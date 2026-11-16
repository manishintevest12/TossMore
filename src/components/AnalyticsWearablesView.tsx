import React, { useState } from 'react';
import { RefreshCw, Watch, MessageSquare, CheckCircle2 } from 'lucide-react';
import type {
  CoachFeedbackRecord,
  LanguageCode,
  SessionAnalyticsRecord,
  SportType,
  WearableDeviceState,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface AnalyticsWearablesViewProps {
  language: LanguageCode;
  sessions: SessionAnalyticsRecord[];
  wearables: WearableDeviceState[];
  feedbacks: CoachFeedbackRecord[];
  onToggleWearable: (id: string) => Promise<void>;
  onSyncAllWearables: () => Promise<void>;
  onReplyFeedback: (feedbackId: string, reply: string) => Promise<void>;
}

export const AnalyticsWearablesView: React.FC<AnalyticsWearablesViewProps> = ({
  language,
  sessions,
  wearables,
  feedbacks,
  onToggleWearable,
  onSyncAllWearables,
  onReplyFeedback,
}) => {
  const t = TRANSLATIONS[language];
  const [sportFilter, setSportFilter] = useState<'all' | SportType>('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState(false);

  const filteredSessions = sessions.filter(
    (s) => sportFilter === 'all' || s.sport === sportFilter
  );

  const chartData = [...filteredSessions].slice(0, 8).reverse();
  const maxWidth = 600;
  const maxHeight = 160;
  const pad = 20;
  const pointsStr = chartData
    .map((s, idx) => {
      const x =
        chartData.length <= 1
          ? maxWidth / 2
          : pad + (idx / (chartData.length - 1)) * (maxWidth - pad * 2);
      const y = maxHeight - pad - ((s.accuracyPct - 40) / 60) * (maxHeight - pad * 2);
      return `${x},${Math.max(pad, Math.min(maxHeight - pad, y))}`;
    })
    .join(' ');

  const handleSyncAll = async () => {
    setSyncing(true);
    await onSyncAllWearables();
    setSyncing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 [text-wrap:balance]">
            {t.sections.analyticsHeadline}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Session-by-session multi-sport performance telemetry, wearable sync, and direct coach reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSyncAll}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{t.actions.syncWearables}</span>
        </button>
      </div>

      {/* Wearables Real-Time Telemetry Hub */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Watch className="h-4 w-4 text-emerald-600" />
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Wearable Fitness Telemetry Sync
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wearables.map((dev) => (
            <div
              key={dev.id}
              className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-slate-500">{dev.brand}</div>
                  <div className="text-base font-semibold text-slate-900">{dev.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                    {dev.connected ? `Synced ${dev.lastSynced}` : 'Disconnected'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleWearable(dev.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    dev.connected
                      ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {dev.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {dev.connected ? (
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[11px] text-slate-500">Heart Rate</div>
                    <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {dev.heartRateBpm} bpm
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">HRV / VO2</div>
                    <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {dev.hrvMs}ms · {dev.vo2Max}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Recovery</div>
                    <div className="font-mono text-sm font-semibold text-emerald-700 tabular-nums">
                      {dev.recoveryPct}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Connect to stream HR, HRV, sprint load, and recovery readiness.
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Accuracy Trend Chart + Sport Filter */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Training Session Accuracy & Reaction Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Filter by sport to inspect Cricket, Football, Kabaddi, and Golf training sessions
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(['all', 'Cricket', 'Football', 'Kabaddi', 'Golf', 'Tennis', 'Athletics'] as const).map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSportFilter(sp)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
                  sportFilter === sp
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sp === 'all' ? 'All Sports' : sp}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Drill Execution Accuracy (%) across recent sessions</span>
              <span className="font-mono tabular-nums">
                Latest: {chartData[chartData.length - 1].accuracyPct}%
              </span>
            </div>
            <svg viewBox={`0 0 ${maxWidth} ${maxHeight}`} className="w-full h-40">
              {[40, 60, 80, 100].map((val) => {
                const y = maxHeight - pad - ((val - 40) / 60) * (maxHeight - pad * 2);
                return (
                  <g key={val}>
                    <line
                      x1={pad}
                      y1={y}
                      x2={maxWidth - pad}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={4}
                      y={y + 4}
                      fontSize="10"
                      fill="#64748B"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}
              {chartData.length > 1 && (
                <polyline fill="none" stroke="#059669" strokeWidth="2.5" points={pointsStr} />
              )}
              {chartData.map((s, idx) => {
                const x =
                  chartData.length <= 1
                    ? maxWidth / 2
                    : pad + (idx / (chartData.length - 1)) * (maxWidth - pad * 2);
                const y = maxHeight - pad - ((s.accuracyPct - 40) / 60) * (maxHeight - pad * 2);
                return (
                  <circle
                    key={s.id}
                    cx={x}
                    cy={Math.max(pad, Math.min(maxHeight - pad, y))}
                    r="4.5"
                    fill="#059669"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-2.5 pr-4">Date</th>
                <th className="py-2.5 pr-4">Sport</th>
                <th className="py-2.5 pr-4">Module & Modality</th>
                <th className="py-2.5 pr-4">Role</th>
                <th className="py-2.5 pr-4 text-right">Accuracy</th>
                <th className="py-2.5 pr-4 text-right">Reaction</th>
                <th className="py-2.5 pr-4 text-right">Output</th>
                <th className="py-2.5 text-right">Avg HR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                    {s.date}
                  </td>
                  <td className="py-3 pr-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                    {s.sport}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-slate-900">{s.moduleTitle}</div>
                    <div className="text-xs text-slate-500">
                      {s.modality.toUpperCase()} · {s.durationMin} min · {s.notes}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs font-medium text-slate-700 capitalize whitespace-nowrap">
                    {s.role}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                    {s.accuracyPct}%
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-slate-700 tabular-nums">
                    {s.reactionMs} ms
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                    {s.speedMetric} {s.speedUnit}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-600 tabular-nums">
                    {s.heartRateAvg} bpm
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Direct Coach Feedback Thread */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Direct Coach Feedback & Action Items
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{fb.coachName}</div>
                  <div className="text-xs text-slate-500">
                    {fb.sport} · {fb.coachRole}
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-500 tabular-nums">{fb.date}</span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{fb.summary}</p>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-700">Assigned Drills:</div>
                {fb.actionItems.map((act) => (
                  <div key={act} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>

              {fb.studentReply ? (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Your reply: </span>
                  {fb.studentReply}
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const text = (replyDrafts[fb.id] || '').trim();
                    if (!text) return;
                    await onReplyFeedback(fb.id, text);
                    setReplyDrafts((prev) => ({ ...prev, [fb.id]: '' }));
                  }}
                  className="flex gap-2 pt-1"
                >
                  <input
                    type="text"
                    placeholder="Ask a follow-up question or confirm drill completion..."
                    value={replyDrafts[fb.id] || ''}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [fb.id]: e.target.value }))}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    Reply
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
