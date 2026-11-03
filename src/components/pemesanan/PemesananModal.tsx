import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Pemesanan, Katering, User } from '../../types';
import { formatRupiah, generatePemesananId } from '../../utils/formatters';

interface PemesananModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pemesanan: Pemesanan) => void;
  initialData?: Pemesanan | null;
  kateringList: Katering[];
  currentUser: User;
}

const SATUAN_OPTIONS = [
  'kotak',
  'porsi',
  'nasi box',
  'paket',
  'snack box',
  'prasmanan',
  'dus',
  'cup',
];

export const PemesananModal: React.FC<PemesananModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  kateringList,
  currentUser,
}) => {
  const isEditing = !!initialData;
  const todayStr = new Date().toISOString().split('T')[0];

  const [id, setId] = useState('');
  const [tanggal, setTanggal] = useState(todayStr);
  const [kateringId, setKateringId] = useState('');
  const [jenisMakanan, setJenisMakanan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [jumlahPesanan, setJumlahPesanan] = useState<number>(30);
  const [satuan, setSatuan] = useState('kotak');
  const [hargaSatuan, setHargaSatuan] = useState<number>(25000);
  const [namaPemesan, setNamaPemesan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setTanggal(initialData.tanggal);
      setKateringId(initialData.kateringId);
      setJenisMakanan(initialData.jenisMakanan);
      setKeterangan(initialData.keterangan || '');
      setJumlahPesanan(initialData.jumlahPesanan);
      setSatuan(initialData.satuan);
      setHargaSatuan(initialData.hargaSatuan);
      setNamaPemesan(initialData.namaPemesan);
      setCatatan(initialData.catatan || '');
    } else {
      setId(generatePemesananId());
      setTanggal(todayStr);
      setKateringId(kateringList.length > 0 ? kateringList[0].id : '');
      setJenisMakanan('');
      setKeterangan('');
      setJumlahPesanan(30);
      setSatuan('kotak');
      setHargaSatuan(25000);
      setNamaPemesan(currentUser.namaLengkap);
      setCatatan('');
    }
    setErrors({});
  }, [initialData, isOpen, kateringList, currentUser, todayStr]);

  // Automatic calculation: Total Harga = Jumlah Pesanan * Harga Satuan
  const totalHarga = (Number(jumlahPesanan) || 0) * (Number(hargaSatuan) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!tanggal) newErrors.tanggal = 'Tanggal pemesanan wajib diisi';
    if (!kateringId) newErrors.kateringId = 'Pilih penyedia katering rekanan';
    if (!jenisMakanan.trim()) newErrors.jenisMakanan = 'Jenis makanan / menu wajib diisi';
    if (!jumlahPesanan || jumlahPesanan <= 0)
      newErrors.jumlahPesanan = 'Jumlah pesanan harus lebih besar dari 0';
    if (!hargaSatuan || hargaSatuan <= 0)
      newErrors.hargaSatuan = 'Harga satuan harus lebih besar dari 0';
    if (!namaPemesan.trim()) newErrors.namaPemesan = 'Nama pemesan / petugas wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedKatering = kateringList.find((k) => k.id === kateringId);
    const kateringNama = selectedKatering ? selectedKatering.nama : 'Katering Rekanan';

    const now = new Date().toISOString();
    const pemesananData: Pemesanan = {
      id: id || generatePemesananId(tanggal),
      tanggal,
      kateringId,
      kateringNama,
      jenisMakanan: jenisMakanan.trim(),
      keterangan: keterangan.trim(),
      jumlahPesanan: Number(jumlahPesanan),
      satuan,
      hargaSatuan: Number(hargaSatuan),
      totalHarga,
      namaPemesan: namaPemesan.trim(),
      catatan: catatan.trim(),
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
    };

    onSave(pemesananData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Ubah Transaksi Pemesanan' : 'Catat Pemesanan Makanan Baru'}
      subtitle="Menyimpan pemesanan akan otomatis menambah saldo utang kepada penyedia katering"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ID Transaksi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              ID Transaksi (Otomatis & Unik)
            </label>
            <input
              type="text"
              value={id}
              readOnly
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono font-bold text-slate-600 focus:outline-none"
            />
          </div>

          {/* Tanggal Pemesanan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tanggal Pemesanan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            {errors.tanggal && <p className="mt-1 text-[11px] text-red-600">{errors.tanggal}</p>}
          </div>
        </div>

        {/* Katering Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Nama Katering Rekanan <span className="text-red-500">*</span>
          </label>
          <select
            value={kateringId}
            onChange={(e) => setKateringId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          >
            <option value="">-- Pilih Penyedia Katering --</option>
            {kateringList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama} ({k.id}) - PJ: {k.pemilik}
              </option>
            ))}
          </select>
          {errors.kateringId && (
            <p className="mt-1 text-[11px] text-red-600">{errors.kateringId}</p>
          )}
        </div>

        {/* Jenis Makanan / Menu */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Jenis Makanan / Nama Menu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={jenisMakanan}
            onChange={(e) => setJenisMakanan(e.target.value)}
            placeholder="Contoh: Nasi Box Ayam Bakar Madu Komplit / Snack Box VIP"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
          {errors.jenisMakanan && (
            <p className="mt-1 text-[11px] text-red-600">{errors.jenisMakanan}</p>
          )}
        </div>

        {/* Keperluan Acara */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Keterangan / Keperluan Pemesanan
          </label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Konsumsi Rapat Pleno Koordinasi / Diklat Pegawai"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        {/* Jumlah, Satuan, Harga Satuan Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Jumlah */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Jumlah Pesanan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={jumlahPesanan}
              onChange={(e) => setJumlahPesanan(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            {errors.jumlahPesanan && (
              <p className="mt-1 text-[11px] text-red-600">{errors.jumlahPesanan}</p>
            )}
          </div>

          {/* Satuan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Satuan
            </label>
            <select
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            >
              {SATUAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Harga Satuan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Harga Satuan (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="500"
              value={hargaSatuan}
              onChange={(e) => setHargaSatuan(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            {errors.hargaSatuan && (
              <p className="mt-1 text-[11px] text-red-600">{errors.hargaSatuan}</p>
            )}
          </div>
        </div>

        {/* Calculation Banner: Total Harga Otomatis */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
              Total Harga (Otomatis: Jumlah × Harga Satuan)
            </span>
            <span className="text-xs text-blue-600">
              {jumlahPesanan || 0} {satuan} × {formatRupiah(hargaSatuan || 0)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black font-mono text-blue-950">
              {formatRupiah(totalHarga)}
            </span>
            <span className="text-[10px] text-blue-700 block">+ Menambah Utang</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nama Pemesan / Petugas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Nama Pemesan / Petugas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaPemesan}
              onChange={(e) => setNamaPemesan(e.target.value)}
              placeholder="Contoh: Ahmad Fauzi (Staf Umum)"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            {errors.namaPemesan && (
              <p className="mt-1 text-[11px] text-red-600">{errors.namaPemesan}</p>
            )}
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Catatan Tambahan
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Pengantaran pukul 11.30, tanpa cabai rawit"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Thumb-Friendly Sticky Action Buttons */}
        <div className="sticky -bottom-3.5 sm:bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 sm:pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 z-10">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-700 active:scale-[0.99] transition-all flex-1 sm:flex-initial"
          >
            {isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi Pemesanan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
