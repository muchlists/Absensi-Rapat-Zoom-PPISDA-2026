import React from 'react';
import { X, User, CreditCard, Building2, Briefcase, Phone, Mail, Clock, MapPin, Video, FileText, CheckCircle2 } from 'lucide-react';
import { AttendanceRecord, Meeting } from '../types';

interface ParticipantDetailModalProps {
  record: AttendanceRecord | null;
  meeting?: Meeting;
  onClose: () => void;
}

export const ParticipantDetailModal: React.FC<ParticipantDetailModalProps> = ({
  record,
  meeting,
  onClose
}) => {
  if (!record) return null;

  const formattedDate = new Date(record.timestamp).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = new Date(record.timestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              Rincian Data Presensi Peserta
            </h3>
            <p className="text-[11px] text-slate-400">
              ID Presensi: <span className="font-mono">{record.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {meeting && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900">
              <span className="font-semibold">Rapat Terkait:</span> {meeting.title}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-blue-700" /> Nama Lengkap
              </div>
              <div className="text-sm font-bold text-slate-900">{record.fullName}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 uppercase flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-blue-700" /> NIP / NIK
              </div>
              <div className="text-sm font-mono text-slate-800">{record.nip || '-'}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 uppercase flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-700" /> Instansi / Unit Kerja
              </div>
              <div className="font-medium text-slate-800">{record.institution}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 uppercase flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-blue-700" /> Jabatan
              </div>
              <div className="font-medium text-slate-800">{record.position}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 uppercase flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-700" /> No. WhatsApp
              </div>
              <div className="font-mono text-slate-800">{record.phone}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 uppercase flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-700" /> Email
              </div>
              <div className="text-slate-800">{record.email || '-'}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600">Waktu Presensi:</span>
              <strong className="font-mono">{formattedDate}, {formattedTime} WIB</strong>
            </div>

            <div>
              {record.attendanceType === 'luring' ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  <MapPin className="w-3.5 h-3.5" /> Hadir Langsung (Luring)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                  <Video className="w-3.5 h-3.5" /> Hadir Daring (Online)
                </span>
              )}
            </div>
          </div>

          {record.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
              <div className="font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-700" /> Catatan Tambahan:
              </div>
              <p className="text-slate-600">{record.notes}</p>
            </div>
          )}

          {/* Signature View */}
          <div className="space-y-1.5 pt-2">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tanda Tangan Digital Peserta
            </div>
            <div className="w-full h-36 bg-white border border-slate-300 rounded-xl p-3 flex items-center justify-center shadow-inner">
              {record.signature ? (
                <img
                  src={record.signature}
                  alt={`Tanda tangan ${record.fullName}`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-600">Tidak ada tanda tangan digital</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
