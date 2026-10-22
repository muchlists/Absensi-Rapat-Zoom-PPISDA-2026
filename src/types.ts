export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  location: string;
  organizer: string;
  leader: string;
  leaderNip?: string;
  notetaker?: string;
  allowedAttendanceMode?: 'hybrid' | 'luring_only' | 'daring_only'; // Luring saja, Daring saja, atau Keduanya
  isActive: boolean;
  createdAt: string;
}

export type AttendanceType = 'luring' | 'daring';

export interface AttendanceRecord {
  id: string;
  meetingId: string;
  fullName: string;
  nip: string;
  institution: string;
  position: string;
  phone: string;
  email: string;
  attendanceType: AttendanceType;
  signature: string; // base64 PNG data URL
  notes: string;
  timestamp: string; // ISO date
}

export interface AdminSettings {
  adminPin: string;
  institutionName: string;
  subInstitution: string;
  address: string;
}
