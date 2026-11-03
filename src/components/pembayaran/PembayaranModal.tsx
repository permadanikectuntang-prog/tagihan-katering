import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Pembayaran, Katering, User, MetodePembayaran, Pemesanan } from '../../types';
import { formatRupiah, generatePembayaranId } from '../../utils/formatters';
import { getSaldoUtangKatering } from '../../utils/calculations';
import { AlertTriangle, Upload, Check } from 'lucide-react';

interface PembayaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pembayaran: Pembayaran) => void;
  initialData?: Pembayaran | null;
  kateringList: Katering[];
  pemesananList: Pemesanan[];
  pembayaranList: Pembayaran[];
  currentUser: User;
  preselectedKateringId?: string;
}

const METODE_OPTIONS: MetodePembayaran[] = [
  'Transfer Bank',
  'Tunai',
  'QRIS',
  'Giro / Cek',
  'Lainnya',
];

export const PembayaranModal: React.FC<PembayaranModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  kateringList,
  pemesananList,
  pembayaranList,
  currentUser,
  preselectedKateringId,
}) => {
  const isEditing = !!initialData;
  const todayStr = new Date().toISOString().split('T')[0];

  const [id, setId] = useState('');
  const [tanggal, setTanggal] = useState(todayStr);
  const [kateringId, setKateringId] = useState('');
  const [jumlah, setJumlah] = useState<number>(500000);
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran>('Transfer Bank');
  const [noReferensi, setNoReferensi] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [namaPetugas, setNamaPetugas] = useState('');
  const [buktiBayarUrl, setBuktiBayarUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [overpaymentConfirmed, setOverpaymentConfirmed] = useState(false);

  // Calculate current debt of the selected catering
  const totalUtangSaatIni = kateringId
    ? getSaldoUtangKatering(
        kateringId,
        pemesananList,
        // When editing, exclude this payment itself so debt calculation reflects the state before this payment
        isEditing ? pembayaranList.filter((b) => b.id !== initialData.id) : pembayaranList
      )
    : 0;

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setTanggal(initialData.tanggal);
      setKateringId(initialData.kateringId);
      setJumlah(initialData.jumlah);
      setMetodePembayaran(initialData.metodePembayaran);
      setNoReferensi(initialData.noReferensi || '');
      setKeterangan(initialData.keterangan || '');
      setNamaPetugas(initialData.namaPetugas);
      setBuktiBayarUrl(initialData.buktiBayarUrl || '');
    } else {
      setId(generatePembayaranId());
      setTanggal(todayStr);
      const defaultKid = preselectedKateringId || (kateringList.length > 0 ? kateringList[0].id : '');
      setKateringId(defaultKid);

      // Default amount to current debt if positive, otherwise 500.000
      const currentDebt = defaultKid
        ? getSaldoUtangKatering(defaultKid, pemesananList, pembayaranList)
        : 0;
      setJumlah(currentDebt > 0 ? currentDebt : 500000);
      setMetodePembayaran('Transfer Bank');
      setNoReferensi('');
      setKeterangan('');
      setNamaPetugas(currentUser.namaLengkap);
      setBuktiBayarUrl('');
    }
    setErrors({});
    setOverpaymentConfirmed(false);
  }, [
    initialData,
    isOpen,
    kateringList,
    preselectedKateringId,
    currentUser,
    todayStr,
    pemesananList,
    pembayaranList,
  ]);

  // Projected remaining balance after this payment
  const sisaUtangSetelahBayar = totalUtangSaatIni - (Number(jumlah) || 0);
  const isOverpayment = Number(jumlah) > totalUtangSaatIni && totalUtangSaatIni > 0;

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiBayarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!tanggal) newErrors.tanggal = 'Tanggal pembayaran wajib diisi';
    if (!kateringId) newErrors.kateringId = 'Pilih penyedia katering rekanan';
    if (!jumlah || jumlah <= 0) newErrors.jumlah = 'Nominal pembayaran harus lebih besar dari 0 (tidak boleh nol atau negatif)';
    if (!namaPetugas.trim()) newErrors.namaPetugas = 'Nama petugas yang membayar wajib diisi';

    // Overpayment check
    if (isOverpayment && !overpaymentConfirmed) {
      newErrors.overpayment =
        'Pembayaran ini melebihi saldo utang saat ini. Centang konfirmasi persetujuan lebih bayar untuk melanjutkan.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedKatering = kateringList.find((k) => k.id === kateringId);
    const kateringNama = selectedKatering ? selectedKatering.nama : 'Katering Rekanan';

    const now = new Date().toISOString();
    const pembayaranData: Pembayaran = {
      id: id || generatePembayaranId(tanggal),
      tanggal,
      kateringId,
      kateringNama,
      totalUtangSaatIni,
      jumlah: Number(jumlah),
      metodePembayaran,
      noReferensi: noReferensi.trim(),
      keterangan: keterangan.trim() || `Pembayaran kepada ${kateringNama}`,
      namaPetugas: namaPetugas.trim(),
      buktiBayarUrl,
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
    };

    onSave(pembayaranData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Ubah Pembayaran Utang' : 'Catat Pembayaran Utang Katering'}
      subtitle="Pembayaran bertahap akan otomatis mengurangi sisa saldo utang vendor katering"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ID Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              ID Pembayaran (Otomatis)
            </label>
            <input
              type="text"
              value={id}
              readOnly
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono font-bold text-slate-600 focus:outline-none"
            />
          </div>

          {/* Tanggal Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tanggal Pembayaran <span className="text-red-500">*</span>
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
            <option value="">-- Pilih Katering --</option>
            {kateringList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama} ({k.id})
              </option>
            ))}
          </select>
          {errors.kateringId && (
            <p className="mt-1 text-[11px] text-red-600">{errors.kateringId}</p>
          )}
        </div>

        {/* Informational Balance Strip: Total Utang Saat Ini */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Utang Saat Ini (Sebelum Pembayaran)
            </span>
            <span className="text-xs text-slate-600">
              Dihitung otomatis dari seluruh pemesanan dikurangi pembayaran sebelumnya
            </span>
          </div>
          <div className="text-right">
            <span
              className={`text-xl font-black font-mono ${
                totalUtangSaatIni > 0
                  ? 'text-amber-600'
                  : totalUtangSaatIni < 0
                  ? 'text-sky-600'
                  : 'text-emerald-600'
              }`}
            >
              {formatRupiah(totalUtangSaatIni)}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {totalUtangSaatIni <= 0 ? 'Status Lunas' : 'Belum Lunas'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Jumlah Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Jumlah Pembayaran (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1000"
              value={jumlah}
              onChange={(e) => setJumlah(Number(e.target.value))}
              placeholder="Contoh: 1000000"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            {errors.jumlah && <p className="mt-1 text-[11px] text-red-600">{errors.jumlah}</p>}
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Metode Pembayaran <span className="text-red-500">*</span>
            </label>
            <select
              value={metodePembayaran}
              onChange={(e) => setMetodePembayaran(e.target.value as MetodePembayaran)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            >
              {METODE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculation Strip: Sisa Utang Setelah Pembayaran */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Sisa Utang Setelah Pembayaran
            </span>
            <span className="text-xs text-emerald-700">
              {formatRupiah(totalUtangSaatIni)} - {formatRupiah(jumlah || 0)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black font-mono text-emerald-950">
              {formatRupiah(sisaUtangSetelahBayar)}
            </span>
            <span className="text-[10px] text-emerald-800 block">
              {sisaUtangSetelahBayar === 0
                ? 'LUNAS SEMPURNA'
                : sisaUtangSetelahBayar > 0
                ? 'Sisa Utang Berkurang'
                : 'LEBIH BAYAR / SALDO KREDIT'}
            </span>
          </div>
        </div>

        {/* Overpayment Warning & Confirmation Box */}
        {isOverpayment && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900">
                  Peringatan: Nominal Pembayaran Melebihi Total Saldo Utang!
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Jumlah pembayaran ({formatRupiah(jumlah)}) lebih besar dari sisa utang saat ini (
                  {formatRupiah(totalUtangSaatIni)}). Selisih sebesar{' '}
                  <span className="font-bold font-mono">
                    {formatRupiah(Math.abs(sisaUtangSetelahBayar))}
                  </span>{' '}
                  akan dicatat secara resmi sebagai saldo lebih bayar / kredit deposit katering untuk pesanan berikutnya.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 text-xs text-amber-950 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={overpaymentConfirmed}
                onChange={(e) => setOverpaymentConfirmed(e.target.checked)}
                className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Saya mengonfirmasi pencatatan kelebihan bayar ini sebagai saldo kredit katering</span>
            </label>
            {errors.overpayment && (
              <p className="text-[11px] font-bold text-red-600">{errors.overpayment}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nomor Referensi / Bukti Transfer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              No. Referensi / Bukti Transfer
            </label>
            <input
              type="text"
              value={noReferensi}
              onChange={(e) => setNoReferensi(e.target.value)}
              placeholder="Contoh: TRF-BCA-20261108112 / KWT-004"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Nama Petugas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Nama Petugas Pembayar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaPetugas}
              onChange={(e) => setNamaPetugas(e.target.value)}
              placeholder="Contoh: Siti Rahmawati (Bendahara)"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            {errors.namaPetugas && (
              <p className="mt-1 text-[11px] text-red-600">{errors.namaPetugas}</p>
            )}
          </div>
        </div>

        {/* Keterangan Pembayaran */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Keterangan Pembayaran
          </label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Pembayaran tahap ke-1 pemesanan awal bulan November"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        {/* Upload Bukti Pembayaran */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Lampiran Foto / Bukti Pembayaran (Opsional)
          </label>
          <div className="mt-1 flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
              <Upload className="h-4 w-4 text-slate-500" />
              <span>Pilih Gambar / Struk</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {buktiBayarUrl && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Bukti terlampir
                </span>
                <button
                  type="button"
                  onClick={() => setBuktiBayarUrl('')}
                  className="text-[11px] text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            )}
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
            {isEditing ? 'Simpan Perubahan' : 'Simpan Pembayaran'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
