import React from 'react';
import { Menu, Cloud, RefreshCw, UserCheck } from 'lucide-react';
import { User, SyncConfig } from '../../types';
import { formatWaktu } from '../../utils/formatters';

interface HeaderProps {
  pageTitle: string;
  onOpenMobileMenu: () => void;
  syncConfig: SyncConfig;
  onTriggerQuickSync: () => void;
  isSyncing: boolean;
  currentUser: User;
  onOpenUserSwitch: () => void;
  onOpenSyncView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  onOpenMobileMenu,
  syncConfig,
  onTriggerQuickSync,
  isSyncing,
  currentUser,
  onOpenUserSwitch,
  onOpenSyncView,
}) => {
  const isConnected = !!syncConfig.gasWebAppUrl;

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Zone 1: Mobile Hamburger + Breadcrumb / Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="font-extrabold text-emerald-700 hidden sm:inline">SIKAT</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate max-w-[160px] sm:max-w-none">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Zone 2: Sync Status & User Profile Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Google Sheets Sync Pill / Button */}
        {isConnected ? (
          <button
            onClick={onTriggerQuickSync}
            disabled={isSyncing}
            title={
              syncConfig.lastSyncTime
                ? `Terakhir sinkron: ${formatWaktu(syncConfig.lastSyncTime)}`
                : 'Klik untuk sinkronisasi dengan Google Sheets'
            }
            className="inline-flex min-h-[40px] items-center gap-1 sm:gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-emerald-600 shrink-0 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span className="font-mono text-emerald-700 font-semibold hidden xs:inline">
              {isSyncing ? 'Sync...' : 'Sheets'}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenSyncView}
            className="inline-flex min-h-[40px] items-center gap-1 sm:gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <Cloud className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="hidden xs:inline">Sheets</span>
          </button>
        )}

        {/* User Role Switch Button */}
        <button
          onClick={onOpenUserSwitch}
          className="flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Klik untuk ganti hak akses / profil pengguna"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="text-left hidden md:block">
            <p className="font-semibold text-slate-800 leading-none">{currentUser.username}</p>
            <p className="text-[10px] text-slate-500 capitalize">{currentUser.role}</p>
          </div>
          <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </button>
      </div>
    </header>
  );
};
