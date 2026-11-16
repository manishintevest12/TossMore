import React, { useMemo, useState } from 'react';
import { CheckCircle2, MessageSquarePlus, Star, ThumbsUp } from 'lucide-react';
import type { PlayerReview, SportType } from '../types';

interface PlayerReviewsSectionProps {
  reviews: PlayerReview[];
  onSubmitReview: (payload: {
    playerName: string;
    sport: SportType;
    roleOrAcademy: string;
    rating: number;
    reasonHighlight: string;
    reviewText: string;
  }) => Promise<void>;
  onMarkHelpful: (id: string) => Promise<void>;
}

const SPORT_FILTERS: ('All' | SportType)[] = [
  'All',
  'Cricket',
  'Football',
  'Kabaddi',
  'Golf',
  'Tennis',
  'Athletics',
  'Basketball',
  'Badminton',
];

const REASON_OPTIONS = [
  'VR Reaction Pods & Direct Coach Feedback',
  'Wearable GPS Telemetry & Live Doubt Clearing',
  'Nationwide Tournaments & Pro Scouting',
  'Accredited Coaching & Umpire Degrees',
  'AR Biomechanics & Skill Labs',
  'Sports Gear Store & Bowling Machines',
];

export const PlayerReviewsSection: React.FC<PlayerReviewsSectionProps> = ({
  reviews,
  onSubmitReview,
  onMarkHelpful,
}) => {
  const [sportFilter, setSportFilter] = useState<'All' | SportType>('All');
  const [showForm, setShowForm] = useState(false);

  const [playerName, setPlayerName] = useState('');
  const [sport, setSport] = useState<SportType>('Cricket');
  const [roleOrAcademy, setRoleOrAcademy] = useState('');
  const [rating, setRating] = useState(5);
  const [reasonHighlight, setReasonHighlight] = useState(REASON_OPTIONS[0]);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => sportFilter === 'All' || r.sport === sportFilter);
  }, [reviews, sportFilter]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '5.0';
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return avg.toFixed(1);
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !reviewText.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitReview({
        playerName: playerName.trim(),
        sport,
        roleOrAcademy: roleOrAcademy.trim() || `${sport} Student-Athlete`,
        rating,
        reasonHighlight,
        reviewText: reviewText.trim(),
      });
      setPlayerName('');
      setRoleOrAcademy('');
      setReviewText('');
      setRating(5);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>
              Verified Student-Athlete Reviews ·{' '}
              <span className="font-mono tabular-nums">
                {averageRating} / 5.0
              </span>{' '}
              across {reviews.length} player stories
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Why Every Sports Student Chooses TossMore
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Players across Cricket, Football, Kabaddi, Golf, Tennis, and Athletics review how TossMore accelerates their training, certifications, scouting, and match performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>{showForm ? 'Close Review Form' : 'Write Player Review'}</span>
        </button>
      </div>

      {/* Add Player Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4"
        >
          <div className="text-sm font-semibold text-slate-900">
            Share Why You Chose TossMore as a Sports Student
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your Name (e.g., Priya Nair)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as SportType)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              {SPORT_FILTERS.filter((s) => s !== 'All').map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={roleOrAcademy}
              onChange={(e) => setRoleOrAcademy(e.target.value)}
              placeholder="Role & Academy (e.g., Fast Bowler · Delhi)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}.0 Stars
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Primary Reason You Chose TossMore
              </label>
              <select
                value={reasonHighlight}
                onChange={(e) => setReasonHighlight(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Your Experience & Review
              </label>
              <textarea
                required
                rows={2}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell other sports students how TossMore improved your game, coaching access, or tournament readiness..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {submitting ? 'Submitting...' : 'Publish Player Review'}
            </button>
          </div>
        </form>
      )}

      {/* Sport Filter Strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        {SPORT_FILTERS.map((sp) => (
          <button
            key={sp}
            type="button"
            onClick={() => setSportFilter(sp)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              sportFilter === sp
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {sp}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">
          No player reviews yet for {sportFilter}. Be the first to share your story!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredReviews.map((rev) => (
            <article
              key={rev.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-emerald-700">
                    {rev.sport} · Verified Student
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-800 tabular-nums">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {rev.rating.toFixed(1)}
                  </span>
                </div>

                <h3 className="font-display text-sm font-bold text-slate-900">
                  “{rev.reasonHighlight}”
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">{rev.reviewText}</p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {rev.playerName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {rev.roleOrAcademy} · {rev.date}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onMarkHelpful(rev.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-mono tabular-nums">{rev.helpfulCount}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
