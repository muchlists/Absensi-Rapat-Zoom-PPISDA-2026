import { Meeting, AttendanceRecord, AdminSettings } from '../types';

// Helper to generate a realistic SVG signature data URL
export function createMockSignatureSvg(name: string, variant: number = 1): string {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  const seed = variant;
  if (seed === 1) {
    ctx.moveTo(35, 95);
    ctx.bezierCurveTo(70, 30, 90, 140, 130, 60);
    ctx.bezierCurveTo(150, 110, 180, 50, 210, 85);
    ctx.bezierCurveTo(240, 120, 270, 70, 290, 85);
    ctx.moveTo(45, 120);
    ctx.lineTo(280, 110);
  } else if (seed === 2) {
    ctx.moveTo(40, 110);
    ctx.quadraticCurveTo(90, 20, 110, 100);
    ctx.quadraticCurveTo(140, 40, 180, 90);
    ctx.lineTo(240, 50);
    ctx.quadraticCurveTo(220, 130, 270, 95);
    ctx.moveTo(70, 125);
    ctx.lineTo(260, 115);
  } else if (seed === 3) {
    ctx.moveTo(50, 80);
    ctx.bezierCurveTo(90, 130, 110, 30, 150, 85);
    ctx.bezierCurveTo(180, 120, 220, 40, 250, 80);
    ctx.moveTo(35, 115);
    ctx.bezierCurveTo(110, 125, 200, 105, 280, 115);
  } else {
    ctx.moveTo(40, 85);
    ctx.lineTo(95, 45);
    ctx.lineTo(120, 125);
    ctx.lineTo(170, 60);
    ctx.lineTo(220, 110);
    ctx.bezierCurveTo(250, 50, 280, 120, 295, 75);
    ctx.moveTo(60, 130);
    ctx.lineTo(270, 120);
  }
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-001',
    title: 'Rapat Koordinasi Skema KPBU Pembiayaan Infrastruktur Sumber Daya Air',
    agenda: 'Sinkronisasi Rencana Proyek Kerjasama Pemerintah dan Badan Usaha (KPBU) Bendungan dan Daerah Irigasi',
    date: '2026-10-22',
    timeStart: '09:00',
    timeEnd: '12:30',
    timezone: 'WIB',
    location: 'Ruang Rapat Utama Gd. Ditjen Pembiayaan Infrastruktur Lt. 2 / Hybrid Zoom',
    organizer: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air (PPISDA)',
    leader: 'Dr. Ir. H. Bambang Priyono, M.Eng.',
    leaderNip: '19750812 200003 1 002',
    notetaker: 'Rina Kusuma Dewi, S.T., M.Sc.',
    allowedAttendanceMode: 'hybrid', // Bisa Luring atau Daring
    showLeaderSignature: true,
    signLocation: 'Jakarta',
    isActive: true,
    createdAt: '2026-10-20T08:00:00.000Z'
  },
  {
    id: 'meet-002',
    title: 'Konsultasi Publik Kajian Kelayakan Finansial SPAM & Irigasi Terpadu',
    agenda: 'Penyampaian Outline Business Case (OBC) dan Final Business Case (FBC) Pembiayaan Kreatif SDA',
    date: '2026-10-25',
    timeStart: '13:30',
    timeEnd: '16:30',
    timezone: 'WIB',
    location: 'Auditorium Kementerian PUPR Jakarta (Tatap Muka Langsung)',
    organizer: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air (PPISDA)',
    leader: 'Ir. Ahmad Zulkarnaen, M.T.',
    leaderNip: '19790315 200312 1 001',
    notetaker: 'Dimas Wicaksono, S.Kom.',
    allowedAttendanceMode: 'luring_only', // Khusus Luring Saja
    showLeaderSignature: true,
    signLocation: 'Jakarta',
    isActive: false,
    createdAt: '2026-10-18T10:00:00.000Z'
  },
  {
    id: 'meet-003',
    title: 'Webinar Sosialisasi Pedoman Pembiayaan Non-APBN Sektor SDA',
    agenda: 'Sharing session bersama Badan Usaha Pelaksana dan Lembaga Keuangan Multilateral',
    date: '2026-10-28',
    timeStart: '09:30',
    timeEnd: '12:00',
    timezone: 'WIB',
    location: 'Zoom Cloud Meeting Dit. PPISDA (ID: 884-2190-3321)',
    organizer: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air (PPISDA)',
    leader: 'Prof. Dr. Ir. Gunawan Wibisono, IPU',
    leaderNip: '19710419 199603 1 003',
    notetaker: 'Wahyu Nugroho, S.Si.',
    allowedAttendanceMode: 'daring_only', // Khusus Daring Saja
    showLeaderSignature: true,
    signLocation: 'Jakarta',
    isActive: false,
    createdAt: '2026-10-19T09:00:00.000Z'
  }
];

export const INITIAL_SETTINGS: AdminSettings = {
  adminPin: '102026',
  institutionName: 'DIREKTORAT PELAKSANAAN PEMBIAYAAN INFRASTRUKTUR SUMBER DAYA AIR (PPISDA)',
  subInstitution: 'Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum dan Perumahan - Kementerian PUPR',
  address: 'Jl. Pattimura No. 20, Kebayoran Baru, Jakarta Selatan 12110 - Telp: (021) 72796155'
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-001',
    meetingId: 'meet-001',
    fullName: 'Dr. Ir. H. Bambang Priyono, M.Eng.',
    nip: '19750812 200003 1 002',
    institution: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air (PPISDA)',
    position: 'Direktur PPISDA / Pimpinan Rapat',
    phone: '0812-3456-7890',
    email: 'bambang.priyono@pu.go.id',
    attendanceType: 'luring',
    signature: '',
    notes: 'Hadir tepat waktu di Ruang Rapat Lt. 3',
    timestamp: '2026-10-22T08:45:12.000Z'
  },
  {
    id: 'att-002',
    meetingId: 'meet-001',
    fullName: 'Ir. Siti Rahmawati, M.Sc.',
    nip: '19810420 200604 2 003',
    institution: 'Dinas PU Pengairan & ESDM',
    position: 'Kepala Bidang Irigasi & SDA',
    phone: '0813-8901-2345',
    email: 'siti.rahma@dinaspu.prov.go.id',
    attendanceType: 'luring',
    signature: '',
    notes: 'Membawa berkas pembaruan jaringan sekunder',
    timestamp: '2026-10-22T08:52:30.000Z'
  },
  {
    id: 'att-003',
    meetingId: 'meet-001',
    fullName: 'Agus Triyono, S.T., M.T.',
    nip: '19860719 201001 1 015',
    institution: 'Perum Jasa Tirta',
    position: 'Manajer Operasi Waduk & Sumber Air',
    phone: '0857-1234-5678',
    email: 'agus.tri@jasatirta.co.id',
    attendanceType: 'luring',
    signature: '',
    notes: 'Hadir langsung',
    timestamp: '2026-10-22T08:58:05.000Z'
  },
  {
    id: 'att-004',
    meetingId: 'meet-001',
    fullName: 'Wahyu Nugroho, S.Si.',
    nip: '19901102 201502 1 004',
    institution: 'Stasiun Klimatologi BMKG',
    position: 'Prakirawan Cuaca & Iklim',
    phone: '0819-7654-3210',
    email: 'wahyu.nugroho@bmkg.go.id',
    attendanceType: 'daring',
    signature: '',
    notes: 'Hadir via Zoom Meeting (ID: BMKG-Wahyu)',
    timestamp: '2026-10-22T09:02:44.000Z'
  },
  {
    id: 'att-005',
    meetingId: 'meet-001',
    fullName: 'Rina Kusuma Dewi, S.T., M.Sc.',
    nip: '19920311 201801 2 007',
    institution: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air (PPISDA)',
    position: 'Sekretaris / Notulis Rapat',
    phone: '0821-4321-9876',
    email: 'rina.dewi@pu.go.id',
    attendanceType: 'luring',
    signature: '',
    notes: 'Notulis dan dokumentasi',
    timestamp: '2026-10-22T08:40:19.000Z'
  },
  {
    id: 'att-006',
    meetingId: 'meet-001',
    fullName: 'Prof. Dr. Ir. Gunawan Wibisono, IPU',
    nip: '-',
    institution: 'Pusat Studi Sumber Daya Air Institut Teknologi',
    position: 'Tenaga Ahli / Narasumber',
    phone: '0811-9876-5432',
    email: 'gunawan.wibisono@itb.ac.id',
    attendanceType: 'daring',
    signature: '',
    notes: 'Narasumber kajian alokasi air waduk',
    timestamp: '2026-10-22T09:05:18.000Z'
  },
  {
    id: 'att-007',
    meetingId: 'meet-003',
    fullName: 'Dr. Hendra Gunawan, S.T., M.T.',
    nip: '19840215 200812 1 003',
    institution: 'PT Sarana Multi Infrastruktur (Persero)',
    position: 'VP Project Advisory',
    phone: '0812-9988-7766',
    email: 'hendra.gunawan@ptsmi.co.id',
    attendanceType: 'daring',
    signature: '',
    notes: 'Bergabung via Zoom Webinar',
    timestamp: '2026-10-28T09:15:20.000Z'
  },
  {
    id: 'att-008',
    meetingId: 'meet-003',
    fullName: 'Siti Nurhaliza, S.E., M.Fin.',
    nip: '-',
    institution: 'Asian Development Bank (ADB)',
    position: 'Infrastructure Finance Specialist',
    phone: '0813-1122-3344',
    email: 'snurhaliza@adb.org',
    attendanceType: 'daring',
    signature: '',
    notes: 'Peserta diskusi skema blended finance',
    timestamp: '2026-10-28T09:22:10.000Z'
  }
];
