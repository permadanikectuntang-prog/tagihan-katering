export type UserRole = 'admin' | 'bendahara' | 'pengurus';

export interface User {
  id: string;
  username: string;
  namaLengkap: string;
  role: UserRole;
  jabatan: string;
}

export type StatusKatering = 'Aktif' | 'Tidak Aktif';

export interface Katering {
  id: string; // KT-001, KT-002, etc.
  nama: string;
  pemilik: string;
  whatsapp: string;
  alamat: string;
  keterangan: string;
  status: StatusKatering;
  createdAt: string;
  updatedAt: string;
}

export interface Pemesanan {
  id: string; // TR-YYYYMMDD-XXX
  tanggal: string; // YYYY-MM-DD
  kateringId: string;
  kateringNama: string;
  jenisMakanan: string;
  keterangan: string; // Keperluan pemesanan (e.g., Rapat Pleno, Diklat Pegawai)
  jumlahPesanan: number;
  satuan: string; // kotak, porsi, nasi box, paket, prasmanan, snack
  hargaSatuan: number;
  totalHarga: number; // jumlahPesanan * hargaSatuan
  namaPemesan: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export type MetodePembayaran = 'Transfer Bank' | 'Tunai' | 'QRIS' | 'Giro / Cek' | 'Lainnya';

export interface Pembayaran {
  id: string; // BY-YYYYMMDD-XXX
  tanggal: string; // YYYY-MM-DD
  kateringId: string;
  kateringNama: string;
  totalUtangSaatIni: number;
  jumlah: number;
  metodePembayaran: MetodePembayaran;
  noReferensi: string; // Bukti transfer / No kwitansi
  keterangan: string;
  namaPetugas: string;
  buktiBayarUrl?: string; // base64 or receipt note
  createdAt: string;
  updatedAt: string;
}

export type StatusUtang = 'LUNAS' | 'BELUM LUNAS' | 'LEBIH BAYAR';

export interface RekapUtangKatering {
  kateringId: string;
  kateringNama: string;
  totalPemesanan: number;
  totalPembayaran: number;
  sisaUtang: number;
  statusUtang: StatusUtang;
  jumlahPemesanan: number;
  jumlahPembayaran: number;
  transaksiTerakhir?: string;
}

export type JenisTransaksi = 'Pemesanan' | 'Pembayaran';

export interface RiwayatItem {
  id: string;
  nomorTransaksi: string;
  tanggal: string;
  kateringId: string;
  kateringNama: string;
  jenisTransaksi: JenisTransaksi;
  keterangan: string;
  penambahanUtang: number; // >0 for Pemesanan, 0 for Pembayaran
  penguranganUtang: number; // 0 for Pemesanan, >0 for Pembayaran
  saldoBerjalan: number;
  detailItem?: string;
}

export interface PengaturanOrganisasi {
  namaOrganisasi: string;
  unitKerja: string;
  alamat: string;
  telepon: string;
  email: string;
  namaKetua: string;
  nipKetua: string;
  jabatanKetua: string;
  namaBendahara: string;
  nipBendahara: string;
  jabatanBendahara: string;
  kotaSurat: string;
  catatanKakiLaporan: string;
}

export interface SyncConfig {
  gasWebAppUrl: string;
  spreadsheetId?: string;
  lastSyncTime?: string;
  autoSync: boolean;
  status: 'idle' | 'syncing' | 'connected' | 'error';
  errorMessage?: string;
}

export interface LogAktivitas {
  id: string;
  timestamp: string;
  user: string;
  aksi: string;
  rincian: string;
  status: 'sukses' | 'gagal';
}

export interface MonthlySummaryReport {
  bulan: number; // 1-12
  tahun: number; // e.g. 2026
  kateringIdFilter: string; // 'all' or specific id
  kateringNamaFilter: string;
  saldoAwal: number;
  totalPemesanan: number;
  totalPembayaran: number;
  saldoAkhir: number;
  daftarPemesanan: Pemesanan[];
  daftarPembayaran: Pembayaran[];
  rekapPerKatering: RekapUtangKatering[];
}
