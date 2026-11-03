import * as XLSX from 'xlsx';
import { MonthlySummaryReport, PengaturanOrganisasi } from '../types';
import { BULAN_INDONESIA, formatTanggal } from './formatters';

export function exportMonthlyReportToExcel(
  report: MonthlySummaryReport,
  pengaturan: PengaturanOrganisasi
) {
  const wb = XLSX.utils.book_new();
  const namaBulan = BULAN_INDONESIA[report.bulan - 1];

  // 1. SHEET: RINGKASAN
  const ringkasanData = [
    ['LAPORAN KEUANGAN DAN ADMINISTRASI KATERING (SIKAT)'],
    [pengaturan.namaOrganisasi.toUpperCase()],
    [`Periode: ${namaBulan} ${report.tahun}`],
    [`Katering: ${report.kateringNamaFilter}`],
    [''],
    ['RINGKASAN ARUS UTANG & PEMBAYARAN', 'NILAI (RP)'],
    ['1. Saldo Utang Awal Bulan', report.saldoAwal],
    ['2. Total Pemesanan Bulan Ini (+)', report.totalPemesanan],
    ['3. Total Pembayaran Bulan Ini (-)', report.totalPembayaran],
    ['4. Saldo Utang Akhir Bulan', report.saldoAkhir],
    [''],
    ['Keterangan Rumus: Saldo Akhir = Saldo Awal + Total Pemesanan - Total Pembayaran'],
    [''],
    ['Mengetahui,', '', 'Bendahara / Pengelola Keuangan,'],
    [pengaturan.jabatanKetua, '', pengaturan.jabatanBendahara],
    [''],
    [''],
    [pengaturan.namaKetua, '', pengaturan.namaBendahara],
    [`NIP: ${pengaturan.nipKetua || '-'}`, '', `NIP: ${pengaturan.nipBendahara || '-'}`],
  ];

  const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasanData);
  wsRingkasan['!cols'] = [{ wch: 45 }, { wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsRingkasan, 'Ringkasan');

  // 2. SHEET: PEMESANAN
  const pemesananRows = [
    [
      'No',
      'Tanggal',
      'ID Transaksi',
      'Nama Katering',
      'Jenis Makanan / Menu',
      'Keperluan',
      'Jumlah',
      'Satuan',
      'Harga Satuan (Rp)',
      'Total Harga (Rp)',
      'Nama Pemesan',
      'Catatan',
    ],
  ];

  report.daftarPemesanan.forEach((p, idx) => {
    pemesananRows.push([
      String(idx + 1),
      formatTanggal(p.tanggal),
      p.id,
      p.kateringNama,
      p.jenisMakanan,
      p.keterangan || '-',
      String(p.jumlahPesanan),
      p.satuan,
      String(p.hargaSatuan),
      String(p.totalHarga),
      p.namaPemesan,
      p.catatan || '-',
    ]);
  });

  // Add subtotal row
  pemesananRows.push([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'TOTAL PEMESANAN:',
    String(report.totalPemesanan),
    '',
    '',
  ]);

  const wsPemesanan = XLSX.utils.aoa_to_sheet(pemesananRows);
  wsPemesanan['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 20 },
    { wch: 26 },
    { wch: 28 },
    { wch: 22 },
    { wch: 10 },
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPemesanan, 'Pemesanan');

  // 3. SHEET: PEMBAYARAN
  const pembayaranRows = [
    [
      'No',
      'Tanggal',
      'ID Pembayaran',
      'Nama Katering',
      'Jumlah Bayar (Rp)',
      'Metode Pembayaran',
      'No. Referensi / Bukti',
      'Keterangan',
      'Petugas Pembayar',
    ],
  ];

  report.daftarPembayaran.forEach((b, idx) => {
    pembayaranRows.push([
      String(idx + 1),
      formatTanggal(b.tanggal),
      b.id,
      b.kateringNama,
      String(b.jumlah),
      b.metodePembayaran,
      b.noReferensi || '-',
      b.keterangan || '-',
      b.namaPetugas,
    ]);
  });

  // Add subtotal row
  pembayaranRows.push([
    '',
    '',
    '',
    'TOTAL PEMBAYARAN:',
    String(report.totalPembayaran),
    '',
    '',
    '',
    '',
  ]);

  const wsPembayaran = XLSX.utils.aoa_to_sheet(pembayaranRows);
  wsPembayaran['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 20 },
    { wch: 26 },
    { wch: 20 },
    { wch: 20 },
    { wch: 24 },
    { wch: 28 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPembayaran, 'Pembayaran');

  // 4. SHEET: REKAP UTANG
  const rekapRows = [
    [
      'No',
      'ID Katering',
      'Nama Katering',
      'Total Pemesanan (Rp)',
      'Total Pembayaran (Rp)',
      'Sisa Utang (Rp)',
      'Status Utang',
    ],
  ];

  let sumPesanan = 0;
  let sumBayar = 0;
  let sumSisa = 0;

  report.rekapPerKatering.forEach((r, idx) => {
    sumPesanan += r.totalPemesanan;
    sumBayar += r.totalPembayaran;
    sumSisa += r.sisaUtang;

    rekapRows.push([
      String(idx + 1),
      r.kateringId,
      r.kateringNama,
      String(r.totalPemesanan),
      String(r.totalPembayaran),
      String(r.sisaUtang),
      r.statusUtang,
    ]);
  });

  // Total row
  rekapRows.push([
    '',
    '',
    'TOTAL KESELURUHAN:',
    String(sumPesanan),
    String(sumBayar),
    String(sumSisa),
    sumSisa === 0 ? 'LUNAS' : sumSisa > 0 ? 'BELUM LUNAS' : 'LEBIH BAYAR',
  ]);

  const wsRekap = XLSX.utils.aoa_to_sheet(rekapRows);
  wsRekap['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap Utang');

  // Generate filename: SIKAT_Laporan_Keuangan_[Bulan]_[Tahun].xlsx
  const safeName = report.kateringNamaFilter.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `SIKAT_Laporan_${namaBulan}_${report.tahun}_${safeName}.xlsx`;

  XLSX.writeFile(wb, filename);
}
