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

  // Helper to render one full attendance sheet matching OfficialPrintView exactly
  const renderSingleSheet = (
    sheetRecords: AttendanceRecord[],
    subTitleTag: string,
    sheetTypeDesc: string,
    isFirstPage: boolean = true
  ) => {
    if (!isFirstPage) {
      doc.addPage();
    }

    // --- 1. TITLE OF DOCUMENT (Matching OfficialPrintView) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(15, 23, 42);
    doc.text('DAFTAR HADIR RAPAT', pageWidth / 2, 13, { align: 'center' });

    // Subtitle Category Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138); // Blue
    doc.text(`[ ${subTitleTag.toUpperCase()} ]`, pageWidth / 2, 18, { align: 'center' });

    // --- 2. MEETING DETAILS BLOCK (Rendered as structured autoTable to prevent text overlap) ---
    autoTable(doc, {
      body: [
        [
          { content: 'Agenda / Topik', styles: { fontStyle: 'bold', cellWidth: 28 } },
          { content: `: ${meeting.title}`, styles: { cellWidth: 106 } },
          { content: 'Tempat / Ruang', styles: { fontStyle: 'bold', cellWidth: 28 } },
          { content: `: ${meeting.location}`, styles: { cellWidth: 107 } }
        ],
        [
          { content: 'Hari / Tanggal', styles: { fontStyle: 'bold', cellWidth: 28 } },
          { content: `: ${formattedDate}`, styles: { cellWidth: 106 } },
          { content: 'Penyelenggara', styles: { fontStyle: 'bold', cellWidth: 28 } },
          { content: `: ${meeting.organizer}`, styles: { cellWidth: 107 } }
        ],
        [
          { content: 'Waktu Pelaksanaan', styles: { fontStyle: 'bold', cellWidth: 28 } },
          {
            content: `: ${meeting.timeStart} - ${meeting.timeEnd || 'Selesai'} ${meeting.timezone || 'WIB'}`,
            styles: { cellWidth: 106 }
          },
          { content: 'Pimpinan Rapat', styles: { fontStyle: 'bold', cellWidth: 28 } },
          { content: `: ${meeting.leader}`, styles: { cellWidth: 107 } }
        ]
      ],
      startY: 22,
      theme: 'grid',
      margin: { left: marginX, right: marginX },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: { top: 1.4, bottom: 1.4, left: 2.5, right: 2.5 },
        textColor: [30, 41, 59],
        fillColor: [248, 250, 252],
        lineColor: [203, 213, 225],
        lineWidth: 0.15,
        overflow: 'linebreak',
        valign: 'top'
      }
    });

    // --- 3. ATTENDANCE TABLE (Starts dynamically below detail box) ---
    // @ts-expect-error autoTable adds lastAutoTable to doc
    const detailBoxFinalY: number = doc.lastAutoTable ? doc.lastAutoTable.finalY + 4 : 42;

    const tableHeaders = [
      [
        { content: 'No.', styles: { halign: 'center' as const } },
        { content: 'Nama Lengkap & NIP', styles: { halign: 'left' as const } },
        { content: 'Instansi / Unit Kerja', styles: { halign: 'left' as const } },
        { content: 'Jabatan', styles: { halign: 'left' as const } },
        { content: 'No. HP', styles: { halign: 'center' as const } },
        { content: 'E-mail', styles: { halign: 'left' as const } },
        { content: 'Tanda Tangan', styles: { halign: 'center' as const } }
      ]
    ];

    const tableRows = sheetRecords.map((rec, index) => {
      const nipText = rec.nip && rec.nip !== '-' ? `\nNIP. ${rec.nip}` : '';
      const nameCell = `${rec.fullName}${nipText}`;

      return [
        (index + 1).toString(),
        nameCell,
        rec.institution || '-',
        rec.position || '-',
        rec.phone || '-',
        rec.email || '-',
        '' // Signature rendered in didDrawCell
      ];
    });

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows.length > 0 ? tableRows : [[
        { content: '1', styles: { halign: 'center' as const } },
        { content: '(Belum ada peserta terdaftar)', colSpan: 6, styles: { halign: 'center' as const, textColor: [150, 150, 150] } }
      ]],
      startY: detailBoxFinalY,
      theme: 'grid',
      margin: { left: marginX, right: marginX, bottom: 16 },
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
        1: { cellWidth: 52 },
        2: { cellWidth: 48 },
        3: { cellWidth: 38 },
        4: { cellWidth: 28, halign: 'center' },
        5: { cellWidth: 48 },
        6: { cellWidth: 45, halign: 'center', minCellHeight: 15 }
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
        doc.text(str, pageWidth - marginX - 10, pageHeight - 6);

        const generatedTime = `Dicetak otomatis melalui Sistem Presensi Rapat Direktorat PPISDA: ${sheetTypeDesc}`;
        doc.text(generatedTime, marginX, pageHeight - 6);
      }
    });

    // --- 4. FOOTER & PENGESAHAN (Rekapitulasi tanpa 'Tanda tangan terisi') ---
    // @ts-expect-error autoTable adds lastAutoTable to doc
    const finalY: number = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 140;

    let signY = finalY;
    if (signY + 38 > pageHeight - 12) {
      doc.addPage();
      signY = 20;
    }

    // Summary box on left (Strictly NO 'Tanda tangan terisi' per user request)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, signY, 70, 16, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Rekapitulasi:', marginX + 3.5, signY + 6);

    doc.setFont('helvetica', 'normal');
    doc.text(`• Jumlah Peserta Terdaftar : ${sheetRecords.length} Orang`, marginX + 3.5, signY + 11.5);

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
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${signLocationText}, ${dateFormattedSign}`, signBlockX, signY + 3);
      doc.setFont('helvetica', 'bold');
      doc.text('Mengetahui / Mengesahkan,', signBlockX, signY + 7.5);
      doc.text('Pimpinan Rapat,', signBlockX, signY + 11.5);

      // Leader name & NIP
      doc.setFont('helvetica', 'bold');
      doc.text(meeting.leader, signBlockX, signY + 29);
      if (meeting.leaderNip) {
        doc.setFont('helvetica', 'normal');
        doc.text(`NIP. ${meeting.leaderNip}`, signBlockX, signY + 33.5);
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
