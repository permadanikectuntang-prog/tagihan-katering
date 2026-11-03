import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Pemesanan, Pembayaran, Katering } from '../../types';
import { formatRupiah, formatTanggal, BULAN_INDONESIA } from '../../utils/formatters';
import { buildRiwayatTransaksi } from '../../utils/calculations';

interface RiwayatViewProps {
  pemesananList: Pemesanan[];
  pembayaranList: Pembayaran[];
  kateringList: Katering[];
}

export const RiwayatView: React.FC<RiwayatViewProps> = ({
  pemesananList,
  pembayaranList,
  kateringList,
}) => {
  const currentYear = new Date().getFullYear();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKatering, setSelectedKatering] = useState('all');
  const [selectedJenis, setSelectedJenis] = useState<'all' | 'Pemesanan' | 'Pembayaran'>('all');
  const [timeFilterPreset, setTimeFilterPreset] = useState<'semua' | 'hari' | 'minggu' | 'bulan' | 'tahun'>('semua');
  const [customDate, setCustomDate] = useState('');
  const [selectedBulan, setSelectedBulan] = useState(String(new Date().getMonth() + 1));
  const [selectedTahun, setSelectedTahun] = useState(String(currentYear));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Build true chronological ledger with running balance
  // Always build with the selected katering (or all), so running balance is accurate for that context
  const fullLedger = useMemo(() => {
    return buildRiwayatTransaksi(pemesananList, pembayaranList, selectedKatering);
  }, [pemesananList, pembayaranList, selectedKatering]);

  // Apply secondary filters (Search, Jenis Transaksi, Timeframe)
  const filteredLedger = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 7 days ago
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return fullLedger.filter((item) => {
      // Search
      const matchesSearch =
        item.nomorTransaksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kateringNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keterangan.toLowerCase().includes(searchQuery.toLowerCase());

      // Jenis
      const matchesJenis = selectedJenis === 'all' || item.jenisTransaksi === selectedJenis;

      // Timeframe preset
      let matchesTime = true;
      if (timeFilterPreset === 'hari') {
        const target = customDate || todayStr;
        matchesTime = item.tanggal === target;
      } else if (timeFilterPreset === 'minggu') {
        matchesTime = item.tanggal >= sevenDaysAgo && item.tanggal <= todayStr;
      } else if (timeFilterPreset === 'bulan') {
        const targetPrefix = `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}`;
        matchesTime = item.tanggal.startsWith(targetPrefix);
      } else if (timeFilterPreset === 'tahun') {
        matchesTime = item.tanggal.startsWith(selectedTahun);
      }

      return matchesSearch && matchesJenis && matchesTime;
    });
  }, [
    fullLedger,
    searchQuery,
    selectedJenis,
    timeFilterPreset,
    customDate,
    selectedBulan,
    selectedTahun,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredLedger.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLedger.slice(start, start + itemsPerPage);
  }, [filteredLedger, currentPage]);

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Buku Besar Riwayat Transaksi
        </h2>
        <p className="text-xs text-slate-500">
          Seluruh aktivitas pemesanan dan pembayaran terpadu dengan perhitungan saldo berjalan (running balance)
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        {/* Row 1: Search, Katering, Jenis */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari no transaksi, katering, atau keterangan..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedKatering}
              onChange={(e) => {
                setSelectedKatering(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-emerald-600 focus:bg-white focus:outline-none"
            >
              <option value="all">Semua Katering Rekanan</option>
              {kateringList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedJenis}
              onChange={(e) => {
                setSelectedJenis(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-emerald-600 focus:bg-white focus:outline-none"
            >
              <option value="all">Semua Jenis Transaksi</option>
              <option value="Pemesanan">Hanya Pemesanan (+ Utang)</option>
              <option value="Pembayaran">Hanya Pembayaran (- Utang)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Time Presets (Hari, Minggu, Bulan, Tahun, Semua) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['semua', 'hari', 'minggu', 'bulan', 'tahun'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setTimeFilterPreset(preset);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${
                  timeFilterPreset === preset
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset === 'semua'
                  ? 'Semua Waktu'
                  : preset === 'hari'
                  ? 'Per Hari'
                  : preset === 'minggu'
                  ? '7 Hari Terakhir'
                  : preset === 'bulan'
                  ? 'Per Bulan'
                  : 'Per Tahun'}
              </button>
            ))}
          </div>

          {/* Conditional sub-controls */}
          {timeFilterPreset === 'hari' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Pilih Tanggal:</span>
              <input
                type="date"
                value={customDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCustomDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
          )}

          {timeFilterPreset === 'bulan' && (
            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
              >
                {BULAN_INDONESIA.map((b, idx) => (
                  <option key={b} value={String(idx + 1)}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono text-slate-800 focus:outline-none"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {timeFilterPreset === 'tahun' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Pilih Tahun:</span>
              <select
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-mono text-slate-800 focus:outline-none"
              >
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Ledger Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Mobile View: Responsive Touch Ledger Cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {paginatedList.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400">
              Tidak ditemukan riwayat transaksi pada filter ini.
            </p>
          ) : (
            paginatedList.map((item) => {
              const isPemesanan = item.jenisTransaksi === 'Pemesanan';

              return (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-500">{item.nomorTransaksi}</span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.kateringNama}</h4>
                      <p className="text-xs text-slate-600">{item.keterangan}</p>
                    </div>

                    <div className="text-right shrink-0">
                      {isPemesanan ? (
                        <p className="font-mono font-bold text-blue-900 text-sm">
                          +{formatRupiah(item.penambahanUtang)}
                        </p>
                      ) : (
                        <p className="font-mono font-bold text-emerald-800 text-sm">
                          -{formatRupiah(item.penguranganUtang)}
                        </p>
                      )}
                      <span
                        className={`text-[10px] font-semibold inline-block mt-0.5 ${
                          isPemesanan ? 'text-blue-700' : 'text-emerald-700'
                        }`}
                      >
                        {item.jenisTransaksi}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-50 bg-slate-50/70 p-2 rounded-lg">
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatTanggal(item.tanggal)}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 mr-1.5">Saldo Berjalan:</span>
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {formatRupiah(item.saldoBerjalan)}
                      </span>
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
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Nama Katering</th>
                <th className="py-3 px-4">Jenis Transaksi</th>
                <th className="py-3 px-4">Keterangan / Rincian</th>
                <th className="py-3 px-4 text-right">Penambahan Utang (+)</th>
                <th className="py-3 px-4 text-right">Pengurangan Utang (-)</th>
                <th className="py-3 px-4 text-right">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan riwayat transaksi pada filter ini.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const isPemesanan = item.jenisTransaksi === 'Pemesanan';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatTanggal(item.tanggal)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {item.nomorTransaksi}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {item.kateringNama}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                            isPemesanan ? 'text-blue-700' : 'text-emerald-700'
                          }`}
                        >
                          {isPemesanan ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          <span>{item.jenisTransaksi}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 max-w-sm">
                        <div>{item.keterangan}</div>
                        {item.detailItem && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.detailItem}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold whitespace-nowrap text-blue-900">
                        {item.penambahanUtang > 0 ? formatRupiah(item.penambahanUtang) : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold whitespace-nowrap text-emerald-800">
                        {item.penguranganUtang > 0 ? formatRupiah(item.penguranganUtang) : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black whitespace-nowrap text-slate-900 text-sm">
                        {formatRupiah(item.saldoBerjalan)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Menampilkan {paginatedList.length} dari {filteredLedger.length} riwayat transaksi
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
