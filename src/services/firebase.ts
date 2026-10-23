import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  Database,
  Unsubscribe
} from 'firebase/database';
import { Meeting, AttendanceRecord, AdminSettings, FirebaseConfig } from '../types';

// Built-in official Firebase Web App configuration
export const BUILTIN_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyDhVmskbrYh-bRAHySfcEalq7COmwZhqKM",
  authDomain: "absensi-ppisda.firebaseapp.com",
  databaseURL: "https://absensi-ppisda-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-ppisda",
  storageBucket: "absensi-ppisda.firebasestorage.app",
  messagingSenderId: "366120721982",
  appId: "1:366120721982:web:4a899468cc1f82a8473b6f"
};

export const BUILTIN_FIREBASE_DB_URL = BUILTIN_FIREBASE_CONFIG.databaseURL;

export function getStoredFirebaseConfig(): FirebaseConfig {
  return BUILTIN_FIREBASE_CONFIG;
}

export function saveStoredFirebaseConfig(_config: FirebaseConfig | null): void {
  // Built-in config is permanently embedded in code; no manual config required
}

function sanitizeDatabaseUrl(url: string): string {
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/+$/, '');
  cleaned = cleaned.replace(/\/(ppisda|data)?(\.json)?$/, '');
  return cleaned;
}

function extractProjectIdFromUrl(url: string): string {
  return BUILTIN_FIREBASE_CONFIG.projectId || 'absensi-ppisda';
}

let activeApp: FirebaseApp | null = null;
let activeDb: Database | null = null;

export function initFirebase(_customConfig?: FirebaseConfig | null): Database | null {
  const config = BUILTIN_FIREBASE_CONFIG;

  try {
    const appName = 'ppisda-firebase-app';
    const existingApps = getApps();
    const existing = existingApps.find((a) => a.name === appName);

    if (existing) {
      activeApp = existing;
    } else {
      activeApp = initializeApp(config, appName);
    }

    activeDb = getDatabase(activeApp, config.databaseURL);
    return activeDb;
  } catch (err) {
    console.error('Failed to initialize Firebase', err);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return true;
}

export async function testFirebaseConnection(config: FirebaseConfig): Promise<{ success: boolean; message: string }> {
  if (!config.databaseURL) {
    return { success: false, message: 'URL Database belum diisi.' };
  }

  const cleanUrl = sanitizeDatabaseUrl(config.databaseURL);

  // Quick REST check to verify accessibility and test mode permissions
  try {
    const pingEndpoint = `${cleanUrl}/ppisda/ping.json`;
    const res = await fetch(pingEndpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pingAt: new Date().toISOString() })
    });

    if (res.ok) {
      return {
        success: true,
        message: 'Koneksi ke Firebase Realtime Database Berhasil! Database siap digunakan untuk sinkronisasi multi-device.'
      };
    } else {
      const text = await res.text();
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          message: 'Akses Ditolak (Rules Permission Denied). Pastikan Rules Realtime Database di Firebase Console diset ke read: true, write: true (Test mode).'
        };
      }
      return {
        success: false,
        message: `Gagal menghubungkan (HTTP ${res.status}): ${text || 'Periksa kembali URL database.'}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menjangkau URL Firebase: ${err?.message || 'Pastikan format URL benar dan perangkat terhubung ke internet.'}`
    };
  }
}

// -------------------------------------------------------------
// Helper: Deduplicate Attendance Records by ID
// -------------------------------------------------------------
export function deduplicateAttendance(records: any[]): AttendanceRecord[] {
  if (!Array.isArray(records)) return [];
  const map = new Map<string, AttendanceRecord>();
  for (const item of records) {
    if (item && typeof item === 'object' && item.id) {
      if (!map.has(item.id)) {
        map.set(item.id, item as AttendanceRecord);
      }
    }
  }
  return Array.from(map.values());
}

// -------------------------------------------------------------
// Realtime Database Subscriptions
// -------------------------------------------------------------

export function subscribeToMeetings(callback: (meetings: Meeting[]) => void): () => void {
  const db = activeDb || initFirebase();
  if (!db) return () => {};

  try {
    const meetingsRef = ref(db, 'ppisda/meetings');
    const unsubscribe: Unsubscribe = onValue(
      meetingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (Array.isArray(val)) {
            callback(val);
          } else if (typeof val === 'object' && val !== null) {
            callback(Object.values(val));
          }
        }
      },
      (error) => {
        console.warn('Realtime meetings listener error', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error subscribing to meetings', err);
    return () => {};
  }
}

export function subscribeToAttendance(callback: (attendance: AttendanceRecord[]) => void): () => void {
  const db = activeDb || initFirebase();
  if (!db) return () => {};

  try {
    const attendanceRef = ref(db, 'ppisda/attendance');
    const unsubscribe: Unsubscribe = onValue(
      attendanceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          let rawList: any[] = [];
          if (Array.isArray(val)) {
            rawList = val;
          } else if (typeof val === 'object' && val !== null) {
            rawList = Object.values(val);
          }
          const cleaned = deduplicateAttendance(rawList);
          callback(cleaned);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.warn('Realtime attendance listener error', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error subscribing to attendance', err);
    return () => {};
  }
}

export function subscribeToSettings(callback: (settings: AdminSettings) => void): () => void {
  const db = activeDb || initFirebase();
  if (!db) return () => {};

  try {
    const settingsRef = ref(db, 'ppisda/settings');
    const unsubscribe: Unsubscribe = onValue(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            callback(val as AdminSettings);
          }
        }
      },
      (error) => {
        console.warn('Realtime settings listener error', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error subscribing to settings', err);
    return () => {};
  }
}

// -------------------------------------------------------------
// Cloud Write & Sync Operations
// -------------------------------------------------------------

export async function saveMeetingsToCloud(meetings: Meeting[]): Promise<boolean> {
  const config = getStoredFirebaseConfig();
  if (!config) return false;

  const db = activeDb || initFirebase(config);
  if (db) {
    try {
      await set(ref(db, 'ppisda/meetings'), meetings);
      return true;
    } catch (err) {
      console.warn('Firebase SDK set meetings failed, trying REST fallback', err);
    }
  }

  // Fallback to direct REST PUT
  try {
    const res = await fetch(`${sanitizeDatabaseUrl(config.databaseURL)}/ppisda/meetings.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetings)
    });
    return res.ok;
  } catch (err) {
    console.error('REST fallback saveMeetingsToCloud failed', err);
    return false;
  }
}

export async function saveAttendanceToCloud(attendance: AttendanceRecord[]): Promise<boolean> {
  const config = getStoredFirebaseConfig();
  if (!config) return false;

  const deduped = deduplicateAttendance(attendance);
  const dict = deduped.reduce<Record<string, AttendanceRecord>>((acc, item) => {
    if (item && item.id) {
      acc[item.id] = item;
    }
    return acc;
  }, {});

  const db = activeDb || initFirebase(config);
  if (db) {
    try {
      await set(ref(db, 'ppisda/attendance'), dict);
      return true;
    } catch (err) {
      console.warn('Firebase SDK set attendance failed, trying REST fallback', err);
    }
  }

  try {
    const res = await fetch(`${sanitizeDatabaseUrl(config.databaseURL)}/ppisda/attendance.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dict)
    });
    return res.ok;
  } catch (err) {
    console.error('REST fallback saveAttendanceToCloud failed', err);
    return false;
  }
}

export async function addAttendanceRecordToCloud(record: AttendanceRecord): Promise<boolean> {
  const config = getStoredFirebaseConfig();
  if (!config) return false;

  const db = activeDb || initFirebase(config);

  if (db) {
    try {
      // Use record ID as key to guarantee idempotency and avoid race duplicates
      await set(ref(db, `ppisda/attendance/${record.id}`), record);
      return true;
    } catch (err) {
      console.warn('Firebase SDK addAttendanceRecordToCloud failed, trying REST', err);
    }
  }

  try {
    const res = await fetch(
      `${sanitizeDatabaseUrl(config.databaseURL)}/ppisda/attendance/${record.id}.json`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      }
    );
    return res.ok;
  } catch (err) {
    console.error('REST fallback addAttendanceRecordToCloud failed', err);
    return false;
  }
}

export async function saveSettingsToCloud(settings: AdminSettings): Promise<boolean> {
  const config = getStoredFirebaseConfig();
  if (!config) return false;

  const db = activeDb || initFirebase(config);
  if (db) {
    try {
      await set(ref(db, 'ppisda/settings'), settings);
      return true;
    } catch (err) {
      console.warn('Firebase SDK set settings failed, trying REST fallback', err);
    }
  }

  try {
    const res = await fetch(`${sanitizeDatabaseUrl(config.databaseURL)}/ppisda/settings.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch (err) {
    console.error('REST fallback saveSettingsToCloud failed', err);
    return false;
  }
}

export async function uploadLocalDataToCloud(
  meetings: Meeting[],
  attendance: AttendanceRecord[],
  settings: AdminSettings
): Promise<{ success: boolean; message: string }> {
  const config = getStoredFirebaseConfig();
  if (!config) {
    return { success: false, message: 'Firebase belum dikonfigurasi. Masukkan URL Realtime Database terlebih dahulu.' };
  }

  try {
    const payload = {
      meetings,
      attendance: Array.isArray(attendance)
        ? attendance.reduce<Record<string, AttendanceRecord>>((acc, item) => {
            acc[item.id] = item;
            return acc;
          }, {})
        : attendance,
      settings,
      lastUploadedAt: new Date().toISOString()
    };

    const res = await fetch(`${sanitizeDatabaseUrl(config.databaseURL)}/ppisda.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return {
        success: true,
        message: 'Seluruh data lokal (rapat, absensi, & pengaturan) berhasil di-upload ke Cloud Firebase! Sekarang semua perangkat lain dapat mengakses data ini.'
      };
    } else {
      const errText = await res.text();
      return { success: false, message: `Gagal upload ke cloud (${res.status}): ${errText}` };
    }
  } catch (err: any) {
    return { success: false, message: `Terjadi error saat upload: ${err?.message || 'Koneksi gagal'}` };
  }
}

export async function fetchFullDataFromCloud(): Promise<{
  meetings?: Meeting[];
  attendance?: AttendanceRecord[];
  settings?: AdminSettings;
} | null> {
  const config = getStoredFirebaseConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${sanitizeDatabaseUrl(config.databaseURL)}/ppisda.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;

    let parsedMeetings: Meeting[] | undefined;
    if (data.meetings) {
      parsedMeetings = Array.isArray(data.meetings) ? data.meetings : Object.values(data.meetings);
    }

    let parsedAttendance: AttendanceRecord[] | undefined;
    if (data.attendance) {
      const rawList = Array.isArray(data.attendance) ? data.attendance : Object.values(data.attendance);
      parsedAttendance = deduplicateAttendance(rawList);
      // If duplicates existed in raw database, rewrite cleanly to heal the database
      if (rawList.length > parsedAttendance.length) {
        saveAttendanceToCloud(parsedAttendance).catch(() => {});
      }
    }

    return {
      meetings: parsedMeetings,
      attendance: parsedAttendance,
      settings: data.settings || undefined
    };
  } catch (err) {
    console.error('Error fetching full data from cloud', err);
    return null;
  }
}
