import { Meeting, AttendanceRecord, AdminSettings } from '../types';
import { INITIAL_MEETINGS, INITIAL_ATTENDANCE, INITIAL_SETTINGS, createMockSignatureSvg } from '../data/initialData';
import { formatOrganizerName, OFFICIAL_ORGANIZER_TITLE_CASE } from './textUtils';
import {
  saveMeetingsToCloud,
  saveAttendanceToCloud,
  saveSettingsToCloud,
  isFirebaseConfigured,
  deduplicateAttendance
} from '../services/firebase';

const STORAGE_KEYS = {
  MEETINGS: 'ppisda_meetings_v4',
  ATTENDANCE: 'ppisda_attendance_v4',
  SETTINGS: 'ppisda_settings_v4',
  ACTIVE_MEETING: 'ppisda_active_meeting_v4'
};

export function getStoredMeetings(): Meeting[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed
          .filter((m): m is Meeting => Boolean(m && typeof m === 'object' && m.id && typeof m.id === 'string'))
          .map((m: Meeting) => ({
            ...m,
            organizer: formatOrganizerName(m.organizer)
          }));
        if (valid.length > 0) {
          return valid;
        }
      }
    }
  } catch (err) {
    console.error('Error loading meetings from storage', err);
  }
  saveStoredMeetings(INITIAL_MEETINGS);
  return INITIAL_MEETINGS;
}

export function saveStoredMeetings(meetings: Meeting[], syncToCloud = true): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    if (syncToCloud && isFirebaseConfigured()) {
      saveMeetingsToCloud(meetings).catch((err) => console.warn('Background sync meetings failed', err));
    }
  } catch (err) {
    console.error('Error saving meetings to storage', err);
  }
}

export function getStoredAttendance(): AttendanceRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateAttendance(parsed);
      }
    }
  } catch (err) {
    console.error('Error loading attendance from storage', err);
  }

  // Populate mock signatures for initial data so signatures are visible right away
  const seeded = INITIAL_ATTENDANCE.map((record, index) => {
    if (!record.signature) {
      return {
        ...record,
        signature: createMockSignatureSvg(record.fullName, (index % 4) + 1)
      };
    }
    return record;
  });

  const deduped = deduplicateAttendance(seeded);
  saveStoredAttendance(deduped, false);
  return deduped;
}

export function saveStoredAttendance(attendance: AttendanceRecord[], syncToCloud = true): void {
  try {
    const deduped = deduplicateAttendance(attendance);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(deduped));
    if (syncToCloud && isFirebaseConfigured()) {
      saveAttendanceToCloud(deduped).catch((err) => console.warn('Background sync attendance failed', err));
    }
  } catch (err) {
    console.error('Error saving attendance to storage', err);
  }
}

export function getStoredSettings(): AdminSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      const parsed = JSON.parse(data);
      const settings = { ...INITIAL_SETTINGS, ...parsed };
      settings.institutionName = formatOrganizerName(settings.institutionName);
      return settings;
    }
  } catch (err) {
    console.error('Error loading settings from storage', err);
  }
  saveStoredSettings(INITIAL_SETTINGS);
  return INITIAL_SETTINGS;
}

export function saveStoredSettings(settings: AdminSettings, syncToCloud = true): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (syncToCloud && isFirebaseConfigured()) {
      saveSettingsToCloud(settings).catch((err) => console.warn('Background sync settings failed', err));
    }
  } catch (err) {
    console.error('Error saving settings to storage', err);
  }
}

export function resetToDefaultData(): { meetings: Meeting[]; attendance: AttendanceRecord[]; settings: AdminSettings } {
  localStorage.removeItem(STORAGE_KEYS.MEETINGS);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);

  const seeded = INITIAL_ATTENDANCE.map((record, index) => ({
    ...record,
    signature: createMockSignatureSvg(record.fullName, (index % 4) + 1)
  }));

  saveStoredMeetings(INITIAL_MEETINGS);
  saveStoredAttendance(seeded);
  saveStoredSettings(INITIAL_SETTINGS);

  return {
    meetings: INITIAL_MEETINGS,
    attendance: seeded,
    settings: INITIAL_SETTINGS
  };
}
