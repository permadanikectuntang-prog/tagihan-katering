import React from 'react';
import { Modal } from '../common/Modal';
import { Pemesanan, PengaturanOrganisasi } from '../../types';
import { formatRupiah, formatTanggalLengkap } from '../../utils/formatters';
import { Printer, Download } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  pemesanan: Pemesanan | null;
  pengaturan: PengaturanOrganisasi;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  pemesanan,
  pengaturan,
}) => {
  if (!pemesanan) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bukti Pemesanan Makanan (Surat Pesanan Katering)"
      subtitle={`No. Transaksi: ${pemesanan.id}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Printable Paper Canvas */}
        <div
          id="printable-invoice"
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-8 text-slate-800 shadow-2xs font-sans text-xs space-y-4 sm:space-y-6 overflow-x-auto"
        >
          {/* Header Kop Organisasi */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              {pengaturan.namaOrganisasi}
            </h2>
            <p className="font-semibold text-slate-700">{pengaturan.unitKerja}</p>
            <p className="text-[11px] text-slate-500">{pengaturan.alamat}</p>
            <p className="text-[10px] text-slate-500">
              Telp: {pengaturan.telepon} · Email: {pengaturan.email}
            </p>
          </div>

          {/* Title of Document */}
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 underline">
              SURAT BUKTI PEMESANAN KATERING
            </h3>
            <p className="font-mono text-[11px] text-slate-600">Nomor: {pemesanan.id}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500">Penyedia Jasa Katering:</p>
              <p className="font-bold text-slate-900 text-sm">{pemesanan.kateringNama}</p>
              <p className="text-[11px] text-slate-600">ID Vendor: {pemesanan.kateringId}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[11px] text-slate-500">Tanggal Pemesanan:</p>
              <p className="font-mono font-bold text-slate-900">
                {formatTanggalLengkap(pemesanan.tanggal)}
              </p>
              <p className="text-[11px] text-slate-600">Pemesan: {pemesanan.namaPemesan}</p>
            </div>
          </div>

          {/* Table Details */}
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Deskripsi / Jenis Menu</th>
                  <th className="py-2.5 px-3">Keperluan Acara</th>
                  <th className="py-2.5 px-3 text-right">Jumlah</th>
                  <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 text-right">Total Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {pemesanan.jenisMakanan}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{pemesanan.keterangan || '-'}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800 whitespace-nowrap">
                    {pemesanan.jumlahPesanan} {pemesanan.satuan}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                    {formatRupiah(pemesanan.hargaSatuan)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatRupiah(pemesanan.totalHarga)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-slate-700">
                    Total Nilai Pemesanan (Utang Timbul):
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-slate-900">
                    {formatRupiah(pemesanan.totalHarga)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {pemesanan.catatan && (
            <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-[11px] text-amber-900">
              <span className="font-bold">Catatan Khusus:</span> {pemesanan.catatan}
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="space-y-16">
              <div>
                <p>Penyedia Jasa Katering,</p>
                <p className="font-semibold text-slate-900">{pemesanan.kateringNama}</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900">( ................................... )</p>
                <p className="text-[10px] text-slate-500">Tanda Tangan & Cap</p>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p>{pengaturan.kotaSurat}, {formatTanggalLengkap(pemesanan.tanggal)}</p>
                <p className="font-semibold text-slate-900">Petugas Pemesan,</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900">{pemesanan.namaPemesan}</p>
                <p className="text-[10px] text-slate-500">Staf Administrasi / Pelaksana</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky thumb-zone action buttons */}
        <div className="sticky -bottom-3.5 sm:bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-1 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 active:bg-black transition-colors shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
