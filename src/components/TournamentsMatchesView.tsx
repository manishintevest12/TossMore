import React, { useState } from 'react';
import { Building2, CheckCircle2, Megaphone, Radio, Trophy, Users } from 'lucide-react';
import type {
  LanguageCode,
  LeaderboardRow,
  LiveMatchState,
  MultiSportLiveMatch,
  PendingCheckout,
  SportType,
  TournamentItem,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface TournamentsMatchesViewProps {
  language: LanguageCode;
  liveMatch: LiveMatchState;
  otherLiveMatches: MultiSportLiveMatch[];
  leaderboard: LeaderboardRow[];
  tournaments: TournamentItem[];
  onRecordBall: (outcome: '0' | '1' | '2' | '4' | '6' | 'W') => Promise<void>;
  onRecordOtherEvent: (matchId: string, label: string) => Promise<void>;
  onRegisterTournament: (checkout: PendingCheckout) => void;
}

export const TournamentsMatchesView: React.FC<TournamentsMatchesViewProps> = ({
  language,
  liveMatch,
  otherLiveMatches,
  leaderboard,
  tournaments,
  onRecordBall,
  onRecordOtherEvent,
  onRegisterTournament,
}) => {
  const t = TRANSLATIONS[language];
  const [sportFilter, setSportFilter] = useState<'all' | SportType>('all');
  const [openTournamentTab, setOpenTournamentTab] = useState<'team' | 'sponsor' | 'organiser'>('team');

  // Team registration inputs keyed by tournament id
  const [teamNames, setTeamNames] = useState<Record<string, string>>({});
  const [captainNames, setCaptainNames] = useState<Record<string, string>>({});
  const [teamCities, setTeamCities] = useState<Record<string, string>>({});

  // Sponsor form state
  const [sponsorTournId, setSponsorTournId] = useState<string>(tournaments[0]?.id ?? '');
  const [sponsorBrand, setSponsorBrand] = useState('');
  const [sponsorTier, setSponsorTier] = useState<
    'Title Sponsor' | 'Kit & Ball Partner' | 'Streaming Partner'
  >('Title Sponsor');

  // Organiser host form state
  const [hostTitle, setHostTitle] = useState('');
  const [hostOrganizer, setHostOrganizer] = useState('');
  const [hostSport, setHostSport] = useState<SportType>('Cricket');
  const [hostTier, setHostTier] = useState<TournamentItem['tier']>('Open Nationals');
  const [hostDate, setHostDate] = useState('2027-02-15');
  const [hostCity, setHostCity] = useState('Mumbai');
  const [hostPrizePool, setHostPrizePool] = useState(10000);
  const [hostEntryFee, setHostEntryFee] = useState(60);
  const [hostMaxTeams, setHostMaxTeams] = useState(16);

  const SPONSOR_TIERS: {
    tier: 'Title Sponsor' | 'Kit & Ball Partner' | 'Streaming Partner';
    feeUsd: number;
    perk: string;
  }[] = [
    { tier: 'Title Sponsor', feeUsd: 1200, perk: 'Tournament naming rights + homepage video banner' },
    { tier: 'Kit & Ball Partner', feeUsd: 650, perk: 'Featured gear link + matchday kit branding' },
    { tier: 'Streaming Partner', feeUsd: 400, perk: 'Live scorecard & YouTube broadcast callout' },
  ];
  const HOSTING_FEE_USD = 150;

  const runRate = liveMatch.ballsA > 0 ? ((liveMatch.runsA / liveMatch.ballsA) * 6).toFixed(2) : '0.00';
  const runsNeeded = Math.max(0, liveMatch.targetRuns - liveMatch.runsA);
  const ballsLeft = Math.max(1, 120 - liveMatch.ballsA);
  const reqRate = ((runsNeeded / ballsLeft) * 6).toFixed(2);

  const visibleLeaderboard = [...leaderboard]
    .filter((r) => sportFilter === 'all' || r.sport === sportFilter)
    .sort((a, b) => b.ratingPoints - a.ratingPoints);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 [text-wrap:balance]">
          {t.sections.tournamentsHeadline}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Real-time live match centers for Cricket, Football, Kabaddi, and Golf alongside nationwide leaderboards and tournament registrations.
        </p>
      </div>

      {/* Multi-Sport Live Match Cards (Football, Kabaddi, Golf) */}
      <section className="space-y-3">
        <div className="text-xs font-semibold text-slate-600">
          Live Multi-Sport Broadcasts (Click actions to sync live match stats)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {otherLiveMatches.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400">{m.sport} · LIVE</span>
                  <span className="font-mono text-slate-300 tabular-nums">{m.clockOrPhase}</span>
                </div>
                <div className="text-xs text-slate-400 truncate">{m.tournamentName}</div>
                <div className="text-sm font-semibold text-white">
                  {m.teamA} vs {m.teamB}
                </div>
              </div>

              <div className="flex items-baseline justify-between border-y border-slate-800 py-3">
                <span className="font-mono text-2xl font-bold tabular-nums">{m.scoreSummary}</span>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">{m.keyStatLabel}</div>
                  <div className="font-mono text-xs font-semibold text-emerald-400 tabular-nums">
                    {m.keyStatValue}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 truncate">
                  Latest: {m.recentEvents.slice(-2).join(' · ')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.sport === 'Football' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onRecordOtherEvent(m.id, 'Goal Scored')}
                        className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-500"
                      >
                        + Goal
                      </button>
                      <button
                        type="button"
                        onClick={() => onRecordOtherEvent(m.id, 'Corner Kick')}
                        className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-semibold hover:bg-slate-700"
                      >
                        + Corner
                      </button>
                    </>
                  )}
                  {m.sport === 'Kabaddi' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onRecordOtherEvent(m.id, 'Raid Point +1')}
                        className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-500"
                      >
                        +1 Raid
                      </button>
                      <button
                        type="button"
                        onClick={() => onRecordOtherEvent(m.id, 'Super Raid +3')}
                        className="rounded bg-amber-600 px-2.5 py-1 text-[11px] font-semibold hover:bg-amber-500"
                      >
                        +3 Super Raid
                      </button>
                    </>
                  )}
                  {m.sport === 'Golf' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onRecordOtherEvent(m.id, 'Birdie (-1)')}
                        className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-500"
                      >
                        Birdie (-1)
                      </button>
                      <button
                        type="button"
                        onClick={() => onRecordOtherEvent(m.id, 'Eagle (-2)')}
                        className="rounded bg-amber-600 px-2.5 py-1 text-[11px] font-semibold hover:bg-amber-500"
                      >
                        Eagle (-2)
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cricket Live Match Center + Wagon Wheel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-slate-900 p-6 text-white space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Radio className="h-4 w-4" />
              <span>CRICKET LIVE TELEMETRY · {liveMatch.tournamentName}</span>
            </div>
            <span className="font-mono text-xs text-slate-300">
              Target {liveMatch.targetRuns} · Need {runsNeeded} off {ballsLeft} balls
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-y border-slate-800 py-5">
            <div>
              <div className="text-xs text-slate-400">
                {liveMatch.teamA} vs {liveMatch.teamB}
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-mono text-4xl font-bold text-white tabular-nums">
                  {liveMatch.scoreA}
                </span>
                <span className="font-mono text-lg text-slate-300 tabular-nums">
                  ({liveMatch.oversA} ov)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-right">
              <div>
                <div className="text-xs text-slate-400">CRR</div>
                <div className="font-mono text-xl font-semibold text-emerald-400 tabular-nums">
                  {runRate}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">RRR</div>
                <div className="font-mono text-xl font-semibold text-amber-400 tabular-nums">
                  {reqRate}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-slate-800/70 p-4 space-y-1">
              <div className="text-xs text-slate-400">Striker</div>
              <div className="flex justify-between font-semibold">
                <span>{liveMatch.striker.name}*</span>
                <span className="font-mono tabular-nums">
                  {liveMatch.striker.runs} ({liveMatch.striker.balls})
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 tabular-nums">
                4s: {liveMatch.striker.fours} · 6s: {liveMatch.striker.sixes}
              </div>
            </div>

            <div className="rounded-lg bg-slate-800/70 p-4 space-y-1">
              <div className="text-xs text-slate-400">Bowler</div>
              <div className="flex justify-between font-semibold">
                <span>{liveMatch.bowler.name}</span>
                <span className="font-mono tabular-nums">
                  {liveMatch.bowler.wickets}/{liveMatch.bowler.runs} ({liveMatch.bowler.overs})
                </span>
              </div>
              <div className="text-xs font-mono text-emerald-400 tabular-nums">
                Radar Speed: {liveMatch.bowler.speedKmh} km/h
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Recent Balls:</span>
              {liveMatch.recentBalls.map((b, i) => (
                <span
                  key={`${b}-${i}`}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums ${
                    b === 'W'
                      ? 'bg-red-600 text-white'
                      : b === '4' || b === '6'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {b}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Match Official Live Scorer:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['0', '1', '2', '4', '6', 'W'] as const).map((outcome) => (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() => onRecordBall(outcome)}
                    className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                      outcome === 'W'
                        ? 'bg-red-600 text-white hover:bg-red-500'
                        : 'bg-slate-800 text-white hover:bg-emerald-600'
                    }`}
                  >
                    {outcome === 'W' ? 'Wicket' : `+${outcome}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wagon Wheel Shot Map */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Live Wagon Wheel Map
            </h2>
            <p className="text-xs text-slate-500">
              Real-time boundary & scoring vector distribution
            </p>
          </div>

          <div className="my-4 flex justify-center">
            <svg viewBox="0 0 220 220" className="w-56 h-56">
              <circle cx="110" cy="110" r="100" fill="#ECFDF5" stroke="#059669" strokeWidth="1.5" />
              <circle cx="110" cy="110" r="52" fill="none" stroke="#94A3B8" strokeDasharray="4 4" />
              <rect x="104" y="88" width="12" height="44" fill="#D6C7A9" rx="2" />
              {liveMatch.shotZones.map((shot, idx) => {
                const rad = (shot.angleDeg * Math.PI) / 180;
                const x2 = 110 + Math.cos(rad) * shot.distancePct;
                const y2 = 110 + Math.sin(rad) * shot.distancePct;
                const color =
                  shot.runs === 6 ? '#D97706' : shot.runs === 4 ? '#059669' : '#64748B';
                return (
                  <line
                    key={idx}
                    x1="110"
                    y1="104"
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth={shot.runs >= 4 ? '2.5' : '1.5'}
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
            <span>Emerald: 4s</span>
            <span>·</span>
            <span>Amber: 6s</span>
            <span>·</span>
            <span>Slate: 1s/2s</span>
          </div>
        </div>
      </section>

      {/* Nationwide Multi-Sport Leaderboard */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-600" />
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Nationwide Multi-Sport Leaderboard
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(['all', 'Cricket', 'Football', 'Kabaddi', 'Golf'] as const).map((sp) => (
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-2.5 pr-4">Rank</th>
                <th className="py-2.5 pr-4">Athlete</th>
                <th className="py-2.5 pr-4">Sport & Role</th>
                <th className="py-2.5 pr-4">Academy / City</th>
                <th className="py-2.5 pr-4 text-right">Matches</th>
                <th className="py-2.5 pr-4 text-right">Primary Stat</th>
                <th className="py-2.5 pr-4 text-right">Secondary Stat</th>
                <th className="py-2.5 text-right">Rating Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleLeaderboard.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="py-3 pr-4 font-mono font-semibold text-slate-900 tabular-nums">
                    #{idx + 1}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-slate-900">{row.athleteName}</td>
                  <td className="py-3 pr-4 text-xs capitalize text-slate-700">
                    {row.sport} · {row.role}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600">
                    {row.academy} · {row.city}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">{row.matches}</td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums whitespace-nowrap">
                    {row.primaryStatValue} {row.primaryStatLabel}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums whitespace-nowrap">
                    {row.secondaryStatValue} {row.secondaryStatLabel}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                    {row.ratingPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Open Tournament Hub: Organisers, Sponsors & Teams */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Open Tournament Portal — Organisers, Sponsors & Teams
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Organisers pay a $150 hosting fee to launch new open tournaments, sponsors pay for tier branding & prize pool boosts, and teams pay entry fees to compete nationwide.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-100 p-1">
            {(
              [
                { id: 'team', label: 'Join as Team', icon: Users },
                { id: 'sponsor', label: 'Join as Sponsor', icon: Megaphone },
                { id: 'organiser', label: 'Organise Tournament', icon: Building2 },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = openTournamentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOpenTournamentTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Teams Join by Paying Entry Fee */}
        {openTournamentTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tournaments.map((tourn) => {
              const sponsorsList = tourn.sponsors || [];
              const teamsList = tourn.joinedTeams || [];
              return (
                <div
                  key={tourn.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/40 p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {tourn.sport} · {tourn.tier} · {tourn.city}
                      </span>
                      <span className="font-mono tabular-nums">Starts {tourn.startDate}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      {tourn.name}
                    </h3>
                    <div className="text-xs text-slate-600">
                      Organiser: <span className="font-medium text-slate-800">{tourn.organizerName || 'TossMore Federation'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 font-mono tabular-nums">
                      <span>Prize Pool: ${tourn.prizePoolUsd.toLocaleString()}</span>
                      <span>·</span>
                      <span>Entry Fee: ${tourn.entryFeeUsd}</span>
                      <span>·</span>
                      <span>Spots Left: {tourn.spotsRemaining}</span>
                    </div>

                    {sponsorsList.length > 0 && (
                      <div className="text-xs text-slate-600 pt-1">
                        Sponsors:{' '}
                        <span className="font-medium text-emerald-700">
                          {sponsorsList.map((s) => `${s.brandName} (${s.tier})`).join(', ')}
                        </span>
                      </div>
                    )}

                    {teamsList.length > 0 && (
                      <div className="text-xs text-slate-600">
                        Joined Teams:{' '}
                        <span className="font-medium text-slate-800">
                          {teamsList.map((tm) => tm.teamName).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-200/80">
                    {tourn.registered && (
                      <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Entered: {tourn.registeredTeamName}</span>
                        </div>
                        <span className="font-mono">Paid</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Team name"
                        value={teamNames[tourn.id] || ''}
                        onChange={(e) =>
                          setTeamNames((prev) => ({ ...prev, [tourn.id]: e.target.value }))
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Captain name"
                        value={captainNames[tourn.id] || ''}
                        onChange={(e) =>
                          setCaptainNames((prev) => ({ ...prev, [tourn.id]: e.target.value }))
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Team city"
                        value={teamCities[tourn.id] || ''}
                        onChange={(e) =>
                          setTeamCities((prev) => ({ ...prev, [tourn.id]: e.target.value }))
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={tourn.spotsRemaining === 0}
                      onClick={() =>
                        onRegisterTournament({
                          description: `Team Entry: ${tourn.name}`,
                          amountUsd: tourn.entryFeeUsd,
                          kind: 'tournament',
                          targetId: tourn.id,
                          teamName: teamNames[tourn.id]?.trim() || 'TossMore Squad',
                          teamEntryPayload: {
                            captainName: captainNames[tourn.id]?.trim() || 'Aarav Mehta',
                            city: teamCities[tourn.id]?.trim() || tourn.city,
                          },
                        })
                      }
                      className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      {tourn.spotsRemaining === 0
                        ? 'Tournament Full'
                        : `Pay Team Entry & Join ($${tourn.entryFeeUsd})`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Sponsors Pay to Join & Brand an Open Tournament */}
        {openTournamentTab === 'sponsor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const targetId = sponsorTournId || tournaments[0]?.id;
                const chosenTourn = tournaments.find((tr) => tr.id === targetId);
                const selectedTierObj =
                  SPONSOR_TIERS.find((s) => s.tier === sponsorTier) || SPONSOR_TIERS[0];
                if (!chosenTourn || !sponsorBrand.trim()) return;
                onRegisterTournament({
                  description: `${sponsorTier} Sponsorship — ${chosenTourn.name} (${sponsorBrand.trim()})`,
                  amountUsd: selectedTierObj.feeUsd,
                  kind: 'tournament-sponsor',
                  targetId: chosenTourn.id,
                  sponsorPayload: {
                    tournamentId: chosenTourn.id,
                    brandName: sponsorBrand.trim(),
                    tier: sponsorTier,
                  },
                });
              }}
              className="lg:col-span-7 rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4"
            >
              <div className="text-sm font-semibold text-slate-900">
                Sponsor an Open Tournament (80% Boosts Official Prize Pool)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select Open Tournament
                  </label>
                  <select
                    value={sponsorTournId || tournaments[0]?.id || ''}
                    onChange={(e) => setSponsorTournId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    {tournaments.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.name} ({tr.sport})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Sponsor / Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={sponsorBrand}
                    onChange={(e) => setSponsorBrand(e.target.value)}
                    placeholder="e.g., Apex Hydration or Metro Sports"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-700">Choose Sponsorship Package</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SPONSOR_TIERS.map((pkg) => {
                    const active = sponsorTier === pkg.tier;
                    return (
                      <button
                        key={pkg.tier}
                        type="button"
                        onClick={() => setSponsorTier(pkg.tier)}
                        className={`rounded-xl border p-3.5 text-left transition-colors ${
                          active
                            ? 'border-emerald-600 bg-emerald-50/70'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{pkg.tier}</div>
                        <div className="mt-1 font-mono text-base font-bold text-emerald-700 tabular-nums">
                          ${pkg.feeUsd}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-600 leading-snug">
                          {pkg.perk}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Pay & Join as {sponsorTier} ($
                {(SPONSOR_TIERS.find((s) => s.tier === sponsorTier) || SPONSOR_TIERS[0]).feeUsd})
              </button>
            </form>

            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="text-sm font-semibold text-slate-900">
                Active Tournament Sponsors
              </div>
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {tournaments.map((tr) => (
                  <div
                    key={tr.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-1 text-xs"
                  >
                    <div className="font-semibold text-slate-900">{tr.name}</div>
                    <div className="text-slate-500">
                      {tr.sport} · Prize Pool ${tr.prizePoolUsd.toLocaleString()}
                    </div>
                    {tr.sponsors && tr.sponsors.length > 0 ? (
                      <div className="pt-1 space-y-1">
                        {tr.sponsors.map((sp) => (
                          <div
                            key={sp.id}
                            className="flex items-center justify-between text-emerald-800 font-medium"
                          >
                            <span>
                              {sp.brandName} ({sp.tier})
                            </span>
                            <span className="font-mono tabular-nums">${sp.contributionUsd}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-400 italic">Open for Title & Kit Sponsors</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Organisers Pay Hosting Fee to Launch an Open Tournament */}
        {openTournamentTab === 'organiser' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!hostTitle.trim() || !hostOrganizer.trim()) return;
              onRegisterTournament({
                description: `Open Tournament Hosting: ${hostTitle.trim()} (${hostOrganizer.trim()})`,
                amountUsd: HOSTING_FEE_USD,
                kind: 'tournament-host',
                tournamentHostPayload: {
                  name: hostTitle.trim(),
                  organizerName: hostOrganizer.trim(),
                  sport: hostSport,
                  tier: hostTier,
                  startDate: hostDate,
                  city: hostCity.trim() || 'Mumbai',
                  prizePoolUsd: hostPrizePool,
                  entryFeeUsd: hostEntryFee,
                  maxTeams: hostMaxTeams,
                },
              });
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Launch a New Open Tournament on TossMore
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Includes live scoring tools, verified player leaderboard sync, automated entry-fee escrow, and sponsor slots.
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
                Platform Hosting Fee: ${HOSTING_FEE_USD}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tournament Title
                </label>
                <input
                  type="text"
                  required
                  value={hostTitle}
                  onChange={(e) => setHostTitle(e.target.value)}
                  placeholder="e.g., Monsoon Premier Cricket Open"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Organiser / Academy Name
                </label>
                <input
                  type="text"
                  required
                  value={hostOrganizer}
                  onChange={(e) => setHostOrganizer(e.target.value)}
                  placeholder="e.g., Western Turf Collective"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sport</label>
                <select
                  value={hostSport}
                  onChange={(e) => setHostSport(e.target.value as SportType)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  {(
                    [
                      'Cricket',
                      'Football',
                      'Kabaddi',
                      'Golf',
                      'Tennis',
                      'Basketball',
                      'Badminton',
                      'Athletics',
                    ] as SportType[]
                  ).map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tier</label>
                <select
                  value={hostTier}
                  onChange={(e) => setHostTier(e.target.value as TournamentItem['tier'])}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Open Nationals">Open Nationals</option>
                  <option value="Semi-Pro">Semi-Pro</option>
                  <option value="Collegiate">Collegiate</option>
                  <option value="Grassroots U-16">Grassroots U-16</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={hostDate}
                  onChange={(e) => setHostDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={hostCity}
                  onChange={(e) => setHostCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Prize Pool (USD)
                </label>
                <input
                  type="number"
                  min={500}
                  required
                  value={hostPrizePool}
                  onChange={(e) => setHostPrizePool(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Team Entry Fee (USD)
                </label>
                <input
                  type="number"
                  min={10}
                  required
                  value={hostEntryFee}
                  onChange={(e) => setHostEntryFee(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Max Team Slots
                </label>
                <input
                  type="number"
                  min={4}
                  max={64}
                  required
                  value={hostMaxTeams}
                  onChange={(e) => setHostMaxTeams(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
              >
                Pay Hosting Fee & Launch Tournament (${HOSTING_FEE_USD})
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};
