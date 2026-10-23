import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  Database,
  Unsubscribe
} from 'firebase/database';
import { Meeting, AttendanceRecord, AdminSettings, FirebaseConfig } from '../types';

const CONFIG_STORAGE_KEY = 'ppisda_firebase_config_v1';

// Default config from environment variable if configured during build/deployment
const ENV_DB_URL = (import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined)?.trim();
const ENV_PROJECT_ID = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined)?.trim();
const ENV_API_KEY = (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim();

export function getStoredFirebaseConfig(): FirebaseConfig | null {
  try {
    // 1. Check localStorage first
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.databaseURL) {
        return {
          ...parsed,
          databaseURL: sanitizeDatabaseUrl(parsed.databaseURL)
        };
      }
    }

    // 2. Fallback to environment variables
    if (ENV_DB_URL) {
      return {
        databaseURL: sanitizeDatabaseUrl(ENV_DB_URL),
        projectId: ENV_PROJECT_ID || extractProjectIdFromUrl(ENV_DB_URL),
        apiKey: ENV_API_KEY || 'fake-api-key-for-rtdb'
      };
    }
  } catch (err) {
    console.error('Error reading stored Firebase config', err);
  }
  return null;
}

export function saveStoredFirebaseConfig(config: FirebaseConfig | null): void {
  try {
    if (!config || !config.databaseURL) {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      activeApp = null;
      activeDb = null;
      return;
    }

    const sanitized: FirebaseConfig = {
      ...config,
      databaseURL: sanitizeDatabaseUrl(config.databaseURL),
      projectId: config.projectId || extractProjectIdFromUrl(config.databaseURL),
      apiKey: config.apiKey || 'anon-key-rtdb'
    };

    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(sanitized));
    // Reset cached instances to force re-init with new config
    activeApp = null;
    activeDb = null;
    initFirebase(sanitized);
  } catch (err) {
    console.error('Error saving Firebase config', err);
  }
}

function sanitizeDatabaseUrl(url: string): string {
  let cleaned = url.trim();
  // Remove trailing slashes and /ppisda or .json suffix if user accidentally typed it
  cleaned = cleaned.replace(/\/+$/, '');
  cleaned = cleaned.replace(/\/(ppisda|data)?(\.json)?$/, '');
  return cleaned;
}

function extractProjectIdFromUrl(url: string): string {
  try {
    const match = url.match(/https?:\/\/([^.]+)/);
    if (match && match[1]) {
      return match[1].replace(/-default-rtdb$/, '');
    }
  } catch {
    // ignore
  }
  return 'ppisda-absensi';
}

let activeApp: FirebaseApp | null = null;
let activeDb: Database | null = null;

export function initFirebase(customConfig?: FirebaseConfig | null): Database | null {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.databaseURL) {
    return null;
  }

  try {
    const appName = 'ppisda-firebase-app';
    const existingApps = getApps();
    const existing = existingApps.find((a) => a.name === appName);

    if (existing) {
      activeApp = existing;
    } else {
      activeApp = initializeApp(
        {
          databaseURL: sanitizeDatabaseUrl(config.databaseURL),
          projectId: config.projectId || extractProjectIdFromUrl(config.databaseURL),
          apiKey: config.apiKey || 'anon-rtdb-key'
        },
        appName
      );
    }

    activeDb = getDatabase(activeApp, sanitizeDatabaseUrl(config.databaseURL));
    return activeDb;
  } catch (err) {
    console.error('Failed to initialize Firebase', err);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  const config = getStoredFirebaseConfig();
  return Boolean(config && config.databaseURL);
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
          if (Array.isArray(val)) {
            callback(val);
          } else if (typeof val === 'object' && val !== null) {
            callback(Object.values(val));
          }
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

  const db = activeDb || initFirebase(config);
  if (db) {
    try {
      await set(ref(db, 'ppisda/attendance'), attendance);
      return true;
    } catch (err) {
      console.warn('Firebase SDK set attendance failed, trying REST fallback', err);
    }
  }

  try {
    const res = await fetch(`${sanitizeDatabaseUrl(config.databaseURL)}/ppisda/attendance.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendance)
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
      parsedAttendance = Array.isArray(data.attendance) ? data.attendance : Object.values(data.attendance);
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
