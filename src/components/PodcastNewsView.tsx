import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Headphones,
  MessageSquarePlus,
  Mic,
  Newspaper,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import type { LanguageCode, PodcastEpisode, SportType, SportsNewsItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface PodcastNewsViewProps {
  language: LanguageCode;
  episodes: PodcastEpisode[];
  news: SportsNewsItem[];
  onToggleBookmark: (id: string) => Promise<void>;
  onAskQuestion: (episodeId: string, question: string) => Promise<void>;
  onPublishNews: (payload: {
    title: string;
    sport: SportType;
    category: SportsNewsItem['category'];
    summary: string;
    body: string;
  }) => Promise<void>;
}

const SPORT_FILTERS: ('All' | SportType)[] = [
  'All',
  'Cricket',
  'Football',
  'Kabaddi',
  'Golf',
  'Athletics',
];

const NEWS_CATEGORIES: SportsNewsItem['category'][] = [
  'Tournament Desk',
  'Transfer & Scouting',
  'Sports Science',
  'Player Spotlight',
];

function formatMmSs(totalSec: number): string {
  const clamped = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const PodcastNewsView: React.FC<PodcastNewsViewProps> = ({
  language,
  episodes,
  news,
  onToggleBookmark,
  onAskQuestion,
  onPublishNews,
}) => {
  const t = TRANSLATIONS[language];

  const [sportFilter, setSportFilter] = useState<'All' | SportType>('All');
  const [viewMode, setViewMode] = useState<'all' | 'podcasts' | 'news'>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((ep) => {
      if (sportFilter !== 'All' && ep.sport !== sportFilter) return false;
      if (bookmarkedOnly && !ep.bookmarked) return false;
      return true;
    });
  }, [episodes, sportFilter, bookmarkedOnly]);

  const filteredNews = useMemo(() => {
    return news.filter((item) => sportFilter === 'All' || item.sport === sportFilter);
  }, [news, sportFilter]);

  const [activeEpisodeId, setActiveEpisodeId] = useState<string>(episodes[0]?.id ?? '');
  const activeEpisode = useMemo(() => {
    return (
      episodes.find((ep) => ep.id === activeEpisodeId) ||
      filteredEpisodes[0] ||
      episodes[0] ||
      null
    );
  }, [episodes, filteredEpisodes, activeEpisodeId]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(news[0]?.id ?? null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSport, setNewsSport] = useState<SportType>('Cricket');
  const [newsCategory, setNewsCategory] =
    useState<SportsNewsItem['category']>('Tournament Desk');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsBody, setNewsBody] = useState('');
  const [publishingNews, setPublishingNews] = useState(false);

  useEffect(() => {
    if (!isPlaying || !activeEpisode) return;
    const intervalMs = Math.round(1000 / playbackSpeed);
    const timer = window.setInterval(() => {
      setCurrentTimeSec((prev) => {
        if (prev + 1 >= activeEpisode.durationSec) {
          setIsPlaying(false);
          return activeEpisode.durationSec;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, playbackSpeed, activeEpisode]);

  const handleSelectEpisode = (ep: PodcastEpisode) => {
    setActiveEpisodeId(ep.id);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const handleJumpChapter = (timeSec: number) => {
    setCurrentTimeSec(timeSec);
    setIsPlaying(true);
  };

  const handleSkipSeconds = (delta: number) => {
    if (!activeEpisode) return;
    setCurrentTimeSec((prev) =>
      Math.max(0, Math.min(activeEpisode.durationSec, prev + delta))
    );
  };

  const activeChapterIndex = useMemo(() => {
    if (!activeEpisode || activeEpisode.chapters.length === 0) return -1;
    let idx = 0;
    for (let i = 0; i < activeEpisode.chapters.length; i += 1) {
      if (currentTimeSec >= activeEpisode.chapters[i].timeSec) {
        idx = i;
      }
    }
    return idx;
  }, [activeEpisode, currentTimeSec]);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEpisode || !questionText.trim()) return;
    setSubmittingQuestion(true);
    try {
      await onAskQuestion(activeEpisode.id, questionText.trim());
      setQuestionText('');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsSummary.trim() || !newsBody.trim()) return;
    setPublishingNews(true);
    try {
      await onPublishNews({
        title: newsTitle.trim(),
        sport: newsSport,
        category: newsCategory,
        summary: newsSummary.trim(),
        body: newsBody.trim(),
      });
      setNewsTitle('');
      setNewsSummary('');
      setNewsBody('');
      setShowPublishForm(false);
    } finally {
      setPublishingNews(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              {t.sections.podcastsHeadline}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Player interviews across Cricket, Football, Kabaddi, and Golf paired with live tournament & sports science dispatches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: 'All Coverage' },
                { id: 'podcasts', label: 'Player Podcasts' },
                { id: 'news', label: 'Sports News Desk' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {SPORT_FILTERS.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => setSportFilter(sport)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  sportFilter === sport
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setBookmarkedOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              bookmarkedOnly
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved Episodes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Podcasts Column */}
        {viewMode !== 'news' && (
          <div
            className={`${
              viewMode === 'podcasts' ? 'lg:col-span-12' : 'lg:col-span-7'
            } space-y-6`}
          >
            {/* Active Audio Deck */}
            {activeEpisode ? (
              <div className="rounded-xl bg-slate-900 text-white p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                      <Mic className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {activeEpisode.sport} · Episode {activeEpisode.episodeNumber} ·{' '}
                        {activeEpisode.publishedAt}
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-white">
                      {activeEpisode.title}
                    </h2>
                    <p className="text-sm text-slate-300">
                      Guest: <span className="font-semibold text-white">{activeEpisode.guestName}</span>{' '}
                      <span className="text-slate-400">({activeEpisode.guestRole})</span> · Host:{' '}
                      {activeEpisode.hostName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleBookmark(activeEpisode.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      activeEpisode.bookmarked
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{activeEpisode.bookmarked ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeEpisode.summary}
                </p>

                {/* Scrubber & Playback Controls */}
                <div className="rounded-lg bg-slate-800/80 border border-slate-700 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      aria-label="Podcast timeline scrubber"
                      min={0}
                      max={activeEpisode.durationSec}
                      value={currentTimeSec}
                      onChange={(e) => setCurrentTimeSec(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSkipSeconds(-15)}
                        className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-700 transition-colors"
                        aria-label="Rewind 15 seconds"
                      >
                        <SkipBack className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPlaying((prev) => !prev)}
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-4 w-4" />
                            <span>Pause Interview</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            <span>Play Interview</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSkipSeconds(15)}
                        className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-700 transition-colors"
                        aria-label="Forward 15 seconds"
                      >
                        <SkipForward className="h-4 w-4" />
                      </button>

                      <span className="ml-2 font-mono text-xs text-slate-300 tabular-nums">
                        {formatMmSs(currentTimeSec)} / {formatMmSs(activeEpisode.durationSec)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {([1, 1.25, 1.5] as const).map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`rounded-md px-2.5 py-1 font-mono text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                            playbackSpeed === speed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {speed.toFixed(speed === 1 ? 1 : 2)}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clickable Interview Chapters & Guest Quotes */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-300">
                    Interview Chapters & Key Quotes
                  </div>
                  <div className="space-y-2">
                    {activeEpisode.chapters.map((chapter, idx) => {
                      const isCurrent = idx === activeChapterIndex;
                      return (
                        <button
                          key={chapter.label}
                          type="button"
                          onClick={() => handleJumpChapter(chapter.timeSec)}
                          className={`w-full text-left rounded-lg border p-3 transition-colors ${
                            isCurrent
                              ? 'border-emerald-500/70 bg-slate-800'
                              : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-emerald-400">
                            <span>{chapter.label}</span>
                            <span className="font-mono text-slate-400 tabular-nums">
                              Jump
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-200 italic">
                            “{chapter.quote}”
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Listener Q&A */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Listener Questions for {activeEpisode.guestName} ({activeEpisode.listenerQuestions.length})
                    </span>
                  </div>

                  {activeEpisode.listenerQuestions.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {activeEpisode.listenerQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="rounded-lg bg-slate-800/60 border border-slate-800 px-3.5 py-2.5 text-sm"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-semibold text-slate-200">{q.author}</span>
                            <span>{q.timestamp}</span>
                          </div>
                          <p className="mt-1 text-slate-300">{q.question}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder={`Ask ${activeEpisode.guestName} a training or match question...`}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submittingQuestion || !questionText.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5" />
                      <span>Submit</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No interview episodes match your current sport or saved filter.
              </div>
            )}

            {/* Episode Queue */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-emerald-600" />
                  <span>All Player Interview Episodes</span>
                </h3>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {filteredEpisodes.length} episodes
                </span>
              </div>

              {filteredEpisodes.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">
                  No episodes found for this filter. Try switching back to All sports.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredEpisodes.map((ep) => {
                    const isSelected = activeEpisode?.id === ep.id;
                    return (
                      <div
                        key={ep.id}
                        className={`rounded-xl border p-4 transition-colors ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleSelectEpisode(ep)}
                            className="text-left flex-1 space-y-1 min-w-0"
                          >
                            <div className="text-xs font-medium text-slate-500">
                              {ep.sport} · Ep. {ep.episodeNumber} ·{' '}
                              <span className="font-mono tabular-nums">
                                {Math.round(ep.durationSec / 60)} min
                              </span>{' '}
                              · {ep.publishedAt}
                            </div>
                            <div className="font-display text-base font-bold text-slate-900">
                              {ep.title}
                            </div>
                            <div className="text-xs text-slate-600">
                              Featuring <span className="font-semibold text-slate-800">{ep.guestName}</span> — {ep.guestRole}
                            </div>
                          </button>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSelectEpisode(ep)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {isSelected ? 'Loaded' : 'Listen'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleBookmark(ep.id)}
                              aria-label={ep.bookmarked ? 'Remove bookmark' : 'Bookmark episode'}
                              className={`rounded-lg border p-1.5 transition-colors ${
                                ep.bookmarked
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <Bookmark className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sports News Column */}
        {viewMode !== 'podcasts' && (
          <div
            className={`${
              viewMode === 'news' ? 'lg:col-span-12' : 'lg:col-span-5'
            } space-y-4`}
          >
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-emerald-600" />
                  <span>Sports News Desk</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPublishForm((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{showPublishForm ? 'Close Form' : 'Submit Dispatch'}</span>
                </button>
              </div>

              {showPublishForm && (
                <form
                  onSubmit={handlePublishSubmit}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                >
                  <div className="text-xs font-semibold text-slate-800">
                    Publish Sports News Update
                  </div>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Headline (e.g., Bengaluru Strikers Sign U-19 Pace Prospect)"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newsSport}
                      onChange={(e) => setNewsSport(e.target.value as SportType)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
                    >
                      {SPORT_FILTERS.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newsCategory}
                      onChange={(e) =>
                        setNewsCategory(e.target.value as SportsNewsItem['category'])
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
                    >
                      {NEWS_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    required
                    value={newsSummary}
                    onChange={(e) => setNewsSummary(e.target.value)}
                    placeholder="One-line summary"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                  <textarea
                    required
                    rows={3}
                    value={newsBody}
                    onChange={(e) => setNewsBody(e.target.value)}
                    placeholder="Full match or scouting report..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={publishingNews}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      {publishingNews ? 'Publishing...' : 'Publish Dispatch'}
                    </button>
                  </div>
                </form>
              )}

              {filteredNews.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">
                  No news dispatches for {sportFilter}. Switch to All to read multi-sport headlines.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredNews.map((item) => {
                    const isExpanded = expandedNewsId === item.id;
                    return (
                      <article key={item.id} className="py-4 first:pt-1 last:pb-1 space-y-2">
                        <div className="text-xs font-medium text-slate-500">
                          <span className="text-emerald-700 font-semibold">{item.sport}</span> ·{' '}
                          {item.category} · {item.publishedAt} ·{' '}
                          <span className="font-mono tabular-nums">
                            {item.readTimeMin} min read
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {item.summary}
                        </p>
                        {isExpanded && (
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-700 leading-relaxed">
                            {item.body}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedNewsId((prev) => (prev === item.id ? null : item.id))
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          <span>{isExpanded ? 'Hide Full Dispatch' : 'Read Full Dispatch'}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
