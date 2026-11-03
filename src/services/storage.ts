import {
  Katering,
  Pemesanan,
  Pembayaran,
  PengaturanOrganisasi,
  SyncConfig,
  LogAktivitas,
  User,
} from '../types';

const STORAGE_KEYS = {
  KATERING: 'sikat_katering_v1',
  PEMESANAN: 'sikat_pemesanan_v1',
  PEMBAYARAN: 'sikat_pembayaran_v1',
  PENGATURAN: 'sikat_pengaturan_v1',
  SYNC_CONFIG: 'sikat_sync_config_v1',
  LOG_AKTIVITAS: 'sikat_log_aktivitas_v1',
  CURRENT_USER: 'sikat_current_user_v1',
};

// Initial Default Organization Profile
export const DEFAULT_PENGATURAN: PengaturanOrganisasi = {
  namaOrganisasi: 'Dinas Komunikasi, Informatika dan Statistik',
  unitKerja: 'Bagian Umum dan Keuangan Sekretariat',
  alamat: 'Jl. Merdeka No. 45, Kompleks Perkantoran Terpadu',
  telepon: '(021) 555-1234 / 0812-3456-7890',
  email: 'keuangan.umum@organisasi.go.id',
  namaKetua: 'Drs. H. Bambang Sudarsono, M.M.',
  nipKetua: '19750815 199803 1 002',
  jabatanKetua: 'Kepala Bagian Umum & Kepegawaian',
  namaBendahara: 'Siti Rahmawati, S.E., Ak.',
  nipBendahara: '19820412 200604 2 008',
  jabatanBendahara: 'Bendahara Pengeluaran Pembantu',
  kotaSurat: 'Jakarta',
  catatanKakiLaporan: 'Laporan ini digenerate secara otomatis melalui Sistem SIKAT dan terverifikasi sah.',
};

// Default Initial Catering Providers
const INITIAL_KATERING: Katering[] = [
  {
    id: 'KT-001',
    nama: 'Berkah Rasa Catering',
    pemilik: 'Ibu Hj. Aminah',
    whatsapp: '081234567890',
    alamat: 'Jl. Melati Indah No. 12, Kebayoran',
    keterangan: 'Spesialis Nasi Box Nusantara, Prasmanan Acara Resmi & Coffee Break',
    status: 'Aktif',
    createdAt: '2026-10-15T08:00:00.000Z',
    updatedAt: '2026-10-15T08:00:00.000Z',
  },
  {
    id: 'KT-002',
    nama: 'Kusuma Boga Selera',
    pemilik: 'Bpk. Hendra Kusuma',
    whatsapp: '085712345678',
    alamat: 'Jl. Anggrek Raya Blok B No. 8, Cilandak',
    keterangan: 'Penyedia Snack Box Tradisional & Kue Basah Rapat',
    status: 'Aktif',
    createdAt: '2026-10-20T09:30:00.000Z',
    updatedAt: '2026-10-20T09:30:00.000Z',
  },
  {
    id: 'KT-003',
    nama: 'Dapur Sedap Nusantara',
    pemilik: 'Ibu Ratna Dewi',
    whatsapp: '081398765432',
    alamat: 'Jl. Pahlawan Karya No. 24, Tebet',
    keterangan: 'Menu Sehat, Sayur Organik & Paket Makan Siang Harian',
    status: 'Aktif',
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-10-25T10:00:00.000Z',
  },
];

// Initial Orders matching the prompt's explicit benchmark scenario
const INITIAL_PEMESANAN: Pemesanan[] = [
  {
    id: 'TR-20261101-101',
    tanggal: '2026-11-01',
    kateringId: 'KT-001',
    kateringNama: 'Berkah Rasa Catering',
    jenisMakanan: 'Nasi Box Ayam Bakar Madu Komplit',
    keterangan: 'Konsumsi Rapat Koordinasi Awal Bulan',
    jumlahPesanan: 40,
    satuan: 'kotak',
    hargaSatuan: 25000,
    totalHarga: 1000000, // Rp 1.000.000 (sesuai contoh prompt)
    namaPemesan: 'Ahmad Fauzi (Staf Umum)',
    catatan: 'Termasuk buah pisang dan air mineral',
    createdAt: '2026-11-01T07:30:00.000Z',
    updatedAt: '2026-11-01T07:30:00.000Z',
  },
  {
    id: 'TR-20261103-102',
    tanggal: '2026-11-03',
    kateringId: 'KT-001',
    kateringNama: 'Berkah Rasa Catering',
    jenisMakanan: 'Konsumsi Rapat Pleno Dinas',
    keterangan: 'Makan Siang Prasmanan Rapat Pleno',
    jumlahPesanan: 25,
    satuan: 'porsi',
    hargaSatuan: 30000,
    totalHarga: 750000, // Rp 750.000 (sesuai contoh prompt)
    namaPemesan: 'Siti Rahmawati',
    catatan: 'Pengantaran tepat pukul 11.45 WIB',
    createdAt: '2026-11-03T08:00:00.000Z',
    updatedAt: '2026-11-03T08:00:00.000Z',
  },
  {
    id: 'TR-20261105-103',
    tanggal: '2026-11-05',
    kateringId: 'KT-001',
    kateringNama: 'Berkah Rasa Catering',
    jenisMakanan: 'Snack Box Tradisional Manis Gurih',
    keterangan: 'Coffee Break Pelatihan SDM',
    jumlahPesanan: 50,
    satuan: 'kotak',
    hargaSatuan: 10000,
    totalHarga: 500000, // Rp 500.000 (sesuai contoh prompt)
    namaPemesan: 'Rian Pratama',
    catatan: '3 jenis kue + air mineral gelas',
    createdAt: '2026-11-05T09:00:00.000Z',
    updatedAt: '2026-11-05T09:00:00.000Z',
  },
  {
    id: 'TR-20261102-201',
    tanggal: '2026-11-02',
    kateringId: 'KT-002',
    kateringNama: 'Kusuma Boga Selera',
    jenisMakanan: 'Snack Box Rapat Tamu VIP',
    keterangan: 'Penerimaan Studi Banding Pemda',
    jumlahPesanan: 30,
    satuan: 'kotak',
    hargaSatuan: 15000,
    totalHarga: 450000,
    namaPemesan: 'Ahmad Fauzi (Staf Umum)',
    catatan: 'Dus motif batik coklat',
    createdAt: '2026-11-02T08:30:00.000Z',
    updatedAt: '2026-11-02T08:30:00.000Z',
  },
];

// Initial Payments matching the prompt's explicit benchmark scenario
const INITIAL_PEMBAYARAN: Pembayaran[] = [
  {
    id: 'BY-20261106-501',
    tanggal: '2026-11-06',
    kateringId: 'KT-001',
    kateringNama: 'Berkah Rasa Catering',
    totalUtangSaatIni: 2250000, // Total utang awal Rp 2.250.000
    jumlah: 1000000, // Pembayaran tahap 1: Rp 1.000.000 -> sisa Rp 1.250.000
    metodePembayaran: 'Transfer Bank',
    noReferensi: 'TRF-BCA-20261106094',
    keterangan: 'Pembayaran tahap ke-1 pemesanan awal bulan November',
    namaPetugas: 'Siti Rahmawati, S.E.',
    createdAt: '2026-11-06T10:15:00.000Z',
    updatedAt: '2026-11-06T10:15:00.000Z',
  },
  {
    id: 'BY-20261108-502',
    tanggal: '2026-11-08',
    kateringId: 'KT-001',
    kateringNama: 'Berkah Rasa Catering',
    totalUtangSaatIni: 1250000, // Total utang sebelum bayar: Rp 1.250.000
    jumlah: 500000, // Pembayaran tahap 2: Rp 500.000 -> sisa Rp 750.000
    metodePembayaran: 'Transfer Bank',
    noReferensi: 'TRF-BCA-20261108112',
    keterangan: 'Pembayaran tahap ke-2 (cicilan rapat pleno)',
    namaPetugas: 'Siti Rahmawati, S.E.',
    createdAt: '2026-11-08T11:00:00.000Z',
    updatedAt: '2026-11-08T11:00:00.000Z',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-01',
    username: 'admin',
    namaLengkap: 'Drs. H. Bambang Sudarsono, M.M.',
    role: 'admin',
    jabatan: 'Administrator Sistem & Kepala Bagian',
  },
  {
    id: 'USR-02',
    username: 'bendahara',
    namaLengkap: 'Siti Rahmawati, S.E., Ak.',
    role: 'bendahara',
    jabatan: 'Bendahara Pengeluaran & Petugas Keuangan',
  },
  {
    id: 'USR-03',
    username: 'pengurus',
    namaLengkap: 'Ahmad Fauzi, S.Kom.',
    role: 'pengurus',
    jabatan: 'Staf Administrasi & Pengurus (Hanya Lihat)',
  },
];

export const storageService = {
  // --- KATERING ---
  getKatering(): Katering[] {
    const raw = localStorage.getItem(STORAGE_KEYS.KATERING);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.KATERING, JSON.stringify(INITIAL_KATERING));
      return INITIAL_KATERING;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_KATERING;
    }
  },

  saveKatering(items: Katering[]): void {
    localStorage.setItem(STORAGE_KEYS.KATERING, JSON.stringify(items));
  },

  // --- PEMESANAN ---
  getPemesanan(): Pemesanan[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEMESANAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PEMESANAN, JSON.stringify(INITIAL_PEMESANAN));
      return INITIAL_PEMESANAN;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PEMESANAN;
    }
  },

  savePemesanan(items: Pemesanan[]): void {
    localStorage.setItem(STORAGE_KEYS.PEMESANAN, JSON.stringify(items));
  },

  // --- PEMBAYARAN ---
  getPembayaran(): Pembayaran[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEMBAYARAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PEMBAYARAN, JSON.stringify(INITIAL_PEMBAYARAN));
      return INITIAL_PEMBAYARAN;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PEMBAYARAN;
    }
  },

  savePembayaran(items: Pembayaran[]): void {
    localStorage.setItem(STORAGE_KEYS.PEMBAYARAN, JSON.stringify(items));
  },

  // --- PENGATURAN ---
  getPengaturan(): PengaturanOrganisasi {
    const raw = localStorage.getItem(STORAGE_KEYS.PENGATURAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(DEFAULT_PENGATURAN));
      return DEFAULT_PENGATURAN;
    }
    try {
      return { ...DEFAULT_PENGATURAN, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PENGATURAN;
    }
  },

  savePengaturan(config: PengaturanOrganisasi): void {
    localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(config));
  },

  // --- SYNC CONFIG ---
  getSyncConfig(): SyncConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_CONFIG);
    const defaultConfig: SyncConfig = {
      gasWebAppUrl: '',
      autoSync: false,
      status: 'idle',
    };
    if (!raw) return defaultConfig;
    try {
      return { ...defaultConfig, ...JSON.parse(raw) };
    } catch {
      return defaultConfig;
    }
  },

  saveSyncConfig(config: SyncConfig): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(config));
  },

  // --- LOG AKTIVITAS ---
  getLogs(): LogAktivitas[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOG_AKTIVITAS);
    if (!raw) {
      return [
        {
          id: 'LOG-001',
          timestamp: new Date().toISOString(),
          user: 'System',
          aksi: 'INISIALISASI_SISTEM',
          rincian: 'Aplikasi SIKAT siap digunakan',
          status: 'sukses',
        },
      ];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addLog(user: string, aksi: string, rincian: string, status: 'sukses' | 'gagal' = 'sukses'): void {
    const logs = this.getLogs();
    const newLog: LogAktivitas = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user,
      aksi,
      rincian,
      status,
    };
    const updated = [newLog, ...logs].slice(0, 150); // Keep last 150 logs
    localStorage.setItem(STORAGE_KEYS.LOG_AKTIVITAS, JSON.stringify(updated));
  },

  // --- CURRENT USER / AUTH ---
  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return INITIAL_USERS[0];
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS[0];
    }
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // --- FULL BACKUP & RESTORE ---
  exportFullBackup(): string {
    const backupData = {
      version: 'SIKAT-v1.0',
      exportedAt: new Date().toISOString(),
      katering: this.getKatering(),
      pemesanan: this.getPemesanan(),
      pembayaran: this.getPembayaran(),
      pengaturan: this.getPengaturan(),
      logs: this.getLogs(),
    };
    return JSON.stringify(backupData, null, 2);
  },

  importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.katering)) this.saveKatering(data.katering);
      if (Array.isArray(data.pemesanan)) this.savePemesanan(data.pemesanan);
      if (Array.isArray(data.pembayaran)) this.savePembayaran(data.pembayaran);
      if (data.pengaturan) this.savePengaturan(data.pengaturan);
      this.addLog('Admin', 'IMPORT_BACKUP', 'Berhasil memulihkan data dari file cadangan JSON');
      return true;
    } catch {
      return false;
    }
  },

  // --- RESET ALL DATA ---
  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.KATERING);
    localStorage.removeItem(STORAGE_KEYS.PEMESANAN);
    localStorage.removeItem(STORAGE_KEYS.PEMBAYARAN);
    localStorage.removeItem(STORAGE_KEYS.LOG_AKTIVITAS);
    this.addLog('Admin', 'RESET_DATA', 'Data transaksi dikosongkan ke pengaturan awal');
  },
};
