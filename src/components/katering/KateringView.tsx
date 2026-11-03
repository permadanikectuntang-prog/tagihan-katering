import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MessageCircle,
  Building2,
  Phone,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Katering, Pemesanan, Pembayaran, User } from '../../types';
import { formatRupiah, getCleanWhatsApp } from '../../utils/formatters';
import { getSaldoUtangKatering } from '../../utils/calculations';
import { KateringModal } from './KateringModal';
import { KateringDetailModal } from './KateringDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface KateringViewProps {
  kateringList: Katering[];
  pemesananList: Pemesanan[];
  pembayaranList: Pembayaran[];
  currentUser: User;
  onSaveKatering: (katering: Katering) => void;
  onDeleteKatering: (kateringId: string) => void;
  onOpenBayarModal: (katering: Katering) => void;
}

export const KateringView: React.FC<KateringViewProps> = ({
  kateringList,
  pemesananList,
  pembayaranList,
  currentUser,
  onSaveKatering,
  onDeleteKatering,
  onOpenBayarModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktif' | 'Tidak Aktif'>('all');
  const [sortBy, setSortBy] = useState<'nama' | 'id' | 'sisaUtang'>('nama');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKatering, setEditingKatering] = useState<Katering | null>(null);

  const [detailKatering, setDetailKatering] = useState<Katering | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtered & Sorted List
  const filteredList = useMemo(() => {
    return kateringList
      .filter((k) => {
        const matchesSearch =
          k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.pemilik.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.whatsapp.includes(searchQuery) ||
          k.alamat.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || k.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'nama') return a.nama.localeCompare(b.nama);
        if (sortBy === 'id') return a.id.localeCompare(b.id);
        if (sortBy === 'sisaUtang') {
          const utangA = getSaldoUtangKatering(a.id, pemesananList, pembayaranList);
          const utangB = getSaldoUtangKatering(b.id, pemesananList, pembayaranList);
          return utangB - utangA;
        }
        return 0;
      });
  }, [kateringList, searchQuery, statusFilter, sortBy, pemesananList, pembayaranList]);

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Rekanan Jasa Katering
          </h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh penyedia makanan rekanan, penanggung jawab, dan pemantauan saldo utang
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setEditingKatering(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Katering</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        {/* Search */}
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama katering, pemilik, nomor WA, alamat..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-emerald-600 focus:bg-white focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
        </div>

        {/* Sort */}
        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-emerald-600 focus:bg-white focus:outline-none"
          >
            <option value="nama">Urutkan: Nama (A-Z)</option>
            <option value="id">Urutkan: ID Katering</option>
            <option value="sisaUtang">Urutkan: Sisa Utang Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Table & Mobile Cards Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Mobile View: Compact Touch Cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {paginatedList.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              Tidak ditemukan data katering yang sesuai dengan pencarian.
            </p>
          ) : (
            paginatedList.map((k) => {
              const sisaUtang = getSaldoUtangKatering(k.id, pemesananList, pembayaranList);
              const cleanWa = getCleanWhatsApp(k.whatsapp);

              return (
                <div key={k.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] font-bold text-slate-400">{k.id}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">{k.nama}</h4>
                      <p className="text-[11px] text-slate-600 truncate">PJ: {k.pemilik}</p>
                    </div>
                    <span
                      className={`font-semibold text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                        k.status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {k.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-semibold">
                        Sisa Utang
                      </span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          sisaUtang > 0
                            ? 'text-amber-600'
                            : sisaUtang < 0
                            ? 'text-sky-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {formatRupiah(sisaUtang)}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/${cleanWa}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 shadow-2xs"
                    >
                      <Phone className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <p className="text-[10px] text-slate-500 truncate">{k.alamat}</p>

                  <div className="flex items-center justify-end gap-1 pt-0.5 border-t border-slate-50">
                    <button
                      onClick={() => {
                        setDetailKatering(k);
                        setIsDetailOpen(true);
                      }}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-blue-600 hover:bg-blue-50 active:bg-blue-100"
                      title="Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingKatering(k);
                          setIsModalOpen(true);
                        }}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 active:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleteId(k.id)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50 active:bg-red-100"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
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
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nama Katering & Spesialisasi</th>
                <th className="py-3 px-4">Penanggung Jawab / Kontak</th>
                <th className="py-3 px-4">Alamat</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Sisa Saldo Utang</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data katering yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginatedList.map((k) => {
                  const sisaUtang = getSaldoUtangKatering(
                    k.id,
                    pemesananList,
                    pembayaranList
                  );
                  const cleanWa = getCleanWhatsApp(k.whatsapp);

                  return (
                    <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 whitespace-nowrap">
                        {k.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{k.nama}</div>
                        {k.keterangan && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {k.keterangan}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{k.pemilik}</div>
                        <a
                          href={`https://wa.me/${cleanWa}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{k.whatsapp}</span>
                        </a>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {k.alamat}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-semibold text-[11px] ${
                            k.status === 'Aktif' ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {k.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            sisaUtang > 0
                              ? 'text-amber-600'
                              : sisaUtang < 0
                              ? 'text-sky-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {formatRupiah(sisaUtang)}
                        </span>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {sisaUtang === 0
                            ? 'Lunas'
                            : sisaUtang > 0
                            ? 'Belum Lunas'
                            : 'Lebih Bayar'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Detail */}
                          <button
                            onClick={() => {
                              setDetailKatering(k);
                              setIsDetailOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Lihat Detail & Riwayat Transaksi"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit */}
                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingKatering(k);
                                setIsModalOpen(true);
                              }}
                              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                              title="Edit Data Katering"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteId(k.id)}
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus Katering"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Menampilkan {paginatedList.length} dari {filteredList.length} data katering
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
      <KateringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveKatering}
        initialData={editingKatering}
        totalKateringCount={kateringList.length}
      />

      <KateringDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        katering={detailKatering}
        pemesananList={pemesananList}
        pembayaranList={pembayaranList}
        onOpenBayarModal={onOpenBayarModal}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteKatering(deleteId);
        }}
        title="Hapus Penyedia Katering"
        message="Apakah Anda yakin ingin menghapus data katering ini? Seluruh riwayat transaksi dengan katering ini akan tetap tersimpan di riwayat arsip."
        confirmLabel="Hapus Katering"
        variant="danger"
      />

      {/* Thumb-Friendly Floating Action Button for Mobile */}
      {canEdit && (
        <button
          onClick={() => {
            setEditingKatering(null);
            setIsModalOpen(true);
          }}
          className="fixed bottom-20 right-4 z-30 lg:hidden inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-950/30 hover:bg-emerald-500 active:scale-95 transition-all"
          aria-label="Tambah Katering Baru"
        >
          <Plus className="h-5 w-5" />
          <span>Katering Baru</span>
        </button>
      )}
    </div>
  );
};
