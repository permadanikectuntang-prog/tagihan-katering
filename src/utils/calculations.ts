import {
  Katering,
  Pemesanan,
  Pembayaran,
  RekapUtangKatering,
  RiwayatItem,
  MonthlySummaryReport,
} from '../types';
import { BULAN_INDONESIA } from './formatters';

/**
 * Calculate debt recap for all catering providers
 * Sisa Utang = Total Seluruh Pemesanan - Total Seluruh Pembayaran
 */
export function calculateRekapUtang(
  kateringList: Katering[],
  pemesananList: Pemesanan[],
  pembayaranList: Pembayaran[]
): RekapUtangKatering[] {
  return kateringList.map((k) => {
    const orders = pemesananList.filter((p) => p.kateringId === k.id);
    const payments = pembayaranList.filter((b) => b.kateringId === k.id);

    const totalPemesanan = orders.reduce((sum, p) => sum + Number(p.totalHarga || 0), 0);
    const totalPembayaran = payments.reduce((sum, b) => sum + Number(b.jumlah || 0), 0);
    const sisaUtang = totalPemesanan - totalPembayaran;

    let statusUtang: 'LUNAS' | 'BELUM LUNAS' | 'LEBIH BAYAR' = 'LUNAS';
    if (sisaUtang > 0) {
      statusUtang = 'BELUM LUNAS';
    } else if (sisaUtang < 0) {
      statusUtang = 'LEBIH BAYAR';
    }

    // Find most recent transaction date
    const allDates = [
      ...orders.map((o) => o.tanggal),
      ...payments.map((p) => p.tanggal),
    ].sort();
    const transaksiTerakhir = allDates.length > 0 ? allDates[allDates.length - 1] : undefined;

    return {
      kateringId: k.id,
      kateringNama: k.nama,
      totalPemesanan,
      totalPembayaran,
      sisaUtang,
      statusUtang,
      jumlahPemesanan: orders.length,
      jumlahPembayaran: payments.length,
      transaksiTerakhir,
    };
  });
}

/**
 * Get current balance for a single catering provider
 */
export function getSaldoUtangKatering(
  kateringId: string,
  pemesananList: Pemesanan[],
  pembayaranList: Pembayaran[]
): number {
  const totalPemesanan = pemesananList
    .filter((p) => p.kateringId === kateringId)
    .reduce((sum, p) => sum + Number(p.totalHarga || 0), 0);

  const totalPembayaran = pembayaranList
    .filter((b) => b.kateringId === kateringId)
    .reduce((sum, b) => sum + Number(b.jumlah || 0), 0);

  return totalPemesanan - totalPembayaran;
}

/**
 * Generate chronological unified transaction history with true running balance
 */
export function buildRiwayatTransaksi(
  pemesananList: Pemesanan[],
  pembayaranList: Pembayaran[],
  kateringFilter?: string
): RiwayatItem[] {
  type RawEntry = {
    date: string;
    timestamp: number;
    item: Pemesanan | Pembayaran;
    type: 'Pemesanan' | 'Pembayaran';
  };

  const rawEntries: RawEntry[] = [];

  pemesananList.forEach((p) => {
    if (!kateringFilter || kateringFilter === 'all' || p.kateringId === kateringFilter) {
      const time = new Date(p.createdAt || p.tanggal).getTime();
      rawEntries.push({
        date: p.tanggal,
        timestamp: isNaN(time) ? 0 : time,
        item: p,
        type: 'Pemesanan',
      });
    }
  });

  pembayaranList.forEach((b) => {
    if (!kateringFilter || kateringFilter === 'all' || b.kateringId === kateringFilter) {
      const time = new Date(b.createdAt || b.tanggal).getTime();
      rawEntries.push({
        date: b.tanggal,
        timestamp: isNaN(time) ? 0 : time,
        item: b,
        type: 'Pembayaran',
      });
    }
  });

  // Sort ascending by date, then by creation timestamp
  rawEntries.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.timestamp - b.timestamp;
  });

  let runningSaldo = 0;
  return rawEntries.map((entry) => {
    if (entry.type === 'Pemesanan') {
      const p = entry.item as Pemesanan;
      const amount = Number(p.totalHarga || 0);
      runningSaldo += amount;

      return {
        id: p.id,
        nomorTransaksi: p.id,
        tanggal: p.tanggal,
        kateringId: p.kateringId,
        kateringNama: p.kateringNama,
        jenisTransaksi: 'Pemesanan',
        keterangan: p.keterangan ? `${p.jenisMakanan} - ${p.keterangan}` : p.jenisMakanan,
        penambahanUtang: amount,
        penguranganUtang: 0,
        saldoBerjalan: runningSaldo,
        detailItem: `${p.jumlahPesanan} ${p.satuan} @ ${p.hargaSatuan}`,
      };
    } else {
      const b = entry.item as Pembayaran;
      const amount = Number(b.jumlah || 0);
      runningSaldo -= amount;

      return {
        id: b.id,
        nomorTransaksi: b.id,
        tanggal: b.tanggal,
        kateringId: b.kateringId,
        kateringNama: b.kateringNama,
        jenisTransaksi: 'Pembayaran',
        keterangan: b.keterangan || `Pembayaran via ${b.metodePembayaran}`,
        penambahanUtang: 0,
        penguranganUtang: amount,
        saldoBerjalan: runningSaldo,
        detailItem: b.noReferensi ? `Ref: ${b.noReferensi}` : b.metodePembayaran,
      };
    }
  });
}

/**
 * Generate monthly summary report calculations
 * Saldo Akhir Bulan = Saldo Awal Bulan + Total Pemesanan Bulan Ini - Total Pembayaran Bulan Ini
 */
export function generateMonthlyReport(
  kateringList: Katering[],
  pemesananList: Pemesanan[],
  pembayaranList: Pembayaran[],
  bulan: number, // 1 to 12
  tahun: number,
  kateringIdFilter: string = 'all'
): MonthlySummaryReport {
  const padMonth = String(bulan).padStart(2, '0');
  const startOfMonthStr = `${tahun}-${padMonth}-01`;

  // Filter prior transactions (before this month)
  const priorOrders = pemesananList.filter((p) => {
    if (kateringIdFilter !== 'all' && p.kateringId !== kateringIdFilter) return false;
    return p.tanggal < startOfMonthStr;
  });

  const priorPayments = pembayaranList.filter((b) => {
    if (kateringIdFilter !== 'all' && b.kateringId !== kateringIdFilter) return false;
    return b.tanggal < startOfMonthStr;
  });

  const priorTotalOrders = priorOrders.reduce((sum, p) => sum + Number(p.totalHarga || 0), 0);
  const priorTotalPayments = priorPayments.reduce((sum, b) => sum + Number(b.jumlah || 0), 0);
  const saldoAwal = priorTotalOrders - priorTotalPayments;

  // Transactions within this month
  const targetPrefix = `${tahun}-${padMonth}`;
  const monthOrders = pemesananList.filter((p) => {
    if (kateringIdFilter !== 'all' && p.kateringId !== kateringIdFilter) return false;
    return p.tanggal.startsWith(targetPrefix);
  }).sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const monthPayments = pembayaranList.filter((b) => {
    if (kateringIdFilter !== 'all' && b.kateringId !== kateringIdFilter) return false;
    return b.tanggal.startsWith(targetPrefix);
  }).sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const totalPemesanan = monthOrders.reduce((sum, p) => sum + Number(p.totalHarga || 0), 0);
  const totalPembayaran = monthPayments.reduce((sum, b) => sum + Number(b.jumlah || 0), 0);
  const saldoAkhir = saldoAwal + totalPemesanan - totalPembayaran;

  // Catering name
  let kateringNamaFilter = 'Seluruh Katering';
  if (kateringIdFilter !== 'all') {
    const found = kateringList.find((k) => k.id === kateringIdFilter);
    kateringNamaFilter = found ? found.nama : kateringIdFilter;
  }

  // Rekap per catering for this month
  const targetKaterings = kateringIdFilter === 'all'
    ? kateringList
    : kateringList.filter((k) => k.id === kateringIdFilter);

  const rekapPerKatering = calculateRekapUtang(targetKaterings, pemesananList, pembayaranList);

  return {
    bulan,
    tahun,
    kateringIdFilter,
    kateringNamaFilter,
    saldoAwal,
    totalPemesanan,
    totalPembayaran,
    saldoAkhir,
    daftarPemesanan: monthOrders,
    daftarPembayaran: monthPayments,
    rekapPerKatering,
  };
}

/**
 * Generate monthly data aggregation for dashboard charts (last 6 to 12 months)
 */
export function getMonthlyChartData(
  pemesananList: Pemesanan[],
  pembayaranList: Pembayaran[],
  targetYear: number = new Date().getFullYear()
) {
  return BULAN_INDONESIA.map((namaBulan, idx) => {
    const monthNum = idx + 1;
    const prefix = `${targetYear}-${String(monthNum).padStart(2, '0')}`;

    const pemesananBulan = pemesananList
      .filter((p) => p.tanggal.startsWith(prefix))
      .reduce((sum, p) => sum + Number(p.totalHarga || 0), 0);

    const pembayaranBulan = pembayaranList
      .filter((b) => b.tanggal.startsWith(prefix))
      .reduce((sum, b) => sum + Number(b.jumlah || 0), 0);

    // Calculate cumulative debt up to the end of this month
    const endOfMonthStr = `${targetYear}-${String(monthNum).padStart(2, '0')}-31`;
    const cumOrders = pemesananList
      .filter((p) => p.tanggal <= endOfMonthStr)
      .reduce((sum, p) => sum + Number(p.totalHarga || 0), 0);

    const cumPayments = pembayaranList
      .filter((b) => b.tanggal <= endOfMonthStr)
      .reduce((sum, b) => sum + Number(b.jumlah || 0), 0);

    const sisaUtangKumulatif = cumOrders - cumPayments;

    return {
      bulanIndex: monthNum,
      bulanNama: namaBulan.slice(0, 3), // Jan, Feb, Mar...
      bulanPenuh: namaBulan,
      pemesanan: pemesananBulan,
      pembayaran: pembayaranBulan,
      sisaUtang: sisaUtangKumulatif,
    };
  });
}
