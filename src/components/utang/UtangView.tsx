import React, { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  Eye,
  Receipt,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { Katering, Pemesanan, Pembayaran, User } from '../../types';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import { calculateRekapUtang } from '../../utils/calculations';
import { KateringDetailModal } from '../katering/KateringDetailModal';

interface UtangViewProps {
  kateringList: Katering[];
  pemesananList: Pemesanan[];
  pembayaranList: Pembayaran[];
  currentUser: User;
  onOpenBayarModal: (katering: Katering) => void;
}

export const UtangView: React.FC<UtangViewProps> = ({
  kateringList,
  pemesananList,
  pembayaranList,
  currentUser,
  onOpenBayarModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'BELUM LUNAS' | 'LUNAS' | 'LEBIH BAYAR'>(
    'all'
  );
  const [selectedKateringForDetail, setSelectedKateringForDetail] = useState<Katering | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Recalculate debt recap for each catering provider
  const rekapList = useMemo(() => {
    return calculateRekapUtang(kateringList, pemesananList, pembayaranList);
  }, [kateringList, pemesananList, pembayaranList]);

  // Overall totals
  const totalAllOrders = rekapList.reduce((sum, r) => sum + r.totalPemesanan, 0);
  const totalAllPayments = rekapList.reduce((sum, r) => sum + r.totalPembayaran, 0);
  const totalAllDebt = totalAllOrders - totalAllPayments;

  // Filtered
  const filteredRekap = useMemo(() => {
    return rekapList.filter((r) => {
      const matchesSearch =
        r.kateringNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.kateringId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.statusUtang === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rekapList, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Pemantauan Saldo Utang Katering
        </h2>
        <p className="text-xs text-slate-500">
          Perhitungan saldo utang individual per penyedia jasa katering (Sisa Utang = Total Pemesanan - Total Pembayaran)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Seluruh Pemesanan
          </span>
          <p className="mt-2 text-2xl font-black font-mono text-slate-900">
            {formatRupiah(totalAllOrders)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Dari seluruh penyedia katering rekanan</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Seluruh Pembayaran
          </span>
          <p className="mt-2 text-2xl font-black font-mono text-emerald-700">
            {formatRupiah(totalAllPayments)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Total cicilan & pembayaran terealisasi</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Sisa Utang Organisasi
          </span>
          <p
            className={`mt-2 text-2xl font-black font-mono ${
              totalAllDebt > 0
                ? 'text-amber-600'
                : totalAllDebt < 0
                ? 'text-sky-600'
                : 'text-emerald-700'
            }`}
          >
            {formatRupiah(totalAllDebt)}
          </p>
          <p className="mt-1 text-xs font-semibold">
            {totalAllDebt === 0
              ? 'Seluruh kewajiban lunas'
              : totalAllDebt > 0
              ? 'Wajib diselesaikan bertahap'
              : 'Terdapat saldo lebih bayar'}
          </p>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama katering atau ID..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto">
          {(['all', 'BELUM LUNAS', 'LUNAS', 'LEBIH BAYAR'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main List & Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Mobile View: Compact Touch Debt Cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {filteredRekap.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              Tidak ada data utang katering yang cocok.
            </p>
          ) : (
            filteredRekap.map((r) => {
              const kateringObj = kateringList.find((k) => k.id === r.kateringId);

              return (
                <div key={r.kateringId} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] font-bold text-slate-400">{r.kateringId}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">{r.kateringNama}</h4>
                    </div>
                    <span
                      className={`font-semibold text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                        r.statusUtang === 'LUNAS'
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.statusUtang === 'BELUM LUNAS'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-sky-50 text-sky-700'
                      }`}
                    >
                      {r.statusUtang}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-semibold">Pesanan</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {formatRupiah(r.totalPemesanan)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-semibold">Dibayar</span>
                      <span className="font-mono font-bold text-emerald-700 text-xs">
                        {formatRupiah(r.totalPembayaran)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Sisa Utang
                      </span>
                      <span
                        className={`text-sm font-black font-mono ${
                          r.sisaUtang > 0
                            ? 'text-amber-600'
                            : r.sisaUtang < 0
                            ? 'text-sky-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {formatRupiah(r.sisaUtang)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (kateringObj) {
                            setSelectedKateringForDetail(kateringObj);
                            setIsDetailOpen(true);
                          }
                        }}
                        className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        <span>Detail</span>
                      </button>

                      {currentUser.role !== 'pengurus' && (
                        <button
                          onClick={() => {
                            if (kateringObj) {
                              onOpenBayarModal(kateringObj);
                            }
                          }}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs active:bg-emerald-800"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>Bayar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Penyedia Katering</th>
                <th className="py-3 px-4 text-right">Total Pemesanan (A)</th>
                <th className="py-3 px-4 text-right">Total Pembayaran (B)</th>
                <th className="py-3 px-4 text-right">Sisa Utang (A - B)</th>
                <th className="py-3 px-4 text-center">Status Utang</th>
                <th className="py-3 px-4 text-center">Aksi & Riwayat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRekap.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data utang katering yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRekap.map((r, idx) => {
                  const kateringObj = kateringList.find((k) => k.id === r.kateringId);

                  return (
                    <tr key={r.kateringId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {idx + 1}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">{r.kateringNama}</div>
                        <div className="text-[11px] text-slate-500">ID: {r.kateringId}</div>
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                        {formatRupiah(r.totalPemesanan)}
                        <span className="block text-[10px] text-slate-400">
                          {r.jumlahPemesanan} kali pesan
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-medium text-emerald-700 whitespace-nowrap">
                        {formatRupiah(r.totalPembayaran)}
                        <span className="block text-[10px] text-slate-400">
                          {r.jumlahPembayaran} kali bayar
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold whitespace-nowrap text-sm">
                        <span
                          className={
                            r.sisaUtang > 0
                              ? 'text-amber-600'
                              : r.sisaUtang < 0
                              ? 'text-sky-600'
                              : 'text-emerald-700'
                          }
                        >
                          {formatRupiah(r.sisaUtang)}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-semibold text-[11px] ${
                            r.statusUtang === 'LUNAS'
                              ? 'text-emerald-700'
                              : r.statusUtang === 'BELUM LUNAS'
                              ? 'text-amber-700'
                              : 'text-sky-700'
                          }`}
                        >
                          {r.statusUtang}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              if (kateringObj) {
                                setSelectedKateringForDetail(kateringObj);
                                setIsDetailOpen(true);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            <span>Detail</span>
                          </button>

                          {currentUser.role !== 'pengurus' && (
                            <button
                              onClick={() => {
                                if (kateringObj) {
                                  onOpenBayarModal(kateringObj);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                            >
                              <Receipt className="h-3.5 w-3.5" />
                              <span>Bayar Utang</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredRekap.length > 0 && (
              <tfoot className="border-t-2 border-slate-200 bg-slate-50/80 font-bold text-slate-900">
                <tr>
                  <td colSpan={2} className="py-3 px-4 uppercase text-slate-700">
                    Total Keseluruhan Rekap:
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatRupiah(
                      filteredRekap.reduce((sum, r) => sum + r.totalPemesanan, 0)
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-800">
                    {formatRupiah(
                      filteredRekap.reduce((sum, r) => sum + r.totalPembayaran, 0)
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm">
                    {formatRupiah(
                      filteredRekap.reduce((sum, r) => sum + r.sisaUtang, 0)
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <KateringDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        katering={selectedKateringForDetail}
        pemesananList={pemesananList}
        pembayaranList={pembayaranList}
        onOpenBayarModal={onOpenBayarModal}
      />
    </div>
  );
};
