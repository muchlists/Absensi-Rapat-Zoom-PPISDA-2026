import React, { useState, useMemo } from 'react';
import { Search, Users, CheckCircle2, Video, MapPin, Clock, Layers, SplitSquareVertical } from 'lucide-react';
import { AttendanceRecord, Meeting } from '../types';

interface PublicAttendanceListProps {
  records: AttendanceRecord[];
  meeting?: Meeting;
}

export const PublicAttendanceList: React.FC<PublicAttendanceListProps> = ({ records, meeting }) => {
  const allowedMode = meeting?.allowedAttendanceMode || 'hybrid';

  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize view mode based on meeting configuration
  const [viewMode, setViewMode] = useState<'split' | 'luring_only' | 'daring_only' | 'combined'>(() => {
    if (allowedMode === 'luring_only') return 'luring_only';
    if (allowedMode === 'daring_only') return 'daring_only';
    return 'split';
  });

  const luringRecords = useMemo(() => {
    return records
      .filter((r) => r.attendanceType === 'luring')
      .filter((rec) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          rec.fullName.toLowerCase().includes(q) ||
          rec.institution.toLowerCase().includes(q) ||
          rec.position.toLowerCase().includes(q) ||
          rec.nip.toLowerCase().includes(q)
        );
      });
  }, [records, searchQuery]);

  const daringRecords = useMemo(() => {
    return records
      .filter((r) => r.attendanceType === 'daring')
      .filter((rec) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          rec.fullName.toLowerCase().includes(q) ||
          rec.institution.toLowerCase().includes(q) ||
          rec.position.toLowerCase().includes(q) ||
          rec.nip.toLowerCase().includes(q)
        );
      });
  }, [records, searchQuery]);

  const combinedRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(
      (rec) =>
        rec.fullName.toLowerCase().includes(q) ||
        rec.institution.toLowerCase().includes(q) ||
        rec.position.toLowerCase().includes(q) ||
        rec.nip.toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

  // Table renderer - NOTE: TOTAL HADIR COUNTS ARE HIDDEN FROM MAIN VIEW AS INSTRUCTED
  const renderTable = (
    data: AttendanceRecord[],
    title: string,
    badgeLabel: string,
    icon: React.ReactNode,
    emptyMessage: string
  ) => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Subheader - No aggregate participant counts displayed */}
        <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{badgeLabel}</p>
            </div>
          </div>
        </div>

        {/* Rows */}
        {data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4 text-center w-12">No.</th>
                  <th className="py-2.5 px-4">Nama Lengkap</th>
                  <th className="py-2.5 px-4">Instansi / Unit Kerja</th>
                  <th className="py-2.5 px-4">Jabatan</th>
                  <th className="py-2.5 px-4 text-center">Waktu Presensi</th>
                  <th className="py-2.5 px-4 text-center">Tanda Tangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {data.map((record, index) => {
                  const timeString = new Date(record.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-600 tabular-nums">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        <div>{record.fullName}</div>
                        {record.nip && record.nip !== '-' && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            NIP: {record.nip}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-normal">
                        {record.institution}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-normal">
                        {record.position}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600 tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {timeString} {meeting?.timezone || 'WIB'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {record.signature ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & View Mode Control Bar - TOTAL HADIR HIDDEN FROM MAIN VIEW */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-800" />
              Daftar Peserta Rapat Terdaftar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar kehadiran resmi peserta rapat Direktorat Pelaksanaan Pembiayaan Infrastruktur SDA.
          </p>
        </div>

        {/* View Mode Selector & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Only show mode switcher if meeting is hybrid */}
          {allowedMode === 'hybrid' && (
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                title="Tampilkan tabel Luring dan Daring terpisah"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'split'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Terpisah</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('luring_only')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  viewMode === 'luring_only'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hanya Luring
              </button>

              <button
                type="button"
                onClick={() => setViewMode('daring_only')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  viewMode === 'daring_only'
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hanya Daring
              </button>

              <button
                type="button"
                onClick={() => setViewMode('combined')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  viewMode === 'combined'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gabungan
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama / instansi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* RENDER ACCORDING TO VIEW MODE */}
      {viewMode === 'split' && (
        <div className="space-y-6">
          {/* TABEL 1: PESERTA LURING */}
          {renderTable(
            luringRecords,
            'DAFTAR HADIR PESERTA LURING (TATAP MUKA LANGSUNG)',
            'Hadir secara fisik di ruang rapat lokasi kegiatan',
            <MapPin className="w-4 h-4 text-emerald-600" />,
            'Belum ada peserta yang mengisi kehadiran Luring.'
          )}

          {/* TABEL 2: PESERTA DARING */}
          {renderTable(
            daringRecords,
            'DAFTAR HADIR PESERTA DARING (ONLINE / VIRTUAL ZOOM)',
            'Mengikuti rapat via platform daring / Zoom Cloud Meeting',
            <Video className="w-4 h-4 text-sky-600" />,
            'Belum ada peserta yang mengisi kehadiran Daring.'
          )}
        </div>
      )}

      {viewMode === 'luring_only' && (
        <div>
          {renderTable(
            luringRecords,
            'DAFTAR HADIR PESERTA LURING (TATAP MUKA LANGSUNG)',
            'Hadir secara fisik di ruang rapat lokasi kegiatan',
            <MapPin className="w-4 h-4 text-emerald-600" />,
            'Belum ada peserta yang mengisi kehadiran Luring.'
          )}
        </div>
      )}

      {viewMode === 'daring_only' && (
        <div>
          {renderTable(
            daringRecords,
            'DAFTAR HADIR PESERTA DARING (ONLINE / VIRTUAL ZOOM)',
            'Mengikuti rapat via platform daring / Zoom Cloud Meeting',
            <Video className="w-4 h-4 text-sky-600" />,
            'Belum ada peserta yang mengisi kehadiran Daring.'
          )}
        </div>
      )}

      {viewMode === 'combined' && (
        <div>
          {renderTable(
            combinedRecords,
            'DAFTAR HADIR SELURUH PESERTA (GABUNGAN)',
            'Semua peserta baik yang hadir langsung maupun daring',
            <Layers className="w-4 h-4 text-blue-700" />,
            'Belum ada peserta yang mengisi kehadiran.'
          )}
        </div>
      )}
    </div>
  );
};
