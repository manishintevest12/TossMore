import React, { useMemo, useState } from 'react';
import { Film, MapPin, Plus, Trophy } from 'lucide-react';
import type { SportType, TournamentVideo } from '../types';

interface TournamentVideosSectionProps {
  videos: TournamentVideo[];
  onAddTournamentVideo: (payload: {
    urlOrId: string;
    title: string;
    tournamentName: string;
    sport: SportType;
    stageLabel: string;
    location: string;
  }) => Promise<void>;
  onOpenTournaments: () => void;
}

const SPORTS: SportType[] = [
  'Cricket',
  'Football',
  'Kabaddi',
  'Golf',
  'Tennis',
  'Basketball',
  'Badminton',
  'Athletics',
];

export const TournamentVideosSection: React.FC<TournamentVideosSectionProps> = ({
  videos,
  onAddTournamentVideo,
  onOpenTournaments,
}) => {
  const [activeId, setActiveId] = useState<string>(videos[0]?.id ?? '');
  const activeVideo = useMemo(() => {
    return videos.find((v) => v.id === activeId) || videos[0] || null;
  }, [videos, activeId]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [urlOrId, setUrlOrId] = useState('');
  const [title, setTitle] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [sport, setSport] = useState<SportType>('Cricket');
  const [stageLabel, setStageLabel] = useState('Quarterfinal Match Highlights');
  const [location, setLocation] = useState('Mumbai Arena');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!activeVideo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!urlOrId.trim() || !title.trim()) return;
    setSubmitting(true);
    try {
      await onAddTournamentVideo({
        urlOrId: urlOrId.trim(),
        title: title.trim(),
        tournamentName: tournamentName.trim() || 'TossMore National Championship',
        sport,
        stageLabel: stageLabel.trim() || 'Ongoing Tournament Match',
        location: location.trim() || 'National Arena',
      });
      setUrlOrId('');
      setTitle('');
      setTournamentName('');
      setShowAddForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to add tournament video.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            <span>
              Ongoing Platform Tournaments · {videos.length} Match Feeds Active
            </span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            Watch Live & Ongoing Platform Tournament Videos
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showAddForm ? 'Close Form' : 'Add Match Video'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenTournaments}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Tournaments & Leaderboard →
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="border-b border-slate-200 bg-slate-50 px-6 py-4 space-y-3"
        >
          <div className="text-xs font-semibold text-slate-800">
            Publish Ongoing Tournament Match Video to Homepage
          </div>
          {formError && <div className="text-xs font-medium text-red-600">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={urlOrId}
              onChange={(e) => setUrlOrId(e.target.value)}
              placeholder="YouTube URL or Video ID"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Match Video Title"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <input
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="Tournament Name"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                {SPORTS.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {submitting ? 'Adding...' : 'Publish'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            <input
              type="text"
              value={stageLabel}
              onChange={(e) => setStageLabel(e.target.value)}
              placeholder="Stage (e.g. Semifinal Highlights)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Venue & City"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Main Tournament Video Player */}
        <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-5 space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-black">
            <iframe
              key={activeVideo.youtubeId}
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0&modestbranding=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>

          <div className="space-y-1 text-white">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">
                {activeVideo.sport} · {activeVideo.stageLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-slate-400 tabular-nums">
                <MapPin className="h-3.5 w-3.5" />
                {activeVideo.location} · {activeVideo.durationLabel}
              </span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white leading-snug">
              {activeVideo.title}
            </h3>
            <p className="text-xs text-slate-300">{activeVideo.tournamentName}</p>
          </div>
        </div>

        {/* Ongoing Tournament Video Playlist */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <Film className="h-3.5 w-3.5 text-emerald-600" />
              <span>Ongoing Match Reels</span>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {videos.length} clips
            </span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {videos.map((video) => {
              const isSelected = video.id === activeVideo.id;
              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveId(video.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-emerald-700">
                      {video.sport} · {video.stageLabel}
                    </span>
                    <span className="font-mono tabular-nums">{video.durationLabel}</span>
                  </div>
                  <div className="mt-1 font-display text-sm font-bold text-slate-900 leading-snug">
                    {video.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 truncate">
                    {video.tournamentName} · {video.location}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
