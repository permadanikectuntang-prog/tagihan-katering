/**
 * Google Apps Script (Code.gs) template and instructions for SIKAT Google Sheets Backend.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================================
 * SIKAT (Sistem Informasi Keuangan dan Administrasi Katering)
 * Google Apps Script Web App Backend API
 * ============================================================================
 * 
 * PANDUAN PEMASANGAN CEPAT:
 * 1. Buka Google Spreadsheet baru di browser (sheets.new).
 * 2. Beri nama file, misalnya: "SIKAT Database Katering".
 * 3. Klik menu: Ekstensi (Extensions) > Apps Script.
 * 4. Hapus seluruh kode bawaan di editor, lalu PASTE SELURUH KODE INI.
 * 5. Klik "Simpan" (ikon disket atau Ctrl+S).
 * 6. Klik tombol "Deploy" (di kanan atas) > "New deployment" (Deployment baru).
 * 7. Pada ikon gerigi "Select type", pilih: "Web app".
 * 8. Isi konfigurasi:
 *    - Description: SIKAT API v1
 *    - Execute as: Me (email akun Anda)
 *    - Who has access: Anyone (Siapa saja)  <-- PENTING agar web app dapat mengirim data
 * 9. Klik "Deploy", lalu jika muncul otorisasi akun Google:
 *    - Klik "Authorize access" > pilih akun Google Anda.
 *    - Klik "Advanced" (Lanjutan) > klik "Go to Untitled project (unsafe)".
 *    - Klik "Allow" (Izinkan).
 * 10. Salin "Web app URL" (akhiran /exec) dan tempel ke menu "Backup dan Sinkronisasi" di aplikasi SIKAT!
 * ============================================================================
 */

// Konstanta Nama Sheet
var SHEET_KATERING = "MASTER_KATERING";
var SHEET_PEMESANAN = "TRANSAKSI_PEMESANAN";
var SHEET_PEMBAYARAN = "TRANSAKSI_PEMBAYARAN";
var SHEET_REKAP = "REKAP_UTANG";
var SHEET_PENGATURAN = "PENGATURAN";
var SHEET_LOG = "LOG_AKTIVITAS";

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "Koneksi Google Sheets SIKAT Berhasil!",
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "initDatabase") {
      initDatabase();
      return createJsonResponse({
        status: "success",
        message: "Database 6 Sheet berhasil diinisialisasi dan disiapkan!"
      });
    }

    if (action === "getAll") {
      initDatabase();
      var data = getAllData();
      return createJsonResponse({
        status: "success",
        data: data,
        timestamp: new Date().toISOString()
      });
    }

    return createJsonResponse({
      status: "error",
      message: "Action GET tidak dikenali: " + action
    });
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Tunggu lock hingga 30 detik untuk menghindari konflik data bersamaan
  try {
    lock.waitLock(30000);
  } catch (e) {
    return createJsonResponse({
      status: "error",
      message: "Server Google Sheets sedang sibuk memproses transaksi lain. Coba beberapa saat lagi."
    });
  }

  try {
    initDatabase();
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    var action = postData.action || "syncAll";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "initDatabase") {
      initDatabase();
      return createJsonResponse({
        status: "success",
        message: "Database 6 Sheet berhasil dibuat dengan header lengkap!"
      });
    }

    if (action === "syncAll") {
      // Sinkronisasi data penuh dari aplikasi ke Google Sheets
      var payload = postData.payload || {};
      var result = saveAllData(payload);
      recalculateRekapUtang();
      logActivity(postData.user || "System", "SINKRONISASI", "Sinkronisasi penuh data dengan Google Sheets");

      return createJsonResponse({
        status: "success",
        message: "Data berhasil disinkronkan ke Google Sheets",
        recap: result,
        currentData: getAllData()
      });
    }

    if (action === "savePemesanan") {
      var item = postData.item;
      savePemesananItem(item);
      recalculateRekapUtang();
      logActivity(postData.user || item.namaPemesan || "Petugas", "TAMBAH_PEMESANAN", "Pemesanan " + item.id + " (" + item.jenisMakanan + ") Rp" + item.totalHarga);

      return createJsonResponse({
        status: "success",
        message: "Transaksi pemesanan tersimpan di Google Sheets",
        id: item.id
      });
    }

    if (action === "savePembayaran") {
      var payItem = postData.item;
      savePembayaranItem(payItem);
      recalculateRekapUtang();
      logActivity(postData.user || payItem.namaPetugas || "Bendahara", "TAMBAH_PEMBAYARAN", "Pembayaran " + payItem.id + " untuk " + payItem.kateringNama + " Rp" + payItem.jumlah);

      return createJsonResponse({
        status: "success",
        message: "Transaksi pembayaran tersimpan di Google Sheets",
        id: payItem.id
      });
    }

    return createJsonResponse({
      status: "error",
      message: "Action POST tidak valid: " + action
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: "Gagal memproses di Google Sheets: " + error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Inisialisasi 6 Sheet Utama beserta Format Header & Warna
 */
function initDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheetsDef = [
    {
      name: SHEET_KATERING,
      headers: ["ID Katering", "Nama Katering", "Nama Pemilik", "No WhatsApp", "Alamat", "Keterangan", "Status", "Waktu Dibuat", "Terakhir Diubah"]
    },
    {
      name: SHEET_PEMESANAN,
      headers: ["ID Transaksi", "Tanggal", "ID Katering", "Nama Katering", "Jenis Makanan", "Keperluan", "Jumlah", "Satuan", "Harga Satuan", "Total Harga", "Nama Pemesan", "Catatan", "Waktu Input"]
    },
    {
      name: SHEET_PEMBAYARAN,
      headers: ["ID Pembayaran", "Tanggal", "ID Katering", "Nama Katering", "Jumlah Bayar", "Metode", "No Referensi", "Keterangan", "Petugas", "Bukti Bayar", "Waktu Input"]
    },
    {
      name: SHEET_REKAP,
      headers: ["ID Katering", "Nama Katering", "Total Pemesanan", "Total Pembayaran", "Sisa Utang", "Status Utang", "Terakhir Diperbarui"]
    },
    {
      name: SHEET_PENGATURAN,
      headers: ["Kunci Pengaturan", "Nilai", "Keterangan", "Waktu Diubah"]
    },
    {
      name: SHEET_LOG,
      headers: ["ID Log", "Waktu", "User", "Aksi", "Rincian", "Status"]
    }
  ];

  sheetsDef.forEach(function(def) {
    var sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    // Set Header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      var headerRange = sheet.getRange(1, 1, 1, def.headers.length);
      headerRange.setBackground("#0F2942"); // Biru Tua SIKAT
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  });

  // Hapus "Sheet1" default jika ada dan sheet lain sudah dibuat
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }
}

/**
 * Ambil seluruh data dari Google Sheets untuk sinkronisasi ke aplikasi
 */
function getAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  return {
    katering: getSheetDataAsObjects(ss.getSheetByName(SHEET_KATERING), [
      "id", "nama", "pemilik", "whatsapp", "alamat", "keterangan", "status", "createdAt", "updatedAt"
    ]),
    pemesanan: getSheetDataAsObjects(ss.getSheetByName(SHEET_PEMESANAN), [
      "id", "tanggal", "kateringId", "kateringNama", "jenisMakanan", "keterangan", "jumlahPesanan", "satuan", "hargaSatuan", "totalHarga", "namaPemesan", "catatan", "createdAt"
    ]),
    pembayaran: getSheetDataAsObjects(ss.getSheetByName(SHEET_PEMBAYARAN), [
      "id", "tanggal", "kateringId", "kateringNama", "jumlah", "metodePembayaran", "noReferensi", "keterangan", "namaPetugas", "buktiBayarUrl", "createdAt"
    ]),
    logAktivitas: getSheetDataAsObjects(ss.getSheetByName(SHEET_LOG), [
      "id", "timestamp", "user", "aksi", "rincian", "status"
    ])
  };
}

/**
 * Simpan seluruh kumpulan data ke Google Sheets
 */
function saveAllData(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Simpan Katering
  if (payload.katering && payload.katering.length >= 0) {
    overwriteSheetData(ss.getSheetByName(SHEET_KATERING), payload.katering, function(k) {
      return [k.id, k.nama, k.pemilik, k.whatsapp, k.alamat, k.keterangan || "", k.status, k.createdAt, k.updatedAt || new Date().toISOString()];
    });
  }

  // 2. Simpan Pemesanan
  if (payload.pemesanan && payload.pemesanan.length >= 0) {
    overwriteSheetData(ss.getSheetByName(SHEET_PEMESANAN), payload.pemesanan, function(p) {
      return [
        p.id, p.tanggal, p.kateringId, p.kateringNama, p.jenisMakanan, p.keterangan || "",
        Number(p.jumlahPesanan || 0), p.satuan, Number(p.hargaSatuan || 0), Number(p.totalHarga || 0),
        p.namaPemesan || "", p.catatan || "", p.createdAt || new Date().toISOString()
      ];
    });
  }

  // 3. Simpan Pembayaran
  if (payload.pembayaran && payload.pembayaran.length >= 0) {
    overwriteSheetData(ss.getSheetByName(SHEET_PEMBAYARAN), payload.pembayaran, function(b) {
      return [
        b.id, b.tanggal, b.kateringId, b.kateringNama, Number(b.jumlah || 0),
        b.metodePembayaran, b.noReferensi || "", b.keterangan || "",
        b.namaPetugas || "", b.buktiBayarUrl || "", b.createdAt || new Date().toISOString()
      ];
    });
  }

  return {
    kateringCount: payload.katering ? payload.katering.length : 0,
    pemesananCount: payload.pemesanan ? payload.pemesanan.length : 0,
    pembayaranCount: payload.pembayaran ? payload.pembayaran.length : 0
  };
}

/**
 * Hitung Ulang Saldo Utang secara otomatis di Sheet REKAP_UTANG
 */
function recalculateRekapUtang() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetKatering = ss.getSheetByName(SHEET_KATERING);
  var sheetPemesanan = ss.getSheetByName(SHEET_PEMESANAN);
  var sheetPembayaran = ss.getSheetByName(SHEET_PEMBAYARAN);
  var sheetRekap = ss.getSheetByName(SHEET_REKAP);

  if (!sheetKatering || !sheetRekap) return;

  var katerData = sheetKatering.getDataRange().getValues();
  if (katerData.length <= 1) return;

  var pemesananData = sheetPemesanan.getDataRange().getValues();
  var pembayaranData = sheetPembayaran.getDataRange().getValues();

  var totals = {};

  // Inisialisasi setiap katering
  for (var i = 1; i < katerData.length; i++) {
    var kId = String(katerData[i][0]).trim();
    var kNama = String(katerData[i][1]).trim();
    if (kId) {
      totals[kId] = { id: kId, nama: kNama, pemesanan: 0, pembayaran: 0 };
    }
  }

  // Hitung total pemesanan
  for (var p = 1; p < pemesananData.length; p++) {
    var pKId = String(pemesananData[p][2]).trim();
    var pTotal = Number(pemesananData[p][9]) || 0;
    if (totals[pKId]) {
      totals[pKId].pemesanan += pTotal;
    }
  }

  // Hitung total pembayaran
  for (var b = 1; b < pembayaranData.length; b++) {
    var bKId = String(pembayaranData[b][2]).trim();
    var bJumlah = Number(pembayaranData[b][4]) || 0;
    if (totals[bKId]) {
      totals[bKId].pembayaran += bJumlah;
    }
  }

  // Kosongkan baris data rekap lama
  if (sheetRekap.getLastRow() > 1) {
    sheetRekap.getRange(2, 1, sheetRekap.getLastRow() - 1, sheetRekap.getLastColumn()).clearContent();
  }

  var rekapRows = [];
  var nowStr = new Date().toISOString();

  for (var id in totals) {
    var row = totals[id];
    var sisa = row.pemesanan - row.pembayaran;
    var status = "LUNAS";
    if (sisa > 0) status = "BELUM LUNAS";
    else if (sisa < 0) status = "LEBIH BAYAR";

    rekapRows.push([row.id, row.nama, row.pemesanan, row.pembayaran, sisa, status, nowStr]);
  }

  if (rekapRows.length > 0) {
    sheetRekap.getRange(2, 1, rekapRows.length, 7).setValues(rekapRows);
  }
}

/**
 * Catat Log Aktivitas ke Sheet
 */
function logActivity(user, aksi, rincian) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_LOG);
  if (!sheet) return;

  var logId = "LOG-" + new Date().getTime();
  sheet.appendRow([logId, new Date().toISOString(), user, aksi, rincian, "sukses"]);
}

/**
 * Helper: Simpan data satu baris pemesanan
 */
function savePemesananItem(p) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PEMESANAN);
  sheet.appendRow([
    p.id, p.tanggal, p.kateringId, p.kateringNama, p.jenisMakanan, p.keterangan || "",
    Number(p.jumlahPesanan || 0), p.satuan, Number(p.hargaSatuan || 0), Number(p.totalHarga || 0),
    p.namaPemesan || "", p.catatan || "", new Date().toISOString()
  ]);
}

/**
 * Helper: Simpan data satu baris pembayaran
 */
function savePembayaranItem(b) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PEMBAYARAN);
  sheet.appendRow([
    b.id, b.tanggal, b.kateringId, b.kateringNama, Number(b.jumlah || 0),
    b.metodePembayaran, b.noReferensi || "", b.keterangan || "",
    b.namaPetugas || "", b.buktiBayarUrl || "", new Date().toISOString()
  ]);
}

/**
 * Helper: Mengosongkan data sheet (kecuali baris header) dan mengisi ulang
 */
function overwriteSheetData(sheet, items, mapFunction) {
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  if (!items || items.length === 0) return;

  var rows = items.map(mapFunction);
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/**
 * Helper: Membaca sheet sebagai array of objects
 */
function getSheetDataAsObjects(sheet, keys) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, keys.length).getValues();
  return data.map(function(row) {
    var obj = {};
    keys.forEach(function(key, idx) {
      obj[key] = row[idx];
    });
    return obj;
  });
}

/**
 * Helper Response JSON dengan CORS
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
