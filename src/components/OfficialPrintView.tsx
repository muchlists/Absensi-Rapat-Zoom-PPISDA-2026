import React, { useState } from 'react';
import { X, Printer, Download, Video, MapPin, Layers } from 'lucide-react';
import { AttendanceRecord, Meeting, AdminSettings } from '../types';
import { generateAttendancePDF, PdfExportMode } from '../utils/pdfGenerator';

interface OfficialPrintViewProps {
  meeting: Meeting;
  records: AttendanceRecord[];
  settings?: AdminSettings;
  onClose: () => void;
}

export const OfficialPrintView: React.FC<OfficialPrintViewProps> = ({
  meeting,
  records,
  settings,
  onClose
}) => {
  const isDaringOnly = meeting.allowedAttendanceMode === 'daring_only';
  const isLuringOnly = meeting.allowedAttendanceMode === 'luring_only';

  const [printFilter, setPrintFilter] = useState<'both' | 'luring' | 'daring'>(() => {
    if (isDaringOnly) return 'daring';
    if (isLuringOnly) return 'luring';
    return 'both';
  });

  const formattedDate = new Date(meeting.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const luringRecords = records.filter((r) => r.attendanceType === 'luring');
  const daringRecords = records.filter((r) => r.attendanceType === 'daring');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const mode: PdfExportMode = isDaringOnly
      ? 'daring_only'
      : isLuringOnly
      ? 'luring_only'
      : printFilter === 'luring'
      ? 'luring_only'
      : printFilter === 'daring'
      ? 'daring_only'
      : 'separate_sheets';
    generateAttendancePDF(meeting, records, settings, mode);
  };

  const renderSinglePrintSheet = (
    data: AttendanceRecord[],
    titleBadge: string,
    badgeColor: string,
    isSecondPage: boolean = false
  ) => {
    return (
      <div
        className={`p-4 sm:p-8 md:p-12 bg-white text-slate-900 rounded-xl shadow-xs border border-slate-200/90 print:shadow-none print:border-none print:rounded-none print:p-0 ${
          isSecondPage
            ? 'print:break-before-page border-t-4 border-dashed border-slate-300 mt-8 pt-8 print:border-none print:mt-0 print:pt-0'
            : ''
        }`}
      >
        {/* JUDUL DAFTAR HADIR (TANPA KOP SURAT SESUAI PERMINTAAN USER) */}
        <div className="text-center mb-5">
          <h1 className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-slate-900 underline decoration-1 underline-offset-4">
            DAFTAR HADIR RAPAT
          </h1>
          <div className="mt-1">
            <span className={`inline-block text-[11px] sm:text-xs font-bold px-3 py-0.5 rounded-full ${badgeColor}`}>
              {titleBadge}
            </span>
          </div>
        </div>

        {/* DETAIL RAPAT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 text-xs text-slate-800 mb-5 bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200/80">
          <div className="flex">
            <span className="w-28 sm:w-32 font-semibold shrink-0">Agenda / Topik</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1 font-medium">{meeting.title}</span>
          </div>
          <div className="flex">
            <span className="w-28 sm:w-32 font-semibold shrink-0">Tempat / Ruang</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1 font-medium">{meeting.location}</span>
          </div>
          <div className="flex">
            <span className="w-28 sm:w-32 font-semibold shrink-0">Hari / Tanggal</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1 font-medium">{formattedDate}</span>
          </div>
          <div className="flex">
            <span className="w-28 sm:w-32 font-semibold shrink-0">Penyelenggara</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1 font-medium">{meeting.organizer}</span>
          </div>
          <div className="flex">
            <span className="w-28 sm:w-32 font-semibold shrink-0">Waktu Pelaksanaan</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1 font-mono tabular-nums">
              {meeting.timeStart} - {meeting.timeEnd || 'Selesai'} WIB
            </span>
          </div>
          <div className="flex">
            <span className="w-28 sm:w-32 font-semibold shrink-0">Pimpinan Rapat</span>
            <span className="w-3 shrink-0">:</span>
            <span className="flex-1 font-medium">{meeting.leader}</span>
          </div>
        </div>

        {/* TABEL KEHADIRAN DENGAN TANDA TANGAN (HORIZONTAL SCROLL ON MOBILE, EXPANDED ON PRINT) */}
        <div className="border border-slate-400 overflow-x-auto rounded-xs print:overflow-visible">
          <table className="w-full text-left border-collapse text-xs print:text-[11px] min-w-[640px] sm:min-w-0">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 font-bold text-slate-900 text-center">
                <th className="py-2.5 px-2 border-r border-slate-300 w-10">No.</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left">Nama Lengkap & NIP</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left">Instansi / Unit Kerja</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left">Jabatan</th>
                <th className="py-2.5 px-3 border-r border-slate-300 w-28 text-center">No. HP</th>
                <th className="py-2.5 px-3 w-36 text-center">Tanda Tangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Belum ada peserta yang terdaftar pada kategori presensi ini.
                  </td>
                </tr>
              ) : (
                data.map((rec, index) => (
                  <tr key={rec.id} className="align-middle hover:bg-slate-50/50 print:hover:bg-transparent">
                    <td className="py-2 px-2 text-center border-r border-slate-300 font-mono font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300">
                      <div className="font-semibold text-slate-900">{rec.fullName}</div>
                      {rec.nip && rec.nip !== '-' && (
                        <div className="text-[11px] text-slate-500 font-mono">NIP. {rec.nip}</div>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300">{rec.institution}</td>
                    <td className="py-2 px-3 border-r border-slate-300">{rec.position}</td>
                    <td className="py-2 px-3 text-center border-r border-slate-300 font-mono text-[11px]">
                      {rec.phone}
                    </td>
                    <td className="py-1 px-2 text-center h-14 w-36 align-middle">
                      {rec.signature ? (
                        <div className="flex items-center justify-center h-full">
                          <img
                            src={rec.signature}
                            alt="TTD"
                            className="max-h-12 max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">(Belum TTD)</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER & PENGESAHAN */}
        <div className="mt-7 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs text-slate-800">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 w-full sm:w-auto">
            <div className="font-bold text-slate-900 text-xs">Rekapitulasi:</div>
            <div>
              • Jumlah Peserta Terdaftar : <strong className="font-mono">{data.length}</strong> Orang
            </div>
            <div>
              • Tanda Tangan Terisi :{' '}
              <strong className="font-mono">{data.filter((r) => !!r.signature).length}</strong> Orang
            </div>
          </div>

          {meeting.showLeaderSignature !== false && (
            <div className="text-center sm:text-right w-full sm:w-64 space-y-1 self-end sm:self-auto">
              <div>{meeting.signLocation?.trim() || 'Lokasi Rapat'}, {formattedDate}</div>
              <div className="font-bold">Mengetahui / Mengesahkan,</div>
              <div className="font-bold">Pimpinan Rapat</div>

              <div className="h-14 flex items-center justify-center sm:justify-end">
                <span className="text-[10px] text-slate-300 italic">(Tanda Tangan & Cap)</span>
              </div>

              <div className="font-bold underline text-slate-900">{meeting.leader}</div>
              {meeting.leaderNip && (
                <div className="font-mono text-[11px] text-slate-500">NIP. {meeting.leaderNip}</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:overflow-visible flex items-start justify-center">
      {/* Modal Dialog Container with clean responsive height and inner scroll */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-300 my-2 sm:my-6 flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-3rem)] print:max-h-none print:my-0 print:border-none print:shadow-none overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Control Bar (Padded & Sticky Header, Hidden on Native Print) */}
        <div className="no-print shrink-0 bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight">
                Pratinjau Cetak Daftar Hadir Resmi
              </h3>
              {isDaringOnly ? (
                <span className="text-[11px] font-semibold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                  Format: Daring Saja (Zoom)
                </span>
              ) : isLuringOnly ? (
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Format: Luring Saja (Tatap Muka)
                </span>
              ) : (
                <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                  Format: Lembar Terpisah Luring & Daring
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {isDaringOnly
                ? 'Dokumen presensi khusus daring (tanpa lembar luring) dengan tanda tangan digital'
                : isLuringOnly
                ? 'Dokumen presensi khusus luring (tanpa lembar daring) dengan tanda tangan digital'
                : 'Dokumen resmi ber-tanda tangan digital dengan nomor urut terpisah'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Filter buttons - ONLY shown if meeting is hybrid */}
            {!isDaringOnly && !isLuringOnly && (
              <div className="inline-flex p-0.5 bg-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPrintFilter('both')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    printFilter === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Kedua Lembar
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFilter('luring')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    printFilter === 'luring' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Luring
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFilter('daring')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    printFilter === 'daring' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Daring
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Tutup Pratinjau (ESC)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Paper Canvas Container - Smooth vertical scrolling for both sheets */}
        <div className="overflow-y-auto overscroll-contain flex-1 p-2 sm:p-6 bg-slate-100/70 print:p-0 print:bg-white print:overflow-visible">
          <div className="max-w-4xl mx-auto space-y-6 print:space-y-0">
            {isDaringOnly ? (
              /* Daring Only Meeting: Strictly only render Daring sheet (NO Luring sheet) */
              renderSinglePrintSheet(
                daringRecords,
                'PESERTA DARING (ONLINE / ZOOM CLOUD MEETING)',
                'bg-sky-100 text-sky-800',
                false
              )
            ) : isLuringOnly ? (
              /* Luring Only Meeting: Strictly only render Luring sheet (NO Daring sheet) */
              renderSinglePrintSheet(
                luringRecords,
                'PESERTA LURING (TATAP MUKA LANGSUNG)',
                'bg-emerald-100 text-emerald-800',
                false
              )
            ) : (
              /* Hybrid Meeting: Render according to filter */
              <>
                {(printFilter === 'both' || printFilter === 'luring') &&
                  renderSinglePrintSheet(
                    luringRecords,
                    'PESERTA LURING (TATAP MUKA LANGSUNG)',
                    'bg-emerald-100 text-emerald-800',
                    false
                  )}

                {(printFilter === 'both' || printFilter === 'daring') &&
                  renderSinglePrintSheet(
                    daringRecords,
                    'PESERTA DARING (ONLINE / ZOOM CLOUD MEETING)',
                    'bg-sky-100 text-sky-800',
                    printFilter === 'both'
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
