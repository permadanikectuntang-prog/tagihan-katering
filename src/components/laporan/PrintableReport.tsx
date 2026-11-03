import React from 'react';
import { MonthlySummaryReport, PengaturanOrganisasi } from '../../types';
import { formatRupiah, formatTanggal, BULAN_INDONESIA } from '../../utils/formatters';

interface PrintableReportProps {
  report: MonthlySummaryReport;
  pengaturan: PengaturanOrganisasi;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ report, pengaturan }) => {
  const namaBulan = BULAN_INDONESIA[report.bulan - 1];
  const today = new Date();
  const printDateStr = `${today.getDate()} ${BULAN_INDONESIA[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <div
      id="printable-monthly-report"
      className="bg-white p-4 sm:p-8 md:p-12 text-slate-900 font-sans text-xs space-y-5 sm:space-y-6 max-w-4xl mx-auto border border-slate-200 rounded-2xl shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 overflow-x-auto"
    >
      {/* KOP SURAT RESMI */}
      <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
        <h1 className="text-lg font-black uppercase tracking-wider text-slate-950">
          {pengaturan.namaOrganisasi}
        </h1>
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800">
          {pengaturan.unitKerja}
        </h2>
        <p className="text-[11px] text-slate-600">{pengaturan.alamat}</p>
        <p className="text-[10px] text-slate-500">
          Telepon: {pengaturan.telepon} · Pos-el: {pengaturan.email}
        </p>
      </div>

      {/* JUDUL LAPORAN & PERIODE */}
      <div className="text-center space-y-1 pt-2">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 underline">
          LAPORAN KEUANGAN DAN ADMINISTRASI KATERING (SIKAT)
        </h3>
        <p className="font-semibold text-slate-700">
          Periode: {namaBulan} {report.tahun} · Rekanan: {report.kateringNamaFilter}
        </p>
      </div>

      {/* RINGKASAN SALDO UTANG & PEMBAYARAN */}
      <div className="border border-slate-300 rounded-xl overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px] text-slate-800">
          I. Ringkasan Saldo Utang & Realisasi Pembayaran
        </div>
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-700 w-2/3">
                1. Saldo Utang Awal Bulan (Kewajiban Periode Sebelumnya)
              </td>
              <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                {formatRupiah(report.saldoAwal)}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-700">
                2. Total Pemesanan Bulan Ini (Penambahan Utang Baru)
              </td>
              <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-900">
                + {formatRupiah(report.totalPemesanan)}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-700">
                3. Total Pembayaran Bulan Ini (Pengurangan Utang Realisasi)
              </td>
              <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800">
                - {formatRupiah(report.totalPembayaran)}
              </td>
            </tr>
            <tr className="bg-slate-50 font-black border-t-2 border-slate-300">
              <td className="py-3 px-4 text-slate-900 uppercase">
                4. Saldo Utang Akhir Bulan (Saldo Awal + Pemesanan - Pembayaran)
              </td>
              <td className="py-3 px-4 text-right font-mono text-sm text-slate-950">
                {formatRupiah(report.saldoAkhir)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RINCIAN TRANSAKSI PEMESANAN BULAN INI */}
      <div className="space-y-2">
        <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800">
          II. Rincian Pemesanan Makanan ({report.daftarPemesanan.length} Transaksi)
        </h4>
        <div className="border border-slate-300 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700">
              <tr>
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Tanggal</th>
                <th className="py-2 px-3">No. Transaksi</th>
                <th className="py-2 px-3">Penyedia Katering</th>
                <th className="py-2 px-3">Menu / Keperluan</th>
                <th className="py-2 px-3 text-right">Volume</th>
                <th className="py-2 px-3 text-right">Total Harga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.daftarPemesanan.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400">
                    Tidak ada transaksi pemesanan pada periode ini.
                  </td>
                </tr>
              ) : (
                report.daftarPemesanan.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-mono text-slate-600">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {formatTanggal(p.tanggal)}
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-700">{p.id}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{p.kateringNama}</td>
                    <td className="py-2 px-3 text-slate-700">
                      {p.jenisMakanan} {p.keterangan ? `(${p.keterangan})` : ''}
                    </td>
                    <td className="py-2 px-3 text-right font-mono whitespace-nowrap">
                      {p.jumlahPesanan} {p.satuan}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(p.totalHarga)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {report.daftarPemesanan.length > 0 && (
              <tfoot className="bg-slate-50 border-t border-slate-300 font-bold">
                <tr>
                  <td colSpan={6} className="py-2 px-3 text-right uppercase text-slate-700">
                    Subtotal Pemesanan Bulan Ini:
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-900">
                    {formatRupiah(report.totalPemesanan)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* RINCIAN TRANSAKSI PEMBAYARAN BULAN INI */}
      <div className="space-y-2">
        <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800">
          III. Rincian Pembayaran Utang ({report.daftarPembayaran.length} Transaksi)
        </h4>
        <div className="border border-slate-300 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700">
              <tr>
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Tanggal</th>
                <th className="py-2 px-3">No. Bukti Bayar</th>
                <th className="py-2 px-3">Penyedia Katering</th>
                <th className="py-2 px-3">Metode & Referensi</th>
                <th className="py-2 px-3">Keterangan</th>
                <th className="py-2 px-3 text-right">Jumlah Dibayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.daftarPembayaran.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400">
                    Tidak ada realisasi pembayaran pada periode ini.
                  </td>
                </tr>
              ) : (
                report.daftarPembayaran.map((b, idx) => (
                  <tr key={b.id}>
                    <td className="py-2 px-3 font-mono text-slate-600">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {formatTanggal(b.tanggal)}
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-700">{b.id}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{b.kateringNama}</td>
                    <td className="py-2 px-3 text-slate-700">
                      {b.metodePembayaran} {b.noReferensi ? `(${b.noReferensi})` : ''}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{b.keterangan || '-'}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {formatRupiah(b.jumlah)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {report.daftarPembayaran.length > 0 && (
              <tfoot className="bg-slate-50 border-t border-slate-300 font-bold">
                <tr>
                  <td colSpan={6} className="py-2 px-3 text-right uppercase text-slate-700">
                    Subtotal Pembayaran Bulan Ini:
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-800">
                    {formatRupiah(report.totalPembayaran)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* CATATAN KAKI RESMI */}
      {pengaturan.catatanKakiLaporan && (
        <p className="text-[10px] text-slate-500 italic pt-2">
          * {pengaturan.catatanKakiLaporan}
        </p>
      )}

      {/* TANDA TANGAN PEJABAT */}
      <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs break-inside-avoid">
        <div className="space-y-20">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold text-slate-900">{pengaturan.jabatanKetua}</p>
          </div>
          <div>
            <p className="font-bold underline text-slate-950">{pengaturan.namaKetua}</p>
            <p className="font-mono text-[11px] text-slate-600">NIP: {pengaturan.nipKetua || '-'}</p>
          </div>
        </div>

        <div className="space-y-20">
          <div>
            <p>{pengaturan.kotaSurat}, {printDateStr}</p>
            <p className="font-bold text-slate-900">{pengaturan.jabatanBendahara}</p>
          </div>
          <div>
            <p className="font-bold underline text-slate-950">{pengaturan.namaBendahara}</p>
            <p className="font-mono text-[11px] text-slate-600">NIP: {pengaturan.nipBendahara || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
