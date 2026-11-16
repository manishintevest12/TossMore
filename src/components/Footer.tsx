import React from 'react';
import type { LanguageCode, NavSectionId } from '../types';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onNavigate: (section: NavSectionId) => void;
  onOpenNotifications: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onChangeLanguage,
  onNavigate,
  onOpenNotifications,
}) => {
  const t = TRANSLATIONS[language];

  const jumpTo = (id: NavSectionId) => {
    onNavigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-3">
            <button
              type="button"
              onClick={() => jumpTo('overview')}
              className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
            >
              {t.brandName}
            </button>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Accredited athletic training degrees, multi-sport VR & AR skill labs, private coaching, club management, scouting, and verified gear commerce.
            </p>
            <div className="text-xs text-slate-500">
              Cricket · Football · Kabaddi · Golf · Tennis · Athletics · Basketball · Badminton
            </div>
          </div>

          {/* Training & Credentials */}
          <div className="md:col-span-3 space-y-2.5">
            <div className="text-xs font-semibold text-slate-900">{t.groups.learn}</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('training')}
                  className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
                >
                  {t.nav.training}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('certifications')}
                  className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
                >
                  {t.nav.certifications}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('analytics')}
                  className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
                >
                  {t.nav.analytics}
                </button>
              </li>
            </ul>
          </div>

          {/* Coaching, Tournaments & Marketplace */}
          <div className="md:col-span-3 space-y-2.5">
            <div className="text-xs font-semibold text-slate-900">{t.groups.compete}</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('coaching')}
                  className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
                >
                  {t.nav.coaching}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('tournaments')}
                  className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
                >
                  {t.nav.tournaments}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('club')}
                  className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
                >
                  {t.nav.club}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('marketplace')}
                  className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
                >
                  {t.nav.marketplace}
                </button>
              </li>
            </ul>
          </div>

          {/* Quick User Actions & Language */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-semibold text-slate-900">Quick Actions</div>
            <div className="flex flex-col items-start gap-2 text-sm text-slate-600">
              <button
                type="button"
                onClick={onOpenNotifications}
                className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
              >
                {t.actions.alerts}
              </button>
              <button
                type="button"
                onClick={() => jumpTo('social')}
                className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
              >
                {t.nav.social}
              </button>
              <button
                type="button"
                onClick={() => jumpTo('podcasts')}
                className="hover:text-slate-900 hover:underline underline-offset-4 text-left"
              >
                {t.nav.podcasts}
              </button>
            </div>
            <div className="pt-1">
              <label htmlFor="footer-lang" className="sr-only">
                {t.actions.language}
              </label>
              <select
                id="footer-lang"
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.native}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>© 2026 {t.brandName}. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => jumpTo('certifications')}
              className="hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Accreditation Standards
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => jumpTo('coaching')}
              className="hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Scheduling Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => jumpTo('marketplace')}
              className="hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Escrow Protection
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
