import { useEffect, useRef, useState, useCallback } from 'react';
import type { AppState } from '../types';

export function useAppSocket() {
  const [state, setState] = useState<AppState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchFallback = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Unable to load platform state');
      const data = (await res.json()) as AppState;
      setState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error');
    }
  }, []);

  useEffect(() => {
    let active = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    fetchFallback();

    function connect() {
      if (!active) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!active) return;
        setConnected(true);
      };

      ws.onmessage = (evt) => {
        if (!active) return;
        try {
          const msg = JSON.parse(evt.data) as { event: string; payload: any };
          setState((prev) => {
            if (msg.event === 'init') {
              return msg.payload as AppState;
            }
            if (!prev) return prev;

            switch (msg.event) {
              case 'session:new': {
                if (prev.sessions.some((s) => s.id === msg.payload.id)) return prev;
                return { ...prev, sessions: [msg.payload, ...prev.sessions] };
              }
              case 'feedback:update': {
                return {
                  ...prev,
                  feedbacks: prev.feedbacks.map((f) => (f.id === msg.payload.id ? msg.payload : f)),
                };
              }
              case 'cert:update': {
                return {
                  ...prev,
                  certifications: prev.certifications.map((c) =>
                    c.id === msg.payload.id ? msg.payload : c
                  ),
                };
              }
              case 'booking:new': {
                const { booking, notification, transaction } = msg.payload;
                const nextBookings = prev.bookings.some((b) => b.id === booking.id)
                  ? prev.bookings
                  : [booking, ...prev.bookings];
                const nextNotifs = prev.notifications.some((n) => n.id === notification.id)
                  ? prev.notifications
                  : [notification, ...prev.notifications];
                const nextTxs = prev.transactions.some((t) => t.id === transaction.id)
                  ? prev.transactions
                  : [transaction, ...prev.transactions];
                const nextProviders = prev.providers.map((p) =>
                  p.id === booking.providerId
                    ? { ...p, bookedSlots: [...p.bookedSlots, `${booking.date}|${booking.timeSlot}`] }
                    : p
                );
                return {
                  ...prev,
                  bookings: nextBookings,
                  notifications: nextNotifs,
                  transactions: nextTxs,
                  providers: nextProviders,
                };
              }
              case 'notification:new': {
                if (prev.notifications.some((n) => n.id === msg.payload.id)) return prev;
                return { ...prev, notifications: [msg.payload, ...prev.notifications] };
              }
              case 'provider:update': {
                return {
                  ...prev,
                  providers: prev.providers.map((p) => (p.id === msg.payload.id ? msg.payload : p)),
                };
              }
              case 'wearable:update': {
                return {
                  ...prev,
                  wearables: prev.wearables.map((w) => (w.id === msg.payload.id ? msg.payload : w)),
                };
              }
              case 'wearables:sync': {
                return { ...prev, wearables: msg.payload };
              }
              case 'match:update': {
                return {
                  ...prev,
                  liveMatch: msg.payload.liveMatch,
                  leaderboard: msg.payload.leaderboard,
                };
              }
              case 'otherMatch:update': {
                return {
                  ...prev,
                  otherLiveMatches: prev.otherLiveMatches.map((m) =>
                    m.id === msg.payload.id ? msg.payload : m
                  ),
                };
              }
              case 'roster:update': {
                return { ...prev, roster: msg.payload };
              }
              case 'clubSchedule:update': {
                return { ...prev, clubSchedule: msg.payload };
              }
              case 'feed:new': {
                if (prev.socialPosts.some((p) => p.id === msg.payload.id)) return prev;
                return { ...prev, socialPosts: [msg.payload, ...prev.socialPosts] };
              }
              case 'feed:update': {
                return {
                  ...prev,
                  socialPosts: prev.socialPosts.map((p) => (p.id === msg.payload.id ? msg.payload : p)),
                };
              }
              case 'podcast:update': {
                return {
                  ...prev,
                  podcastEpisodes: prev.podcastEpisodes.map((ep) =>
                    ep.id === msg.payload.id ? msg.payload : ep
                  ),
                };
              }
              case 'news:new': {
                if (prev.sportsNews.some((n) => n.id === msg.payload.id)) return prev;
                return { ...prev, sportsNews: [msg.payload, ...prev.sportsNews] };
              }
              case 'youtube:update': {
                return {
                  ...prev,
                  youtubeLiveStreams: msg.payload.youtubeLiveStreams,
                  activeYoutubeStreamId: msg.payload.activeYoutubeStreamId,
                };
              }
              case 'playerReview:new': {
                if (prev.playerReviews?.some((r) => r.id === msg.payload.id)) return prev;
                return { ...prev, playerReviews: [msg.payload, ...(prev.playerReviews || [])] };
              }
              case 'playerReview:update': {
                return {
                  ...prev,
                  playerReviews: (prev.playerReviews || []).map((r) =>
                    r.id === msg.payload.id ? msg.payload : r
                  ),
                };
              }
              case 'tournamentVideo:new': {
                if (prev.tournamentVideos?.some((v) => v.id === msg.payload.id)) return prev;
                return { ...prev, tournamentVideos: [msg.payload, ...(prev.tournamentVideos || [])] };
              }
              case 'marketplace:new': {
                if (prev.marketplace.some((m) => m.id === msg.payload.id)) return prev;
                return { ...prev, marketplace: [msg.payload, ...prev.marketplace] };
              }
              case 'checkout:complete': {
                return msg.payload.state as AppState;
              }
              case 'class:chat': {
                if (prev.liveClass.messages.some((m) => m.id === msg.payload.id)) return prev;
                return {
                  ...prev,
                  liveClass: {
                    ...prev.liveClass,
                    messages: [...prev.liveClass.messages, msg.payload],
                  },
                };
              }
              case 'class:stroke': {
                if (prev.liveClass.strokes.some((s) => s.id === msg.payload.id)) return prev;
                return {
                  ...prev,
                  liveClass: {
                    ...prev.liveClass,
                    strokes: [...prev.liveClass.strokes, msg.payload],
                  },
                };
              }
              case 'class:clear': {
                return {
                  ...prev,
                  liveClass: { ...prev.liveClass, strokes: [] },
                };
              }
              case 'class:hands': {
                return {
                  ...prev,
                  liveClass: { ...prev.liveClass, raisedHands: msg.payload },
                };
              }
              default:
                return prev;
            }
          });
        } catch {
          // Ignore invalid JSON
        }
      };

      ws.onclose = () => {
        if (!active) return;
        setConnected(false);
        reconnectTimer = setTimeout(connect, 2000);
      };
    }

    connect();
    return () => {
      active = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [fetchFallback]);

  const sendSocket = useCallback((event: string, payload: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, payload }));
    }
  }, []);

  return { state, setState, connected, error, sendSocket, refreshState: fetchFallback };
}
