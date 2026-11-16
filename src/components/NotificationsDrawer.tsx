import React from 'react';
import { X, AlertTriangle, CheckCircle2, CalendarClock } from 'lucide-react';
import type { NotificationRecord } from '../types';

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: NotificationRecord[];
  onMarkAllRead: () => void;
  onSelectAlternativeSlot: (providerId: string, slotKey: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectAlternativeSlot,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Schedule & Ecosystem Alerts
            </h2>
            <p className="text-xs text-slate-500">
              Automated coach conflict detection and booking updates
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close alerts"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2.5 bg-slate-50">
          <span className="text-xs font-medium text-slate-600 tabular-nums">
            {notifications.length} total alerts
          </span>
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap shrink-0"
          >
            Mark all as read
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 transition-colors ${n.read ? 'bg-white' : 'bg-slate-50/70'}`}
              >
                <div className="flex items-start gap-3">
                  {n.type === 'conflict' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">{n.title}</span>
                      <span className="text-xs font-mono text-slate-500 tabular-nums shrink-0">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>

                    {n.suggestedSlots && n.suggestedSlots.length > 0 && n.providerId && (
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                          <CalendarClock className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Open alternative slots:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {n.suggestedSlots.map((slot) => {
                            const [date, time] = slot.split('|');
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => onSelectAlternativeSlot(n.providerId!, slot)}
                                className="rounded-lg border border-emerald-600 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors whitespace-nowrap shrink-0 tabular-nums"
                              >
                                {date} · {time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
