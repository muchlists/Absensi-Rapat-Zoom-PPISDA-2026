import { AttendanceRecord, Meeting } from '../types';

export function exportAttendanceToCSV(
  meeting: Meeting,
  records: AttendanceRecord[],
  categoryFilter?: 'luring' | 'daring' | 'all'
): void {
  // Enforce attendance mode restriction if meeting is configured as daring_only or luring_only
  let effectiveFilter = categoryFilter;
  if (meeting.allowedAttendanceMode === 'daring_only') {
    effectiveFilter = 'daring';
  } else if (meeting.allowedAttendanceMode === 'luring_only') {
    effectiveFilter = 'luring';
  }

  const filteredRecords =
    effectiveFilter && effectiveFilter !== 'all'
      ? records.filter((r) => r.attendanceType === effectiveFilter)
      : records;

  const categoryName =
    effectiveFilter === 'luring'
      ? 'KHUSUS PESERTA LURING (TATAP MUKA)'
      : effectiveFilter === 'daring'
      ? 'KHUSUS PESERTA DARING (ONLINE/ZOOM)'
      : 'SELURUH PESERTA (GABUNGAN)';

  // Indonesian standard date formatting
  const formattedDate = new Date(meeting.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Header meta rows for Indonesian official documentation
  const metaRows = [
    `"DAFTAR HADIR RAPAT - ${categoryName}"`,
    `"AGENDA / TOPIK :","${meeting.title.replace(/"/g, '""')}"`,
    `"HARI / TANGGAL :","${formattedDate}"`,
    `"WAKTU :","${meeting.timeStart} - ${meeting.timeEnd || 'Selesai'} ${meeting.timezone || 'WIB'}"`,
    `"TEMPAT :","${meeting.location.replace(/"/g, '""')}"`,
    `"PENYELENGGARA :","${meeting.organizer.replace(/"/g, '""')}"`,
    `"PIMPINAN RAPAT :","${meeting.leader.replace(/"/g, '""')}"`,
    `""`
  ];

  // Column Headers
  const columnHeaders = [
    '"No."',
    '"Waktu Presensi"',
    '"Nama Lengkap"',
    '"NIP / NIK"',
    '"Instansi / Lembaga / Unit Kerja"',
    '"Jabatan / Posisi"',
    '"Nomor HP / WhatsApp"',
    '"Email"',
    '"Kehadiran"',
    '"Tanda Tangan Digital"',
    '"Catatan / Keterangan"'
  ];

  // Data rows
  const dataRows = filteredRecords.map((rec, index) => {
    const time = new Date(rec.timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const date = new Date(rec.timestamp).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const signStatus = rec.signature ? 'Tervalidasi (Digital)' : 'Belum';
    const typeLabel = rec.attendanceType === 'luring' ? 'Hadir Langsung (Luring)' : 'Hadir Online (Daring)';

    return [
      `"${index + 1}"`,
      `"${date} ${time}"`,
      `"${(rec.fullName || '').replace(/"/g, '""')}"`,
      `"${(rec.nip || '-').replace(/"/g, '""')}"`,
      `"${(rec.institution || '').replace(/"/g, '""')}"`,
      `"${(rec.position || '').replace(/"/g, '""')}"`,
      `"'\t${(rec.phone || '').replace(/"/g, '""')}"`,
      `"${(rec.email || '-').replace(/"/g, '""')}"`,
      `"${typeLabel}"`,
      `"${signStatus}"`,
      `"${(rec.notes || '-').replace(/"/g, '""')}"`
    ].join(',');
  });

  // Footer summary
  const summaryRows = [
    `""`,
    `"RINGKASAN KEHADIRAN"`,
    `"Jumlah Peserta Terdaftar :","${filteredRecords.length} orang"`,
    `"Mengetahui Pimpinan Rapat :","${meeting.leader.replace(/"/g, '""')}"`
  ];

  const fullContent = [
    ...metaRows,
    columnHeaders.join(','),
    ...dataRows,
    ...summaryRows
  ].join('\r\n');

  // Add UTF-8 BOM
  const blob = new Blob(['\uFEFF' + fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const cleanTitle = meeting.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const tag = categoryFilter ? `_${categoryFilter}` : '';
  link.setAttribute('href', url);
  link.setAttribute('download', `Daftar_Hadir_${cleanTitle}${tag}_${meeting.date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
