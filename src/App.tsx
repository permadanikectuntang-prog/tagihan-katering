import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, MenuItemId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { KateringView } from './components/katering/KateringView';
import { PemesananView } from './components/pemesanan/PemesananView';
import { UtangView } from './components/utang/UtangView';
import { PembayaranView } from './components/pembayaran/PembayaranView';
import { RiwayatView } from './components/riwayat/RiwayatView';
import { LaporanView } from './components/laporan/LaporanView';
import { PengaturanView } from './components/pengaturan/PengaturanView';
import { BackupSyncView } from './components/backup/BackupSyncView';
import { LoginModal } from './components/auth/LoginModal';
import { NotificationToast, ToastMessage } from './components/common/NotificationToast';

import {
  Katering,
  Pemesanan,
  Pembayaran,
  PengaturanOrganisasi,
  SyncConfig,
  LogAktivitas,
  User,
} from './types';
import { storageService } from './services/storage';
import { googleSheetsService } from './services/googleSheetsService';
import { formatRupiah } from './utils/formatters';

export default function App() {
  // Navigation State
  const [activeMenu, setActiveMenu] = useState<MenuItemId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data States
  const [kateringList, setKateringList] = useState<Katering[]>([]);
  const [pemesananList, setPemesananList] = useState<Pemesanan[]>([]);
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);
  const [pengaturan, setPengaturan] = useState<PengaturanOrganisasi>(storageService.getPengaturan());
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(storageService.getSyncConfig());
  const [logs, setLogs] = useState<LogAktivitas[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(storageService.getCurrentUser());

  // UI Flow States
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);

  // Quick Action Modal Triggers
  const [isNewPemesananOpen, setIsNewPemesananOpen] = useState(false);
  const [isNewPembayaranOpen, setIsNewPembayaranOpen] = useState(false);
  const [preselectedKateringId, setPreselectedKateringId] = useState<string | undefined>(undefined);

  // Load Initial Data from Storage
  useEffect(() => {
    setKateringList(storageService.getKatering());
    setPemesananList(storageService.getPemesanan());
    setPembayaranList(storageService.getPembayaran());
    setPengaturan(storageService.getPengaturan());
    setSyncConfig(storageService.getSyncConfig());
    setLogs(storageService.getLogs());
    setCurrentUser(storageService.getCurrentUser());
  }, []);

  // Toast Helper
  const showToast = useCallback(
    (type: 'success' | 'error' | 'info', title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Background Auto-sync helper if URL configured
  const triggerAutoSync = useCallback(
    async (
      updatedKatering: Katering[],
      updatedPemesanan: Pemesanan[],
      updatedPembayaran: Pembayaran[]
    ) => {
      if (!syncConfig.gasWebAppUrl) return;

      try {
        await googleSheetsService.syncAllToSheets(
          syncConfig.gasWebAppUrl,
          {
            katering: updatedKatering,
            pemesanan: updatedPemesanan,
            pembayaran: updatedPembayaran,
          },
          currentUser.username
        );
        const newSyncTime = new Date().toISOString();
        const updatedConfig = { ...syncConfig, lastSyncTime: newSyncTime };
        setSyncConfig(updatedConfig);
        storageService.saveSyncConfig(updatedConfig);
      } catch {
        // Silent failure in background auto-sync so user UI isn't blocked
      }
    },
    [syncConfig, currentUser.username]
  );

  // --- KATERING CRUD ---
  const handleSaveKatering = (katering: Katering) => {
    const exists = kateringList.some((k) => k.id === katering.id);
    let updated: Katering[];

    if (exists) {
      updated = kateringList.map((k) => (k.id === katering.id ? katering : k));
      storageService.addLog(
        currentUser.namaLengkap,
        'EDIT_KATERING',
        `Memperbarui profil katering: ${katering.nama} (${katering.id})`
      );
      showToast('success', 'Data Katering Diperbarui', katering.nama);
    } else {
      updated = [...kateringList, katering];
      storageService.addLog(
        currentUser.namaLengkap,
        'TAMBAH_KATERING',
        `Mendaftarkan penyedia katering baru: ${katering.nama} (${katering.id})`
      );
      showToast('success', 'Katering Baru Tersimpan', katering.nama);
    }

    setKateringList(updated);
    storageService.saveKatering(updated);
    setLogs(storageService.getLogs());
    triggerAutoSync(updated, pemesananList, pembayaranList);
  };

  const handleDeleteKatering = (kateringId: string) => {
    const target = kateringList.find((k) => k.id === kateringId);
    const updated = kateringList.filter((k) => k.id !== kateringId);
    setKateringList(updated);
    storageService.saveKatering(updated);

    storageService.addLog(
      currentUser.namaLengkap,
      'HAPUS_KATERING',
      `Menghapus katering: ${target?.nama || kateringId}`
    );
    setLogs(storageService.getLogs());
    showToast('info', 'Katering Dihapus', target?.nama || kateringId);
    triggerAutoSync(updated, pemesananList, pembayaranList);
  };

  // --- PEMESANAN CRUD (MENAMBAH UTANG) ---
  const handleSavePemesanan = (pemesanan: Pemesanan) => {
    const exists = pemesananList.some((p) => p.id === pemesanan.id);
    let updated: Pemesanan[];

    if (exists) {
      updated = pemesananList.map((p) => (p.id === pemesanan.id ? pemesanan : p));
      storageService.addLog(
        currentUser.namaLengkap,
        'EDIT_PEMESANAN',
        `Ubah pesanan ${pemesanan.id} (${pemesanan.kateringNama}) nilai ${formatRupiah(pemesanan.totalHarga)}`
      );
      showToast('success', 'Transaksi Pemesanan Diperbarui', pemesanan.id);
    } else {
      updated = [pemesanan, ...pemesananList];
      storageService.addLog(
        currentUser.namaLengkap,
        'TAMBAH_PEMESANAN',
        `Pesanan baru ${pemesanan.id} dari ${pemesanan.kateringNama}. Utang bertambah: ${formatRupiah(pemesanan.totalHarga)}`
      );
      showToast(
        'success',
        'Pemesanan Tersimpan! Utang Bertambah',
        `${pemesanan.kateringNama}: +${formatRupiah(pemesanan.totalHarga)}`
      );
    }

    setPemesananList(updated);
    storageService.savePemesanan(updated);
    setLogs(storageService.getLogs());
    triggerAutoSync(kateringList, updated, pembayaranList);
  };

  const handleDeletePemesanan = (pemesananId: string) => {
    const target = pemesananList.find((p) => p.id === pemesananId);
    const updated = pemesananList.filter((p) => p.id !== pemesananId);
    setPemesananList(updated);
    storageService.savePemesanan(updated);

    storageService.addLog(
      currentUser.namaLengkap,
      'HAPUS_PEMESANAN',
      `Menghapus pemesanan ${pemesananId}. Saldo utang terkait dikurangi otomatis.`
    );
    setLogs(storageService.getLogs());
    showToast('info', 'Transaksi Pemesanan Dihapus', pemesananId);
    triggerAutoSync(kateringList, updated, pembayaranList);
  };

  // --- PEMBAYARAN CRUD (MENGURANGI UTANG) ---
  const handleSavePembayaran = (pembayaran: Pembayaran) => {
    const exists = pembayaranList.some((b) => b.id === pembayaran.id);
    let updated: Pembayaran[];

    if (exists) {
      updated = pembayaranList.map((b) => (b.id === pembayaran.id ? pembayaran : b));
      storageService.addLog(
        currentUser.namaLengkap,
        'EDIT_PEMBAYARAN',
        `Ubah pembayaran ${pembayaran.id} (${pembayaran.kateringNama}) ${formatRupiah(pembayaran.jumlah)}`
      );
      showToast('success', 'Pembayaran Diperbarui', pembayaran.id);
    } else {
      updated = [pembayaran, ...pembayaranList];
      storageService.addLog(
        currentUser.namaLengkap,
        'TAMBAH_PEMBAYARAN',
        `Realisasi pembayaran ${pembayaran.id} kepada ${pembayaran.kateringNama}. Utang berkurang: ${formatRupiah(pembayaran.jumlah)}`
      );
      showToast(
        'success',
        'Pembayaran Berhasil Dicatat!',
        `Sisa utang ${pembayaran.kateringNama} berkurang sebesar ${formatRupiah(pembayaran.jumlah)}`
      );
    }

    setPembayaranList(updated);
    storageService.savePembayaran(updated);
    setLogs(storageService.getLogs());
    triggerAutoSync(kateringList, pemesananList, updated);
  };

  const handleDeletePembayaran = (pembayaranId: string) => {
    const target = pembayaranList.find((b) => b.id === pembayaranId);
    const updated = pembayaranList.filter((b) => b.id !== pembayaranId);
    setPembayaranList(updated);
    storageService.savePembayaran(updated);

    storageService.addLog(
      currentUser.namaLengkap,
      'HAPUS_PEMBAYARAN',
      `Menghapus pembayaran ${pembayaranId}. Saldo utang dikembalikan.`
    );
    setLogs(storageService.getLogs());
    showToast('info', 'Pembayaran Dihapus', pembayaranId);
    triggerAutoSync(kateringList, pemesananList, updated);
  };

  // --- PENGATURAN ---
  const handleSavePengaturan = (newPengaturan: PengaturanOrganisasi) => {
    setPengaturan(newPengaturan);
    storageService.savePengaturan(newPengaturan);
    storageService.addLog(currentUser.namaLengkap, 'UBAH_PENGATURAN', 'Memperbarui profil lembaga & pejabat');
    setLogs(storageService.getLogs());
    showToast('success', 'Pengaturan Berhasil Disimpan');
  };

  // --- GOOGLE SHEETS SYNC OPERATIONS ---
  const handleSaveSyncConfig = (newConfig: SyncConfig) => {
    setSyncConfig(newConfig);
    storageService.saveSyncConfig(newConfig);
    showToast('success', 'Konfigurasi Google Sheets Disimpan');
  };

  const handleTestConnection = async () => {
    if (!syncConfig.gasWebAppUrl) {
      showToast('error', 'URL Kosong', 'Silakan masukkan URL Google Apps Script Web App terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    const res = await googleSheetsService.testConnection(syncConfig.gasWebAppUrl);
    setIsSyncing(false);

    if (res.success) {
      showToast('success', 'Koneksi Berhasil!', res.message);
    } else {
      showToast('error', 'Koneksi Gagal', res.message);
    }
  };

  const handleSyncAll = async () => {
    if (!syncConfig.gasWebAppUrl) {
      showToast('error', 'Koneksi Belum Diatur', 'Masukkan URL Web App di menu Backup dan Sinkronisasi');
      return;
    }

    setIsSyncing(true);
    const res = await googleSheetsService.syncAllToSheets(
      syncConfig.gasWebAppUrl,
      {
        katering: kateringList,
        pemesanan: pemesananList,
        pembayaran: pembayaranList,
      },
      currentUser.namaLengkap
    );
    setIsSyncing(false);

    if (res.success) {
      const now = new Date().toISOString();
      const updatedConfig = { ...syncConfig, lastSyncTime: now };
      setSyncConfig(updatedConfig);
      storageService.saveSyncConfig(updatedConfig);

      storageService.addLog(
        currentUser.namaLengkap,
        'SINKRONISASI_SHEETS',
        'Sinkronisasi 6 sheet database berhasil'
      );
      setLogs(storageService.getLogs());
      showToast('success', 'Sinkronisasi Selesai!', res.message);
    } else {
      showToast('error', 'Gagal Sinkronisasi', res.message);
    }
  };

  const handleFetchFromSheets = async () => {
    if (!syncConfig.gasWebAppUrl) {
      showToast('error', 'URL Belum Diatur', 'Masukkan URL Google Apps Script Web App');
      return;
    }

    setIsSyncing(true);
    const res = await googleSheetsService.fetchFromSheets(syncConfig.gasWebAppUrl);
    setIsSyncing(false);

    if (res.success && res.data) {
      if (Array.isArray(res.data.katering) && res.data.katering.length > 0) {
        setKateringList(res.data.katering);
        storageService.saveKatering(res.data.katering);
      }
      if (Array.isArray(res.data.pemesanan) && res.data.pemesanan.length > 0) {
        setPemesananList(res.data.pemesanan);
        storageService.savePemesanan(res.data.pemesanan);
      }
      if (Array.isArray(res.data.pembayaran) && res.data.pembayaran.length > 0) {
        setPembayaranList(res.data.pembayaran);
        storageService.savePembayaran(res.data.pembayaran);
      }

      const now = new Date().toISOString();
      const updatedConfig = { ...syncConfig, lastSyncTime: now };
      setSyncConfig(updatedConfig);
      storageService.saveSyncConfig(updatedConfig);

      storageService.addLog(
        currentUser.namaLengkap,
        'PULL_SHEETS',
        'Berhasil menarik data terbaru dari Google Sheets'
      );
      setLogs(storageService.getLogs());
      showToast('success', 'Data Diperbarui dari Google Sheets', res.message);
    } else {
      showToast('error', 'Gagal Menarik Data', res.message);
    }
  };

  const handleInitSheets = async () => {
    if (!syncConfig.gasWebAppUrl) {
      showToast('error', 'URL Belum Diatur', 'Masukkan URL Web App terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    const res = await googleSheetsService.initSheets(syncConfig.gasWebAppUrl);
    setIsSyncing(false);

    if (res.success) {
      showToast('success', 'Database 6 Sheet Terbuat!', res.message);
    } else {
      showToast('error', 'Inisialisasi Gagal', res.message);
    }
  };

  // --- BACKUP & RESTORE FILE ---
  const handleExportJsonBackup = () => {
    const jsonStr = storageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIKAT_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'File Backup JSON Berhasil Diunduh');
  };

  const handleImportJsonBackup = (content: string) => {
    const success = storageService.importFullBackup(content);
    if (success) {
      setKateringList(storageService.getKatering());
      setPemesananList(storageService.getPemesanan());
      setPembayaranList(storageService.getPembayaran());
      setPengaturan(storageService.getPengaturan());
      setLogs(storageService.getLogs());
      showToast('success', 'Data Berhasil Dipulihkan dari Backup!');
    } else {
      showToast('error', 'Format File Tidak Valid', 'Pastikan Anda memilih file backup JSON SIKAT yang benar.');
    }
  };

  const handleResetData = () => {
    storageService.resetAllData();
    setKateringList(storageService.getKatering());
    setPemesananList(storageService.getPemesanan());
    setPembayaranList(storageService.getPembayaran());
    setLogs(storageService.getLogs());
    showToast('info', 'Database Dikembalikan ke Pengaturan Awal');
  };

  // --- QUICK PAY FROM CATERING / UTANG TABLE ---
  const handleOpenBayarModal = (katering: Katering) => {
    setPreselectedKateringId(katering.id);
    setActiveMenu('pembayaran');
    setIsNewPembayaranOpen(true);
  };

  // Menu Titles
  const MENU_TITLES: Record<MenuItemId, string> = {
    dashboard: 'Dashboard Keuangan',
    katering: 'Data Penyedia Katering',
    pemesanan: 'Transaksi Pemesanan',
    utang: 'Data Utang Katering',
    pembayaran: 'Pembayaran Utang',
    riwayat: 'Riwayat Transaksi',
    laporan: 'Laporan Bulanan',
    pengaturan: 'Pengaturan Sistem',
    backup: 'Backup & Sinkronisasi',
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 selection:bg-emerald-500 selection:text-white">
      {/* Left Sidebar Navigation */}
      <div className="no-print">
        <Sidebar
          activeMenu={activeMenu}
          onSelectMenu={(menu) => setActiveMenu(menu)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          currentUser={currentUser}
        />
      </div>

      {/* Main Viewport */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Sticky Header Bar */}
        <div className="no-print">
          <Header
            pageTitle={MENU_TITLES[activeMenu]}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            syncConfig={syncConfig}
            onTriggerQuickSync={handleSyncAll}
            isSyncing={isSyncing}
            currentUser={currentUser}
            onOpenUserSwitch={() => setIsUserSwitchOpen(true)}
            onOpenSyncView={() => setActiveMenu('backup')}
          />
        </div>

        {/* Content Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            {activeMenu === 'dashboard' && (
              <DashboardView
                kateringList={kateringList}
                pemesananList={pemesananList}
                pembayaranList={pembayaranList}
                currentUser={currentUser}
                onNavigate={(menu) => setActiveMenu(menu as MenuItemId)}
                onOpenNewPemesanan={() => {
                  setActiveMenu('pemesanan');
                  setIsNewPemesananOpen(true);
                }}
                onOpenNewPembayaran={() => {
                  setPreselectedKateringId(undefined);
                  setActiveMenu('pembayaran');
                  setIsNewPembayaranOpen(true);
                }}
              />
            )}

            {activeMenu === 'katering' && (
              <KateringView
                kateringList={kateringList}
                pemesananList={pemesananList}
                pembayaranList={pembayaranList}
                currentUser={currentUser}
                onSaveKatering={handleSaveKatering}
                onDeleteKatering={handleDeleteKatering}
                onOpenBayarModal={handleOpenBayarModal}
              />
            )}

            {activeMenu === 'pemesanan' && (
              <PemesananView
                pemesananList={pemesananList}
                kateringList={kateringList}
                currentUser={currentUser}
                pengaturan={pengaturan}
                onSavePemesanan={handleSavePemesanan}
                onDeletePemesanan={handleDeletePemesanan}
                isCreateModalOpen={isNewPemesananOpen}
                onCloseCreateModal={() => setIsNewPemesananOpen(false)}
              />
            )}

            {activeMenu === 'utang' && (
              <UtangView
                kateringList={kateringList}
                pemesananList={pemesananList}
                pembayaranList={pembayaranList}
                currentUser={currentUser}
                onOpenBayarModal={handleOpenBayarModal}
              />
            )}

            {activeMenu === 'pembayaran' && (
              <PembayaranView
                pembayaranList={pembayaranList}
                pemesananList={pemesananList}
                kateringList={kateringList}
                currentUser={currentUser}
                pengaturan={pengaturan}
                onSavePembayaran={handleSavePembayaran}
                onDeletePembayaran={handleDeletePembayaran}
                isCreateModalOpen={isNewPembayaranOpen}
                onCloseCreateModal={() => {
                  setIsNewPembayaranOpen(false);
                  setPreselectedKateringId(undefined);
                }}
                preselectedKateringId={preselectedKateringId}
              />
            )}

            {activeMenu === 'riwayat' && (
              <RiwayatView
                pemesananList={pemesananList}
                pembayaranList={pembayaranList}
                kateringList={kateringList}
              />
            )}

            {activeMenu === 'laporan' && (
              <LaporanView
                kateringList={kateringList}
                pemesananList={pemesananList}
                pembayaranList={pembayaranList}
                pengaturan={pengaturan}
              />
            )}

            {activeMenu === 'pengaturan' && (
              <PengaturanView
                pengaturan={pengaturan}
                onSavePengaturan={handleSavePengaturan}
                currentUser={currentUser}
                onSwitchUser={(user) => {
                  setCurrentUser(user);
                  storageService.setCurrentUser(user);
                  showToast('info', 'Beralih Pengguna', `Sekarang login sebagai: ${user.namaLengkap} (${user.role})`);
                }}
              />
            )}

            {activeMenu === 'backup' && (
              <BackupSyncView
                syncConfig={syncConfig}
                onSaveSyncConfig={handleSaveSyncConfig}
                onTestConnection={handleTestConnection}
                onSyncAll={handleSyncAll}
                onFetchFromSheets={handleFetchFromSheets}
                onInitSheets={handleInitSheets}
                isSyncing={isSyncing}
                logs={logs}
                onExportJsonBackup={handleExportJsonBackup}
                onImportJsonBackup={handleImportJsonBackup}
                onResetData={handleResetData}
              />
            )}
          </div>
        </main>
      </div>

      {/* User Switch Modal */}
      <LoginModal
        isOpen={isUserSwitchOpen}
        onClose={() => setIsUserSwitchOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          storageService.setCurrentUser(u);
          showToast('info', 'Beralih Pengguna', `Login aktif: ${u.namaLengkap} (${u.role})`);
        }}
      />

      {/* Global Toast Notifications */}
      <div className="no-print">
        <NotificationToast toasts={toasts} onDismiss={dismissToast} />
      </div>

      {/* Mobile Bottom Navigation Bar (Android Touch Ergonomics) */}
      <div className="no-print">
        <BottomNav
          activeMenu={activeMenu}
          onSelectMenu={(menu) => setActiveMenu(menu)}
          onOpenMoreMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>
    </div>
  );
}
