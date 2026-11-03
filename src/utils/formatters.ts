/**
 * Indonesian financial and date formatting utilities for SIKAT
 */

export const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format number to Indonesian Rupiah currency: Rp 1.500.000
 */
export function formatRupiah(nominal: number | string | undefined | null): string {
  const num = typeof nominal === 'number' ? nominal : parseFloat(String(nominal || 0));
  if (isNaN(num)) return 'Rp 0';
  
  const isNegative = num < 0;
  const absVal = Math.abs(num);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(absVal);

  return isNegative ? `Rp -${formatted}` : `Rp ${formatted}`;
}

/**
 * Format ISO or YYYY-MM-DD date string to DD-MM-YYYY
 */
export function formatTanggal(dateInput?: string | Date | null): string {
  if (!dateInput) return '-';
  try {
    let dateStr = '';
    if (dateInput instanceof Date) {
      dateStr = dateInput.toISOString().split('T')[0];
    } else {
      dateStr = String(dateInput).split('T')[0].trim();
    }

    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format date to full Indonesian text: 02 November 2026
 */
export function formatTanggalLengkap(dateInput?: string | Date | null): string {
  if (!dateInput) return '-';
  try {
    const raw = typeof dateInput === 'string' ? dateInput.split('T')[0] : dateInput.toISOString().split('T')[0];
    const [y, m, d] = raw.split('-');
    const monthIdx = parseInt(m, 10) - 1;
    return `${d} ${BULAN_INDONESIA[monthIdx] || m} ${y}`;
  } catch {
    return formatTanggal(dateInput);
  }
}

/**
 * Format datetime to DD-MM-YYYY HH:mm
 */
export function formatWaktu(isoString?: string | null): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

/**
 * Generate sequential unique ID for Katering: KT-001
 */
export function generateKateringId(existingCount: number = 0): string {
  const nextNumber = existingCount + 1;
  return `KT-${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Generate unique ID for Pemesanan: TR-YYYYMMDD-XXX
 */
export function generatePemesananId(dateStr?: string): string {
  const now = dateStr ? new Date(dateStr) : new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digits
  return `TR-${y}${m}${d}-${randomSuffix}`;
}

/**
 * Generate unique ID for Pembayaran: BY-YYYYMMDD-XXX
 */
export function generatePembayaranId(dateStr?: string): string {
  const now = dateStr ? new Date(dateStr) : new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digits
  return `BY-${y}${m}${d}-${randomSuffix}`;
}

/**
 * Clean phone number for WhatsApp link
 */
export function getCleanWhatsApp(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  }
  return clean;
}
