/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  ClipboardList,
  ClipboardCheck
} from 'lucide-react';
import { Meeting, AttendanceRecord, AdminSettings } from './types';
import {
  getStoredMeetings,
  saveStoredMeetings,
  getStoredAttendance,
  saveStoredAttendance,
  getStoredSettings,
  saveStoredSettings,
  resetToDefaultData
} from './utils/storage';
import {
  subscribeToMeetings,
  subscribeToAttendance,
  subscribeToSettings,
  addAttendanceRecordToCloud,
  fetchFullDataFromCloud,
  uploadLocalDataToCloud,
  isFirebaseConfigured,
  deduplicateAttendance
} from './services/firebase';
import { MeetingHeader } from './components/MeetingHeader';
import { AttendanceForm } from './components/AttendanceForm';
import { SuccessModal } from './components/SuccessModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(() => getStoredSettings());
  const [activeMeetingId, setActiveMeetingId] = useState<string>('');
  
  // Navigation & Authentication State
  const [currentView, setCurrentView] = useState<'attendance' | 'admin'>('attendance');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // Success Confirmation Modal
  const [justSubmittedRecord, setJustSubmittedRecord] = useState<AttendanceRecord | null>(null);

  // Initial load & Firebase synchronization
  useEffect(() => {
    const loadedMeetings = getStoredMeetings();
    const loadedAttendance = getStoredAttendance();
    const loadedSettings = getStoredSettings();

    setMeetings(loadedMeetings);
    setAttendance(loadedAttendance);
    setSettings(loadedSettings);

    // Support direct meeting link generation via ?meeting=id
    const params = new URLSearchParams(window.location.search);
    const meetingQuery = params.get('meeting');

    if (meetingQuery && loadedMeetings.some((m) => m.id === meetingQuery)) {
      setActiveMeetingId(meetingQuery);
    } else {
      const active = loadedMeetings.find((m) => m.isActive) || loadedMeetings[0];
      if (active) {
        setActiveMeetingId(active.id);
      }
    }

    // Background Real-Time Cloud Synchronization (Automatic, Zero-Config)
    // 1. Initial snapshot fetch from cloud to keep this device completely fresh
    fetchFullDataFromCloud()
      .then((cloudData) => {
        if (cloudData) {
          if (cloudData.meetings && cloudData.meetings.length > 0) {
            setMeetings(cloudData.meetings);
            saveStoredMeetings(cloudData.meetings, false);
          } else {
            // If cloud is empty, seed cloud with local data so other devices can access it
            uploadLocalDataToCloud(loadedMeetings, loadedAttendance, loadedSettings);
          }

          if (cloudData.attendance && cloudData.attendance.length > 0) {
            setAttendance(cloudData.attendance);
            saveStoredAttendance(cloudData.attendance, false);
          }

          if (cloudData.settings) {
            setSettings(cloudData.settings);
            saveStoredSettings(cloudData.settings, false);
          }
        }
      })
      .catch((err) => {
        console.warn('Initial cloud sync fetch failed', err);
      });

    // 2. Real-time push listeners (changes on any device update this device instantly)
    const unsubMeetings = subscribeToMeetings((remoteMeetings) => {
      if (remoteMeetings && remoteMeetings.length > 0) {
        setMeetings(remoteMeetings);
        saveStoredMeetings(remoteMeetings, false);
      }
    });

    const unsubAttendance = subscribeToAttendance((remoteAttendance) => {
      if (remoteAttendance) {
        setAttendance(remoteAttendance);
        saveStoredAttendance(remoteAttendance, false);
      }
    });

    const unsubSettings = subscribeToSettings((remoteSettings) => {
      if (remoteSettings) {
        setSettings(remoteSettings);
        saveStoredSettings(remoteSettings, false);
      }
    });

    return () => {
      unsubMeetings();
      unsubAttendance();
      unsubSettings();
    };
  }, []);

  // Sync state to storage
  const handleUpdateMeetings = (newMeetings: Meeting[]) => {
    setMeetings(newMeetings);
    saveStoredMeetings(newMeetings, true);
  };

  const handleUpdateAttendance = (newAttendance: AttendanceRecord[]) => {
    const deduped = deduplicateAttendance(newAttendance);
    setAttendance(deduped);
    saveStoredAttendance(deduped, true);
  };

  const handleUpdateSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings, true);
  };

  const handleResetData = () => {
    const reset = resetToDefaultData();
    setMeetings(reset.meetings);
    setAttendance(reset.attendance);
    setSettings(reset.settings);
    setActiveMeetingId(reset.meetings[0]?.id || '');
    if (isFirebaseConfigured()) {
      uploadLocalDataToCloud(reset.meetings, reset.attendance, reset.settings);
    }
  };

  // Active meeting object
  const currentMeeting = useMemo(() => {
    return meetings.find((m) => m.id === activeMeetingId) || meetings[0] || {
      id: 'default',
      title: 'Rapat Koordinasi Pembiayaan Infrastruktur Sumber Daya Air',
      agenda: 'Koordinasi Penyelenggaraan Rapat',
      date: new Date().toISOString().split('T')[0],
      timeStart: '09:00',
      timeEnd: '12:00',
      location: 'Ruang Rapat Utama Gd. Ditjen Pembiayaan Infrastruktur / Zoom',
      organizer: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air, Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum',
      leader: 'Pimpinan Rapat',
      isActive: true,
      createdAt: new Date().toISOString()
    };
  }, [meetings, activeMeetingId]);

  // Attendance for active meeting
  const currentMeetingAttendance = useMemo(() => {
    return attendance.filter((r) => r.meetingId === currentMeeting.id);
  }, [attendance, currentMeeting.id]);

  const luringCount = currentMeetingAttendance.filter((r) => r.attendanceType === 'luring').length;
  const daringCount = currentMeetingAttendance.filter((r) => r.attendanceType === 'daring').length;

  // Handler when participant submits attendance
  const handleAttendanceSubmit = (newRecord: AttendanceRecord) => {
    // 1. Guard against duplicates in local state & storage
    setAttendance((prev) => {
      if (prev.some((r) => r.id === newRecord.id)) {
        return prev;
      }
      const updated = [newRecord, ...prev];
      // Save to localStorage only (avoid double-syncing full array to cloud)
      saveStoredAttendance(updated, false);
      return updated;
    });

    // 2. Push ONLY the single new record to Firebase by its unique ID
    addAttendanceRecordToCloud(newRecord).catch((err) =>
      console.warn('Background add attendance to cloud failed', err)
    );

    setJustSubmittedRecord(newRecord);
  };

  // Admin access trigger
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setShowAdminLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased">
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Brand Wordmark (Single element)
        Zone 2: 4-5 Nav Links (Single line, whitespace-nowrap)
        Zone 3: 1 Primary Action (whitespace-nowrap shrink-0)
      */}
      <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark with attendance icon */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-amber-400 flex items-center justify-center shadow-xs ring-1 ring-blue-700/40 shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView('attendance');
              }}
              className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-blue-900 transition-colors"
            >
              Absensi Dit. PPISDA
            </a>
          </div>

          {/* Zone 2: Clean single-line text navigation link */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setCurrentView('attendance')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'attendance' ? 'text-blue-900 font-bold' : ''
              }`}
            >
              Formulir Kehadiran Rapat
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {currentView === 'attendance' ? (
              <button
                type="button"
                onClick={handleOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-blue-950 hover:bg-blue-900 rounded-xl shadow-xs hover:shadow transition-all whitespace-nowrap shrink-0"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Menu Admin</span>
                <span className="hidden sm:inline">& Ekspor</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentView('attendance')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all whitespace-nowrap shrink-0 border border-slate-300"
              >
                <ClipboardList className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline">Kembali ke </span>
                <span>Absensi</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6">
        {currentView === 'attendance' ? (
          /* =========================================================================
             HALAMAN ABSENSI RAPAT (PUBLIC ATTENDANCE VIEW)
             NOTE: strictly NO export / download buttons here per user instruction.
             Total hadir counter is hidden per user request.
             ========================================================================= */
          <div className="space-y-6">
            {/* Active Meeting Information Card (Total hadir is hidden) */}
            <MeetingHeader meeting={currentMeeting} />

            {/* Attendance Form Section (Wider full-width container, sidebar hidden per user request) */}
            <div className="w-full">
              <AttendanceForm
                meeting={currentMeeting}
                onSubmit={handleAttendanceSubmit}
              />
            </div>
          </div>
        ) : (
          /* =========================================================================
             HALAMAN ADMIN & MANAJEMEN DATA (DEDICATED ADMIN AREA)
             Here is where the CSV and PDF with signatures exports are located!
             ========================================================================= */
          <AdminPanel
            meetings={meetings}
            currentMeeting={currentMeeting}
            allAttendance={attendance}
            settings={settings}
            onUpdateMeetings={handleUpdateMeetings}
            onUpdateAttendance={handleUpdateAttendance}
            onUpdateSettings={handleUpdateSettings}
            onSelectMeeting={(id) => setActiveMeetingId(id)}
            onBackToAttendance={() => setCurrentView('attendance')}
            onLogout={() => {
              setIsAdminAuthenticated(false);
              setCurrentView('attendance');
            }}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Success Attendance Confirmation Modal */}
      {justSubmittedRecord && (
        <SuccessModal
          record={justSubmittedRecord}
          meeting={currentMeeting}
          onClose={() => setJustSubmittedRecord(null)}
        />
      )}

      {/* 2. Admin PIN Login Modal */}
      <AdminLoginModal
        currentPin={settings.adminPin}
        isOpen={showAdminLoginModal}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setShowAdminLoginModal(false);
          setCurrentView('admin');
        }}
        onClose={() => setShowAdminLoginModal(false)}
      />
    </div>
  );
}
