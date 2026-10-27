import { Meeting, AttendanceRecord, AdminSettings } from '../types';
import { trimCanvasWhitespace } from '../utils/textUtils';

// Helper to generate a realistic signature data URL with trimmed margins
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

  return trimCanvasWhitespace(canvas);
}

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1792664134359',
    title: 'Rapat Koordinasi Pengembangan PLTS Terapung pada Bendungan Batu Bulan, Sumbawa, Nusa Tenggara Barat',
    agenda: 'Pembahasan kesesuaian rencana tata ruang, kesiapan sistem ketenegalistrikan dan data teknis bendungan Batu Bulan',
    date: '2026-10-28',
    timeStart: '09:00',
    timeEnd: '16:00',
    timezone: 'WITA',
    location: 'Ruang Rapat Unit Pengelola Bendungan Batu Bulan / Zoom',
    organizer: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air, Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum',
    leader: 'Adi Prasetyo',
    leaderNip: '',
    notetaker: '',
    allowedAttendanceMode: 'daring_only',
    showLeaderSignature: false,
    signLocation: 'Jakarta',
    isActive: true,
    createdAt: '2026-10-22T10:15:34.359Z'
  },

  {
    id: 'meet-001',
    title: 'Rapat Koordinasi Skema KPBU Pembiayaan Infrastruktur Sumber Daya Air',
    agenda: 'Sinkronisasi Rencana Proyek Kerjasama Pemerintah dan Badan Usaha (KPBU) Bendungan dan Daerah Irigasi',
    date: '2026-10-22',
    timeStart: '09:00',
    timeEnd: '12:30',
    timezone: 'WIB',
    location: 'Ruang Rapat Utama Gd. Ditjen Pembiayaan Infrastruktur Lt. 2 / Hybrid Zoom',
    organizer: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air, Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum',
    leader: 'Dr. Ir. H. Bambang Priyono, M.Eng.',
    leaderNip: '19750812 200003 1 002',
    notetaker: 'Rina Kusuma Dewi, S.T., M.Sc.',
    allowedAttendanceMode: 'hybrid', // Bisa Luring atau Daring
    showLeaderSignature: true,
    signLocation: 'Jakarta',
    isActive: false,
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
    organizer: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air, Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum',
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
    organizer: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air, Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum',
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
  institutionName: 'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air, Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum',
  subInstitution: 'Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum dan Perumahan - Kementerian PUPR',
  address: 'Jl. Pattimura No. 20, Kebayoran Baru, Jakarta Selatan 12110 - Telp: (021) 72796155'
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1792726961804-obw4',
    meetingId: 'meet-1792664134359',
    fullName: 'Muchlis Ahmad Tri Setiawan',
    nip: '-',
    institution: 'DJPI',
    position: 'Pengelola SDA Ahli Pertama',
    phone: '082173980496',
    email: 'muchlists@gmail.com',
    attendanceType: 'daring',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABH4AAAD6CAYAAADX24DEAAAQAElEQVR4AezdC7RkV3kY6H/X7YceoDbYgC1135YYzTBEAzaRM6K7hRFexgFjgz22sMDGj4xtgjEywuqWhGdmXbMAqW8LYWSWHZz4kQdkDAkLSHjYkKSBfiA7nUAITnCQ1H3ViAB2AIHU6setnX2qTvWLvq37qFtVp+qrdfbZ+5w6Z+9/f1trqde/Tp3bCh8CBAgQIECAAAECBAgQIEBg3AXMb0IFJH4mdOFNmwABAgQIECBAgACBSRUwbwIEJklA4meSVttcCRAgQIAAAQIECJwuoE2AAAECYy8g8TP2S2yCBAgQIECAAIHHFnAFAQIECBAgMJ4CEj/jua5mRYAAAQIEliuwrPumt+765emts1/olC2zH53eNvu5Tdt2vnhZnbmJAAECBAgQIECgbwISP32j1BEBAgTGTcB8CCxBIOW3lqv/l05J8UOR42+lnN47XRJC5ZyNAAECBAgQIEBgSAISP0OCNyyBRgkIlgABAucRmN46+yuR00XnuGQqIv9++f7PNm6567JzfO8UAQIECBAgQIDAKgtI/Kwy8Lh1bz4ECBAgQKAnsHnrri3TW3c9WI7fURI8qdRV9bEnHd2wrpXjuog4GN3P81vpxF+Wa3+5e2hPgAABAgQIECAwKIHlJn4GFZ9xCBAgQIAAgREUeOrVd2zIkT9WMj3fU4d3b7s1/7y5/duff+DAK48f3L/j4+285m+V795WSi7lknLt709vm/3opm07Ly3HNgIECBAgQKAZAqJsuIDET8MXUPgECBAgQGDwAjmdWN96Vxm39/OuT5YkzzMO77ltdzl3cju8/3VH5vbteG204znl5MFSSu4nfijl9F88/dPRsCNAgEDDBIRLgEATBSR+mrhqYiZAgAABAkMU2LR11xvK8D9SStnyB+f2bX9uleQpB+fc5j61Y29JDPWe/qmu6T79s3X2i5u27fz+6oRCgEDDBIRLgAABAo0RkPhpzFIJlAABAgQIDF9g89ZdL0oR/08dyb1H1h25ISJVP+WK832qxFDn6Z/Urp7+OVRfe2mKtPvKa+4uiaD6jKpxAgImQIAAAQIERltA4me010d0BAgQIEBgZASmn33HS9uR39cNKH+rlVs/+tXdM9/qHseiqrm9t+5p5zVPj8h7OjfkuPjYmkf/ZVz/7qnOsR0BAgQIECBAgEBfBSR++sqpMwIECBCIYDCOAhu33PGMaLXemSLWVPNL0brh4P6b/2ss49N9+ueW6smfD3Ruz/FDmx48WL0EunNoR4AAAQIECBAg0D+BVv+60hMBAgTOEnBIgMBYCFz+d2a/u5VaHyqT6SR9co6PHNq3/YPleEVbO6+5oXTw6VKqH4u9evO22V+q2goBAgQIECBAgED/BCR++mepp/MI+IoAAQIEmimwcctdF+Z18acl+o2lRE7xrgf273hh1V5pqZ78SVNrfyQif6nqqySU/sHmbTufV7UVAgQIECBAgACB/ggMOvHTn6j1QoAAAQIECAxAYKbVSifeXRIyz6wGSxEff/KjG36haverHPrkTV9qRSrJnzha+pzKOb1v8w/suqK0bQQIECBAgECzBUQ/IgKtEYlDGAQIECBAgMCICUxvu/AtJaQfLaXa/tva+QtefODAK49XB/0sB/ft+HTkeEXd5yVxov0Rf+mr1lARIEBgLARMggCBYQpI/AxT39gECBAgQGBEBTZtnX1V5PTaOryvtdrzP/yFe258qD7uezW3f8d7IvJvVR3nSP/bsalH3+cvfVUaCoExEzAdAgQIEBi4gMTPwMkNSIAAAQIERltgeuvOG1PE79ZRHk2RXnTwU7cdrI9XrZrbd8tM6bz7l74inucvfRWNMd5MjQABAgQIEBiMgMTPYJyNQoAAAQIEmiTwpl6wOcXPH9q3fX/veBXqM7r0l77O4HBAgAABAgQIEFixgMTPigl1QIAAAQL9EdDLKAhs3nLH1oj0uOh88r4H9u74k05zQDt/6WtA0IYhQIAAAQIEJkZA4mdiltpECTRIQKgECAxNIKfWjScHb7V7L1w+eWoQDX/paxDKxiBAgAABAgQmRUDiZ1JWuqHzFDYBAgQIDE7gimve9JQy2k+WUm0fndtz231VYxjl4Lf9pa981zDiMCYBAgQIECBAoOkCTUn8NN1Z/AQIECBAYOQF2lNrXlOCXFNKRI67O/UQd9Vf+koR/28VQs5xT1UrBAgQIECAwNgLmGCfBSR++gyqOwIECBAg0ESBK1949/oc6VV17PfN7d/+wbo91OrQvh1vnNu3I5Uk0B1DDcTgBAgQIDAEAUMSINAPAYmffijqgwABAgQINFzg2ENHbihTeGIpkVO8PSLl8CFAgMCoCIiDAAECBJYtIPGzbDo3EiBAgACBMRLI6bX1bB5Zf+KCP6jbI1dNb519zfTWnX82vWXnbSMXnIAGImAQAgQIECBAYGkCEj9L83I1AQIECBAYO4HpZ89uK5P6vlIiRfrjL9xz40NVexRL6rzzJz0/p7hpFOMTEwECBAgQIEBg1AQkfkZtRcRDgAABAksUcPmKBVpRvdS5001unXhLpzGiuxxxtAotRfrOy6+buaBqKwQIECBAgAABAgsLSPwsbOMbAgSaJiBeAgSWLHDFNW96SrnpJ0upto/O7bntvqoxqiWlNFPH1srHLt5at1UECBAgQIAAAQILCEj8LADjdLMFRE+AAAECixNoT62pnvZZ07k6x92deoR37Zx398LLKb+s11YTIECAAAECBAicW2DcEz/nnrWzBAgQIECAQFz5wrvX50ivqinum9u//YN1e2SrB/btuLcEd6yUiJx/1s+9OhJ2BAgQIECAQASDBQQkfhaAcZoAAQIECIy7wLGvP/r6MscnlhI5xdsjUo4GfHLO/6YbZrqgfeyiG7ttewIECBAg0BNQEyBwuoDEz+ka2gQIECBAYJIEUvx6d7ppfu2j7T/stkd/P3/syE+VKL9SSrX95sYtd3WSV9WBQoAAgTMEHBAgQIBASPz4j4AAAQIECEygwKatd/5AmfaGUsqW/8N9B279Rmk0YnvwwMwjKaXqaaUq3ktSzP9W1VAInE/AdwQIECBAYFIFJH4mdeXNmwABAgQmWiBF+zdqgByt+RvqdmOqQ3sf/qMS7OdKiZTyqzZeM/u/Vu1FFJcQIECAAAECBCZKQOJnopbbZAkQIEDglMDktqavvf2pZfY/VkqkiPfP7bntvqrdrDLTbrXSr9UxT7WmYlfdVhEgQIAAAQIECJwmIPFzGoYmAQITKmDaBCZMIOep15Upl5xPRDtaby3tRm4H92zfHZH+NLqfl2zeumtLt2lPgAABAgQIECDQE5D46UmoCUQEBAIECIy7wNO27Xx8yvGL1TxzpM88sO/mT1TtxpY0X/1krV3FnyO/vaoVAgQIECBAgACBUwISP6csTm9pEyBAgACBsRQ40k6vLhO7qJRo5Zit6iaXub23fi7nXL3vp5rG355+9uxrqoZCgAABAgQIEFikwNhfJvEz9ktsggQIECBAoBa4bmZNpLipPjp8aP3D767bja7WpdbrI9J8VJ9WvLGqFAIECBAgsHQBdxAYTwGJn/FcV7MiQIAAAQLfJrD5+IU/XU4+uZSy5bfH7pkTpdH47d5927+Scv5kPZFLNm3beWndVhEgQGB5Au4iQIDAGAlI/IzRYpoKAQIECBA4n0A7t7bX3z9yYYrfrdtjUc1H7OxNJLXT9b22msBKBdxPgAABAgSaLiDx0/QVFD8BAgQIEFiEwMYts89Nkb+3ujTn9Ief33vLN6v2uJQNDz3yb8tcHiklIsWLo/8fPRIgQIAAAQIEGikg8dPIZRM0AQIECAxPoJkjt1K8ro48p6kTb63bY1N97nMzxyLSh6L7ee6V19x9SbdpT4AAAQIECBCYbAGJn8lef7MnQGAlAu4l0BCB6Wtvf2oJ9cdKqbYPzO257b6qMYbl/fWcpo6vOdKbb31KRYAAAQIECBCYTAGJn8lcd7Pus4DuCBAgMMoCOU9VT/ukKsYcrbuqehzLuvn1Hyjzmi8lcqSXVLVCgAABAgQIEJh0AYmf/v4XoDcCBAgQIDBSAk/btvPxKccvVkGVZMhnHth38yeq9riU6a27fnZ6y86/3Lxt9r3Hph79VMn4/FVnbjledNVVM+s6bTsCBAgQIECAQP8FGtOjxE9jlkqgBAgQIEBg6QJH2unV5a6LSolWjtmqHpeycctdF0bkfxQpPT3n+Ikyr6dHiqeVutoueuiSC55XNRQCBAgQILC6AnonMNoCEj+jvT6iI0CAAAECyxe4bmZNSYTcVHfwlUPrH3533R6LKrVO7CoTWV/K6dvJf9u0UsvPvU6X0SZAYPUFjECAAIERFDj5j6MRjE1IBAgQIECAwAoENh+9+LZy+5NLKVu+K3bPnCiNsdg2X7vr5SlH9TRT5Mhz0XrcEyPyvzh9cjnihtOPtQkMUsBYBAgQIEBgVAQkfkZlJcRBgAABAgT6LJBT/o1ul2m+tW7dO7rt5u+r9xbldv5HvZmklH9mbs+vfm3usituiJxPf6rpCZu2zv5C77oh1YYlQIAAAQIECAxVQOJnqPwGJ0CAAIHJERjsTDdumX1uGXFDKZEif/zg7pu+XrXHoTzSbv1xmceFpVTbJ+f23rqnasR7Xjo/t/GKl5f2vaV0thTxB5u27vLkT0fDjgABAgQIEJhEgdYkTtqcCRAgMFQBgxMYgEArxc31MO1Yk36pbje+2rxl9tUp5f+rnshfzK175Afrdreqkj+XXf60iDQf3U+hyGPztFN3SvYECBAgQIAAgcULSPws3sqVBPouoEMCBAishsAV23aWxEe8qNt3eu+hT2y/v9tu9n7Tttmfzinurmfx9XZe8xPnfG9RSf5E5IP1dVV1ycYtsy+oGgoBAgQIECBAYNIEJH5GY8VFQYAAAQIE+iYwn9PrSmeplGjndvWXr6pm40vKUT250/m3SzvHyw7vf90XF55U/q/1d7mqWym/uaoVAgQIECBAgMCQBQY+fOcfTwMf1YAECBAgQIDAqghMX3v7E0rH9QuN077D+2/583Lc+G3ztjtfWCbReWdR5Nh7eP+Oj5TjBbec0jeqL0v263hVR6Rn1X2EDwECBAgQGA0BURAYjIDEz2CcjUKAAAECBAYj0G79ehloXSmRUvstVT0OJef5N9XzOHJifevH6/aCVWrHQ9WXOaKyONJpn+qjOlQIECAwOgIiIUCAwCoKtFaxb10TIECAAAECAxS46qqZkuRIN3aGzHH/ob1H3tdpN3y3edvsj0SkZ0X38zsP7r75r7vN8+xTN/HTvSL/w27tqZ+ug/0oC4iNAAECBAj0W0Dip9+i+iNAgAABAkMS+OaGi6qfeFU/9YoU8ZaImfaQQunrsDnnN9YdHjmxrrWodxblSJ0nfqr75ltr/rDUR0qJ054cqg5HuYiNAAECBAgQINAXAYmfvjDqhAABAgQIrJbAYvvNJdcTtxZBTwAAEABJREFU1Uudqxu+Nh+dZEfVbnRZ1tM+ZcYp8snEz1Q+fiJyens5Xbb0rOmts68pDRsBAgQIECBAYCIEJH4mYplNkgCBsRAwCQLnEZjesutF5eunlVI97fN7h/e/rvOES3Xc5LKcp306883Reblz1U7t2HBifZqNHL0noH6rOq8QIECAAAECBCZBQOJnElbZHMdOwIQIECBwtkCO+I363Ik1kd5Wtxtdbb529tWx1Hf7RPeTT3viZz5al3TeC5Ti491v4wnT2+64tm6rCBAgQIAAAQJjLSDx0+zlFT0BAgQIEIiN1+x6ZkpxXXQ//+zefdu/0m02d79xy10X5nbM1jNoL/bdPvX10Uqtkz/1arXSJZ3zrflfKnXJkUWk3OolysKHAAECBAgQINAAgWWHKPGzbDo3EiBAgACB0RCYmsq39iKZSvmOXrvJ9VQ6Xr3Q+aLuHNJHO0/sdA8WtW+n9snET4rcSfzM7bntvnLzvyolSvbnJdPX3v7Uqq0QIECAAIFmCYiWwNIEJH6W5uVqAgQIECAwUgIbt9x1WUliXN8NKv3p/Xtv+Xy33dz95mfP/u0c6dfrGXz5yLqHf6puL7rKJ9LJd/xEzht6N7Zz3FW3U55fc1PdVhEgQKCZAqImQIDAIgQkfhaB5BICBAgQIDCqAimdqJIXazrxpfZbOnWTd9e/eyq34p+UKUyVEinlX/3q7plvVe2llLVx/OQTPznXP/UqHRzev+PjJan0mdKs+v57T9u28/FVWyHQdAHxEyBAgACBhQQkfhaScZ4AAQIECIy4QJW0SBG/Uof5+bm9t3y0bje22vzg/dWfpL+qnsAHDu295b11e0nV8daFJxM/0er+1KvXQSu1d9Xti47k+NW6PS6VeRAgQIAAAQIEzhCQ+DmDwwEBAgQIEGiOwKO5k/TpPrGS8u1nRt68o80/sOuKnNNvdSPP35qaP95LanVPLWF/eP/rjpTL26VE6bPzjp+qXZVDa4/8SanrF2CnX4vrZrpPTJWTNgIECBAgQIDAuAlI/IzbipoPAQIEzhZwPKYCM60cqfqZVzW/r8ytPfLOqtHociL/UYn/wlKizG3H/ff85per9grK16t7U5z6qVd1HLtnTpQB3tppR2ycfvSiV9VtFQECBAgQIEBg7AQkfsZuSU2IwMICviFAYHwENm296PVlNpeVEp0kRpXM6Bw0cze9ZfbncsRzq+hL/akH9m3/B1V7heXR7v15uluftp+af0fk6DwRFK14w2nfaBIgQIAAAQIExkpA4meslnPRk3EhAQIECDRcIOW4uTOFkrxorV/bjyRJp7th7C77P9/8nZHi7nrsE+3W1M9HlBnGCj8pen/N6+ln9zS357avRSv21+e/Y9O2nZfWbRUBAgQIECBAYJwEyj95xmo6JkOAAAECBMZfYPrZs9tKoqSb1Ejx8YO7b+r8pKmpM59as+ZtJfbufCK/6Yt7fuOvyvHKtxw9l2/GOT7tdryxdzq10/W9tpoAAQIECIyngFlNqoAnfiZ15c2bAAECBBorkFOq/vJVFX+O1vwvVY2mls1bd1Z/VetnqvhT5L+aW3fkZDKmOrfC8t/r+79U12dUGx565N+WE4+UEiWR9uLwIUCAwKQImCcBAhMlIPEzUcttsgQIECDQdIHLrtm5MaX849155A/N7bntvm67efuNW+66MEe6sxd5SvHznRcv906scv25z80ci0gfiu7nuVdec/cl3aY9gckRMFMCBAgQGH8BiZ/xX2MzJECAAIExElgzFTeV6XT//91u/XZpN3ZrxXz1p9s7f8WrTOLfH9x7y6dKPejt/fWAU8fXHPmxuj2JlTkTIECAAAECYyrQGtN5mRYBAgQIEBg7gUuvnrkoR/rlemL/Ze5T2z9Wt/tYDaarTVt3/R+Rcu8na3/TWrf2+YMZ+cxR1s2v/0A5M19KFNuXVPVSy/TWna+Y3jr7l5dvmX3ZUu91PQECBAgQIEBgtQUkflZbWP8ECBBoqoC4R05gzfqL/u8S1ONLiZTirqpuZskl/PzHJfapUkr+J904rBdUf+GeGx/KOT5ZxVEyPy+66qqZdZ32IneXb935ixHpH0fE09sRv1dqGwECBAgQIEBgpAQkfkZqOQRDYDQFREWAwCgI5FSieG0p1fY/1l5ywT+tGk0sm7fsql7ofHUVe0m67D60f/u7qvawSorU+7nXRQ9dcsHzlhLHfMTd5fpUSpQMVvdF0eFDgAABAgQIEBgdAYmf0VmLJkQiRgIECBAYksD0tXf+aBn6qaVEivx7X/jwjUerdtPK5X9n9rtzynfUcR9trU1/r24PrWrlE+/rDd5KrSX93CtFWtu7N1LrayfbGgQIECBAgACBERFYZuJnRKIXBgECBAgQmBSBdu497XOiNX/id5o67fbaVGJPj6vizynecOgT2++v2sMsBz9128Ey/mdLiRyxhMTPTPXvqFOJn3b7yuovlVX9KAQIECBAYHwEzKTpAtU/WJo+B/ETIECAAIGxFtj87J1PLxP8wVKq7U/uv+c3v1w1mlY2bb39FyLyT9Vxf/6BtY/M1u2hVyXh0/u516Wbtu38/sUEtHHLBVeV6079WyqldSnmR2ZOJTYbAQIE+iugNwIEGilw6h8rjQxf0AQIECBAYPwF2q10c2+W5X/cd/baTatTTL0l6k+K9Iuxe+ZEfTgCVav66169OH6+1zhfnVKr856i+pqvVHVK+ddK4ujvV22FwDgLmBsBAgQINEeg/PuxOcGKlAABAgQITJrAxi13PTFF/Exn3in2Hty349OdduN2M60csaEbdv7CoX3b93fbo7F/YN/Nf1Ei6bw3KeX08tJ+zC1FflHvolZu/VyvHTl2nWyPf8MMCRAgQIAAgREXkPgZ8QUSHgECBAhMtsBUzL+6CKwvJSLn3+7UI7k7f1DVz6JKAmuqc1WKP+zUo7e7rw5pkf8+Sn+3vv7Iwf03/2lpHy8lUpz2wufqhEKAAAECBAgQGKLAIv9hM8QIDU2AAAECzRIQbf8ErptZk1OuEj9Vn4fn9h15b9VoYkmn/Swq53RgROdwTx3XhpJlS3X7nNXmLXdsLV88vpSy5d58HioH1fataqcQIECAAAECBEZBQOJnFFZBDATGVMC0CBBYmcCmYxffWHp4SimRcrwtYqZdtRtZcjr5Ppy1R9u9BMtITaVkeh6sA0pXXPPmJ9ftc1Y5taq16X7XanffCZTjgs6JXt05sCNAgAABAgQIDFdA4me4/pMyunkSIECAwDIEUsq3dW9L81PH2v+w227mvsyll/g5eN+BW78xkrNI+Uu9uNqtCy7ttc+ur7jmTVUy7ifr8x+d23Nb9ydirfhm51yv7hzYESBAgAABAgSGKzDgxM9wJ2t0AgQIECDQFIGrr37H2sjxxG68+dMjmyzpBvgY+5nq3xvfX1/U+1lUfbiq1cV17726Plyw6j3xE9Ga/56FrmpPrXlN+W5NKVHW6O5OXe1yfLGqyrlu3TmwI0CAAAECkypg3qMiUP1DbFRiEQcBAgQIECBQC3x53defVZr1/6fTPyntxm7Vi51L8GtLiUgn34cTq/7JsakzRq/uHCy8SxGnEj8R53zi58oX3r0+R3pV3ct9c/u3f7BuV1XvJdzrqgOFAAECBGoBFQECQxWo/0E51BgMToAAAQIECJwl0Iq0pXeqJBr299pNrNOwXuzc+8lVr34MvJSnTv7UKy+Q+Dn+0JHfLN10nsTKKd4eJZMVJz9putNMaXOntiNA4NsEnCBAgACBwQu0Bj+kEQkQIECAAIHHFEjRS/wcf/LRx3/6Ma8f4QtSpBf1whvoi52X+NOrJx59/Kknftpxzp965Zzqlzqn+bWPts/6s/T5gXqej7v8upnui57rE6pvE3CCAAECBAgQGJCAxM+AoA1DgAABAgSWIpAjuomfFH9+4MArjy/l3tG7Nj+/junot7+rqP5mBKra+RudUFJc1alP223atrN6T9GG+tR/OnsuKaW31t+18rGLt9ZtFQECBAgQIEBgqAISP0PlNzgBAgQInBTQOClw6XV3fleK6PxsqCSAGv0zr86kcv3XrnJ8tXM8yrsU3Zc2R3zv2WGmnF7ZO5fjVLt3rp3z7l47R/une201AQIECBAgQGCYAhI/w9Q3NgEC5xRwksCkC6w91n5uz6AVufmJnxRf7synV3cORnSX42t1ZL26c/iUH951ceR4Wecg4rMP7Lv5L+r2yeqBfTvuLQdHSylbkvgpCjYCBAgQIEBg+AISP8NfAxEsLOAbAgQITKRAu/czrzL742unPlEq2+AEukmqiL8+fch1D7dfESkurs7llH+3qs9Zcuypz2/YuGX2BXVbRYAAAQIECBAYmkBDEj9D8zEwAQIECBAYuECKeGY96KEHd998RgKiPq8asEDK6Vc7Q+Z4+NjFrX/aaZ9jd2J964Zy+kgp0Ur5zVWtECBAgAABAksRcG2/BSR++i2qPwIECBAgsFKBlP9d6eJY5PTbpbYNWaB+qfMzOmGk+Odf/rPtD3fa59h1EnU5vb37VXrW9NY7X9Ft2xMgQIDAkgXcQIBAXwQkfvrCqBMCBAgQINA/gbm9t9w+t2/H+rn92yV++se67J7SGS91bv3+Y3V0Yn2ajRzt7nXtt3VrewIEViLgXgIECBBYvoDEz/Lt3EmAAAECBAiMucBiXup8NkHnqZ8U/74+/4SNW26/sm6rVi6gBwIECBAgQGCJAhI/SwRzOQECBAgQIDAKAqsWw/pOzzmvq+oLvpVvWtRLnauLTysppzt6h63W1M29tpoAAQIECBAgMGgBiZ9BixuPAAECBPoroDcCfRVI053uUtpc1TnitdH9zF8U8c5u87H3af3DHy5XzZcSkePlndqOAAECBAgQIDAEAYmfIaAbkgCB1RHQKwECBM4S6D69E9Grz/r6XIf5gfrs4y69euaikvj5juo4R7r383tv+WbVXkw5uHvm0XJd/Z6fuHj62juvLsc2AgQIECBAgMDABSR+Bk5uwAEIGIIAAQIERkqg+7OpEtISEjDl6pVvT6276D7FUx+cr0opvbX+vrX2gotfliKmquOU2n9c1Ussvff8tKLdvn2J97qcAAECBAgQINAXgTFP/PTFSCcECBAgQIDAigTqn09Fr15RZ4u6+buf8+YnlQsvKiVSpPurejGlnfPuU9fln+21c04Heu3F1nOXXf6ccu0/KyVypI9XtUKAAAECBAisloB+FxKQ+FlIxnkCBAgQIECgXwJfqTpKkS+s6kGU9e01Lzk5Tmq/4WT7MRoP7Ntxb7nkaClRkj3PreqqrD3avqeql1Te89L5uX07XlFKemDf9jct6V4XEyBAgMDyBdxJgMAZAhI/Z3A4IECAAAECBPotkFP+/6s+c8TajVtuv7Jqr3Zpt9ML6zHmjz965CN1e3FVjk92L8ypW8fR+w7c+o26rSJAoEECQiVAgACBiBYEAgQIECBAgHeVDdYAABAASURBVMBqCrRy+kyv/6lW65m99qrV1797KqX8gqr/FLHnwQMzj1TtxZa5jZdX9/7nU9fnfafaWg0VEDYBAgQIEJhYAYmfiV16EydAgAABAoMRmJ+P/9QbKbfT9/baq1VvPHzw2tJ35/0+OeJDpX3atohm9ydaz3jS0Q3rqjK375YfXMRdLiFAgAABAgQIjKSAxM9ILougCBAgQGDVBQwwMIHD9+z4b5Hj4WrAlGLVn/hppfiRaqyqtHP7w1W9nHLgwCuPV2U597qHAAECBAgQIDAqAhI/o7IS4iBAYGgCBiZAYPUFUkTnp1M5x6o/8VNm03m/Txnzq4f33/rZcmwjQIAAAQIECEysgMTPxC69iZ9DwCkCBAgQWCWBnKL7np8UVzzlh3ddvErDxHc/581PKn0/o5TIEe+vaoUAAQIECBAgMMkCEj/nXH0nCRAgQIAAgX4K5MjdxE/pdP1D+ftKtSrb+vaal/Q6Tikv+2devT7UBAgQIECAwLgLjP/8JH7Gf43NkAABAgQIDF2gJGFOveC5tXrv+Wm3U+dnXmXC88cfPfKRUtsIECBAgMDiBFxFYEwFJH7GdGFNiwABAgQIjJLA0Yun/uNp8TzntHb/mte/e6okmF5QdZgi9jx4YOaRqq0QIEBgqQKuJ0CAwDgJSPyM02qaCwECBAgQGFGBL//Z9uqvenUSMeUfHz+0GmFuPHzw2tLvRaVU7/f5UFUrBFYo4HYCBAgQINB4gfJvr8bPwQQIECBAgACBRgjk/16FmaPKy1St/pbyj5obej2u5M+49/o4s3ZEgAABAgQIEGimQPk3UjMDFzUBAgQIEBiKgEFXIJA6P/dKEWWL/n9Sennd6ZHD+2/9bN1WESBAgAABAgQmWkDiZ6KX3+QJEFiJgHsJEFiywN9Ud+SI76rqfpbLt9z5v0fkS+o+P13XKgIECBAgQIDAxAtI/Ez8fwIA+iCgCwIECBBYjECK/1Fflp569R0b6nZfqpzar+h11M7xhl5bTYAAAQIECBCYdAGJn77+F6AzAgQIECBAYCGBFLmX+In5i6eeuNB1yzmfI36uvu9rhzde/tG6rSJAgAABAgQIrJJAc7qV+GnOWomUAAECBAg0W6CdOj/1qibRnm9/Z1X3o2zecsfW0s/GUiLn9M54z0vnq7ZCgAABAgQGImAQAiMuIPEz4gskPAIECBAgMC4C7dOe+Imc+vbET7vV6r3UOVop3jUuXuZBgEDzBERMgACBURSQ+BnFVRETAQIECBAYR4E0dfKnXhF9Svxc/+6plKOX+Dl8aN/2/eFDYPgCIiBAgAABAiMjIPEzMkshEAIECBAgMO4Cp97xE9HuyxM/mx+c++Gi9oRSIkX+x1U9WkU0BAgQIECAAIHhCkj8DNff6AQIECAwKQLmGa2pNSff8dPKrb684yfndu9pn2hH+iPMBAgQIECAAAECZwpI/Jzp4YgAAQKrLmAAApMqsPZxp37qlVsrf+Ln8utmLiiWP1VKtX36gX077q0aCgECBAgQIECAwCkBiZ9TFloEBi1gPAIECEyUwBc+fOPRMuFHSilbWvFPveaPXfzjpaMq+RMpZS91Lhg2AgQIECBAgMDZAhI/Z4sM5digBAgQIEBgUgTyNzozzbGxU69gl3Lu/cwrnzgR/3wFXbmVAAECBAgQIDAggcEPI/EzeHMjEiBAgACBCRZoXVxP/ll1vaxq+trbnxApXlDdnCI+8cV7bjlctRUCBAgQINAYAYESGJCAxM+AoA1DgAABAgQIRMnVxP3R/Wy4+up3rO02l7GfX/PSclfn/hzhZ14Fw0aAQHMFRE6AAIHVFJD4WU1dfRMgQIAAAQJnCOSce395q/WV9d/8vjO+XMpBOvnXvI5Ha/49S7nVtQRGWEBoBAgQIECg7wISP30n1SEBAgQIECCwkEA78v7edynyll57KfVl1+zcGJGeE93Ph+f23Pa1bnOc9uZCgAABAgQIEOiPgMRPfxz1QoAAAQIEVkdgzHp9yrHv+I9lSsdLiRTtZSV+pqbSjnJ/KiVy8jOvykEhQIAAAQIECCwkIPGzkIzzBAgQGDEB4RAYB4EDB15Zkj7pL6q55EhLTvxc+cK715d7f7mUapufWvvI+6uGQoAAAQIECBAgcG4BiZ9zuzhLYJQFxEaAAIFGC+RTP/fafOl1d37XUiZz7KFHbynXX1BKRIpPHdw982j4ECBAgAABAgQILCgg8bMgTRO+ECMBAgQIEGieQPnHx8n3/Kw9Pv8Di53B5ue89Xsix+ur63PE3JMe3fC8qq0QIECAAAECBMZfYPkzLP/2Wv7N7iRAgAABAgQILFXg+LrWx3v35Hbrxb32Y9W5ffxt5Zrqp16lSjd2fzZWmjYCBAgQIDBJAuZKYIkCEj9LBHM5AQIECBAgsDKBB3ff/Nelh+5PtFL+idJ+zG162x3XRo7rOxem+NgD+7Z7t08Hw44AgUkWMHcCBAgsRkDiZzFKriFAgAABAgT6LbCv7vCSjVtmX1C3F6hyitz6/frL+Zzj79dtFQECXQF7AgQIECCwoIDEz4I0viBAgAABAgRWS2D+xImXlr47T/20Utxe2gtum7bOvqp8+fRSIlL+nQf27bg3fBYQcJoAAQIECBAgcKaAxM+ZHo4IECBAgMB4CIz4LL7456//m8jpd+owv2+hp36mr739CSnSG6vrUsRXL4z4/6q2QoAAAQIECBAgsDgBiZ/FObmKAAECjRUQOIFRFZifP76zxHbep35Se02V9HlCuS4ixes/v/eWb4YPAQIECBAgQIDAogUkfhZN5UICjRcwAQIECIyUwGM99bP52TufniO/sgo6R/rMob3b/6BqKwQIECBAgAABAosXkPhZvNUYXWkqBAgQIEBgNATO99RPbnVe6DxVRZpz+1ciUg4fAgQIECBAgACBJQhESPwsicvFBAgQIECAQD8FFnrqZ/OW2Zsj8rX1WO88vP+WP6/bKgIECBAgQGA5Au6ZWAGJn4ldehMnQIAAAQKjIXD2Uz+btu66IaeY7UaX5tPU2u3dtj0BAgQI9ENAHwQITJaAxM9krbfZEiBAgACBkRM4+6mfFPldJchUStnyvz70yZu+VBo2AgT6L6BHAgQIEJgAAYmfCVhkUyRAgAABAqMucGJ9qp7waddxdpI+KdJn5i67/Cfrc6pVFdA5AQIECBAgMK4CEj/jurLmRYAAAQIEliMwpHse3H3zX5ehP1ZKb/vsocs2Xx3veel874SaAAECBAgQIEBg6QISP0s3cwcBAgQmQsAkCQxaYG7fjr/7pKMb1lWltJ8p6TPoFTAeAQIECBAgMI4CEj/juKrmRKC/AnojQIDAwAQOHHjl8aoMbEADESBAgAABAgTGXEDiZ8wXuL/T0xsBAgQIECBAgAABAgQIECDQJIHlJX6aNEOxEiBAgAABAgQIECBAgAABAssTcFfjBSR+Gr+EJkCAAAECBAgQIECAAIHVFzACAQLNFJD4aea6iZoAAQIECBAgQIDAsASMS4AAAQINEpD4adBiCZUAAQIECBAgMFoCoiFAgAABAgRGXUDiZ9RXSHwECBAgQKAJAmIkQIAAAQIECBAYSQGJn5FcFkERIECguQIiJ0CAAAECBAgQIEBgdAQkfkZnLURCYNwEzIcAAQIECBAgQIAAAQIEhiwg8TPkBZiM4c2SAAECBAgQIECAAAECBAgQGIbAYBM/w5ihMQkQIECAAAECBAgQIECAAIHBChhtZAQkfkZmKQRCgAABAgQIECBAgACB8RMwIwIEhisg8TNcf6MTIECAAAECBAgQmBQB8yRAgACBIQhI/AwB3ZAECBAgQIAAgckWMHsCBAgQIEBgUAISP4OSNg4BAgQIECDw7QLOECBAgAABAgQIrKqAxM+q8uqcAAECBBYr4DoCBAgQIECAAAECBPovIPHTf1M9EiCwMgF3EyBAgAABAgQIECBAgECfBCR++gSpm9UQ0CcBAgQIECBAgAABAgQIECCwEoFmJH5WMkP3EiBAgAABAgQIECBAgAABAs0QEGXfBSR++k6qQwIECBAgQIAAAQIECBBYqYD7CRDoj4DET38c9UKAAAECBAgQIECAwOoI6JUAAQIEViAg8bMCPLcSIECAAAECBAgMUsBYBAgQIECAwFIFJH6WKuZ6AgQIECBAYPgCIiBAgAABAgQIEFiUgMTPophcRIAAAQKjKiAuAgQIECBAgAABAgQWFpD4WdjGNwQINEtAtAQIECBAgAABAgQIECBwloDEz1kgDsdBwBwIECBAgAABAgQIECBAgACBSmC8Ez/VDBUCBAgQIECAAAECBAgQIEBgvAXMbkEBiZ8FaXxBgAABAgQIECBAgAABAk0TEC8BAmcKSPyc6eGIAAECBAgQIECAAIHxEDALAgQIECgCEj8FwUaAAAECBAgQIDDOAuZGgAABAgQmV0DiZ3LX3swJECBAgMDkCZgxAQIECBAgQGDCBCR+JmzBTZcAAQIEugL2BAgQIECAAAECBCZBQOJnElbZHAkQOJ+A7wgQIECAAAECBAgQIDC2AhI/Y7u0JrZ0AXcQIECAAAECBAgQIECAAIHxEpD4Odd6OkeAAAECBAgQIECAAAECBAiMv8AEzFDiZwIW2RQJECBAgAABAgQIECBA4PwCviUwrgISP+O6suZFgAABAgQIECBAgMByBNxDgACBsRKQ+Bmr5TQZAgQIECBAgACB/gnoiQABAgQINF9A4qf5a2gGBAgQIECAwGoL6J8AAQIECBAg0FABiZ+GLpywCRAgQGA4AkYlQIAAAQIECBAg0CQBiZ8mrZZYCRAYJQGxECBAgAABAgQIECBAYOQFJH5GfokEOPoCIiRAgAABAgQIECBAgAABAqMpIPHTz3XRFwECBAgQIECAAAECBAgQIDD+Ag2aocRPgxZLqAQIECBAgAABAgQIECAwWgKiITDqAhI/o75C4iNAgAABAgQIECBAoAkCYiRAgMBICkj8jOSyCIoAAQIECBAgQKC5AiInQIAAAQKjIyDxMzprIRICBAgQIEBg3ATMhwABAgQIECAwZAGJnyEvgOEJECBAYDIEzJIAAQIECBAgQIDAMAQkfoahbkwCBCZZwNwJECBAgAABAgQIECAwMAGJn4FRG4jA2QKOCRAgQIAAAQIECBAgQIDA6gpI/Kyu7+J6dxUBAgQIECBAgAABAgQIECAw/gJDmKHEzxDQDUmAAAECBAgQIECAAAECky1g9gQGJSDxMyhp4xAgQIAAAQIECBAgQODbBZwhQIDAqgpI/Kwqr84JECBAgAABAgQILFbAdQQIECBAoP8CEj/9N9UjAQIECBAgQGBlAu4mQIAAAQIECPRJQOKnT5C6IUCAAAECqyGgTwIECBAgQIAAAQIrEZD4WYmeewkQIDA4ASMRIECAAAECBAgQIEBgyQISP0smcwOBYQsYnwABAgQIECBAgAABAgQILE5A4mdxTqN5lah+DPyRAAAESUlEQVQIECBAgAABAgQIECBAgACB8RdYwQwlflaA51YCBAgQIECAAAECBAgQIDBIAWMRWKqAxM9SxVxPgAABAgQIECBAgACB4QuIgAABAosSkPhZFJOLCBAgQIAAAQIECIyqgLgIECBAgMDCAhI/C9v4hgABAgQIECDQLAHREiBAgAABAgTOEpD4OQvEIQECBAgQGAcBcyBAgAABAgQIECBQCUj8VAoKAQIExlfAzAgQIECAAAECBAgQmGABiZ8JXnxTnzQB8yVAgAABAgQIECBAgACBSROQ+Jm0Fa/mqxAgQIAAAQIECBAgQIAAAQLjL1BmKPFTEGwECBAgQIAAAQIECBAgQGCcBcxtcgUkfiZ37c2cAAECBAgQIECAAIHJEzBjAgQmTEDiZ8IW3HQJECBAgAABAgQIdAXsCRAgQGASBCR+JmGVzZEAAQIECBAgcD4B3xEgQIAAAQJjKyDxM7ZLa2IECBAgQGDpAu4gQIAAAQIECBAYLwGJn/FaT7MhQIBAvwT0Q4AAAQIECBAgQIDAGAhI/IzBIpoCgdUV0DsBAgQIECBAgAABAgQINFVA4qepKzeMuI1JgAABAgQIECBAgAABAgQINEpgWYmfRs1QsAQIECBAgAABAgQIECBAgMCyBNzUfAGJn+avoRkQIECAAAECBAgQIEBgtQX0T4BAQwUkfhq6cMImQIAAAQIECBAgMBwBoxIgQIBAkwQkfpq0WmIlQIAAAQIECIySgFgIECBAgACBkReQ+Bn5JRIgAQIECBAYfQEREiBAgAABAgQIjKaAxM9orouoCBAg0FQBcRMgQIAAAQIECBAgMEICEj8jtBhCITBeAmZDgAABAgQIECBAgAABAsMWkPgZ9gpMwvjmSIAAAQIECBAgQIAAAQIECAxFYKCJn6HM0KAECBAgQIAAAQIECBAgQIDAQAUMNjoCEj+jsxYiIUCAAAECBAgQIECAwLgJmA8BAkMWkPgZ8gIYngABAgQIECBAgMBkCJglAQIECAxDQOJnGOrGJECAAAECBAhMsoC5EyBAgAABAgMTkPgZGLWBCBAgQIAAgbMFHBMgQIAAAQIECKyugMTP6vrqnQABAgQWJ+AqAgQIECBAgAABAgRWQUDiZxVQdUmAwEoE3EuAAAECBAgQIECAAAEC/RKQ+OmXpH76L6BHAgQIECBAgAABAgQIECBAYEUCjUj8rGiGbiZAgAABAgQIECBAgAABAgQaISDI/gtI/PTfVI8ECBAgQIAAAQIECBAgsDIBdxMg0CcBiZ8+QeqGAAECBAgQIECAAIHVENAnAQIECKxEQOJnJXruJUCAAAECBAgQGJyAkQgQIECAAIElC0j8LJnMDQQIECBAgMCwBYxPgAABAgQIECCwOAGJn8U5uYoAAQIERlNAVAQIECBAgAABAgQInEdA4uc8OL4iQKBJAmIlQIAAAQIECBAgQIAAgbMF/icAAAD//4LMcgEAAAAGSURBVAMAYi5YXusvlKMAAAAASUVORK5CYII=',
    notes: 'Tim Pokja Bali NT',
    timestamp: '2026-10-23T03:42:41.804Z'
  },

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
