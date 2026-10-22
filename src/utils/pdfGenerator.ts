import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord, Meeting, AdminSettings } from '../types';

export type PdfExportMode = 'separate_sheets' | 'luring_only' | 'daring_only' | 'combined';

export function generateAttendancePDF(
  meeting: Meeting,
  records: AttendanceRecord[],
  settings?: AdminSettings,
  mode: PdfExportMode = 'separate_sheets'
): void {
  // A4 Landscape gives ample width for signatures and organizational details
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  const formattedDate = new Date(meeting.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Helper to render one full attendance sheet (Kop + Meta + Table + Signatures)
  const renderSingleSheet = (
    sheetRecords: AttendanceRecord[],
    subTitleTag: string,
    sheetTypeDesc: string,
    isFirstPage: boolean = true
  ) => {
    if (!isFirstPage) {
      doc.addPage();
    }

    // --- TITLE OF DOCUMENT (TANPA KOP SURAT) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`DAFTAR HADIR RAPAT - ${subTitleTag.toUpperCase()}`, pageWidth / 2, 16, { align: 'center' });

    // --- MEETING DETAILS BLOCK ---
    doc.setFontSize(8.5);
    const col1X = marginX + 2;
    const col1ValX = marginX + 34;
    const col2X = pageWidth / 2 + 5;
    const col2ValX = pageWidth / 2 + 37;
    let infoY = 22;

    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Agenda / Topik', col1X, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${meeting.title}`, col1ValX, infoY);

    infoY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Hari / Tanggal', col1X, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${formattedDate}`, col1ValX, infoY);

    infoY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Waktu', col1X, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${meeting.timeStart} - ${meeting.timeEnd || 'Selesai'} ${meeting.timezone || 'WIB'}`, col1ValX, infoY);

    // Right column
    let rightInfoY = 22;
    doc.setFont('helvetica', 'bold');
    doc.text('Tempat / Ruang', col2X, rightInfoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${meeting.location}`, col2ValX, rightInfoY);

    rightInfoY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Penyelenggara', col2X, rightInfoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${meeting.organizer}`, col2ValX, rightInfoY);

    rightInfoY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Pimpinan Rapat', col2X, rightInfoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${meeting.leader}`, col2ValX, rightInfoY);

    // Table setup
    const startTableY = 38;

    const tableHeaders = [
      [
        { content: 'No.', styles: { halign: 'center' as const } },
        { content: 'Nama Lengkap Peserta & NIP', styles: { halign: 'left' as const } },
        { content: 'Instansi / Unit Kerja', styles: { halign: 'left' as const } },
        { content: 'Jabatan / Peran', styles: { halign: 'left' as const } },
        { content: 'No. HP / WA', styles: { halign: 'center' as const } },
        { content: 'Status Kehadiran', styles: { halign: 'center' as const } },
        { content: 'Tanda Tangan Digital', styles: { halign: 'center' as const } }
      ]
    ];

    const tableRows = sheetRecords.map((rec, index) => {
      const nipText = rec.nip && rec.nip !== '-' ? `\nNIP. ${rec.nip}` : '';
      const nameCell = `${rec.fullName}${nipText}`;
      const typeLabel = rec.attendanceType === 'luring' ? 'Luring (Tatap Muka)' : 'Daring (Online/Zoom)';

      return [
        (index + 1).toString(),
        nameCell,
        rec.institution || '-',
        rec.position || '-',
        rec.phone || '-',
        typeLabel,
        '' // Signature rendered in didDrawCell
      ];
    });

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows.length > 0 ? tableRows : [[
        { content: '1', styles: { halign: 'center' as const } },
        { content: '(Belum ada peserta terdaftar)', colSpan: 6, styles: { halign: 'center' as const, textColor: [150, 150, 150] } }
      ]],
      startY: startTableY,
      theme: 'grid',
      margin: { left: marginX, right: marginX, bottom: 35 },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [180, 190, 205],
        lineWidth: 0.2,
        minCellHeight: 14,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        lineColor: [148, 163, 184],
        lineWidth: 0.3,
        minCellHeight: 8
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 64 },
        2: { cellWidth: 60 },
        3: { cellWidth: 48 },
        4: { cellWidth: 30, halign: 'center' },
        5: { cellWidth: 26, halign: 'center' },
        6: { cellWidth: 32, halign: 'center', minCellHeight: 16 }
      },
      didDrawCell: (data) => {
        if (data.column.index === 6 && data.section === 'body') {
          const record = sheetRecords[data.row.index];
          if (record && record.signature && record.signature.startsWith('data:image')) {
            try {
              const padX = data.cell.x + 2;
              const padY = data.cell.y + 1;
              const padW = data.cell.width - 4;
              const padH = data.cell.height - 2;
              doc.addImage(record.signature, 'PNG', padX, padY, padW, padH, undefined, 'FAST');
            } catch (e) {
              doc.setFontSize(7);
              doc.setTextColor(120, 120, 120);
              doc.text('[Tervalidasi]', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center' });
            }
          }
        }
      },
      didDrawPage: (data) => {
        // Page numbering footer
        const str = `Halaman ${doc.getNumberOfPages()}`;
        doc.setFontSize(7.5);
        doc.setTextColor(120, 120, 120);
        doc.text(str, pageWidth - marginX - 10, pageHeight - 8);

        const generatedTime = `Dicetak otomatis melalui Sistem Presensi Rapat Direktorat PPISDA: ${sheetTypeDesc}`;
        doc.text(generatedTime, marginX, pageHeight - 8);
      }
    });

    // @ts-expect-error autoTable adds lastAutoTable to doc
    const finalY: number = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 150;

    let signY = finalY;
    if (signY > pageHeight - 38) {
      doc.addPage();
      signY = 20;
    }

    // Summary box
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Keterangan Presensi:', marginX, signY);

    doc.setFont('helvetica', 'normal');
    doc.text(`• Jumlah Peserta ${subTitleTag} : ${sheetRecords.length} Orang`, marginX, signY + 4.5);
    doc.text(`• Status Tanda Tangan Lengkap : ${sheetRecords.filter(r => !!r.signature).length} Orang`, marginX, signY + 8.5);

    // Sign-off block on the right (jika showLeaderSignature aktif)
    if (meeting.showLeaderSignature !== false) {
      const signBlockX = pageWidth - marginX - 65;
      const dateFormattedSign = new Date(meeting.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const signLocationText = meeting.signLocation?.trim() || 'Lokasi Rapat';

      doc.setFont('helvetica', 'normal');
      doc.text(`${signLocationText}, ${dateFormattedSign}`, signBlockX, signY);
      doc.setFont('helvetica', 'bold');
      doc.text('Mengetahui / Mengesahkan,', signBlockX, signY + 4.5);
      doc.text('Pimpinan Rapat,', signBlockX, signY + 8.5);

      // Leader name
      doc.setFont('helvetica', 'bold');
      doc.text(meeting.leader, signBlockX, signY + 28);
      if (meeting.leaderNip) {
        doc.setFont('helvetica', 'normal');
        doc.text(`NIP. ${meeting.leaderNip}`, signBlockX, signY + 32);
      }
    }
  };

  const luringList = records.filter((r) => r.attendanceType === 'luring');
  const daringList = records.filter((r) => r.attendanceType === 'daring');

  // Enforce attendance mode restriction if meeting is configured as daring_only or luring_only
  let effectiveMode: PdfExportMode = mode;
  if (meeting.allowedAttendanceMode === 'daring_only') {
    effectiveMode = 'daring_only';
  } else if (meeting.allowedAttendanceMode === 'luring_only') {
    effectiveMode = 'luring_only';
  }

  if (effectiveMode === 'daring_only') {
    // Only export daring sheet - no luring page is ever generated
    renderSingleSheet(
      daringList,
      'Peserta Daring (Online / Virtual Zoom)',
      'Lembar Khusus Peserta Hadir Virtual via Zoom',
      true
    );
  } else if (effectiveMode === 'luring_only') {
    // Only export luring sheet - no daring page is ever generated
    renderSingleSheet(
      luringList,
      'Peserta Luring (Tatap Muka)',
      'Lembar Khusus Peserta Hadir Langsung di Lokasi',
      true
    );
  } else if (effectiveMode === 'separate_sheets') {
    // Sheet 1: Luring Participants
    renderSingleSheet(
      luringList,
      'Peserta Luring (Tatap Muka)',
      'Lembar Khusus Peserta Hadir Langsung di Lokasi',
      true
    );

    // Sheet 2: Daring Participants (always generate distinct page)
    renderSingleSheet(
      daringList,
      'Peserta Daring (Online / Virtual Zoom)',
      'Lembar Khusus Peserta Hadir Virtual via Zoom',
      false
    );
  } else {
    // Combined
    renderSingleSheet(
      records,
      'Seluruh Peserta (Gabungan Luring & Daring)',
      'Lembar Daftar Hadir Gabungan',
      true
    );
  }

  const cleanTitle = meeting.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const suffix = effectiveMode === 'separate_sheets' ? 'Terpisah_Luring_Daring' : effectiveMode;
  doc.save(`Daftar_Hadir_${cleanTitle}_${suffix}_${meeting.date}.pdf`);
}
