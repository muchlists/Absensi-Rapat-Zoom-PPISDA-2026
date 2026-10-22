import React, { useState } from 'react';
import {
  User,
  Building2,
  Briefcase,
  Phone,
  Mail,
  Send,
  FileText,
  AlertCircle
} from 'lucide-react';
import { AttendanceRecord, AttendanceType, Meeting } from '../types';
import { SignaturePad } from './SignaturePad';

interface AttendanceFormProps {
  meeting: Meeting;
  onSubmit: (record: AttendanceRecord) => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  meeting,
  onSubmit
}) => {
  const allowedMode = meeting.allowedAttendanceMode || 'hybrid';

  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errs.fullName = 'Nama lengkap wajib diisi';
    }
    if (!institution.trim()) {
      errs.institution = 'Instansi / unit kerja wajib diisi';
    }
    if (!position.trim()) {
      errs.position = 'Jabatan / peran wajib diisi';
    }
    if (!phone.trim()) {
      errs.phone = 'Nomor HP / WhatsApp wajib diisi';
    } else if (phone.replace(/[^0-9]/g, '').length < 9) {
      errs.phone = 'Nomor HP tidak valid (minimal 9 digit)';
    }
    if (!signature) {
      errs.signature = 'Tanda tangan digital wajib dibubuhkan';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`input-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    const actualType: AttendanceType =
      allowedMode === 'daring_only' ? 'daring' : 'luring';

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      meetingId: meeting.id,
      fullName: fullName.trim(),
      nip: '-',
      institution: institution.trim(),
      position: position.trim(),
      phone: phone.trim(),
      email: email.trim(),
      attendanceType: actualType,
      signature,
      notes: notes.trim(),
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      onSubmit(newRecord);
      setIsSubmitting(false);

      // Reset form
      setFullName('');
      setInstitution('');
      setPosition('');
      setPhone('');
      setEmail('');
      setSignature('');
      setNotes('');
      setErrors({});
    }, 300);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 md:p-8 space-y-6"
    >
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Formulir Presensi Kehadiran Peserta
          </h2>
          <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            Dit. PPISDA
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Agenda: <strong>{meeting.title}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nama Lengkap (Full Width) */}
        <div id="input-fullName" className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-700" />
            Nama Lengkap (beserta Gelar) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Ir. Hendra Wijaya, M.T."
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors({ ...errors, fullName: '' });
            }}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
              errors.fullName
                ? 'border-rose-400 focus:ring-rose-200 ring-1 ring-rose-300'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
            }`}
          />
          {errors.fullName && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Instansi */}
        <div id="input-institution" className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            Instansi / Lembaga / Unit Kerja <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Ditjen Pembiayaan Infrastruktur / Dinas PU / Badan Usaha"
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              if (errors.institution) setErrors({ ...errors, institution: '' });
            }}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
              errors.institution
                ? 'border-rose-400 focus:ring-rose-200 ring-1 ring-rose-300'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
            }`}
          />
          {errors.institution && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.institution}
            </p>
          )}
        </div>

        {/* Jabatan */}
        <div id="input-position" className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-700" />
            Jabatan / Posisi <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Sub Koordinator / Tenaga Ahli / Analis Pembiayaan"
            value={position}
            onChange={(e) => {
              setPosition(e.target.value);
              if (errors.position) setErrors({ ...errors, position: '' });
            }}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
              errors.position
                ? 'border-rose-400 focus:ring-rose-200 ring-1 ring-rose-300'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
            }`}
          />
          {errors.position && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.position}
            </p>
          )}
        </div>

        {/* No HP WhatsApp */}
        <div id="input-phone" className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-blue-700" />
            Nomor HP / WhatsApp Aktif <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="Contoh: 0812-3456-7890"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: '' });
            }}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
              errors.phone
                ? 'border-rose-400 focus:ring-rose-200 ring-1 ring-rose-300'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
            }`}
          />
          {errors.phone && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-700" />
            Alamat Email <span className="text-xs font-normal text-slate-500">(Opsional untuk resume)</span>
          </label>
          <input
            type="email"
            placeholder="Contoh: nama@pu.go.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Signature Pad (Paling lega & nyaman untuk tanda tangan) */}
      <div id="input-signature" className="pt-2">
        <SignaturePad
          value={signature}
          onChange={(val) => {
            setSignature(val);
            if (errors.signature) setErrors({ ...errors, signature: '' });
          }}
          error={errors.signature}
        />
      </div>

      {/* Keterangan Tambahan */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-700" />
          Keterangan / Disposisi Tambahan <span className="text-xs font-normal text-slate-500">(Opsional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="Catatan khusus, membawa mandat perwakilan, dll..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Menyimpan Presensi...</span>
            </div>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Kirim & Simpan Presensi Kehadiran</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-slate-500 mt-2">
          Dengan mengirim formulir ini, Anda mengonfirmasi kehadiran sah pada agenda Dit. PPISDA.
        </p>
      </div>
    </form>
  );
};
