import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Scale,
  Menu,
} from 'lucide-react';
import { MenuItemId } from './Sidebar';

interface BottomNavProps {
  activeMenu: MenuItemId;
  onSelectMenu: (menu: MenuItemId) => void;
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeMenu,
  onSelectMenu,
  onOpenMoreMenu,
}) => {
  const isMoreActive = ['pembayaran', 'riwayat', 'laporan', 'pengaturan', 'backup'].includes(
    activeMenu
  );

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-lg safe-area-bottom">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* 1. Dashboard */}
        <button
          onClick={() => onSelectMenu('dashboard')}
          className={`flex flex-col items-center justify-center h-full py-1 min-h-[48px] transition-colors ${
            activeMenu === 'dashboard' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Beranda</span>
        </button>

        {/* 2. Katering */}
        <button
          onClick={() => onSelectMenu('katering')}
          className={`flex flex-col items-center justify-center h-full py-1 min-h-[48px] transition-colors ${
            activeMenu === 'katering' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UtensilsCrossed className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Katering</span>
        </button>

        {/* 3. Pesanan */}
        <button
          onClick={() => onSelectMenu('pemesanan')}
          className={`flex flex-col items-center justify-center h-full py-1 min-h-[48px] transition-colors ${
            activeMenu === 'pemesanan' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Pemesanan</span>
        </button>

        {/* 4. Utang */}
        <button
          onClick={() => onSelectMenu('utang')}
          className={`flex flex-col items-center justify-center h-full py-1 min-h-[48px] transition-colors ${
            activeMenu === 'utang' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Utang</span>
        </button>

        {/* 5. Menu Lainnya (Buka Sidebar drawer) */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center h-full py-1 min-h-[48px] transition-colors ${
            isMoreActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Menu Lain</span>
        </button>
      </div>
    </div>
  );
};
