import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
  Settings,
  Calendar,
  Users,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Building2,
  KeyRound,
  Lock
} from 'lucide-react';
import { AttendanceRecord, Meeting, AdminSettings, AttendanceType } from '../types';
import { exportAttendanceToCSV } from '../utils/csvGenerator';
import { generateAttendancePDF } from '../utils/pdfGenerator';
import { ParticipantDetailModal } from './ParticipantDetailModal';
import { OfficialPrintView } from './OfficialPrintView';

interface AdminPanelProps {
  meetings: Meeting[];
  currentMeeting: Meeting;
  allAttendance: AttendanceRecord[];
  settings: AdminSettings;
  onUpdateMeetings: (meetings: Meeting[]) => void;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onUpdateSettings: (settings: AdminSettings) => void;
  onSelectMeeting: (meetingId: string) => void;
  onBackToAttendance: () => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  meetings,
  currentMeeting,
  allAttendance,
  settings,
  onUpdateMeetings,
  onUpdateAttendance,
  onUpdateSettings,
  onSelectMeeting,
  onBackToAttendance,
  onLogout,
  onResetData
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'meetings' | 'settings'>('attendance');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(currentMeeting.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminViewMode, setAdminViewMode] = useState<'split' | 'luring' | 'daring' | 'combined'>('split');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modals state
  const [detailRecord, setDetailRecord] = useState<AttendanceRecord | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Meeting Form State
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAgenda, setNewAgenda] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTimeStart, setNewTimeStart] = useState('09:00');
  const [newTimeEnd, setNewTimeEnd] = useState('12:00');
  const [newLocation, setNewLocation] = useState('Ruang Rapat Ditjen Pembiayaan Infrastruktur / Zoom');
  const [newOrganizer, setNewOrganizer] = useState(settings.institutionName);
  const [newLeader, setNewLeader] = useState('Dr. Ir. H. Bambang Priyono, M.Eng.');
  const [newLeaderNip, setNewLeaderNip] = useState('19750812 200003 1 002');
  const [newAllowedMode, setNewAllowedMode] = useState<'hybrid' | 'luring_only' | 'daring_only'>('hybrid');

  // Edit Meeting State
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [copiedMeetingId, setCopiedMeetingId] = useState<string | null>(null);
  const [manualName, setManualName] = useState('');
  const [manualNip, setManualNip] = useState('');
  const [manualInstitution, setManualInstitution] = useState('');
  const [manualPosition, setManualPosition] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualType, setManualType] = useState<AttendanceType>('luring');

  // Settings State
  const [tempPin, setTempPin] = useState(settings.adminPin);
  const [tempInstName, setTempInstName] = useState(settings.institutionName);
  const [tempSubInst, setTempSubInst] = useState(settings.subInstitution);
  const [tempAddress, setTempAddress] = useState(settings.address);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // The meeting currently inspected in admin
  const activeAdminMeeting = useMemo(() => {
    return meetings.find((m) => m.id === selectedMeetingId) || currentMeeting;
  }, [meetings, selectedMeetingId, currentMeeting]);

  // Attendance for the chosen meeting
  const meetingAttendance = useMemo(() => {
    return allAttendance.filter((rec) => rec.meetingId === activeAdminMeeting.id);
  }, [allAttendance, activeAdminMeeting.id]);

  // Filtered attendance for display
  const luringAttendance = useMemo(() => {
    return meetingAttendance
      .filter((r) => r.attendanceType === 'luring')
      .filter((rec) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          rec.fullName.toLowerCase().includes(q) ||
          rec.institution.toLowerCase().includes(q) ||
          rec.position.toLowerCase().includes(q) ||
          rec.nip.toLowerCase().includes(q) ||
          rec.phone.includes(q)
        );
      });
  }, [meetingAttendance, searchQuery]);

  const daringAttendance = useMemo(() => {
    return meetingAttendance
      .filter((r) => r.attendanceType === 'daring')
      .filter((rec) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          rec.fullName.toLowerCase().includes(q) ||
          rec.institution.toLowerCase().includes(q) ||
          rec.position.toLowerCase().includes(q) ||
          rec.nip.toLowerCase().includes(q) ||
          rec.phone.includes(q)
        );
      });
  }, [meetingAttendance, searchQuery]);

  const combinedFilteredAttendance = useMemo(() => {
    if (!searchQuery.trim()) return meetingAttendance;
    const q = searchQuery.toLowerCase();
    return meetingAttendance.filter(
      (rec) =>
        rec.fullName.toLowerCase().includes(q) ||
        rec.institution.toLowerCase().includes(q) ||
        rec.position.toLowerCase().includes(q) ||
        rec.nip.toLowerCase().includes(q) ||
        rec.phone.includes(q)
    );
  }, [meetingAttendance, searchQuery]);

  // Calculations
  const luringCount = meetingAttendance.filter((r) => r.attendanceType === 'luring').length;
  const daringCount = meetingAttendance.filter((r) => r.attendanceType === 'daring').length;
  const signedCount = meetingAttendance.filter((r) => !!r.signature).length;

  // EXPORT HANDLERS - THESE LIVE EXCLUSIVELY IN THE ADMIN PANEL
  const handleExportCSV = (category: 'all' | 'luring' | 'daring' = 'all') => {
    exportAttendanceToCSV(activeAdminMeeting, meetingAttendance, category);
  };

  const handleExportPDF = (mode: 'separate_sheets' | 'luring_only' | 'daring_only' | 'combined' = 'separate_sheets') => {
    generateAttendancePDF(activeAdminMeeting, meetingAttendance, settings, mode);
  };

  // Delete attendee
  const handleDeleteAttendance = (id: string) => {
    const updated = allAttendance.filter((r) => r.id !== id);
    onUpdateAttendance(updated);
    setDeleteConfirmId(null);
  };

  // Manual Add submit
  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualInstitution.trim()) return;

    // Create simple mock signature for manually added attendee
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(30, 80);
      ctx.bezierCurveTo(70, 20, 110, 120, 160, 50);
      ctx.bezierCurveTo(190, 110, 220, 40, 260, 90);
      ctx.moveTo(40, 110);
      ctx.lineTo(260, 100);
      ctx.stroke();
    }
    const signature = canvas.toDataURL('image/png');

    const newRec: AttendanceRecord = {
      id: `att-manual-${Date.now()}`,
      meetingId: activeAdminMeeting.id,
      fullName: manualName.trim(),
      nip: manualNip.trim() || '-',
      institution: manualInstitution.trim(),
      position: manualPosition.trim() || 'Peserta Rapat',
      phone: manualPhone.trim() || '-',
      email: manualEmail.trim() || '-',
      attendanceType: manualType,
      signature,
      notes: 'Ditambahkan langsung oleh Administrator',
      timestamp: new Date().toISOString()
    };

    onUpdateAttendance([newRec, ...allAttendance]);
    setShowAddModal(false);
    // Reset inputs
    setManualName('');
    setManualNip('');
    setManualInstitution('');
    setManualPosition('');
    setManualPhone('');
    setManualEmail('');
  };

  // Create new meeting
  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title: newTitle.trim(),
      agenda: newAgenda.trim(),
      date: newDate,
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
      location: newLocation.trim(),
      organizer: newOrganizer.trim(),
      leader: newLeader.trim(),
      leaderNip: newLeaderNip.trim(),
      allowedAttendanceMode: newAllowedMode,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Set other meetings isActive to false
    const updatedMeetings = meetings.map((m) => ({ ...m, isActive: false }));
    const finalList = [newMeeting, ...updatedMeetings];
    onUpdateMeetings(finalList);
    onSelectMeeting(newMeeting.id);
    setSelectedMeetingId(newMeeting.id);
    setShowNewMeetingModal(false);
  };

  // Save edited meeting
  const handleSaveEditMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;

    const updatedMeetings = meetings.map((m) =>
      m.id === editingMeeting.id ? editingMeeting : m
    );
    onUpdateMeetings(updatedMeetings);
    setEditingMeeting(null);
  };

  // Copy shareable link for meeting
  const handleCopyLink = (meetingId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('meeting', meetingId);
    navigator.clipboard.writeText(url.toString());
    setCopiedMeetingId(meetingId);
    setTimeout(() => setCopiedMeetingId(null), 2500);
  };

  // Set active meeting
  const handleSetActiveMeeting = (meetingId: string) => {
    const updated = meetings.map((m) => ({
      ...m,
      isActive: m.id === meetingId
    }));
    onUpdateMeetings(updated);
    onSelectMeeting(meetingId);
    setSelectedMeetingId(meetingId);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdminSettings = {
      adminPin: tempPin.trim() || '102026',
      institutionName: tempInstName.trim(),
      subInstitution: tempSubInst.trim(),
      address: tempAddress.trim()
    };
    onUpdateSettings(updated);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Header Bar */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 ring-1 ring-blue-500/40">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">
                Panel Admin & Manajemen Data Presensi
              </h1>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Admin Terotentikasi
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Menu khusus pengelolaan data, pembuatan laporan resmi, dan ekspor daftar hadir
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToAttendance}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lihat Halaman Absensi</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Kunci & Keluar</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs - Mobile Responsive Scroll */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Presensi & Ekspor</span>
          <span className="ml-1 text-[11px] font-mono opacity-80">
            ({meetingAttendance.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('meetings')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'meetings'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Kelola Rapat ({meetings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'settings'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan & PIN</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE & EXPORT */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          {/* Active Meeting Selector Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Pilih Agenda Rapat yang Dikelola:
              </label>
              <select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                className="w-full md:max-w-xl text-sm font-semibold rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.date}) {m.isActive ? '— [Rapat Aktif di Form]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* DEDICATED ADMIN-ONLY EXPORT & DOWNLOAD BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
              {/* CSV Export Dropdown / Buttons */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Unduh CSV / Excel</span>
                </button>

                {showExportMenu && (
                  <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs">
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pilih Format CSV
                    </div>
                    {activeAdminMeeting.allowedAttendanceMode === 'daring_only' ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleExportCSV('daring');
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-sky-50 text-sky-800 font-medium"
                      >
                        Khusus Peserta Daring ({daringCount})
                      </button>
                    ) : activeAdminMeeting.allowedAttendanceMode === 'luring_only' ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleExportCSV('luring');
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-800 font-medium"
                      >
                        Khusus Peserta Luring ({luringCount})
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            handleExportCSV('all');
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                        >
                          Semua Peserta (Gabungan)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleExportCSV('luring');
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-800 font-medium"
                        >
                          Khusus Peserta Luring ({luringCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleExportCSV('daring');
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-sky-50 text-sky-800 font-medium"
                        >
                          Khusus Peserta Daring ({daringCount})
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* PDF Export - Dynamic based on Meeting Mode */}
              {activeAdminMeeting.allowedAttendanceMode === 'daring_only' ? (
                <button
                  type="button"
                  onClick={() => handleExportPDF('daring_only')}
                  title="Unduh PDF Resmi Peserta Daring (Tanpa Luring)"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF (Daring Saja)</span>
                </button>
              ) : activeAdminMeeting.allowedAttendanceMode === 'luring_only' ? (
                <button
                  type="button"
                  onClick={() => handleExportPDF('luring_only')}
                  title="Unduh PDF Resmi Peserta Luring (Tanpa Daring)"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF (Luring Saja)</span>
                </button>
              ) : (
                <div className="inline-flex rounded-xl shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleExportPDF('separate_sheets')}
                    title="Unduh PDF Resmi dengan lembar terpisah antara Peserta Luring dan Daring"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-l-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold transition-all border-r border-blue-800"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh PDF (Lembar Terpisah)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportPDF('luring_only')}
                    title="Unduh PDF Khusus Peserta Luring"
                    className="px-2.5 py-2.5 bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white text-[11px] font-semibold border-r border-blue-800"
                  >
                    Luring
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportPDF('daring_only')}
                    title="Unduh PDF Khusus Peserta Daring"
                    className="px-2.5 py-2.5 bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white text-[11px] font-semibold rounded-r-xl"
                  >
                    Daring
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowPrintPreview(true)}
                title="Buka pratinjau format cetak resmi dan cetak langsung"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Pratinjau Cetak</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">
                Total Presensi
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {meetingAttendance.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Peserta tercatat</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="text-[11px] font-semibold text-emerald-700 uppercase">
                Hadir Langsung (Luring)
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {luringCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Daftar terpisah (Fisik)</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="text-[11px] font-semibold text-sky-700 uppercase">
                Hadir Daring (Zoom)
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-sky-700 mt-1">
                {daringCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Daftar terpisah (Virtual)</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="text-[11px] font-semibold text-blue-700 uppercase">
                Tanda Tangan Valid
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-blue-800 mt-1">
                {signedCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Muncul di cetakan PDF</div>
            </div>
          </div>

          {/* Table Container with Split View Control */}
          <div className="space-y-4">
            {/* View Mode & Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[240px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIP, instansi, jabatan, WA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="inline-flex p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
                  {activeAdminMeeting.allowedAttendanceMode === 'daring_only' ? (
                    <span className="px-3 py-1 text-xs font-semibold bg-white text-sky-800 rounded-lg shadow-xs">
                      Khusus Rapat Daring ({daringCount} Peserta)
                    </span>
                  ) : activeAdminMeeting.allowedAttendanceMode === 'luring_only' ? (
                    <span className="px-3 py-1 text-xs font-semibold bg-white text-emerald-800 rounded-lg shadow-xs">
                      Khusus Rapat Luring ({luringCount} Peserta)
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setAdminViewMode('split')}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                          adminViewMode === 'split' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Dua Tabel Terpisah (Luring & Daring)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminViewMode('luring')}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${
                          adminViewMode === 'luring' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Hanya Luring ({luringCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminViewMode('daring')}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${
                          adminViewMode === 'daring' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Hanya Daring ({daringCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminViewMode('combined')}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${
                          adminViewMode === 'combined' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Gabungan ({meetingAttendance.length})
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Peserta Manual</span>
                </button>
              </div>
            </div>

            {/* Helper to render individual table */}
            {(() => {
              const renderTableBlock = (
                data: AttendanceRecord[],
                title: string,
                badgeColor: string,
                emptyMsg: string
              ) => (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                        {title}
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                        {data.length} Peserta (Nomor urut terpisah 1 - {data.length || 0})
                      </span>
                    </div>
                  </div>

                  {data.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      {emptyMsg}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <th className="py-2.5 px-3 text-center w-10">No.</th>
                            <th className="py-2.5 px-3">Nama & NIP</th>
                            <th className="py-2.5 px-3">Instansi</th>
                            <th className="py-2.5 px-3">Jabatan</th>
                            <th className="py-2.5 px-3">No. WhatsApp</th>
                            <th className="py-2.5 px-3 text-center">Kehadiran</th>
                            <th className="py-2.5 px-3 text-center">Tanda Tangan</th>
                            <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {data.map((rec, index) => (
                            <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-600 tabular-nums">
                                {index + 1}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">{rec.fullName}</div>
                                {rec.nip && rec.nip !== '-' && (
                                  <div className="text-[11px] font-mono text-slate-500">
                                    NIP. {rec.nip}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{rec.institution}</td>
                              <td className="py-2.5 px-3 text-slate-600">{rec.position}</td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                                {rec.phone}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {rec.attendanceType === 'luring' ? (
                                  <span className="inline-block text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                    Luring (Fisik)
                                  </span>
                                ) : (
                                  <span className="inline-block text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                                    Daring (Zoom)
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {rec.signature ? (
                                  <div
                                    onClick={() => setDetailRecord(rec)}
                                    className="inline-block cursor-pointer p-1 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors"
                                    title="Klik untuk memperbesar tanda tangan"
                                  >
                                    <img
                                      src={rec.signature}
                                      alt="TTD"
                                      className="h-7 max-w-[70px] object-contain"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Kosong</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setDetailRecord(rec)}
                                    title="Lihat Detail Peserta"
                                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(rec.id)}
                                    title="Hapus Data Presensi"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );

              return (
                <div className="space-y-5">
                  {activeAdminMeeting.allowedAttendanceMode === 'daring_only' ? (
                    renderTableBlock(
                      daringAttendance,
                      'Daftar Hadir Peserta Daring (Online / Virtual Zoom)',
                      'bg-sky-100 text-sky-800',
                      'Belum ada peserta Daring yang terdaftar.'
                    )
                  ) : activeAdminMeeting.allowedAttendanceMode === 'luring_only' ? (
                    renderTableBlock(
                      luringAttendance,
                      'Daftar Hadir Peserta Luring (Tatap Muka Langsung)',
                      'bg-emerald-100 text-emerald-800',
                      'Belum ada peserta Luring yang terdaftar.'
                    )
                  ) : (
                    <>
                      {(adminViewMode === 'split' || adminViewMode === 'luring') &&
                        renderTableBlock(
                          luringAttendance,
                          'Tabel 1: Daftar Hadir Peserta Luring (Tatap Muka Langsung)',
                          'bg-emerald-100 text-emerald-800',
                          'Belum ada peserta Luring yang terdaftar.'
                        )}

                      {(adminViewMode === 'split' || adminViewMode === 'daring') &&
                        renderTableBlock(
                          daringAttendance,
                          'Tabel 2: Daftar Hadir Peserta Daring (Online / Virtual Zoom)',
                          'bg-sky-100 text-sky-800',
                          'Belum ada peserta Daring yang terdaftar.'
                        )}

                      {adminViewMode === 'combined' &&
                        renderTableBlock(
                          combinedFilteredAttendance,
                          'Tabel Gabungan Seluruh Peserta Hadir',
                          'bg-blue-100 text-blue-800',
                          'Belum ada peserta yang mengisi kehadiran.'
                        )}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 2: MEETINGS MANAGEMENT */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Daftar Agenda Rapat
              </h2>
              <p className="text-xs text-slate-500">
                Tentukan rapat aktif untuk formulir absensi atau kelola arsip rapat sebelumnya
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewMeetingModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Rapat Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {meetings.map((m) => {
              const count = allAttendance.filter((a) => a.meetingId === m.id).length;
              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    m.isActive
                      ? 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{m.title}</span>
                        {m.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Rapat Aktif di Form
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Arsip
                          </span>
                        )}

                        {/* Format Mode Badge */}
                        {(m.allowedAttendanceMode || 'hybrid') === 'hybrid' && (
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            Hybrid (Luring & Daring)
                          </span>
                        )}
                        {m.allowedAttendanceMode === 'luring_only' && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Luring Saja
                          </span>
                        )}
                        {m.allowedAttendanceMode === 'daring_only' && (
                          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                            Daring Saja
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{m.agenda}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span>Tanggal: <strong className="text-slate-700">{m.date}</strong></span>
                        <span>Waktu: <strong className="text-slate-700">{m.timeStart} - {m.timeEnd} WIB</strong></span>
                        <span>Lokasi: <strong className="text-slate-700">{m.location}</strong></span>
                        <span>Peserta: <strong className="font-mono text-blue-700">{count} Hadir</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          handleSetActiveMeeting(m.id);
                          onBackToAttendance();
                        }}
                        title="Jadikan rapat ini aktif dan langsung buka formulir absensinya"
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
                      >
                        Buka Form Rapat Ini
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingMeeting(m)}
                        title="Edit judul, waktu, dan format kehadiran rapat"
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                      >
                        Edit Rapat
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(m.id)}
                        title="Salin link khusus formulir rapat ini"
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                      >
                        {copiedMeetingId === m.id ? 'Tersalin!' : 'Salin Link'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMeetingId(m.id);
                          setActiveTab('attendance');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                      >
                        Presensi ({count})
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & PIN */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institution & Kop Settings */}
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4"
          >
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                Format Kop Surat & Identitas Penyelenggara
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Identitas ini dicetak pada bagian kop atas dokumen resmi PDF dan berkas ekspor.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nama Instansi Utama (Baris 1)
              </label>
              <input
                type="text"
                value={tempInstName}
                onChange={(e) => setTempInstName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Sub-Instansi / Unit Kerja (Baris 2)
              </label>
              <input
                type="text"
                value={tempSubInst}
                onChange={(e) => setTempSubInst(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Alamat / Kontak Sekretariat (Baris 3)
              </label>
              <input
                type="text"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  PIN Masuk Panel Admin
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={tempPin}
                  onChange={(e) => setTempPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-500">
                  PIN untuk membuka menu admin dan tombol ekspor. Default: 102026
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {settingsSavedMessage && (
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pengaturan berhasil disimpan!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 text-xs font-semibold rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>

          {/* Data Reset & Storage Help */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-700" />
                Reset Data Uji Coba (Demo)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jika Anda ingin mengembalikan data daftar rapat, contoh tanda tangan peserta PPI SDA, dan pengaturan ke kondisi awal pabrik, Anda dapat mereset data di bawah ini.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke data default awal?')) {
                    onResetData();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Data Awal Demo</span>
              </button>
            </div>

            <div className="bg-blue-50/60 rounded-2xl border border-blue-200/80 p-5 space-y-2 text-xs text-blue-950">
              <div className="font-bold text-sm text-blue-900">
                Privasi Ekspor Sesuai Permintaan
              </div>
              <p className="leading-relaxed">
                Sesuai dengan arahan Anda, menu ekspor (CSV dan PDF ber-tanda tangan) hanya berada di dalam Menu Admin ini dan tidak ditampilkan di halaman absensi reguler demi keamanan dan kerahasiaan tanda tangan peserta.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      <ParticipantDetailModal
        record={detailRecord}
        meeting={activeAdminMeeting}
        onClose={() => setDetailRecord(null)}
      />

      {/* OFFICIAL PRINT PREVIEW MODAL */}
      {showPrintPreview && (
        <OfficialPrintView
          meeting={activeAdminMeeting}
          records={meetingAttendance}
          settings={settings}
          onClose={() => setShowPrintPreview(false)}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-900">Hapus Data Presensi Ini?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Data kehadiran dan tanda tangan peserta yang dihapus tidak dapat dipulihkan kembali.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAttendance(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ADD PARTICIPANT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Tambah Presensi Peserta Manual</h4>
                <p className="text-[11px] text-slate-400">
                  Untuk mendaftarkan peserta yang hadir tanpa mengisi lewat form mandiri
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Contoh: Budi Prasetyo, S.T."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">NIP / NIK</label>
                  <input
                    type="text"
                    value={manualNip}
                    onChange={(e) => setManualNip(e.target.value)}
                    placeholder="1985..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Instansi *</label>
                  <input
                    type="text"
                    required
                    value={manualInstitution}
                    onChange={(e) => setManualInstitution(e.target.value)}
                    placeholder="Dinas PU / Balai SDA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Jabatan</label>
                  <input
                    type="text"
                    value={manualPosition}
                    onChange={(e) => setManualPosition(e.target.value)}
                    placeholder="Staf Operasi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">No. WhatsApp</label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="email@instansi.go.id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-slate-700">Metode Kehadiran</label>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={manualType === 'luring'}
                      onChange={() => setManualType('luring')}
                    />
                    <span>Hadir Langsung (Luring)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={manualType === 'daring'}
                      onChange={() => setManualType('daring')}
                    />
                    <span>Hadir Online (Daring)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW MEETING MODAL */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Buat Agenda Rapat Baru</h4>
                <p className="text-[11px] text-slate-400">
                  Agenda baru otomatis dijadikan rapat aktif pada halaman absensi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewMeetingModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul / Topik Rapat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rapat Teknis Sinkronisasi Alokasi Air..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Deskripsi / Agenda</label>
                <input
                  type="text"
                  placeholder="Pembahasan debit air, pemeliharaan bendung, dll..."
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mulai (WIB)</label>
                  <input
                    type="time"
                    required
                    value={newTimeStart}
                    onChange={(e) => setNewTimeStart(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Selesai (WIB)</label>
                  <input
                    type="time"
                    value={newTimeEnd}
                    onChange={(e) => setNewTimeEnd(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tempat / Ruang Rapat</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Pimpinan Rapat</label>
                  <input
                    type="text"
                    required
                    value={newLeader}
                    onChange={(e) => setNewLeader(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">NIP Pimpinan</label>
                  <input
                    type="text"
                    value={newLeaderNip}
                    onChange={(e) => setNewLeaderNip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Status / Format Kehadiran Setting Sebelum Rapat */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Pengaturan Status / Format Kehadiran Peserta *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Tentukan apakah rapat ini membuka absensi tatap muka saja, daring saja, atau keduanya (hybrid)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                      newAllowedMode === 'hybrid'
                        ? 'bg-blue-50 border-blue-500 font-semibold text-blue-900 ring-1 ring-blue-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="newAllowedMode"
                      checked={newAllowedMode === 'hybrid'}
                      onChange={() => setNewAllowedMode('hybrid')}
                      className="text-blue-600"
                    />
                    <span>Keduanya / Hybrid (Luring & Daring)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                      newAllowedMode === 'luring_only'
                        ? 'bg-emerald-50 border-emerald-500 font-semibold text-emerald-900 ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="newAllowedMode"
                      checked={newAllowedMode === 'luring_only'}
                      onChange={() => setNewAllowedMode('luring_only')}
                      className="text-emerald-600"
                    />
                    <span>Luring Saja (Tatap Muka)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                      newAllowedMode === 'daring_only'
                        ? 'bg-sky-50 border-sky-500 font-semibold text-sky-900 ring-1 ring-sky-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="newAllowedMode"
                      checked={newAllowedMode === 'daring_only'}
                      onChange={() => setNewAllowedMode('daring_only')}
                      className="text-sky-600"
                    />
                    <span>Daring Saja (Online Zoom)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs"
                >
                  Simpan & Aktifkan Rapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXISTING MEETING MODAL */}
      {editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Edit Pengaturan Rapat & Format Absensi</h4>
                <p className="text-[11px] text-slate-400">
                  Ubah judul, waktu, dan format kehadiran (luring/daring) sebelum rapat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMeeting(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditMeeting} className="p-6 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul / Topik Rapat *</label>
                <input
                  type="text"
                  required
                  value={editingMeeting.title}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Deskripsi / Agenda</label>
                <input
                  type="text"
                  value={editingMeeting.agenda}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, agenda: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={editingMeeting.date}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, date: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mulai (WIB)</label>
                  <input
                    type="time"
                    required
                    value={editingMeeting.timeStart}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, timeStart: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Selesai (WIB)</label>
                  <input
                    type="time"
                    value={editingMeeting.timeEnd}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, timeEnd: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tempat / Ruang / Link Zoom</label>
                <input
                  type="text"
                  required
                  value={editingMeeting.location}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Pimpinan Rapat</label>
                  <input
                    type="text"
                    required
                    value={editingMeeting.leader}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, leader: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">NIP Pimpinan</label>
                  <input
                    type="text"
                    value={editingMeeting.leaderNip || ''}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, leaderNip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Status / Format Kehadiran Setting Sebelum Rapat */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Pengaturan Status / Format Kehadiran Peserta *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Atur apakah peserta hanya bisa mengisi luring, daring, atau keduanya (hybrid)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                      (editingMeeting.allowedAttendanceMode || 'hybrid') === 'hybrid'
                        ? 'bg-blue-50 border-blue-500 font-semibold text-blue-900 ring-1 ring-blue-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editAllowedMode"
                      checked={(editingMeeting.allowedAttendanceMode || 'hybrid') === 'hybrid'}
                      onChange={() => setEditingMeeting({ ...editingMeeting, allowedAttendanceMode: 'hybrid' })}
                      className="text-blue-600"
                    />
                    <span>Keduanya / Hybrid (Luring & Daring)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                      editingMeeting.allowedAttendanceMode === 'luring_only'
                        ? 'bg-emerald-50 border-emerald-500 font-semibold text-emerald-900 ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editAllowedMode"
                      checked={editingMeeting.allowedAttendanceMode === 'luring_only'}
                      onChange={() => setEditingMeeting({ ...editingMeeting, allowedAttendanceMode: 'luring_only' })}
                      className="text-emerald-600"
                    />
                    <span>Luring Saja (Tatap Muka)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                      editingMeeting.allowedAttendanceMode === 'daring_only'
                        ? 'bg-sky-50 border-sky-500 font-semibold text-sky-900 ring-1 ring-sky-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editAllowedMode"
                      checked={editingMeeting.allowedAttendanceMode === 'daring_only'}
                      onChange={() => setEditingMeeting({ ...editingMeeting, allowedAttendanceMode: 'daring_only' })}
                      className="text-sky-600"
                    />
                    <span>Daring Saja (Online Zoom)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMeeting(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs"
                >
                  Simpan Perubahan Rapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
