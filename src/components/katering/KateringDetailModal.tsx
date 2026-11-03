import React from 'react';
import { Modal } from '../common/Modal';
import { Katering, Pemesanan, Pembayaran } from '../../types';
import { formatRupiah, formatTanggal, getCleanWhatsApp } from '../../utils/formatters';
import { buildRiwayatTransaksi, getSaldoUtangKatering } from '../../utils/calculations';
import { MessageSquare, Phone, MapPin, Receipt, ShoppingBag } from 'lucide-react';

interface KateringDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  katering: Katering | null;
  pemesananList: Pemesanan[];
  pembayaranList: Pembayaran[];
  onOpenBayarModal: (katering: Katering) => void;
}

export const KateringDetailModal: React.FC<KateringDetailModalProps> = ({
  isOpen,
  onClose,
  katering,
  pemesananList,
  pembayaranList,
  onOpenBayarModal,
}) => {
  if (!katering) return null;

  const currentDebt = getSaldoUtangKatering(katering.id, pemesananList, pembayaranList);
  const riwayat = buildRiwayatTransaksi(pemesananList, pembayaranList, katering.id);

  const totalOrders = pemesananList
    .filter((p) => p.kateringId === katering.id)
    .reduce((sum, p) => sum + Number(p.totalHarga || 0), 0);

  const totalPayments = pembayaranList
    .filter((b) => b.kateringId === katering.id)
    .reduce((sum, b) => sum + Number(b.jumlah || 0), 0);

  const cleanWa = getCleanWhatsApp(katering.whatsapp);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Profil & Riwayat: ${katering.nama}`}
      subtitle={`ID: ${katering.id} · Penanggung Jawab: ${katering.pemilik}`}
      maxWidth="3xl"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Info & Saldo Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {/* Card 1: Total Pemesanan */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Seluruh Pesanan
            </span>
            <p className="mt-1 text-base sm:text-lg font-black font-mono text-slate-900">
              {formatRupiah(totalOrders)}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {pemesananList.filter((p) => p.kateringId === katering.id).length} kali pesanan
            </p>
          </div>

          {/* Card 2: Total Pembayaran */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Pembayaran Masuk
            </span>
            <p className="mt-1 text-base sm:text-lg font-black font-mono text-emerald-700">
              {formatRupiah(totalPayments)}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {pembayaranList.filter((b) => b.kateringId === katering.id).length} kali pembayaran
            </p>
          </div>

          {/* Card 3: Saldo Utang */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Sisa Utang Saat Ini
            </span>
            <p
              className={`mt-1 text-base sm:text-lg font-black font-mono ${
                currentDebt > 0
                  ? 'text-amber-600'
                  : currentDebt < 0
                  ? 'text-sky-600'
                  : 'text-emerald-700'
              }`}
            >
              {formatRupiah(currentDebt)}
            </p>
            <p className="text-[10px] sm:text-[11px] font-semibold mt-0.5">
              {currentDebt === 0
                ? 'Status: LUNAS'
                : currentDebt > 0
                ? 'Status: BELUM LUNAS'
                : 'Status: LEBIH BAYAR'}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-mono font-bold">{katering.whatsapp}</span>
              <span className="text-slate-300">·</span>
              <span className="font-medium text-slate-800">{katering.pemilik}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                  katering.nama
                )},%20kami%20dari%20bagian%20keuangan%20ingin%20konfirmasi%20pemesanan/pembayaran%20katering.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat WhatsApp</span>
              </a>

              {currentDebt > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenBayarModal(katering);
                  }}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Bayar Utang</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{katering.alamat}</span>
          </div>

          {katering.keterangan && (
            <p className="text-[11px] text-slate-500 italic pl-5">{katering.keterangan}</p>
          )}
        </div>

        {/* Transaction History: Card-based on mobile, table on desktop */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Buku Pembantu & Riwayat Saldo ({riwayat.length})
            </h4>
            <span className="text-[10px] text-slate-400">Kronologis waktu</span>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden max-h-80 overflow-y-auto">
            {riwayat.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Belum ada riwayat transaksi dengan katering ini.
              </p>
            ) : (
              riwayat.map((r) => (
                <div key={r.id} className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400">{r.nomorTransaksi}</span>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{r.keterangan}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{formatTanggal(r.tanggal)}</span>
                    </div>
                    <div className="text-right shrink-0">
                      {r.penambahanUtang > 0 && (
                        <p className="font-mono font-bold text-blue-700 text-xs">
                          +{formatRupiah(r.penambahanUtang)}
                        </p>
                      )}
                      {r.penguranganUtang > 0 && (
                        <p className="font-mono font-bold text-emerald-700 text-xs">
                          -{formatRupiah(r.penguranganUtang)}
                        </p>
                      )}
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-sm inline-block mt-0.5 ${
                          r.jenisTransaksi === 'Pemesanan'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {r.jenisTransaksi}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded text-[11px]">
                    <span className="text-slate-400 text-[10px]">Saldo Berjalan:</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {formatRupiah(r.saldoBerjalan)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">No. Transaksi</th>
                  <th className="py-2.5 px-3">Keterangan / Menu</th>
                  <th className="py-2.5 px-3 text-right">Penambahan (+)</th>
                  <th className="py-2.5 px-3 text-right">Pengurangan (-)</th>
                  <th className="py-2.5 px-3 text-right">Saldo Utang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayat.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Belum ada riwayat transaksi dengan katering ini.
                    </td>
                  </tr>
                ) : (
                  riwayat.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {formatTanggal(r.tanggal)}
                      </td>
                      <td className="py-2 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {r.nomorTransaksi}
                      </td>
                      <td className="py-2 px-3 text-slate-700">{r.keterangan}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-blue-700 whitespace-nowrap">
                        {r.penambahanUtang > 0 ? formatRupiah(r.penambahanUtang) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">
                        {r.penguranganUtang > 0 ? formatRupiah(r.penguranganUtang) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(r.saldoBerjalan)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sticky thumb-zone action buttons */}
        <div className="sticky -bottom-3.5 sm:bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-1 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
