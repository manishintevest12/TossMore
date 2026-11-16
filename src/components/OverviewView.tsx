import React from 'react';
import { ArrowRight, Activity, Award, Calendar, MessageSquare, Mic, ShieldCheck, ShoppingBag } from 'lucide-react';
import type { AppState, LanguageCode, MarketplaceProduct, NavSectionId, SportType } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { YouTubeLivePodcastSection } from './YouTubeLivePodcastSection';
import { TournamentVideosSection } from './TournamentVideosSection';
import { PlayerReviewsSection } from './PlayerReviewsSection';

interface OverviewViewProps {
  state: AppState;
  language: LanguageCode;
  onNavigate: (section: NavSectionId) => void;
  onSelectSportAndTrain: (sport: SportType) => void;
  onAddToCart: (product: MarketplaceProduct) => void;
  onActivateYoutubeStream: (id: string) => Promise<void>;
  onSendYoutubeChat: (streamId: string, text: string) => Promise<void>;
  onAddYoutubeStream: (payload: {
    urlOrId: string;
    title: string;
    channelName: string;
    sport: SportType;
    hostAndGuest: string;
  }) => Promise<void>;
  onAddTournamentVideo: (payload: {
    urlOrId: string;
    title: string;
    tournamentName: string;
    sport: SportType;
    stageLabel: string;
    location: string;
  }) => Promise<void>;
  onSubmitPlayerReview: (payload: {
    playerName: string;
    sport: SportType;
    roleOrAcademy: string;
    rating: number;
    reasonHighlight: string;
    reviewText: string;
  }) => Promise<void>;
  onMarkReviewHelpful: (id: string) => Promise<void>;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  language,
  onNavigate,
  onSelectSportAndTrain,
  onAddToCart,
  onActivateYoutubeStream,
  onSendYoutubeChat,
  onAddYoutubeStream,
  onAddTournamentVideo,
  onSubmitPlayerReview,
  onMarkReviewHelpful,
}) => {
  const t = TRANSLATIONS[language];
  const connectedWearable = state.wearables.find((w) => w.connected);
  const avgAccuracy = state.sessions.length
    ? Math.round(state.sessions.reduce((sum, s) => sum + s.accuracyPct, 0) / state.sessions.length)
    : 0;
  const activeCerts = state.certifications.filter((c) => c.enrolled);

  const sportTracks: {
    sport: SportType;
    roles: string;
    focus: string;
    metric: string;
  }[] = [
    {
      sport: 'Cricket',
      roles: 'Batsman · Wicketkeeper · Bowler · All-Rounder',
      focus: '145 km/h VR pitch reaction, AR seam release & corridor batting',
      metric: `${state.sessions.filter((s) => s.sport === 'Cricket').length} sessions`,
    },
    {
      sport: 'Football',
      roles: 'Striker · Midfielder · Defender · Goalkeeper',
      focus: 'VR curved free-kicks, xG finishing zones & pressing biomechanics',
      metric: `${state.sessions.filter((s) => s.sport === 'Football').length} sessions`,
    },
    {
      sport: 'Kabaddi',
      roles: 'Raider · Corner Defender · Cover · All-Rounder',
      focus: 'Mat raid toe-touch timing, dubki escape & ankle-hold chain drills',
      metric: `${state.sessions.filter((s) => s.sport === 'Kabaddi').length} sessions`,
    },
    {
      sport: 'Golf',
      roles: 'Driver & Tee · Iron Approach · Short Game · Putting',
      focus: 'AR swing-plane kinematics, clubhead speed & green-reading VR',
      metric: `${state.sessions.filter((s) => s.sport === 'Golf').length} sessions`,
    },
    {
      sport: 'Tennis',
      roles: 'Baseline Striker · Serve & Volley · Returner',
      focus: '200 km/h serve pronation AR, topspin arc & split-step reaction',
      metric: 'VR & AR Ready',
    },
    {
      sport: 'Athletics',
      roles: 'Sprinter · Hurdler · Distance · Jumps',
      focus: 'Block-start shin angles, ground-contact time & VO2 pacing',
      metric: 'Wearable Sync',
    },
    {
      sport: 'Basketball',
      roles: 'Point Guard · Wing Shooter · Forward · Center',
      focus: 'Shot release arc (48°), defensive slide lateral speed & court vision',
      metric: 'VR & AR Ready',
    },
    {
      sport: 'Badminton',
      roles: 'Singles Tactician · Doubles Net · Smash Specialist',
      focus: 'Jump-smash wrist snap, net-kill reflexes & 6-corner footwork',
      metric: 'VR & AR Ready',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner with measured contrast scrim */}
      <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
        <div className="relative h-72 sm:h-80 w-full">
          <img
            src="/src/assets/images/hero_cricket_stadium_1794825376251.jpg"
            alt="High-performance multi-sport training stadium with biomechanical tracking cameras"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/35"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 max-w-3xl">
            <div className="text-xs font-medium text-emerald-400 mb-2">
              Cricket · Football · Kabaddi · Golf · Tennis · Athletics · Basketball · Badminton
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
              {t.hero.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              {t.hero.subtitle}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('training')}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.hero.primaryCta}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('coaching')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.hero.secondaryCta}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip directly below Hero */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Multi-Sport Drill Accuracy</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {avgAccuracy}%
            </span>
            <span className="text-xs font-medium text-emerald-700 tabular-nums">
              {state.sessions.length} sessions
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Cricket, Football, Kabaddi & Golf</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Wearable Readiness</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {connectedWearable ? `${connectedWearable.recoveryPct}%` : 'Offline'}
            </span>
            <span className="text-xs font-mono text-slate-600 tabular-nums">
              {connectedWearable ? `${connectedWearable.heartRateBpm} bpm` : 'Connect device'}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {connectedWearable ? `${connectedWearable.brand} ${connectedWearable.name}` : 'No active wearable'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Degree & Cert Progress</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {activeCerts.length} Active
            </span>
            <span className="text-xs font-medium text-slate-600 tabular-nums">
              {state.certifications.filter((c) => c.passed).length} Certified
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Player, Coach & Official Tracks</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Live Matches Across Sports</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {1 + state.otherLiveMatches.length} Live
            </span>
            <button
              type="button"
              onClick={() => onNavigate('tournaments')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Watch Scores
            </button>
          </div>
          <div className="mt-1 text-xs text-slate-500 truncate">
            Cricket {state.liveMatch.scoreA} · Football {state.otherLiveMatches[0]?.scoreSummary} · Kabaddi {state.otherLiveMatches[1]?.scoreSummary}
          </div>
        </div>
      </section>

      {/* Live Podcast from YouTube on Homepage */}
      <YouTubeLivePodcastSection
        context="homepage"
        streams={state.youtubeLiveStreams || []}
        activeStreamId={state.activeYoutubeStreamId}
        onActivateStream={onActivateYoutubeStream}
        onSendChat={onSendYoutubeChat}
        onAddStream={onAddYoutubeStream}
        onOpenPodcastsPage={() => onNavigate('podcasts')}
      />

      {/* Ongoing Platform Tournament Videos on Homepage */}
      <TournamentVideosSection
        videos={state.tournamentVideos || []}
        onAddTournamentVideo={onAddTournamentVideo}
        onOpenTournaments={() => onNavigate('tournaments')}
      />

      {/* All-Sports Training Ecosystem Grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              All-Sport Training & Skill Labs
            </h2>
            <p className="text-sm text-slate-600">
              Launch written manuals, high-speed video, VR simulators, and AR biomechanics for any sport
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('training')}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap shrink-0"
          >
            Open Full Studio →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {sportTracks.map((item) => (
            <div
              key={item.sport}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
            >
              <div>
                <div className="text-xs font-medium text-slate-500 truncate">{item.roles}</div>
                <h3 className="mt-1 font-display text-lg font-semibold text-slate-900">
                  {item.sport}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.focus}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-700 tabular-nums">{item.metric}</span>
                <button
                  type="button"
                  onClick={() => onSelectSportAndTrain(item.sport)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap shrink-0"
                >
                  Train {item.sport}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Bookings & Recent Coach Feedback */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Upcoming Coach & Institute Sessions
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('coaching')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap shrink-0"
            >
              Manage Calendar
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {state.bookings.slice(0, 3).map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {b.providerName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {b.sessionType} · {b.date} at {b.timeSlot}
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Direct Coach Feedback
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap shrink-0"
            >
              View All Analytics
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {state.feedbacks.slice(0, 3).map((fb) => (
              <div key={fb.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {fb.coachName} · {fb.sport}
                  </span>
                  <span className="font-mono tabular-nums">{fb.date}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{fb.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Gear Ecommerce Showcase on Homepage */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              <span>Sports Gear Store — Bats, Balls, Gloves & Equipment</span>
            </h2>
            <p className="text-sm text-slate-600">
              Match-grade equipment for Cricket, Football, Kabaddi, Golf, Tennis, Basketball, Badminton, and Athletics.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('marketplace')}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap shrink-0"
          >
            Open Sports Store →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {state.marketplace.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] w-full bg-slate-100 border-b border-slate-200 overflow-hidden">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <div className="text-xs text-slate-500">
                    {product.sport} · {product.category}
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900 line-clamp-2">
                    {product.title}
                  </h3>
                </div>
              </div>
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  ${product.priceUsd}
                </span>
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Player Reviews: Why Every Sports Student Chooses TossMore */}
      <PlayerReviewsSection
        reviews={state.playerReviews || []}
        onSubmitReview={onSubmitPlayerReview}
        onMarkHelpful={onMarkReviewHelpful}
      />

      {/* Quick Ecosystem Links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('tournaments')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-emerald-600 transition-colors"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">Open Tournaments Hub</div>
            <div className="text-xs text-slate-500 mt-1">Organisers, sponsors & teams join nationwide</div>
          </div>
          <Award className="h-5 w-5 text-emerald-600 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-emerald-600 transition-colors"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">Wearables & Biomechanics</div>
            <div className="text-xs text-slate-500 mt-1">Live HR, HRV, VO2 Max & workload metrics</div>
          </div>
          <Activity className="h-5 w-5 text-emerald-600 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('club')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-emerald-600 transition-colors"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">Scouting & Club Roster</div>
            <div className="text-xs text-slate-500 mt-1">Manage squads & invite verified talent</div>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('podcasts')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-emerald-600 transition-colors"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">Podcasts & Sports News</div>
            <div className="text-xs text-slate-500 mt-1">Player interviews & live match dispatches</div>
          </div>
          <Mic className="h-5 w-5 text-emerald-600 shrink-0" />
        </button>
      </section>
    </div>
  );
};
