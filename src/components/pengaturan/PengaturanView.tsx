import React, { useState } from 'react';
import { Save, Building, Users, ShieldCheck, Check } from 'lucide-react';
import { PengaturanOrganisasi, User } from '../../types';
import { INITIAL_USERS } from '../../services/storage';

interface PengaturanViewProps {
  pengaturan: PengaturanOrganisasi;
  onSavePengaturan: (newPengaturan: PengaturanOrganisasi) => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  pengaturan,
  onSavePengaturan,
  currentUser,
  onSwitchUser,
}) => {
  const [form, setForm] = useState<PengaturanOrganisasi>({ ...pengaturan });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof PengaturanOrganisasi, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePengaturan(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Pengaturan Sistem & Profil Organisasi
        </h2>
        <p className="text-xs text-slate-500">
          Konfigurasi identitas organisasi, kop surat resmi, pejabat penandatangan laporan, dan hak akses
        </p>
      </div>

      {/* Simulasi Hak Akses / Pengguna Aktif */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Hak Akses Pengguna & Manajemen Peran (RBAC)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Sistem mendukung 3 tingkat hak akses: Administrator (kontrol penuh & hapus transaksi), Bendahara (catat pemesanan & bayar utang), dan Pengurus (hanya melihat laporan).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
          {INITIAL_USERS.map((u) => {
            const isSelected = currentUser.id === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onSwitchUser(u)}
                className={`text-left rounded-xl p-3 sm:p-3.5 border transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{u.namaLengkap}</span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                </div>
                <div className="mt-1 text-[11px] font-mono text-emerald-700 font-semibold capitalize">
                  {u.role === 'admin'
                    ? 'Administrator'
                    : u.role === 'bendahara'
                    ? 'Bendahara Keuangan'
                    : 'Pengurus (Hanya Lihat)'}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500">{u.jabatan}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profil Organisasi Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Kop Dokumen & Identitas Lembaga / Organisasi
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nama Organisasi / Dinas / Lembaga
              </label>
              <input
                type="text"
                value={form.namaOrganisasi}
                onChange={(e) => handleChange('namaOrganisasi', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Unit Kerja / Bagian
              </label>
              <input
                type="text"
                value={form.unitKerja}
                onChange={(e) => handleChange('unitKerja', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Alamat Kantor Lengkap
            </label>
            <input
              type="text"
              value={form.alamat}
              onChange={(e) => handleChange('alamat', e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={form.telepon}
                onChange={(e) => handleChange('telepon', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Resmi
              </label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Kota Pembuatan Surat
              </label>
              <input
                type="text"
                value={form.kotaSurat}
                onChange={(e) => handleChange('kotaSurat', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pejabat Penandatangan Laporan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Pejabat Penandatangan Laporan Keuangan Katering
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Ketua Organisasi */}
            <div className="space-y-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase block">
                Pihak 1: Ketua Organisasi / Pimpinan
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={form.namaKetua}
                  onChange={(e) => handleChange('namaKetua', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Jabatan Resmi
                </label>
                <input
                  type="text"
                  value={form.jabatanKetua}
                  onChange={(e) => handleChange('jabatanKetua', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">NIP / NRP</label>
                <input
                  type="text"
                  value={form.nipKetua}
                  onChange={(e) => handleChange('nipKetua', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Bendahara */}
            <div className="space-y-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase block">
                Pihak 2: Bendahara / Petugas Keuangan
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={form.namaBendahara}
                  onChange={(e) => handleChange('namaBendahara', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Jabatan Resmi
                </label>
                <input
                  type="text"
                  value={form.jabatanBendahara}
                  onChange={(e) => handleChange('jabatanBendahara', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">NIP / NRP</label>
                <input
                  type="text"
                  value={form.nipBendahara}
                  onChange={(e) => handleChange('nipBendahara', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Catatan Kaki Laporan Resmi
            </label>
            <input
              type="text"
              value={form.catatanKakiLaporan}
              onChange={(e) => handleChange('catatanKakiLaporan', e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Sticky thumb-zone action bar */}
        <div className="sticky -bottom-3 sm:bottom-0 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Pengaturan berhasil disimpan!
              </span>
            )}
          </div>

          {currentUser.role !== 'pengurus' && (
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[46px] sm:min-h-[40px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
