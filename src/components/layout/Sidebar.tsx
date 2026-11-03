import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Scale,
  Receipt,
  History,
  FileSpreadsheet,
  Settings,
  Cloud,
  X,
  ChefHat,
} from 'lucide-react';
import { User } from '../../types';

export type MenuItemId =
  | 'dashboard'
  | 'katering'
  | 'pemesanan'
  | 'utang'
  | 'pembayaran'
  | 'riwayat'
  | 'laporan'
  | 'pengaturan'
  | 'backup';

interface SidebarProps {
  activeMenu: MenuItemId;
  onSelectMenu: (menu: MenuItemId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: User;
  hasUnsyncedChanges?: boolean;
}

interface NavItem {
  id: MenuItemId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'katering', label: 'Data Katering', icon: UtensilsCrossed },
  { id: 'pemesanan', label: 'Transaksi Pemesanan', icon: ShoppingBag },
  { id: 'utang', label: 'Data Utang Katering', icon: Scale },
  { id: 'pembayaran', label: 'Pembayaran Utang', icon: Receipt },
  { id: 'riwayat', label: 'Riwayat Transaksi', icon: History },
  { id: 'laporan', label: 'Laporan Bulanan', icon: FileSpreadsheet },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  { id: 'backup', label: 'Backup & Sinkronisasi', icon: Cloud },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onSelectMenu,
  isOpenMobile,
  onCloseMobile,
  currentUser,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0b192c] text-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-800/80 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-950/40">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>SIKAT</span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wide">
                Keuangan & Adm. Katering
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectMenu(item.id);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Role Card & Footer */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser.namaLengkap}
                </p>
                <p className="text-[11px] text-emerald-400 capitalize truncate">
                  {currentUser.role === 'admin'
                    ? 'Administrator'
                    : currentUser.role === 'bendahara'
                    ? 'Bendahara Keuangan'
                    : 'Pengurus (Hanya Lihat)'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
