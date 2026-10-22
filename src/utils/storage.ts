import { Meeting, AttendanceRecord, AdminSettings } from '../types';
import { INITIAL_MEETINGS, INITIAL_ATTENDANCE, INITIAL_SETTINGS, createMockSignatureSvg } from '../data/initialData';

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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error loading meetings from storage', err);
  }
  saveStoredMeetings(INITIAL_MEETINGS);
  return INITIAL_MEETINGS;
}

export function saveStoredMeetings(meetings: Meeting[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  } catch (err) {
    console.error('Error saving meetings to storage', err);
  }
}

export function getStoredAttendance(): AttendanceRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

  saveStoredAttendance(seeded);
  return seeded;
}

export function saveStoredAttendance(attendance: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  } catch (err) {
    console.error('Error saving attendance to storage', err);
  }
}

export function getStoredSettings(): AdminSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...INITIAL_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error loading settings from storage', err);
  }
  saveStoredSettings(INITIAL_SETTINGS);
  return INITIAL_SETTINGS;
}

export function saveStoredSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
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
