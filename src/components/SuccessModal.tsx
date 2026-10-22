import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, User, Building2, Briefcase, Calendar, X, Clock, MapPin, Video } from 'lucide-react';
import { AttendanceRecord, Meeting } from '../types';

interface SuccessModalProps {
  record: AttendanceRecord;
  meeting: Meeting;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  record,
  meeting,
  onClose
}) => {
  useEffect(() => {
    // Trigger confetti on modal open
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if confetti blocked
    }
  }, []);

  const formattedTime = new Date(record.timestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedDate = new Date(record.timestamp).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-500/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-2 text-white shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold tracking-tight">
            Presensi Berhasil Disimpan!
          </h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Terima kasih telah melakukan konfirmasi kehadiran rapat.
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2">
              Bukti Kehadiran Resmi
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <User className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{record.fullName}</div>
                  {record.nip && record.nip !== '-' && (
                    <div className="text-[11px] text-slate-600 font-mono">NIP: {record.nip}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="text-slate-700 font-medium">{record.institution}</span>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="text-slate-600">{record.position}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="text-slate-600 font-mono tabular-nums">
                  {formattedDate}, {formattedTime} WIB
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {record.attendanceType === 'luring' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    <MapPin className="w-3.5 h-3.5" />
                    Hadir Langsung (Luring)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                    <Video className="w-3.5 h-3.5" />
                    Hadir Daring (Zoom/Online)
                  </span>
                )}
              </div>
            </div>

            {/* Signature Preview */}
            {record.signature && (
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[11px] text-slate-600 mb-1 font-medium">
                  Tanda Tangan Digital Tersimpan:
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2 h-16 flex items-center justify-center">
                  <img
                    src={record.signature}
                    alt="Tanda Tangan"
                    className="max-h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-600 bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 text-center">
            Rapat: <strong>{meeting.title}</strong>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
