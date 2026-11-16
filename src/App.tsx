import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { OverviewView } from './components/OverviewView';
import { TrainingStudioView } from './components/TrainingStudioView';
import { CertificationsView } from './components/CertificationsView';
import { AnalyticsWearablesView } from './components/AnalyticsWearablesView';
import { CoachingHubView } from './components/CoachingHubView';
import { TournamentsMatchesView } from './components/TournamentsMatchesView';
import { ClubScoutingView } from './components/ClubScoutingView';
import { SocialFeedView } from './components/SocialFeedView';
import { PodcastNewsView } from './components/PodcastNewsView';
import { MarketplaceView } from './components/MarketplaceView';
import { Footer } from './components/Footer';
import { useAppSocket } from './hooks/useWebSocket';
import type {
  BookingRecord,
  CartItem,
  CoachProfile,
  LanguageCode,
  MarketplaceProduct,
  NavSectionId,
  PendingCheckout,
  SportType,
  TransactionRecord,
} from './types';

export default function App() {
  const { state, setState, error, sendSocket, refreshState } = useAppSocket();
  const [activeSection, setActiveSection] = useState<NavSectionId>('overview');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [trainingSport, setTrainingSport] = useState<SportType>('Cricket');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null);
  const [preselectedSlot, setPreselectedSlot] = useState<{
    providerId: string;
    date: string;
    timeSlot: string;
  } | null>(null);

  if (!state) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 max-w-md w-full text-center space-y-3">
          <div className="font-display text-xl font-bold text-slate-900">TossMore</div>
          <p className="text-sm text-slate-600">
            {error ? `Connection issue: ${error}` : 'Loading athletic training ecosystem...'}
          </p>
          {error && (
            <button
              type="button"
              onClick={refreshState}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  const unreadCount = state.notifications.filter((n) => !n.read).length;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const postJson = async <T,>(url: string, body: unknown): Promise<T> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw Object.assign(new Error(data.message || data.error || 'Request failed'), {
        status: res.status,
        data,
      });
    }
    return data as T;
  };

  const handleConfirmPayment = async (
    method: 'Card' | 'UPI' | 'NetBanking'
  ): Promise<TransactionRecord | null> => {
    if (!pendingCheckout) return null;

    if (pendingCheckout.kind === 'booking' && pendingCheckout.bookingPayload) {
      const res = await postJson<{ transaction: TransactionRecord }>('/api/bookings', {
        ...pendingCheckout.bookingPayload,
        paymentMethod: method,
      });
      return res.transaction;
    }

    const res = await postJson<{ transaction: TransactionRecord; state: typeof state }>(
      '/api/checkout',
      {
        description: pendingCheckout.description,
        amountUsd: pendingCheckout.amountUsd,
        method,
        kind: pendingCheckout.kind,
        targetId: pendingCheckout.targetId,
        teamName: pendingCheckout.teamName,
        teamEntryPayload: pendingCheckout.teamEntryPayload,
        tournamentHostPayload: pendingCheckout.tournamentHostPayload,
        sponsorPayload: pendingCheckout.sponsorPayload,
      }
    );
    if (pendingCheckout.kind === 'cart') {
      setCart([]);
    }
    setState(res.state);
    return res.transaction;
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        language={language}
        onChangeLanguage={setLanguage}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        unreadCount={unreadCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          language={language}
          unreadNotifications={unreadCount}
          onOpenNotifications={() => setNotificationsOpen(true)}
          cartCount={cartCount}
          onOpenCartCheckout={() => {
            const total = cart.reduce((s, i) => s + i.product.priceUsd * i.quantity, 0);
            setPendingCheckout({
              description: `Marketplace Order (${cartCount} items)`,
              amountUsd: total,
              kind: 'cart',
            });
          }}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {activeSection === 'overview' && (
            <OverviewView
              state={state}
              language={language}
              onNavigate={setActiveSection}
              onSelectSportAndTrain={(sport) => {
                setTrainingSport(sport);
                setActiveSection('training');
              }}
              onAddToCart={(product: MarketplaceProduct) => {
                setCart((prev) => {
                  const existing = prev.find((i) => i.product.id === product.id);
                  if (existing) {
                    return prev.map((i) =>
                      i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                    );
                  }
                  return [...prev, { product, quantity: 1 }];
                });
              }}
              onActivateYoutubeStream={async (id) => {
                await postJson(`/api/youtube-podcasts/${id}/activate`, {});
              }}
              onSendYoutubeChat={async (streamId, text) => {
                await postJson(`/api/youtube-podcasts/${streamId}/chat`, {
                  author: 'Aarav Mehta',
                  text,
                });
              }}
              onAddYoutubeStream={async (payload) => {
                await postJson('/api/youtube-podcasts', payload);
              }}
              onAddTournamentVideo={async (payload) => {
                await postJson('/api/tournament-videos', payload);
              }}
              onSubmitPlayerReview={async (payload) => {
                await postJson('/api/player-reviews', payload);
              }}
              onMarkReviewHelpful={async (id) => {
                await postJson(`/api/player-reviews/${id}/helpful`, {});
              }}
            />
          )}

          {activeSection === 'training' && (
            <TrainingStudioView
              language={language}
              initialSport={trainingSport}
              onLogSession={async (payload) => {
                await postJson('/api/sessions', payload);
              }}
            />
          )}

          {activeSection === 'certifications' && (
            <CertificationsView
              language={language}
              certifications={state.certifications}
              onEnroll={(checkout) => setPendingCheckout(checkout)}
              onCompleteModule={async (certId) => {
                await postJson(`/api/certifications/${certId}/complete-module`, {});
              }}
              onSubmitExam={async (certId, scorePct) => {
                await postJson(`/api/certifications/${certId}/exam`, { scorePct });
              }}
            />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsWearablesView
              language={language}
              sessions={state.sessions}
              wearables={state.wearables}
              feedbacks={state.feedbacks}
              onToggleWearable={async (id) => {
                await postJson(`/api/wearables/${id}/toggle`, {});
              }}
              onSyncAllWearables={async () => {
                await postJson('/api/wearables/sync-all', {});
              }}
              onReplyFeedback={async (fbId, reply) => {
                await postJson(`/api/feedback/${fbId}/reply`, { reply });
              }}
            />
          )}

          {activeSection === 'coaching' && (
            <CoachingHubView
              language={language}
              state={state}
              preselectedSlot={preselectedSlot}
              onAttemptBooking={async ({
                provider,
                date,
                timeSlot,
              }: {
                provider: CoachProfile;
                date: string;
                timeSlot: string;
                sessionType: BookingRecord['sessionType'];
              }) => {
                const slotKey = `${date}|${timeSlot}`;
                const isConflict =
                  provider.unavailableSlots.includes(slotKey) ||
                  provider.bookedSlots.includes(slotKey);
                if (!isConflict) {
                  return { conflict: false };
                }
                // Trigger real server-side automated conflict alert + alternatives
                try {
                  await postJson('/api/bookings', {
                    providerId: provider.id,
                    date,
                    timeSlot,
                  });
                } catch (err: any) {
                  if (err?.status === 409 && err?.data) {
                    return {
                      conflict: true,
                      message: err.data.message,
                      suggestedSlots: err.data.suggestedSlots,
                    };
                  }
                }
                return { conflict: true, message: `${provider.name} is unavailable at ${timeSlot}.`, suggestedSlots: [] };
              }}
              onProceedBookingPayment={(checkout) => setPendingCheckout(checkout)}
              onAddReview={async (providerId, rating, comment) => {
                await postJson(`/api/providers/${providerId}/reviews`, {
                  author: 'Aarav Mehta',
                  rating,
                  comment,
                });
              }}
              onSendClassChat={(text) => {
                sendSocket('class:chat', { sender: 'Aarav Mehta', role: 'Student', text });
              }}
              onToggleRaiseHand={() => {
                sendSocket('class:hand', { name: 'Aarav Mehta' });
              }}
              onSendWhiteboardStroke={(stroke) => {
                sendSocket('class:stroke', stroke);
              }}
              onClearWhiteboard={() => {
                sendSocket('class:clear', {});
              }}
            />
          )}

          {activeSection === 'tournaments' && (
            <TournamentsMatchesView
              language={language}
              liveMatch={state.liveMatch}
              otherLiveMatches={state.otherLiveMatches}
              leaderboard={state.leaderboard}
              tournaments={state.tournaments}
              onRecordBall={async (outcome) => {
                await postJson('/api/match/ball', { outcome });
              }}
              onRecordOtherEvent={async (matchId, label) => {
                await postJson(`/api/other-match/${matchId}/event`, { label });
              }}
              onRegisterTournament={(checkout) => setPendingCheckout(checkout)}
            />
          )}

          {activeSection === 'club' && (
            <ClubScoutingView
              language={language}
              roster={state.roster}
              clubSchedule={state.clubSchedule}
              prospects={state.prospects}
              onAddPlayer={async (payload) => {
                await postJson('/api/club/roster', payload);
              }}
              onToggleXI={async (id) => {
                await postJson(`/api/club/roster/${id}/toggle-xi`, {});
              }}
              onAddSchedule={async (payload) => {
                await postJson('/api/club/schedule', payload);
              }}
              onToggleShortlist={async (id) => {
                const updated = await postJson(`/api/scouting/${id}/shortlist`, {});
                setState((prev) =>
                  prev
                    ? {
                        ...prev,
                        prospects: prev.prospects.map((p) => (p.id === id ? (updated as any) : p)),
                      }
                    : prev
                );
              }}
              onInviteTrial={async (id) => {
                const res = await postJson<{ prospect: any }>(`/api/scouting/${id}/invite`, {});
                setState((prev) =>
                  prev
                    ? {
                        ...prev,
                        prospects: prev.prospects.map((p) => (p.id === id ? res.prospect : p)),
                      }
                    : prev
                );
              }}
            />
          )}

          {activeSection === 'social' && (
            <SocialFeedView
              language={language}
              posts={state.socialPosts}
              onCreatePost={async (payload) => {
                await postJson('/api/feed', payload);
              }}
              onLikePost={async (id) => {
                await postJson(`/api/feed/${id}/like`, {});
              }}
              onCommentPost={async (id, text) => {
                await postJson(`/api/feed/${id}/comment`, { author: 'Aarav Mehta', text });
              }}
            />
          )}

          {activeSection === 'podcasts' && (
            <PodcastNewsView
              language={language}
              episodes={state.podcastEpisodes || []}
              news={state.sportsNews || []}
              onToggleBookmark={async (id) => {
                await postJson(`/api/podcasts/${id}/bookmark`, {});
              }}
              onAskQuestion={async (episodeId, question) => {
                await postJson(`/api/podcasts/${episodeId}/question`, {
                  author: 'Aarav Mehta',
                  question,
                });
              }}
              onPublishNews={async (payload) => {
                await postJson('/api/news', payload);
              }}
            />
          )}

          {activeSection === 'marketplace' && (
            <MarketplaceView
              language={language}
              products={state.marketplace}
              cart={cart}
              transactions={state.transactions}
              youtubeStreams={state.youtubeLiveStreams || []}
              activeYoutubeStreamId={state.activeYoutubeStreamId}
              onActivateYoutubeStream={async (id) => {
                await postJson(`/api/youtube-podcasts/${id}/activate`, {});
              }}
              onSendYoutubeChat={async (streamId, text) => {
                await postJson(`/api/youtube-podcasts/${streamId}/chat`, {
                  author: 'Aarav Mehta',
                  text,
                });
              }}
              onAddYoutubeStream={async (payload) => {
                await postJson('/api/youtube-podcasts', payload);
              }}
              onAddToCart={(product: MarketplaceProduct) => {
                setCart((prev) => {
                  const existing = prev.find((i) => i.product.id === product.id);
                  if (existing) {
                    return prev.map((i) =>
                      i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                    );
                  }
                  return [...prev, { product, quantity: 1 }];
                });
              }}
              onUpdateCartQuantity={(productId, delta) => {
                setCart((prev) =>
                  prev
                    .map((i) =>
                      i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
                    )
                    .filter((i) => i.quantity > 0)
                );
              }}
              onRemoveFromCart={(productId) => {
                setCart((prev) => prev.filter((i) => i.product.id !== productId));
              }}
              onCheckoutCart={() => {
                const total = cart.reduce((s, i) => s + i.product.priceUsd * i.quantity, 0);
                setPendingCheckout({
                  description: `Marketplace Order (${cartCount} items)`,
                  amountUsd: total,
                  kind: 'cart',
                });
              }}
              onCreateListing={async (payload) => {
                await postJson('/api/marketplace/listings', payload);
              }}
            />
          )}
        </main>

        <Footer
          language={language}
          onChangeLanguage={setLanguage}
          onNavigate={setActiveSection}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
      </div>

      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={state.notifications}
        onMarkAllRead={async () => {
          const updated = await postJson('/api/notifications/read-all', {});
          setState((prev) => (prev ? { ...prev, notifications: updated as any } : prev));
        }}
        onSelectAlternativeSlot={(providerId, slotKey) => {
          const [date, timeSlot] = slotKey.split('|');
          setPreselectedSlot({ providerId, date, timeSlot });
          setNotificationsOpen(false);
          setActiveSection('coaching');
        }}
      />

      <PaymentGatewayModal
        checkout={pendingCheckout}
        onClose={() => setPendingCheckout(null)}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}
