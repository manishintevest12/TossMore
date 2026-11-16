import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  AlertTriangle,
  Star,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Hand,
  Send,
  Trash2,
} from 'lucide-react';
import type {
  AppState,
  BookingRecord,
  CoachProfile,
  LanguageCode,
  PendingCheckout,
  SportType,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface CoachingHubViewProps {
  language: LanguageCode;
  state: AppState;
  preselectedSlot: { providerId: string; date: string; timeSlot: string } | null;
  onAttemptBooking: (payload: {
    provider: CoachProfile;
    date: string;
    timeSlot: string;
    sessionType: BookingRecord['sessionType'];
  }) => Promise<{ conflict: boolean; message?: string; suggestedSlots?: string[] }>;
  onProceedBookingPayment: (checkout: PendingCheckout) => void;
  onAddReview: (providerId: string, rating: number, comment: string) => Promise<void>;
  onSendClassChat: (text: string) => void;
  onToggleRaiseHand: () => void;
  onSendWhiteboardStroke: (stroke: { id: string; color: string; points: { x: number; y: number }[] }) => void;
  onClearWhiteboard: () => void;
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '18:00'];

export const CoachingHubView: React.FC<CoachingHubViewProps> = ({
  language,
  state,
  preselectedSlot,
  onAttemptBooking,
  onProceedBookingPayment,
  onAddReview,
  onSendClassChat,
  onToggleRaiseHand,
  onSendWhiteboardStroke,
  onClearWhiteboard,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'booking' | 'liveclass'>('booking');
  const [providerFilter, setProviderFilter] = useState<'all' | 'coach' | 'umpire' | 'institute'>('all');
  const [sportFilter, setSportFilter] = useState<'all' | SportType>('all');
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    state.providers[0]?.id || 'prov-vikram'
  );
  const [selectedDate, setSelectedDate] = useState('2026-11-17');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [sessionType, setSessionType] = useState<BookingRecord['sessionType']>('1-on-1 Online Video');
  const [conflictAlert, setConflictAlert] = useState<{
    message: string;
    suggestedSlots: string[];
  } | null>(null);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Live Video & Doubt Clearing Class state
  const [chatInput, setChatInput] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Shared Whiteboard Canvas
  const boardRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);
  const [penColor, setPenColor] = useState('#059669');

  useEffect(() => {
    if (preselectedSlot) {
      setSelectedProviderId(preselectedSlot.providerId);
      setSelectedDate(preselectedSlot.date);
      setSelectedTime(preselectedSlot.timeSlot);
      setActiveTab('booking');
      setConflictAlert(null);
    }
  }, [preselectedSlot]);

  // Draw persisted + live WebSocket whiteboard strokes
  useEffect(() => {
    if (activeTab !== 'liveclass') return;
    const canvas = boardRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Pitch tactical backdrop
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w * 0.25, 24, w * 0.5, h - 48);
    ctx.beginPath();
    ctx.moveTo(w * 0.25, 68);
    ctx.lineTo(w * 0.75, 68);
    ctx.moveTo(w * 0.25, h - 68);
    ctx.lineTo(w * 0.75, h - 68);
    ctx.stroke();

    state.liveClass.strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [activeTab, state.liveClass.strokes]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  const toggleCamera = async () => {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
      setCameraOn(false);
      setMicOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCameraOn(true);
      setMicOn(true);
      setMediaNotice(null);
    } catch {
      setMediaNotice('Camera/mic permission unavailable in this browser frame — Audio/Whiteboard Q&A remains active.');
    }
  };

  const selectedProvider =
    state.providers.find((p) => p.id === selectedProviderId) || state.providers[0];
  const visibleProviders = state.providers.filter(
    (p) =>
      (providerFilter === 'all' || p.type === providerFilter) &&
      (sportFilter === 'all' || p.sport === sportFilter)
  );

  const handleBookClick = async () => {
    if (!selectedProvider) return;
    setConflictAlert(null);
    const check = await onAttemptBooking({
      provider: selectedProvider,
      date: selectedDate,
      timeSlot: selectedTime,
      sessionType,
    });
    if (check.conflict) {
      setConflictAlert({
        message: check.message || 'Coach is unavailable for this slot.',
        suggestedSlots: check.suggestedSlots || [],
      });
    } else {
      onProceedBookingPayment({
        description: `${sessionType} — ${selectedProvider.name} (${selectedDate} ${selectedTime})`,
        amountUsd: selectedProvider.rateUsd,
        kind: 'booking',
        bookingPayload: {
          providerId: selectedProvider.id,
          date: selectedDate,
          timeSlot: selectedTime,
          sessionType,
        },
      });
    }
  };

  const getBoardCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = boardRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 [text-wrap:balance]">
            {t.sections.coachingHeadline}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Book verified private coaches, umpires, and turf institutes with automated conflict alerts or join live doubt classes.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('booking')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'booking'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendar & Booking
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('liveclass')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'liveclass'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Doubt Class ({state.liveClass.attendeesCount})
          </button>
        </div>
      </div>

      {activeTab === 'booking' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Coaches, Umpires & Institutes Directory */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200">
                {(
                  [
                    { id: 'all', label: 'All Providers' },
                    { id: 'coach', label: 'Coaches' },
                    { id: 'umpire', label: 'Officials' },
                    { id: 'institute', label: 'Institutes' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setProviderFilter(f.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
                      providerFilter === f.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1">
                {(['all', 'Cricket', 'Football', 'Kabaddi', 'Golf'] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSportFilter(sp)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
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

            <div className="space-y-4">
              {visibleProviders.map((prov) => {
                const isSelected = prov.id === selectedProvider?.id;
                return (
                  <div
                    key={prov.id}
                    className={`rounded-xl border bg-white p-5 transition-colors ${
                      isSelected ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {prov.avatarUrl ? (
                          <img
                            src={prov.avatarUrl}
                            alt={prov.name}
                            referrerPolicy="no-referrer"
                            className="h-14 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-900 text-white font-display font-bold text-lg shrink-0">
                            {prov.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-slate-500 capitalize">
                            {prov.type} · {prov.sport} · {prov.location}
                          </div>
                          <h3 className="font-display text-lg font-semibold text-slate-900">
                            {prov.name}
                          </h3>
                          <p className="text-xs text-slate-600">{prov.credentials}</p>
                          <p className="text-sm text-slate-700 pt-1">{prov.specialty}</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-900 tabular-nums">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span>{prov.rating.toFixed(2)}</span>
                          <span className="text-xs font-normal text-slate-500">
                            ({prov.reviewCount})
                          </span>
                        </div>
                        <div className="font-mono text-base font-semibold text-slate-900 tabular-nums">
                          ${prov.rateUsd}/hr
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProviderId(prov.id);
                            setConflictAlert(null);
                          }}
                          className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select Calendar'}
                        </button>
                      </div>
                    </div>

                    {/* Reviews snippet & quick review box when selected */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        <div className="text-xs font-semibold text-slate-700">
                          Verified Athlete Reviews
                        </div>
                        <div className="space-y-2">
                          {prov.reviews.slice(0, 2).map((r) => (
                            <div key={r.id} className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
                              <span className="font-semibold text-slate-900">{r.author}</span> ·{' '}
                              <span className="font-mono">{r.rating}/5</span> — “{r.comment}”
                            </div>
                          ))}
                        </div>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!reviewComment.trim()) return;
                            await onAddReview(prov.id, reviewRating, reviewComment.trim());
                            setReviewComment('');
                          }}
                          className="flex flex-wrap gap-2"
                        >
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                          >
                            <option value={5}>5 ★</option>
                            <option value={4}>4 ★</option>
                            <option value={3}>3 ★</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Write a verified rating review..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="flex-1 min-w-[180px] rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Post Review
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Integrated Calendar + Automated Conflict Notification */}
          <div className="lg:col-span-5">
            {selectedProvider && (
              <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <div>
                    <h2 className="font-display text-lg font-semibold text-slate-900">
                      Integrated Booking Calendar
                    </h2>
                    <div className="text-xs text-slate-500">
                      Scheduling with {selectedProvider.name}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Session Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setConflictAlert(null);
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Format
                    </label>
                    <select
                      value={sessionType}
                      onChange={(e) =>
                        setSessionType(e.target.value as BookingRecord['sessionType'])
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="1-on-1 Online Video">1-on-1 Online Video</option>
                      <option value="In-Person Turf / Net">In-Person Turf / Net</option>
                      <option value="Doubt Clearing">Doubt Clearing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-2">
                    <span>Select Time Slot</span>
                    <span className="text-slate-500">Amber = Busy / Unavailable</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const key = `${selectedDate}|${slot}`;
                      const unavailable =
                        selectedProvider.unavailableSlots.includes(key) ||
                        selectedProvider.bookedSlots.includes(key);
                      const active = selectedTime === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setSelectedTime(slot);
                            setConflictAlert(null);
                          }}
                          className={`rounded-lg border px-2.5 py-2 text-xs font-mono font-semibold tabular-nums transition-colors ${
                            active
                              ? unavailable
                                ? 'border-amber-600 bg-amber-50 text-amber-900'
                                : 'border-emerald-600 bg-emerald-600 text-white'
                              : unavailable
                                ? 'border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {conflictAlert && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-amber-950">
                          Automated Conflict Notification Triggered
                        </div>
                        <p className="text-xs text-amber-900 mt-0.5">{conflictAlert.message}</p>
                      </div>
                    </div>
                    {conflictAlert.suggestedSlots.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {conflictAlert.suggestedSlots.map((alt) => {
                          const [d, tm] = alt.split('|');
                          return (
                            <button
                              key={alt}
                              type="button"
                              onClick={() => {
                                setSelectedDate(d);
                                setSelectedTime(tm);
                                setConflictAlert(null);
                              }}
                              className="rounded-md border border-emerald-600 bg-white px-2.5 py-1 text-xs font-mono font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                              Switch to {tm}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBookClick}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Check Availability & Book (${selectedProvider.rateUsd})
                </button>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Your Confirmed Bookings</div>
                  {state.bookings.slice(0, 3).map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-xs text-slate-600">
                      <span className="truncate">{b.providerName} · {b.date} {b.timeSlot}</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('liveclass')}
                        className="font-semibold text-emerald-700 hover:underline whitespace-nowrap shrink-0"
                      >
                        Join Room
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Real-Time Live Video & Doubt Clearing Class */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-emerald-400">
                    LIVE VIDEO & DOUBT CLEARING · {state.liveClass.attendeesCount} STUDENTS IN ROOM
                  </div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    {state.liveClass.title}
                  </h2>
                  <div className="text-xs text-slate-300">
                    Instructors: {state.liveClass.instructor}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                      cameraOn ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {cameraOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                    <span>{cameraOn ? 'Cam Active' : 'Enable Cam'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMicOn((m) => !m)}
                    disabled={!cameraOn}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                  >
                    {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                    <span>{micOn ? 'Mic On' : 'Muted'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onToggleRaiseHand}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                      state.liveClass.raisedHands.includes('Aarav Mehta')
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Hand className="h-3.5 w-3.5" />
                    <span>Raise Hand</span>
                  </button>
                </div>
              </div>

              {mediaNotice && (
                <div className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-amber-300">
                  {mediaNotice}
                </div>
              )}

              {/* Split Video Feed + Shared Synced Pitch Whiteboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-950 aspect-video">
                    <img
                      src="/src/assets/images/coach_portrait_one_1794825376366.jpg"
                      alt="Head Coach Vikram Rathore live coaching stream"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-2 py-0.5 text-[11px] font-medium text-white">
                      Vikram Rathore (Host)
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center">
                    {cameraOn ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-slate-400 text-center px-3">
                        Your Student Camera Off · Click Enable Cam for live stance critique
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-2 py-0.5 text-[11px] font-medium text-white">
                      Aarav Mehta (You)
                    </div>
                  </div>
                </div>

                {/* Real-time WebSocket Tactical Pitch Whiteboard */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Shared Tactical Pitch Whiteboard (Real-Time WebSocket Sync)</span>
                    <div className="flex items-center gap-2">
                      {['#059669', '#F59E0B', '#EF4444'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPenColor(c)}
                          className={`h-4 w-4 rounded-full border ${
                            penColor === c ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                          aria-label={`Pen color ${c}`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={onClearWhiteboard}
                        className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  <canvas
                    ref={boardRef}
                    width={520}
                    height={280}
                    onPointerDown={(e) => {
                      drawingRef.current = true;
                      currentPointsRef.current = [getBoardCoords(e)];
                    }}
                    onPointerMove={(e) => {
                      if (!drawingRef.current) return;
                      currentPointsRef.current.push(getBoardCoords(e));
                    }}
                    onPointerUp={() => {
                      if (!drawingRef.current) return;
                      drawingRef.current = false;
                      if (currentPointsRef.current.length >= 2) {
                        onSendWhiteboardStroke({
                          id: `str-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                          color: penColor,
                          points: currentPointsRef.current,
                        });
                      }
                      currentPointsRef.current = [];
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 cursor-crosshair touch-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Doubt Clearing Chat & Raised Hands Queue */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white flex flex-col h-[500px]">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Live Doubt Q&A & Hand Queue
              </h3>
              <div className="text-xs text-slate-500 mt-1">
                Hands Raised ({state.liveClass.raisedHands.length}):{' '}
                {state.liveClass.raisedHands.length > 0
                  ? state.liveClass.raisedHands.join(', ')
                  : 'None'}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {state.liveClass.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg p-3 text-xs ${
                    m.role === 'Coach'
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                    <span>
                      {m.sender} · {m.role}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                      {m.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                onSendClassChat(chatInput.trim());
                setChatInput('');
              }}
              className="border-t border-slate-200 p-3 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask a live technical doubt..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
