import React from 'react';
import { Modal } from '../common/Modal';
import { Pembayaran, PengaturanOrganisasi } from '../../types';
import { formatRupiah, formatTanggalLengkap } from '../../utils/formatters';
import { Printer } from 'lucide-react';

interface KuitansiModalProps {
  isOpen: boolean;
  onClose: () => void;
  pembayaran: Pembayaran | null;
  pengaturan: PengaturanOrganisasi;
}

export const KuitansiModal: React.FC<KuitansiModalProps> = ({
  isOpen,
  onClose,
  pembayaran,
  pengaturan,
}) => {
  if (!pembayaran) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kuitansi Resmi Pembayaran Utang Katering"
      subtitle={`No. Kuitansi: ${pembayaran.id}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Printable Paper Canvas */}
        <div
          id="printable-kuitansi"
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-8 text-slate-800 shadow-2xs font-sans text-xs space-y-4 sm:space-y-6"
        >
          {/* Header Kop */}
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

          {/* Title */}
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 underline">
              KUITANSI BUKTI PEMBAYARAN KATERING
            </h3>
            <p className="font-mono text-[11px] text-slate-600">Nomor: {pembayaran.id}</p>
          </div>

          {/* Key-Value Fields */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Telah Dibayarkan Kepada</span>
              <span className="col-span-2 font-bold text-slate-900">: {pembayaran.kateringNama}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Tanggal Pembayaran</span>
              <span className="col-span-2 font-mono text-slate-800">
                : {formatTanggalLengkap(pembayaran.tanggal)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Metode Pembayaran</span>
              <span className="col-span-2 text-slate-800">
                : {pembayaran.metodePembayaran}{' '}
                {pembayaran.noReferensi ? `(No. Ref: ${pembayaran.noReferensi})` : ''}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Untuk Keperluan</span>
              <span className="col-span-2 text-slate-800">
                : {pembayaran.keterangan || 'Pembayaran bertahap pesanan katering'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-700">Jumlah Pembayaran</span>
              <span className="col-span-2 font-mono font-black text-emerald-800 text-base">
                : {formatRupiah(pembayaran.jumlah)}
              </span>
            </div>
          </div>

          {/* Uploaded Receipt Image Preview if exists */}
          {pembayaran.buktiBayarUrl && (
            <div className="space-y-1">
              <span className="font-bold text-[11px] text-slate-700">Lampiran Bukti Transfer/Struk:</span>
              <div className="max-w-xs border border-slate-200 rounded-lg p-1 bg-slate-50">
                <img
                  src={pembayaran.buktiBayarUrl}
                  alt="Bukti Bayar"
                  className="max-h-40 rounded object-contain"
                />
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="space-y-16">
              <div>
                <p>Penerima Pembayaran,</p>
                <p className="font-semibold text-slate-900">{pembayaran.kateringNama}</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900">( ................................... )</p>
                <p className="text-[10px] text-slate-500">Tanda Tangan & Cap Vendor</p>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p>{pengaturan.kotaSurat}, {formatTanggalLengkap(pembayaran.tanggal)}</p>
                <p className="font-semibold text-slate-900">Petugas / Bendahara,</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900">{pembayaran.namaPetugas}</p>
                <p className="text-[10px] text-slate-500">Petugas Keuangan Pengeluaran</p>
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
            <span>Cetak Kuitansi Resmi</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
