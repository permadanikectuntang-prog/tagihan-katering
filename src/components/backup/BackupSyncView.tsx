import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Database,
  Terminal,
} from 'lucide-react';
import { SyncConfig, LogAktivitas, Katering, Pemesanan, Pembayaran } from '../../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../data/gasScriptCode';
import { formatWaktu } from '../../utils/formatters';

interface BackupSyncViewProps {
  syncConfig: SyncConfig;
  onSaveSyncConfig: (config: SyncConfig) => void;
  onTestConnection: () => Promise<void>;
  onSyncAll: () => Promise<void>;
  onFetchFromSheets: () => Promise<void>;
  onInitSheets: () => Promise<void>;
  isSyncing: boolean;
  logs: LogAktivitas[];
  onExportJsonBackup: () => void;
  onImportJsonBackup: (jsonContent: string) => void;
  onResetData: () => void;
}

export const BackupSyncView: React.FC<BackupSyncViewProps> = ({
  syncConfig,
  onSaveSyncConfig,
  onTestConnection,
  onSyncAll,
  onFetchFromSheets,
  onInitSheets,
  isSyncing,
  logs,
  onExportJsonBackup,
  onImportJsonBackup,
  onResetData,
}) => {
  const [urlInput, setUrlInput] = useState(syncConfig.gasWebAppUrl || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'panduan' | 'backup' | 'logs'>('sync');

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSyncConfig({
      ...syncConfig,
      gasWebAppUrl: urlInput.trim(),
    });
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onImportJsonBackup(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Integrasi Google Sheets & Backup Data
        </h2>
        <p className="text-xs text-slate-500">
          Sinkronisasi dua arah dengan Google Sheets sebagai database utama, unduh cadangan file JSON, dan periksa log audit aktivitas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'sync'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Koneksi & Sinkronisasi
        </button>
        <button
          onClick={() => setActiveTab('panduan')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'panduan'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Panduan Google Apps Script (Code.gs)
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'backup'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          File Backup & Reset
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Log Aktivitas ({logs.length})
        </button>
      </div>

      {/* TAB 1: KONEKSI & SINKRONISASI */}
      {activeTab === 'sync' && (
        <div className="space-y-5">
          {/* Status Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl p-2.5 sm:p-3 ${
                    syncConfig.gasWebAppUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Cloud className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Status Koneksi Google Sheets</h3>
                  <p className="text-xs text-slate-500">
                    {syncConfig.gasWebAppUrl
                      ? 'URL Web App terkonfigurasi. Siap sinkronisasi dua arah.'
                      : 'Belum terhubung ke Google Sheets. Masukkan URL Web App di bawah.'}
                  </p>
                </div>
              </div>

              {syncConfig.lastSyncTime && (
                <span className="text-xs text-slate-500 font-mono hidden sm:block">
                  Terakhir: {formatWaktu(syncConfig.lastSyncTime)}
                </span>
              )}
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleSaveUrl} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Google Apps Script Web App URL (Akhiran /exec)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="flex-1 min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="min-h-[42px] rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 active:bg-black transition-colors whitespace-nowrap"
                >
                  Simpan URL
                </button>
              </div>
            </form>

            {/* Sync Action Buttons in Thumb-friendly zone */}
            {syncConfig.gasWebAppUrl && (
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={onSyncAll}
                  disabled={isSyncing}
                  className="min-h-[44px] sm:min-h-[38px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-2xs"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menyinkronkan...' : 'Kirim & Sinkronkan ke Sheets'}</span>
                </button>

                <button
                  onClick={onFetchFromSheets}
                  disabled={isSyncing}
                  className="min-h-[44px] sm:min-h-[38px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <Download className="h-4 w-4 text-blue-600" />
                  <span>Tarik Data Terbaru dari Sheets</span>
                </button>

                <button
                  onClick={onTestConnection}
                  disabled={isSyncing}
                  className="min-h-[44px] sm:min-h-[38px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Uji Koneksi</span>
                </button>

                <button
                  onClick={onInitSheets}
                  disabled={isSyncing}
                  className="min-h-[44px] sm:min-h-[38px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <Database className="h-4 w-4 text-purple-600" />
                  <span>Inisialisasi 6 Sheet Otomatis</span>
                </button>
              </div>
            )}
          </div>

          {/* Database Google Sheets Architecture Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Struktur 6 Tabel Utama di Google Sheets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 sm:p-3 space-y-1">
                <div className="font-bold font-mono text-slate-800">1. MASTER_KATERING</div>
                <p className="text-[11px] text-slate-500">ID, Nama Katering, Pemilik, WhatsApp, Alamat, Status</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <div className="font-bold font-mono text-slate-800">2. TRANSAKSI_PEMESANAN</div>
                <p className="text-[11px] text-slate-500">ID Transaksi, Tanggal, Menu, Jumlah, Harga, Total Utang Timbul</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <div className="font-bold font-mono text-slate-800">3. TRANSAKSI_PEMBAYARAN</div>
                <p className="text-[11px] text-slate-500">ID Pembayaran, Tanggal, Jumlah Bayar, Metode, No Referensi</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <div className="font-bold font-mono text-slate-800">4. REKAP_UTANG</div>
                <p className="text-[11px] text-slate-500">Saldo Utang otomatis per katering (Pemesanan - Pembayaran)</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <div className="font-bold font-mono text-slate-800">5. PENGATURAN</div>
                <p className="text-[11px] text-slate-500">Profil organisasi, pejabat penandatangan, kop dokumen</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <div className="font-bold font-mono text-slate-800">6. LOG_AKTIVITAS</div>
                <p className="text-[11px] text-slate-500">Audit trail pencatatan waktu input, perubahan data & sinkronisasi</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PANDUAN LENGKAP & KODE GOOGLE APPS SCRIPT */}
      {activeTab === 'panduan' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Kode Google Apps Script Backend (Code.gs)
                </h3>
                <p className="text-xs text-slate-500">
                  Salin dan tempel kode ini ke dalam project Apps Script Google Spreadsheet Anda
                </p>
              </div>

              <button
                onClick={handleCopyScript}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs shrink-0"
              >
                {copiedScript ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedScript ? 'Kode Berhasil Disalin!' : 'Salin Seluruh Kode'}</span>
              </button>
            </div>

            {/* Step-by-Step Guide */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2 text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                Langkah Cepat 5 Menit:
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-600">
                <li>
                  Buka tab baru dan buat Google Spreadsheet di{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    sheets.new <ExternalLink className="h-3 w-3" />
                  </a>
                  . Beri nama file, misalnya: <strong>"SIKAT Database Katering"</strong>.
                </li>
                <li>
                  Klik menu atas: <strong>Ekstensi (Extensions) &gt; Apps Script</strong>.
                </li>
                <li>
                  Hapus semua kode di editor <code>Code.gs</code>, lalu klik tombol <strong>"Salin Seluruh Kode"</strong> di atas dan PASTE (Ctrl+V).
                </li>
                <li>
                  Klik ikon Disket (Simpan), lalu klik tombol biru <strong>"Deploy" &gt; "New deployment"</strong> (Deployment baru).
                </li>
                <li>
                  Klik ikon gerigi <em>Select type</em>, pilih <strong>"Web app"</strong>.
                </li>
                <li>
                  Atur <strong>Execute as: Me</strong> dan{' '}
                  <strong className="text-emerald-700">Who has access: Anyone</strong> (Penting agar web app dapat terhubung).
                </li>
                <li>
                  Klik <strong>Deploy</strong>, lakukan otorisasi akun Google Anda, lalu salin <strong>Web app URL</strong> dan tempel di tab "Koneksi & Sinkronisasi" di atas!
                </li>
              </ol>
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="max-h-96 overflow-y-auto rounded-xl bg-slate-900 p-4 text-[11px] font-mono text-emerald-400 leading-relaxed border border-slate-800">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP FILE & RESET */}
      {activeTab === 'backup' && (
        <div className="space-y-4 sm:space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Cadangan File Offline (JSON Backup)</h3>
            <p className="text-xs text-slate-500">
              Anda dapat mengunduh seluruh database aplikasi (data katering, seluruh transaksi pemesanan, riwayat pembayaran, pengaturan, dan log) sebagai satu file cadangan mandiri untuk disimpan di komputer.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
              <button
                onClick={onExportJsonBackup}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 active:bg-black transition-colors shadow-2xs"
              >
                <Download className="h-4 w-4" />
                <span>Unduh File Cadangan (.json)</span>
              </button>

              <label className="cursor-pointer w-full sm:w-auto min-h-[44px] sm:min-h-[40px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs">
                <Upload className="h-4 w-4" />
                <span>Pulihkan dari File Backup</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Box */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3.5 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              <h3 className="text-sm font-bold text-rose-950">Zona Bahaya: Reset Database</h3>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Tindakan ini akan mengosongkan seluruh data transaksi pemesanan dan pembayaran. Data yang sudah tersimpan di Google Sheets tidak akan hilang jika Anda telah menyinkronkannya sebelumnya.
            </p>
            <button
              onClick={() => {
                if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data transaksi? Pastikan Anda sudah mengunduh backup file JSON jika diperlukan.')) {
                  onResetData();
                }
              }}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 active:bg-rose-800 transition-colors shadow-2xs"
            >
              Reset Seluruh Data Transaksi
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG AKTIVITAS */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Audit Trail Aktivitas Sistem</h3>
              <p className="text-xs text-slate-500">
                Catatan riwayat input transaksi, perubahan data, dan sinkronisasi
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500">{logs.length} catatan</span>
          </div>

          {/* Mobile Card List for Logs */}
          <div className="md:hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Belum ada catatan aktivitas.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-400">
                      {formatWaktu(log.timestamp)}
                    </span>
                    <span className="font-bold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {log.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{log.user}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {log.aksi}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{log.rincian}</p>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table for Logs */}
          <div className="hidden md:block max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Waktu</th>
                  <th className="py-2.5 px-4">Pengguna</th>
                  <th className="py-2.5 px-4">Aksi</th>
                  <th className="py-2.5 px-4">Rincian</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada catatan aktivitas.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {formatWaktu(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {log.user}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                        {log.aksi}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-md truncate">
                        {log.rincian}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-[11px] text-emerald-600">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
