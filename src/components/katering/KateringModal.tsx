import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Katering, StatusKatering } from '../../types';
import { generateKateringId } from '../../utils/formatters';

interface KateringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (katering: Katering) => void;
  initialData?: Katering | null;
  totalKateringCount: number;
}

export const KateringModal: React.FC<KateringModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalKateringCount,
}) => {
  const isEditing = !!initialData;

  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [pemilik, setPemilik] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [status, setStatus] = useState<StatusKatering>('Aktif');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setNama(initialData.nama);
      setPemilik(initialData.pemilik);
      setWhatsapp(initialData.whatsapp);
      setAlamat(initialData.alamat);
      setKeterangan(initialData.keterangan || '');
      setStatus(initialData.status);
    } else {
      setId(generateKateringId(totalKateringCount));
      setNama('');
      setPemilik('');
      setWhatsapp('');
      setAlamat('');
      setKeterangan('');
      setStatus('Aktif');
    }
    setErrors({});
  }, [initialData, totalKateringCount, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!nama.trim()) newErrors.nama = 'Nama katering wajib diisi';
    if (!pemilik.trim()) newErrors.pemilik = 'Nama pemilik/penanggung jawab wajib diisi';
    if (!whatsapp.trim()) newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    if (!alamat.trim()) newErrors.alamat = 'Alamat wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const kateringData: Katering = {
      id: id || generateKateringId(totalKateringCount),
      nama: nama.trim(),
      pemilik: pemilik.trim(),
      whatsapp: whatsapp.trim(),
      alamat: alamat.trim(),
      keterangan: keterangan.trim(),
      status,
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
    };

    onSave(kateringData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Ubah Data Penyedia Katering' : 'Tambah Penyedia Jasa Katering Baru'}
      subtitle="Pastikan kontak penanggung jawab dan nomor WhatsApp valid untuk konfirmasi pesanan"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID Katering (Otomatis) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            ID Katering (Otomatis)
          </label>
          <input
            type="text"
            value={id}
            readOnly
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono font-bold text-slate-600 focus:outline-none"
          />
        </div>

        {/* Nama Katering */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Nama Katering / Usaha <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Berkah Rasa Catering"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
          {errors.nama && <p className="mt-1 text-[11px] text-red-600">{errors.nama}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pemilik */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Nama Pemilik / PJ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={pemilik}
              onChange={(e) => setPemilik(e.target.value)}
              placeholder="Contoh: Ibu Hj. Aminah"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            {errors.pemilik && <p className="mt-1 text-[11px] text-red-600">{errors.pemilik}</p>}
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            {errors.whatsapp && <p className="mt-1 text-[11px] text-red-600">{errors.whatsapp}</p>}
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Alamat Lengkap <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Jalan, nomor gedung/rumah, kelurahan, kecamatan"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
          {errors.alamat && <p className="mt-1 text-[11px] text-red-600">{errors.alamat}</p>}
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Keterangan / Spesialisasi Menu
          </label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Spesialis nasi box, snack box rapat, prasmanan prasmanan"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Status Kerjasama
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusKatering)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          >
            <option value="Aktif">Aktif (Menerima Pesanan)</option>
            <option value="Tidak Aktif">Tidak Aktif (Nonaktifkan Sementara)</option>
          </select>
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
            {isEditing ? 'Simpan Perubahan' : 'Simpan Katering'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
