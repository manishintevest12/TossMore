import React from 'react';
import { Bell, Menu, ShoppingCart } from 'lucide-react';
import type { LanguageCode, NavSectionId } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface TopBarProps {
  activeSection: NavSectionId;
  onSelectSection: (id: NavSectionId) => void;
  language: LanguageCode;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  cartCount: number;
  onOpenCartCheckout: () => void;
  onOpenMobileNav: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onSelectSection,
  language,
  unreadNotifications,
  onOpenNotifications,
  cartCount,
  onOpenCartCheckout,
  onOpenMobileNav,
}) => {
  const t = TRANSLATIONS[language];

  const quickLinks: { id: NavSectionId; label: string }[] = [
    { id: 'training', label: t.nav.training },
    { id: 'coaching', label: t.nav.coaching },
    { id: 'tournaments', label: t.nav.tournaments },
    { id: 'marketplace', label: t.nav.marketplace },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-8 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Zone 1: Brand/Context Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-sm whitespace-nowrap shrink-0">
          <span className="font-semibold text-slate-900">{t.brandName}</span>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="font-medium text-slate-600 truncate max-w-[180px] sm:max-w-xs">
            {t.nav[activeSection]}
          </span>
        </div>
      </div>

      {/* Zone 2: 4 Single-line Navigation Links */}
      <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600">
        {quickLinks.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onSelectSection(link.id)}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 ${
              activeSection === link.id
                ? 'text-slate-900 underline decoration-emerald-600 decoration-2 underline-offset-4'
                : ''
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: Primary Action & Utility Triggers */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          aria-label="Open scheduling and coach notifications"
        >
          <Bell className="h-4 w-4 text-slate-600" />
          <span className="hidden sm:inline">{t.actions.alerts}</span>
          {unreadNotifications > 0 && (
            <span className="font-mono text-xs font-semibold text-amber-700 tabular-nums">
              ({unreadNotifications})
            </span>
          )}
        </button>

        {cartCount > 0 ? (
          <button
            type="button"
            onClick={onOpenCartCheckout}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>
              {t.actions.cart} ({cartCount})
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectSection('coaching')}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            {t.actions.bookSession}
          </button>
        )}
      </div>
    </header>
  );
};
