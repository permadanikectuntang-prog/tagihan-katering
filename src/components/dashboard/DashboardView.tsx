import React from 'react';
import {
  ShoppingBag,
  Receipt,
  Scale,
  UtensilsCrossed,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';
import { Katering, Pemesanan, Pembayaran, User } from '../../types';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import { getSaldoUtangKatering } from '../../utils/calculations';

interface DashboardViewProps {
  kateringList: Katering[];
  pemesananList: Pemesanan[];
  pembayaranList: Pembayaran[];
  currentUser: User;
  onNavigate: (menu: string) => void;
  onOpenNewPemesanan: () => void;
  onOpenNewPembayaran: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kateringList,
  pemesananList,
  pembayaranList,
  currentUser,
  onNavigate,
  onOpenNewPemesanan,
  onOpenNewPembayaran,
}) => {
  // Current month & year
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1;
  const currentMonthPrefix = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  // 1. Total seluruh pemesanan
  const totalSeluruhPemesanan = pemesananList.reduce(
    (sum, p) => sum + Number(p.totalHarga || 0),
    0
  );

  // 2. Total seluruh pembayaran
  const totalSeluruhPembayaran = pembayaranList.reduce(
    (sum, b) => sum + Number(b.jumlah || 0),
    0
  );

  // 3. Total sisa utang kepada katering
  const totalSisaUtang = totalSeluruhPemesanan - totalSeluruhPembayaran;

  // 4. Jumlah transaksi pemesanan & pembayaran
  const countPemesanan = pemesananList.length;
  const countPembayaran = pembayaranList.length;

  // 5. Jumlah katering yang bekerja sama
  const countKatering = kateringList.length;

  // 6. Total pemesanan (utang timbul) bulan berjalan
  const totalPemesananBulanIni = pemesananList
    .filter((p) => p.tanggal.startsWith(currentMonthPrefix))
    .reduce((sum, p) => sum + Number(p.totalHarga || 0), 0);

  // 7. Total pembayaran bulan berjalan
  const totalPembayaranBulanIni = pembayaranList
    .filter((b) => b.tanggal.startsWith(currentMonthPrefix))
    .reduce((sum, b) => sum + Number(b.jumlah || 0), 0);

  // Recent 6 orders
  const recentOrders = [...pemesananList]
    .sort((a, b) => {
      if (a.tanggal !== b.tanggal) return b.tanggal.localeCompare(a.tanggal);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0b192c] via-[#0f2942] to-[#1e3a8a] p-4 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              SIKAT · Administrasi Katering
            </span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-black tracking-tight text-white">
              Ringkasan Keuangan
            </h2>
            <p className="mt-0.5 text-xs text-slate-300">
              Pantau sisa utang dan transaksi pembayaran katering
            </p>
          </div>

          {currentUser.role !== 'pengurus' && (
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-1 sm:pt-0">
              <button
                onClick={onOpenNewPemesanan}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all text-center"
              >
                <PlusCircle className="h-4 w-4 shrink-0" />
                <span>Pesan Katering</span>
              </button>

              <button
                onClick={onOpenNewPembayaran}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/25 active:scale-95 transition-all border border-white/20 text-center"
              >
                <Receipt className="h-4 w-4 shrink-0 text-emerald-300" />
                <span>Bayar Utang</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 Kartu Utama Ringkas (2 kolom di HP, 4 kolom di Laptop/Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total Sisa Utang (Paling Utama) */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              Sisa Utang Katering
            </span>
            <div className="rounded-lg bg-amber-100 p-1.5 text-amber-700">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-700">
              {formatRupiah(totalSisaUtang)}
            </p>
            <p className="text-[11px] font-semibold text-amber-900 mt-0.5">
              {totalSisaUtang === 0
                ? 'Semua Lunas'
                : totalSisaUtang > 0
                ? 'Kewajiban Belum Lunas'
                : 'Saldo Lebih Bayar'}
            </p>
          </div>
        </div>

        {/* Card 2: Total Pemesanan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Pemesanan
            </span>
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatRupiah(totalSeluruhPemesanan)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              {countPemesanan} pesanan
            </p>
          </div>
        </div>

        {/* Card 3: Total Pembayaran */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Pembayaran
            </span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-2xl font-black text-emerald-700 font-mono tracking-tight">
              {formatRupiah(totalSeluruhPembayaran)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              {countPembayaran} kali bayar
            </p>
          </div>
        </div>

        {/* Card 4: Mitra Katering */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Mitra Katering
            </span>
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              {countKatering} <span className="text-xs font-normal text-slate-500 font-sans">Vendor</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {kateringList.filter((k) => k.status === 'Aktif').length} Aktif
            </p>
          </div>
        </div>
      </div>

      {/* Rincian Bulan Ini (Sederhana & Ringkas) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-500 font-medium">Pesanan Bulan Ini (+)</p>
            <p className="text-sm sm:text-base font-bold font-mono text-blue-900">
              {formatRupiah(totalPemesananBulanIni)}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 shrink-0 hidden sm:block">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-500 font-medium">Pembayaran Bulan Ini (-)</p>
            <p className="text-sm sm:text-base font-bold font-mono text-emerald-800">
              {formatRupiah(totalPembayaranBulanIni)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 shrink-0 hidden sm:block">
            <ArrowDownRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Pemesanan Terbaru (Touch Cards di HP, Tabel di Layar Lebar) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Pemesanan Makanan Terbaru
            </h3>
            <p className="text-[11px] text-slate-500">
              Daftar transaksi pesanan yang menambah utang
            </p>
          </div>
          <button
            onClick={() => onNavigate('pemesanan')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5 min-h-[36px]"
          >
            <span>Semua</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile View: Touch-Friendly Card List */}
        <div className="mt-3 divide-y divide-slate-100 md:hidden">
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              Belum ada data transaksi pemesanan makanan.
            </p>
          ) : (
            recentOrders.map((order) => {
              const sisaVendor = getSaldoUtangKatering(
                order.kateringId,
                pemesananList,
                pembayaranList
              );

              return (
                <div key={order.id} className="py-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{order.jenisMakanan}</p>
                      <p className="text-[11px] font-semibold text-emerald-700">{order.kateringNama}</p>
                    </div>
                    <p className="text-xs font-mono font-bold text-blue-900 whitespace-nowrap">
                      {formatRupiah(order.totalHarga)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="font-mono">{formatTanggal(order.tanggal)} · {order.jumlahPesanan} {order.satuan}</span>
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        sisaVendor <= 0 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {sisaVendor <= 0 ? 'LUNAS' : `UTANG: ${formatRupiah(sisaVendor)}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tablet / Desktop View: Traditional Data Table */}
        <div className="mt-4 overflow-x-auto hidden md:block">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Nama Katering</th>
                <th className="py-3 px-3">Jenis Makanan / Menu</th>
                <th className="py-3 px-3 text-right">Jumlah</th>
                <th className="py-3 px-3 text-right">Total Harga</th>
                <th className="py-3 px-3 text-center">Status Utang Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada data transaksi pemesanan makanan.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const sisaVendor = getSaldoUtangKatering(
                    order.kateringId,
                    pemesananList,
                    pembayaranList
                  );

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {formatTanggal(order.tanggal)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {order.kateringNama}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                        {order.jenisMakanan}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-800 whitespace-nowrap">
                        {order.jumlahPesanan} {order.satuan}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(order.totalHarga)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {sisaVendor <= 0 ? (
                          <span className="font-mono text-[11px] font-semibold text-emerald-700">
                            LUNAS
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] font-semibold text-amber-700">
                            BELUM LUNAS ({formatRupiah(sisaVendor)})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
