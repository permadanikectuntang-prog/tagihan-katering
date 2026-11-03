import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { User } from '../../types';
import { INITIAL_USERS } from '../../services/storage';
import { ShieldCheck, UserCheck, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [selectedId, setSelectedId] = useState(currentUser.id);

  const handleApply = () => {
    const user = INITIAL_USERS.find((u) => u.id === selectedId);
    if (user) {
      onSelectUser(user);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Pengguna & Hak Akses Sistem"
      subtitle="Beralih peran untuk menguji otorisasi Admin, Bendahara, atau Pengurus"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="space-y-2.5">
          {INITIAL_USERS.map((user) => {
            const isSelected = selectedId === user.id;

            return (
              <label
                key={user.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="roleSelection"
                  checked={isSelected}
                  onChange={() => setSelectedId(user.id)}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{user.namaLengkap}</span>
                    <span className="font-mono text-[10px] text-slate-400">({user.username})</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 capitalize">
                    {user.role === 'admin'
                      ? 'Administrator (Akses Penuh & Hapus Data)'
                      : user.role === 'bendahara'
                      ? 'Bendahara (Input Pesanan & Pembayaran)'
                      : 'Pengurus (Hanya Lihat Laporan)'}
                  </p>
                  <p className="text-[11px] text-slate-500">{user.jabatan}</p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            Terapkan Pengguna
          </button>
        </div>
      </div>
    </Modal>
  );
};
