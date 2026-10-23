/**
 * Text and formatting utilities for Direktorat PPISDA Presensi
 */

export const OFFICIAL_ORGANIZER_TITLE_CASE =
  'Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air, Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum';

/**
 * Normalizes organizer name to Title Case instead of ALL-CAPS.
 * Preserves custom organizers while ensuring correct capitalization.
 */
export function formatOrganizerName(organizer?: string): string {
  if (!organizer || !organizer.trim()) {
    return OFFICIAL_ORGANIZER_TITLE_CASE;
  }

  const raw = organizer.trim();
  const uppercased = raw.toUpperCase();

  // If it's the official ministry / directorate name or has old abbreviations
  if (
    uppercased.includes('DIREKTORAT PELAKSANAAN PEMBIAYAAN') ||
    uppercased.includes('DIREKTORAT JENDERAL PEMBIAYAAN INFRASTRUKTUR') ||
    uppercased.includes('(PPISDA)')
  ) {
    return OFFICIAL_ORGANIZER_TITLE_CASE;
  }

  // If the entire text is in ALL-CAPS, convert to Title Case
  const hasLetters = /[A-Z]/.test(raw);
  const hasNoLowercase = !/[a-z]/.test(raw);
  if (hasLetters && hasNoLowercase && raw.length > 3) {
    return raw
      .toLowerCase()
      .split(' ')
      .map((word) => {
        const clean = word.replace(/[^a-z]/g, '');
        // Keep acronyms uppercase
        if (['sda', 'pu', 'pupr', 'kpbu', 'apbn', 'dki', 'ri', 'upt', 'balai'].includes(clean)) {
          return word.toUpperCase();
        }
        if (word.length > 0) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  }

  return raw;
}

/**
 * Trims transparent outer margins from a signature canvas so the stroke
 * occupies the maximum visible space when rendered in PDF and print views.
 */
export function trimCanvasWhitespace(canvas: HTMLCanvasElement): string {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    // Scan for non-transparent pixels (alpha threshold > 12)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 12) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Canvas is empty or no visible stroke found
    if (maxX === -1 || maxX < minX || maxY < minY) {
      return canvas.toDataURL('image/png');
    }

    // Comfortable padding so ink line ends are not clipped
    const padding = 8;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropW = Math.min(width - cropX, maxX - minX + 1 + padding * 2);
    const cropH = Math.min(height - cropY, maxY - minY + 1 + padding * 2);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return canvas.toDataURL('image/png');

    croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    return croppedCanvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Failed to trim canvas whitespace', err);
    return canvas.toDataURL('image/png');
  }
}
