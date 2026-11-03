import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  FileText,
} from 'lucide-react';
import { Pemesanan, Katering, User, PengaturanOrganisasi } from '../../types';
import { formatRupiah, formatTanggal, BULAN_INDONESIA } from '../../utils/formatters';
import { PemesananModal } from './PemesananModal';
import { InvoiceModal } from './InvoiceModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PemesananViewProps {
  pemesananList: Pemesanan[];
  kateringList: Katering[];
  currentUser: User;
  pengaturan: PengaturanOrganisasi;
  onSavePemesanan: (pemesanan: Pemesanan) => void;
  onDeletePemesanan: (pemesananId: string) => void;
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
}

export const PemesananView: React.FC<PemesananViewProps> = ({
  pemesananList,
  kateringList,
  currentUser,
  pengaturan,
  onSavePemesanan,
  onDeletePemesanan,
  isCreateModalOpen = false,
  onCloseCreateModal,
}) => {
  const currentYear = new Date().getFullYear();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKatering, setSelectedKatering] = useState('all');
  const [selectedBulan, setSelectedBulan] = useState<string>('all');
  const [selectedTahun, setSelectedTahun] = useState<string>(String(currentYear));
  const [sortBy, setSortBy] = useState<'tanggal-desc' | 'tanggal-asc' | 'total-desc'>('tanggal-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(isCreateModalOpen);
  const [editingPemesanan, setEditingPemesanan] = useState<Pemesanan | null>(null);

  const [invoicePemesanan, setInvoicePemesanan] = useState<Pemesanan | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Sync external modal state if opened from Dashboard
  React.useEffect(() => {
    if (isCreateModalOpen) {
      setEditingPemesanan(null);
      setIsModalOpen(true);
    }
  }, [isCreateModalOpen]);

  // Unique years list
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add(String(currentYear));
    pemesananList.forEach((p) => {
      if (p.tanggal) years.add(p.tanggal.split('-')[0]);
    });
    return Array.from(years).sort().reverse();
  }, [pemesananList, currentYear]);

  // Filter & Sort
  const filteredList = useMemo(() => {
    return pemesananList
      .filter((p) => {
        const matchesSearch =
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.jenisMakanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.kateringNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.namaPemesan.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesKatering = selectedKatering === 'all' || p.kateringId === selectedKatering;

        let matchesDate = true;
        if (p.tanggal) {
          const [y, m] = p.tanggal.split('-');
          if (selectedTahun !== 'all' && y !== selectedTahun) matchesDate = false;
          if (selectedBulan !== 'all' && parseInt(m, 10) !== parseInt(selectedBulan, 10))
            matchesDate = false;
        }

        return matchesSearch && matchesKatering && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'tanggal-desc') return b.tanggal.localeCompare(a.tanggal);
        if (sortBy === 'tanggal-asc') return a.tanggal.localeCompare(b.tanggal);
        if (sortBy === 'total-desc') return b.totalHarga - a.totalHarga;
        return 0;
      });
  }, [pemesananList, searchQuery, selectedKatering, selectedBulan, selectedTahun, sortBy]);

  const totalNilaiFiltered = filteredList.reduce((sum, p) => sum + Number(p.totalHarga || 0), 0);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'bendahara';
  const canDelete = currentUser.role === 'admin';

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Transaksi Pemesanan Makanan
          </h2>
          <p className="text-xs text-slate-500">
            Seluruh pesanan berulang yang menambah saldo utang organisasi kepada pihak katering
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setEditingPemesanan(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Catat Pemesanan Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        {/* Search */}
        <div className="relative sm:col-span-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari ID, jenis menu, acara, pemesan..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Katering Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={selectedKatering}
            onChange={(e) => {
              setSelectedKatering(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-emerald-600 focus:bg-white focus:outline-none"
          >
            <option value="all">Semua Katering</option>
            {kateringList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Bulan */}
        <div className="sm:col-span-2">
          <select
            value={selectedBulan}
            onChange={(e) => {
              setSelectedBulan(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-emerald-600 focus:bg-white focus:outline-none"
          >
            <option value="all">Semua Bulan</option>
            {BULAN_INDONESIA.map((bulan, idx) => (
              <option key={bulan} value={String(idx + 1)}>
                {bulan}
              </option>
            ))}
          </select>
        </div>

        {/* Tahun */}
        <div className="sm:col-span-1">
          <select
            value={selectedTahun}
            onChange={(e) => {
              setSelectedTahun(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-mono text-slate-700 focus:border-emerald-600 focus:bg-white focus:outline-none"
          >
            <option value="all">Semua</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="sm:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-emerald-600 focus:bg-white focus:outline-none"
          >
            <option value="tanggal-desc">Tanggal Terbaru</option>
            <option value="tanggal-asc">Tanggal Terlama</option>
            <option value="total-desc">Total Harga Terbesar</option>
          </select>
        </div>
      </div>

      {/* Summary Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-600">
        <div>
          <span>Ditemukan </span>
          <span className="font-bold text-slate-900 font-mono">{filteredList.length}</span>
          <span> pesanan makanan</span>
        </div>
        <div>
          <span>Total Nilai Pesanan Terpilih: </span>
          <span className="font-bold font-mono text-blue-700 text-sm">
            {formatRupiah(totalNilaiFiltered)}
          </span>
        </div>
      </div>

      {/* Orders List / Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Mobile View: Compact Touch Cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {paginatedList.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              Tidak ditemukan transaksi pemesanan yang sesuai.
            </p>
          ) : (
            paginatedList.map((p) => (
              <div key={p.id} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{p.id}</span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">{p.jenisMakanan}</h4>
                    <p className="text-[11px] font-semibold text-emerald-700 truncate">{p.kateringNama}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-blue-900 text-xs">{formatRupiah(p.totalHarga)}</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {p.jumlahPesanan} {p.satuan}
                    </p>
                  </div>
                </div>

                {p.keterangan && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100 line-clamp-1">
                    {p.keterangan}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                    {formatTanggal(p.tanggal)} · {p.namaPemesan}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setInvoicePemesanan(p);
                        setIsInvoiceOpen(true);
                      }}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                      title="Cetak Bukti"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingPemesanan(p);
                          setIsModalOpen(true);
                        }}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-blue-600 hover:bg-blue-50 active:bg-blue-100"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50 active:bg-red-100"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nama Katering</th>
                <th className="py-3 px-4">Menu & Keperluan</th>
                <th className="py-3 px-4 text-right">Pesanan</th>
                <th className="py-3 px-4 text-right">Harga Satuan</th>
                <th className="py-3 px-4 text-right">Total Harga</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan transaksi pemesanan yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {p.id}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatTanggal(p.tanggal)}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.kateringNama}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800">{p.jenisMakanan}</div>
                      {p.keterangan && (
                        <div className="text-[11px] text-slate-500 truncate">{p.keterangan}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                      {p.jumlahPesanan} {p.satuan}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                      {formatRupiah(p.hargaSatuan)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-900 whitespace-nowrap">
                      {formatRupiah(p.totalHarga)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Cetak Bukti */}
                        <button
                          onClick={() => {
                            setInvoicePemesanan(p);
                            setIsInvoiceOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Cetak Bukti Pemesanan"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        {/* Edit */}
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingPemesanan(p);
                              setIsModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Transaksi"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Pemesanan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Menampilkan {paginatedList.length} dari {filteredList.length} pesanan
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

      {/* Modals */}
      <PemesananModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (onCloseCreateModal) onCloseCreateModal();
        }}
        onSave={onSavePemesanan}
        initialData={editingPemesanan}
        kateringList={kateringList}
        currentUser={currentUser}
      />

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        pemesanan={invoicePemesanan}
        pengaturan={pengaturan}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeletePemesanan(deleteId);
        }}
        title="Hapus Transaksi Pemesanan"
        message="Menghapus transaksi pemesanan ini akan otomatis mengurangi saldo utang terkait. Lanjutkan penghapusan?"
        confirmLabel="Hapus Transaksi"
        variant="danger"
      />

      {/* Thumb-Friendly Floating Action Button for Mobile */}
      {canEdit && (
        <button
          onClick={() => {
            setEditingPemesanan(null);
            setIsModalOpen(true);
          }}
          className="fixed bottom-20 right-4 z-30 lg:hidden inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-950/30 hover:bg-emerald-500 active:scale-95 transition-all"
          aria-label="Pesan Katering Baru"
        >
          <Plus className="h-5 w-5" />
          <span>Pesan Baru</span>
        </button>
      )}
    </div>
  );
};
