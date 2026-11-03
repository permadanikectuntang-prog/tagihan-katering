import { Katering, Pemesanan, Pembayaran } from '../types';

export interface GasTestResponse {
  success: boolean;
  message: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
}

export interface GasSyncResponse {
  success: boolean;
  message: string;
  data?: {
    katering: Katering[];
    pemesanan: Pemesanan[];
    pembayaran: Pembayaran[];
  };
}

export const googleSheetsService = {
  /**
   * Tes koneksi ke Google Apps Script Web App
   */
  async testConnection(webAppUrl: string): Promise<GasTestResponse> {
    if (!webAppUrl || !webAppUrl.trim()) {
      return { success: false, message: 'URL Web App Google Apps Script belum diisi.' };
    }

    const cleanUrl = webAppUrl.trim();
    try {
      const url = new URL(cleanUrl);
      url.searchParams.set('action', 'ping');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error status: ${response.status} (${response.statusText})`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        return {
          success: true,
          message: result.message || 'Koneksi ke Google Sheets Berhasil!',
          spreadsheetName: result.spreadsheetName,
          spreadsheetUrl: result.spreadsheetUrl,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Respon dari Google Sheets menyatakan gagal.',
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal terhubung: ${msg}. Pastikan Web App dideploy dengan hak akses "Who has access: Anyone".`,
      };
    }
  },

  /**
   * Inisialisasi otomatis 6 Sheet utama di Google Sheets
   */
  async initSheets(webAppUrl: string): Promise<{ success: boolean; message: string }> {
    if (!webAppUrl) return { success: false, message: 'URL Web App belum diatur' };

    try {
      const url = new URL(webAppUrl.trim());
      url.searchParams.set('action', 'initDatabase');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const res = await response.json();
      if (res.status === 'success') {
        return { success: true, message: res.message || 'Database 6 sheet berhasil disiapkan!' };
      }
      return { success: false, message: res.message || 'Gagal inisialisasi sheet' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Koneksi gagal: ${msg}` };
    }
  },

  /**
   * Kirim seluruh data lokal ke Google Sheets (Push & Sync)
   */
  async syncAllToSheets(
    webAppUrl: string,
    payload: {
      katering: Katering[];
      pemesanan: Pemesanan[];
      pembayaran: Pembayaran[];
    },
    user: string
  ): Promise<GasSyncResponse> {
    if (!webAppUrl) return { success: false, message: 'URL Web App belum diatur' };

    try {
      const response = await fetch(webAppUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // GAS handles text/plain JSON avoiding strict CORS preflight
        },
        body: JSON.stringify({
          action: 'syncAll',
          user,
          payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const res = await response.json();
      if (res.status === 'success') {
        return {
          success: true,
          message: res.message || 'Data berhasil disinkronkan ke Google Sheets!',
          data: res.currentData,
        };
      }
      return {
        success: false,
        message: res.message || 'Gagal memproses sinkronisasi di Google Sheets',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Sinkronisasi gagal: ${msg}. Silakan periksa koneksi internet atau hak akses Web App.`,
      };
    }
  },

  /**
   * Ambil data terbaru dari Google Sheets (Pull)
   */
  async fetchFromSheets(webAppUrl: string): Promise<GasSyncResponse> {
    if (!webAppUrl) return { success: false, message: 'URL Web App belum diatur' };

    try {
      const url = new URL(webAppUrl.trim());
      url.searchParams.set('action', 'getAll');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const res = await response.json();
      if (res.status === 'success' && res.data) {
        return {
          success: true,
          message: 'Berhasil mengunduh data dari Google Sheets',
          data: res.data,
        };
      }
      return { success: false, message: res.message || 'Data tidak ditemukan' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Gagal membaca Google Sheets: ${msg}` };
    }
  },
};
