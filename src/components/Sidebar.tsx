import React from 'react';
import {
  LayoutDashboard,
  Target,
  Award,
  Activity,
  Video,
  Trophy,
  Users,
  MessageSquare,
  Mic,
  ShoppingBag,
  Globe,
  X,
} from 'lucide-react';
import type { LanguageCode, NavSectionId } from '../types';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../i18n/translations';

interface SidebarProps {
  activeSection: NavSectionId;
  onSelectSection: (id: NavSectionId) => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  unreadCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  language,
  onChangeLanguage,
  mobileOpen,
  onCloseMobile,
}) => {
  const t = TRANSLATIONS[language];

  const groups: {
    label: string;
    items: { id: NavSectionId; label: string; icon: React.ComponentType<{ className?: string }> }[];
  }[] = [
    {
      label: t.groups.learn,
      items: [
        { id: 'overview', label: t.nav.overview, icon: LayoutDashboard },
        { id: 'training', label: t.nav.training, icon: Target },
        { id: 'certifications', label: t.nav.certifications, icon: Award },
        { id: 'analytics', label: t.nav.analytics, icon: Activity },
      ],
    },
    {
      label: t.groups.connect,
      items: [
        { id: 'coaching', label: t.nav.coaching, icon: Video },
        { id: 'social', label: t.nav.social, icon: MessageSquare },
        { id: 'podcasts', label: t.nav.podcasts, icon: Mic },
      ],
    },
    {
      label: t.groups.compete,
      items: [
        { id: 'tournaments', label: t.nav.tournaments, icon: Trophy },
        { id: 'club', label: t.nav.club, icon: Users },
      ],
    },
    {
      label: t.groups.commerce,
      items: [{ id: 'marketplace', label: t.nav.marketplace, icon: ShoppingBag }],
    },
  ];

  const handleNav = (id: NavSectionId) => {
    onSelectSection(id);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <button
            type="button"
            onClick={() => handleNav('overview')}
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            {t.brandName}
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-2 text-xs font-medium text-slate-500">
                {group.label}
              </div>
              <nav className="space-y-1" aria-label={group.label}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNav(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                        active
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 p-4 space-y-3">
          <div>
            <label
              htmlFor="global-language-select"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span>{t.actions.language}</span>
            </label>
            <select
              id="global-language-select"
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.native} ({opt.label})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-sm font-semibold text-slate-900 truncate">Aarav Mehta</div>
            <div className="text-xs text-slate-500 truncate">
              Cricket · All-Rounder · Mumbai
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
