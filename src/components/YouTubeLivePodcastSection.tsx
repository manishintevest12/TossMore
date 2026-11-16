import React, { useMemo, useState } from 'react';
import {
  MessageSquare,
  Plus,
  Radio,
  Send,
  ShoppingCart,
  Tv,
  Users,
} from 'lucide-react';
import type { MarketplaceProduct, SportType, YouTubeLiveStream } from '../types';

interface YouTubeLivePodcastSectionProps {
  context: 'homepage' | 'ecommerce';
  streams: YouTubeLiveStream[];
  activeStreamId: string;
  products?: MarketplaceProduct[];
  onActivateStream: (id: string) => Promise<void>;
  onSendChat: (streamId: string, text: string) => Promise<void>;
  onAddStream: (payload: {
    urlOrId: string;
    title: string;
    channelName: string;
    sport: SportType;
    hostAndGuest: string;
  }) => Promise<void>;
  onAddFeaturedProduct?: (product: MarketplaceProduct) => void;
  onOpenPodcastsPage?: () => void;
}

const STREAM_SPORTS: SportType[] = [
  'Cricket',
  'Football',
  'Kabaddi',
  'Golf',
  'Tennis',
  'Athletics',
  'Basketball',
  'Badminton',
];

export const YouTubeLivePodcastSection: React.FC<YouTubeLivePodcastSectionProps> = ({
  context,
  streams,
  activeStreamId,
  products = [],
  onActivateStream,
  onSendChat,
  onAddStream,
  onAddFeaturedProduct,
  onOpenPodcastsPage,
}) => {
  const activeStream = useMemo(() => {
    return streams.find((s) => s.id === activeStreamId) || streams[0] || null;
  }, [streams, activeStreamId]);

  const featuredProduct = useMemo(() => {
    if (!activeStream || products.length === 0) return null;
    return (
      products.find((p) => p.id === activeStream.featuredProductId) ||
      products.find((p) => p.sport === activeStream.sport) ||
      products[0] ||
      null
    );
  }, [activeStream, products]);

  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [urlOrId, setUrlOrId] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [channelName, setChannelName] = useState('');
  const [sport, setSport] = useState<SportType>('Cricket');
  const [hostAndGuest, setHostAndGuest] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingStream, setSubmittingStream] = useState(false);

  if (!activeStream) return null;

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setSendingChat(true);
    try {
      await onSendChat(activeStream.id, chatInput.trim());
      setChatInput('');
    } finally {
      setSendingChat(false);
    }
  };

  const handleAddStreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!urlOrId.trim() || !streamTitle.trim()) return;
    setSubmittingStream(true);
    try {
      await onAddStream({
        urlOrId: urlOrId.trim(),
        title: streamTitle.trim(),
        channelName: channelName.trim() || 'YouTube Live Podcast',
        sport,
        hostAndGuest: hostAndGuest.trim() || 'Live Player & Coach Roundtable',
      });
      setUrlOrId('');
      setStreamTitle('');
      setChannelName('');
      setHostAndGuest('');
      setShowAddForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to load YouTube stream.');
    } finally {
      setSubmittingStream(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
            <Radio className="h-3.5 w-3.5 shrink-0" />
            <span>
              Live Podcast from YouTube · {activeStream.sport} ·{' '}
              <span className="font-mono tabular-nums">
                {activeStream.viewerCount.toLocaleString()} watching
              </span>
            </span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            {context === 'ecommerce'
              ? 'Live YouTube Gear & Athlete Podcast Studio'
              : 'Live Sports Podcast Broadcasts on YouTube'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showAddForm ? 'Close Form' : 'Stream YouTube URL'}</span>
          </button>

          {context === 'homepage' && onOpenPodcastsPage && (
            <button
              type="button"
              onClick={onOpenPodcastsPage}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              All Podcasts & News →
            </button>
          )}
        </div>
      </div>

      {/* Add Custom YouTube Live URL Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddStreamSubmit}
          className="border-b border-slate-200 bg-slate-50 px-6 py-4 space-y-3"
        >
          <div className="text-xs font-semibold text-slate-800">
            Load a Live YouTube Podcast Stream (synced across Homepage & Gear Marketplace)
          </div>
          {formError && (
            <div className="text-xs font-medium text-red-600">{formError}</div>
          )}
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
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              placeholder="Podcast Episode / Stream Title"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <input
              type="text"
              value={hostAndGuest}
              onChange={(e) => setHostAndGuest(e.target.value)}
              placeholder="Host & Player Guest"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                {STREAM_SPORTS.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={submittingStream}
                className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {submittingStream ? 'Loading...' : 'Go Live'}
              </button>
            </div>
          </div>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="YouTube Channel Name (optional)"
            className="w-full sm:w-80 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </form>
      )}

      {/* Main Split Stage: YouTube Player + Channel Switcher / Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Embedded YouTube Live Video */}
        <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-black">
            <iframe
              key={activeStream.youtubeId}
              src={`https://www.youtube.com/embed/${activeStream.youtubeId}?rel=0&modestbranding=1`}
              title={activeStream.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>

          <div className="space-y-1.5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
              <span className="font-medium text-emerald-400">
                {activeStream.startedLabel} · {activeStream.channelName}
              </span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-400">
                <Users className="h-3.5 w-3.5" />
                {activeStream.viewerCount.toLocaleString()} live
              </span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white leading-snug">
              {activeStream.title}
            </h3>
            <p className="text-xs text-slate-300">{activeStream.hostAndGuest}</p>
          </div>

          {/* Channel Switcher Strip */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Tv className="h-3.5 w-3.5" />
              <span>Switch YouTube Podcast Channel</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {streams.slice(0, 4).map((stream) => {
                const isSelected = stream.id === activeStream.id;
                return (
                  <button
                    key={stream.id}
                    type="button"
                    onClick={() => onActivateStream(stream.id)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? 'border-emerald-500 bg-slate-800 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-emerald-400">
                        {stream.sport} · {stream.isLive ? 'LIVE' : 'Replay'}
                      </span>
                      <span className="font-mono tabular-nums">
                        {stream.viewerCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs font-semibold truncate">
                      {stream.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Featured Ecommerce Gear (in ecommerce context) + Live Stream Chat */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col justify-between p-5 space-y-4">
          {context === 'ecommerce' && featuredProduct && onAddFeaturedProduct && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
              <div className="text-xs font-semibold text-emerald-800">
                Featured in This Live Podcast
              </div>
              <div className="font-display text-sm font-bold text-slate-900">
                {featuredProduct.title}
              </div>
              <div className="text-xs text-slate-600">{featuredProduct.specs}</div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  ${featuredProduct.priceUsd}
                </span>
                <button
                  type="button"
                  onClick={() => onAddFeaturedProduct(featuredProduct)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Add Featured Gear</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-[240px] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>Live Broadcast Chat</span>
              </div>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {activeStream.chatMessages.length} msgs
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-64 pr-1">
              {activeStream.chatMessages.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">
                  Be the first to drop a question for {activeStream.hostAndGuest}.
                </p>
              ) : (
                activeStream.chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-800">{msg.author}</span>
                      <span className="font-mono tabular-nums">{msg.timestamp}</span>
                    </div>
                    <p className="mt-1 text-slate-700 leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a live podcast question..."
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatInput.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
