import React, { useState } from 'react';
import { Users, CalendarPlus, Search, CheckCircle2, UserPlus } from 'lucide-react';
import type {
  ClubScheduleEvent,
  LanguageCode,
  RosterMember,
  ScoutProspect,
  SportType,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface ClubScoutingViewProps {
  language: LanguageCode;
  roster: RosterMember[];
  clubSchedule: ClubScheduleEvent[];
  prospects: ScoutProspect[];
  onAddPlayer: (payload: { name: string; sport: SportType; role: string; age: number; jerseyNo: number }) => Promise<void>;
  onToggleXI: (id: string) => Promise<void>;
  onAddSchedule: (payload: {
    title: string;
    sport: SportType;
    type: ClubScheduleEvent['type'];
    date: string;
    time: string;
    venue: string;
  }) => Promise<void>;
  onToggleShortlist: (id: string) => Promise<void>;
  onInviteTrial: (id: string) => Promise<void>;
}

export const ClubScoutingView: React.FC<ClubScoutingViewProps> = ({
  language,
  roster,
  clubSchedule,
  prospects,
  onAddPlayer,
  onToggleXI,
  onAddSchedule,
  onToggleShortlist,
  onInviteTrial,
}) => {
  const t = TRANSLATIONS[language];
  const [subTab, setSubTab] = useState<'club' | 'scouting'>('club');

  // Add player form
  const [playerName, setPlayerName] = useState('');
  const [playerSport, setPlayerSport] = useState<SportType>('Football');
  const [playerRole, setPlayerRole] = useState('striker');
  const [playerAge, setPlayerAge] = useState(20);

  // Add club schedule form
  const [evtTitle, setEvtTitle] = useState('');
  const [evtSport, setEvtSport] = useState<SportType>('Football');
  const [evtType, setEvtType] = useState<ClubScheduleEvent['type']>('Net Practice');
  const [evtDate, setEvtDate] = useState('2026-11-23');
  const [evtTime, setEvtTime] = useState('08:00');
  const [evtVenue, setEvtVenue] = useState('TossMore Turf Field 1');

  // Scouting filter
  const [scoutQuery, setScoutQuery] = useState('');
  const [scoutSport, setScoutSport] = useState<'all' | SportType>('all');

  const startingCount = roster.filter((r) => r.inStartingXI).length;

  const filteredProspects = prospects.filter((p) => {
    const matchesSport = scoutSport === 'all' || p.sport === scoutSport;
    const matchesQuery =
      !scoutQuery.trim() ||
      p.name.toLowerCase().includes(scoutQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(scoutQuery.toLowerCase());
    return matchesSport && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 [text-wrap:balance]">
            {t.sections.clubHeadline}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage multi-sport club squads, practice calendars, and verified scouting combine talent.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setSubTab('club')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'club' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Club Roster & Schedule
          </button>
          <button
            type="button"
            onClick={() => setSubTab('scouting')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'scouting' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Talent Scouting Hub
          </button>
        </div>
      </div>

      {subTab === 'club' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    Multi-Sport Club Squad Roster
                  </h2>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-700 tabular-nums">
                  {startingCount} Active Lineup
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                      <th className="py-2 pr-3">#</th>
                      <th className="py-2 pr-3">Player</th>
                      <th className="py-2 pr-3">Sport & Role</th>
                      <th className="py-2 pr-3 text-right">Readiness</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 text-right">Lineup</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70">
                        <td className="py-3 pr-3 font-mono text-xs text-slate-500 tabular-nums">
                          {m.jerseyNo}
                        </td>
                        <td className="py-3 pr-3 font-semibold text-slate-900">
                          {m.name}{' '}
                          <span className="font-normal text-xs text-slate-500">({m.age}y)</span>
                        </td>
                        <td className="py-3 pr-3 text-xs capitalize text-slate-700">
                          {m.sport} · {m.role}
                        </td>
                        <td className="py-3 pr-3 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums">
                          {m.readinessPct}%
                        </td>
                        <td className="py-3 pr-3 text-xs">
                          <span
                            className={
                              m.status === 'Active' ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'
                            }
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onToggleXI(m.id)}
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                              m.inStartingXI
                                ? 'bg-emerald-600 text-white'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {m.inStartingXI ? 'Starter' : 'Bench'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!playerName.trim()) return;
                  await onAddPlayer({
                    name: playerName.trim(),
                    sport: playerSport,
                    role: playerRole,
                    age: playerAge,
                    jerseyNo: Math.floor(10 + Math.random() * 88),
                  });
                  setPlayerName('');
                }}
                className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-6 gap-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Player name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <select
                  value={playerSport}
                  onChange={(e) => setPlayerSport(e.target.value as SportType)}
                  className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-900"
                >
                  <option value="Cricket">Cricket</option>
                  <option value="Football">Football</option>
                  <option value="Kabaddi">Kabaddi</option>
                  <option value="Golf">Golf</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Athletics">Athletics</option>
                </select>
                <input
                  type="text"
                  placeholder="Role"
                  value={playerRole}
                  onChange={(e) => setPlayerRole(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-900"
                />
                <input
                  type="number"
                  min={12}
                  max={45}
                  value={playerAge}
                  onChange={(e) => setPlayerAge(Number(e.target.value))}
                  aria-label="Age"
                  className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-mono text-slate-900"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-emerald-600" />
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Team Practice & Match Calendar
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {clubSchedule.map((ev) => (
                  <div key={ev.id} className="py-3 space-y-0.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-emerald-700">
                        {ev.sport} · {ev.type}
                      </span>
                      <span className="font-mono tabular-nums">
                        {ev.date} · {ev.time}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{ev.title}</div>
                    <div className="text-xs text-slate-500">{ev.venue}</div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!evtTitle.trim()) return;
                  await onAddSchedule({
                    title: evtTitle.trim(),
                    sport: evtSport,
                    type: evtType,
                    date: evtDate,
                    time: evtTime,
                    venue: evtVenue,
                  });
                  setEvtTitle('');
                }}
                className="pt-4 border-t border-slate-100 space-y-2.5"
              >
                <div className="text-xs font-semibold text-slate-700">Schedule New Team Event</div>
                <input
                  type="text"
                  required
                  placeholder="Session title (e.g., Kabaddi Mat Tackle Drill)"
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={evtSport}
                    onChange={(e) => setEvtSport(e.target.value as SportType)}
                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-900"
                  >
                    <option value="Football">Football</option>
                    <option value="Kabaddi">Kabaddi</option>
                    <option value="Golf">Golf</option>
                    <option value="Cricket">Cricket</option>
                  </select>
                  <select
                    value={evtType}
                    onChange={(e) => setEvtType(e.target.value as ClubScheduleEvent['type'])}
                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-900"
                  >
                    <option value="Net Practice">Practice</option>
                    <option value="Fitness Combine">Combine</option>
                    <option value="League Match">Match</option>
                    <option value="Tactical Review">Tactics</option>
                  </select>
                  <input
                    type="text"
                    value={evtVenue}
                    onChange={(e) => setEvtVenue(e.target.value)}
                    placeholder="Venue"
                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="col-span-2 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-mono text-slate-900"
                  />
                  <input
                    type="time"
                    value={evtTime}
                    onChange={(e) => setEvtTime(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Add to Club Calendar
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search prospect by name or city..."
                value={scoutQuery}
                onChange={(e) => setScoutQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(['all', 'Cricket', 'Football', 'Kabaddi', 'Golf'] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setScoutSport(sp)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
                    scoutSport === sp
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sp === 'all' ? 'All Sports' : sp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProspects.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-500 capitalize">
                      {p.sport} · {p.role} · Age {p.age} · {p.city}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-slate-900 mt-0.5">
                      {p.name}
                    </h3>
                  </div>
                  <span className="font-mono text-sm font-semibold text-emerald-700 tabular-nums">
                    {p.combinePercentile}th pct
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                  <div>
                    <div className="text-slate-500">{p.primaryMetricLabel}</div>
                    <div className="font-mono font-semibold text-slate-900 tabular-nums">
                      {p.primaryMetricValue}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">{p.secondaryMetricLabel}</div>
                    <div className="font-mono font-semibold text-slate-900 tabular-nums">
                      {p.secondaryMetricValue}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">20m Sprint</div>
                    <div className="font-mono font-semibold text-slate-900 tabular-nums">
                      {p.sprint20mSec} s
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onToggleShortlist(p.id)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                      p.shortlisted
                        ? 'border border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p.shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                  </button>

                  {p.trialInvited ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Trial Invite Sent</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onInviteTrial(p.id)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                    >
                      Invite to National Trial
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
