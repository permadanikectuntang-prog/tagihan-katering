import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { Pembayaran, Katering, Pemesanan, User, PengaturanOrganisasi } from '../../types';
import { formatRupiah, formatTanggal, BULAN_INDONESIA } from '../../utils/formatters';
import { PembayaranModal } from './PembayaranModal';
import { KuitansiModal } from './KuitansiModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PembayaranViewProps {
  pembayaranList: Pembayaran[];
  pemesananList: Pemesanan[];
  kateringList: Katering[];
  currentUser: User;
  pengaturan: PengaturanOrganisasi;
  onSavePembayaran: (pembayaran: Pembayaran) => void;
  onDeletePembayaran: (pembayaranId: string) => void;
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
  preselectedKateringId?: string;
}

export const PembayaranView: React.FC<PembayaranViewProps> = ({
  pembayaranList,
  pemesananList,
  kateringList,
  currentUser,
  pengaturan,
  onSavePembayaran,
  onDeletePembayaran,
  isCreateModalOpen = false,
  onCloseCreateModal,
  preselectedKateringId,
}) => {
  const currentYear = new Date().getFullYear();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKatering, setSelectedKatering] = useState('all');
  const [selectedBulan, setSelectedBulan] = useState<string>('all');
  const [selectedTahun, setSelectedTahun] = useState<string>(String(currentYear));
  const [sortBy, setSortBy] = useState<'tanggal-desc' | 'tanggal-asc' | 'jumlah-desc'>(
    'tanggal-desc'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(isCreateModalOpen);
  const [editingPembayaran, setEditingPembayaran] = useState<Pembayaran | null>(null);

  const [kuitansiPembayaran, setKuitansiPembayaran] = useState<Pembayaran | null>(null);
  const [isKuitansiOpen, setIsKuitansiOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Sync external open request
  React.useEffect(() => {
    if (isCreateModalOpen) {
      setEditingPembayaran(null);
      setIsModalOpen(true);
    }
  }, [isCreateModalOpen]);

  // Unique years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add(String(currentYear));
    pembayaranList.forEach((b) => {
      if (b.tanggal) years.add(b.tanggal.split('-')[0]);
    });
    return Array.from(years).sort().reverse();
  }, [pembayaranList, currentYear]);

  // Filter & Sort
  const filteredList = useMemo(() => {
    return pembayaranList
      .filter((b) => {
        const matchesSearch =
          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.kateringNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.noReferensi && b.noReferensi.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (b.keterangan && b.keterangan.toLowerCase().includes(searchQuery.toLowerCase())) ||
          b.namaPetugas.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesKatering = selectedKatering === 'all' || b.kateringId === selectedKatering;

        let matchesDate = true;
        if (b.tanggal) {
          const [y, m] = b.tanggal.split('-');
          if (selectedTahun !== 'all' && y !== selectedTahun) matchesDate = false;
          if (selectedBulan !== 'all' && parseInt(m, 10) !== parseInt(selectedBulan, 10))
            matchesDate = false;
        }

        return matchesSearch && matchesKatering && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'tanggal-desc') return b.tanggal.localeCompare(a.tanggal);
        if (sortBy === 'tanggal-asc') return a.tanggal.localeCompare(b.tanggal);
        if (sortBy === 'jumlah-desc') return b.jumlah - a.jumlah;
        return 0;
      });
  }, [pembayaranList, searchQuery, selectedKatering, selectedBulan, selectedTahun, sortBy]);

  const totalNilaiFiltered = filteredList.reduce((sum, b) => sum + Number(b.jumlah || 0), 0);

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
            Pencatatan Pembayaran Utang
          </h2>
          <p className="text-xs text-slate-500">
            Realisasi pembayaran bertahap dan pelunasan kewajiban kepada mitra katering
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setEditingPembayaran(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Catat Pembayaran Baru</span>
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
            placeholder="Cari ID, referensi transfer, petugas, keterangan..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Katering */}
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
            <option value="jumlah-desc">Nominal Terbesar</option>
          </select>
        </div>
      </div>

      {/* Summary Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-600">
        <div>
          <span>Ditemukan </span>
          <span className="font-bold text-slate-900 font-mono">{filteredList.length}</span>
          <span> transaksi pembayaran</span>
        </div>
        <div>
          <span>Total Nilai Pembayaran Terpilih: </span>
          <span className="font-bold font-mono text-emerald-700 text-sm">
            {formatRupiah(totalNilaiFiltered)}
          </span>
        </div>
      </div>

      {/* Payments List & Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Mobile View: Compact Touch Cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {paginatedList.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              Tidak ditemukan transaksi pembayaran yang sesuai.
            </p>
          ) : (
            paginatedList.map((b) => (
              <div key={b.id} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{b.id}</span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">{b.kateringNama}</h4>
                    <p className="text-[11px] font-semibold text-slate-600 truncate">{b.metodePembayaran}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-emerald-800 text-xs">{formatRupiah(b.jumlah)}</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {formatTanggal(b.tanggal)}
                    </p>
                  </div>
                </div>

                {b.keterangan && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100 line-clamp-1">
                    {b.keterangan}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                  <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {b.namaPetugas} {b.noReferensi ? `· ${b.noReferensi}` : ''}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setKuitansiPembayaran(b);
                        setIsKuitansiOpen(true);
                      }}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                      title="Cetak Kuitansi"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingPembayaran(b);
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
                        onClick={() => setDeleteId(b.id)}
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
                <th className="py-3 px-4">No. Pembayaran</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Katering Penerima</th>
                <th className="py-3 px-4">Metode & Referensi</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4 text-right">Jumlah Dibayar</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan transaksi pembayaran yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedList.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {b.id}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatTanggal(b.tanggal)}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {b.kateringNama}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{b.metodePembayaran}</div>
                      {b.noReferensi && (
                        <div className="font-mono text-[11px] text-slate-500">
                          Ref: {b.noReferensi}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {b.keterangan || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">{b.namaPetugas}</td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-800 whitespace-nowrap text-sm">
                      {formatRupiah(b.jumlah)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Cetak Kuitansi */}
                        <button
                          onClick={() => {
                            setKuitansiPembayaran(b);
                            setIsKuitansiOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Cetak Kuitansi Pembayaran"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        {/* Edit */}
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingPembayaran(b);
                              setIsModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Pembayaran"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteId(b.id)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Pembayaran"
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
              Menampilkan {paginatedList.length} dari {filteredList.length} pembayaran
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
      <PembayaranModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (onCloseCreateModal) onCloseCreateModal();
        }}
        onSave={onSavePembayaran}
        initialData={editingPembayaran}
        kateringList={kateringList}
        pemesananList={pemesananList}
        pembayaranList={pembayaranList}
        currentUser={currentUser}
        preselectedKateringId={preselectedKateringId}
      />

      <KuitansiModal
        isOpen={isKuitansiOpen}
        onClose={() => setIsKuitansiOpen(false)}
        pembayaran={kuitansiPembayaran}
        pengaturan={pengaturan}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeletePembayaran(deleteId);
        }}
        title="Hapus Pembayaran Utang"
        message="Menghapus transaksi pembayaran ini akan otomatis mengembalikan saldo utang ke nilai sebelum pembayaran. Lanjutkan penghapusan?"
        confirmLabel="Hapus Pembayaran"
        variant="danger"
      />

      {/* Thumb-Friendly Floating Action Button for Mobile */}
      {canEdit && (
        <button
          onClick={() => {
            setEditingPembayaran(null);
            setIsModalOpen(true);
          }}
          className="fixed bottom-20 right-4 z-30 lg:hidden inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-950/30 hover:bg-emerald-500 active:scale-95 transition-all"
          aria-label="Catat Pembayaran Baru"
        >
          <Plus className="h-5 w-5" />
          <span>Bayar Utang</span>
        </button>
      )}
    </div>
  );
};
