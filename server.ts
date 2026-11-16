import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  loadState,
  saveState,
  type AppState,
  type SessionAnalyticsRecord,
  type BookingRecord,
  type NotificationRecord,
  type SocialPost,
  type MarketplaceProduct,
  type RosterMember,
  type ClubScheduleEvent,
  type TransactionRecord,
  type LiveClassMessage,
  type WhiteboardStroke,
  type SportsNewsItem,
  type YouTubeLiveStream,
  type PlayerReview,
  type TournamentVideo,
} from './server/store.js';

const PORT = 3000;
let appState: AppState = loadState();

const app = express();
app.use(express.json({ limit: '2mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(event: string, payload: unknown) {
  const message = JSON.stringify({ event, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ event: 'init', payload: appState }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as { event: string; payload: any };
      if (msg.event === 'class:chat') {
        const entry: LiveClassMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: String(msg.payload?.sender || 'Athlete').slice(0, 40),
          role: msg.payload?.role === 'Coach' ? 'Coach' : 'Student',
          text: String(msg.payload?.text || '').slice(0, 400),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        if (!entry.text.trim()) return;
        const exists = appState.liveClass.messages.some((m) => m.id === entry.id);
        if (!exists) {
          appState.liveClass.messages.push(entry);
          if (appState.liveClass.messages.length > 60) {
            appState.liveClass.messages = appState.liveClass.messages.slice(-60);
          }
          saveState(appState);
          broadcast('class:chat', entry);
        }
      } else if (msg.event === 'class:stroke') {
        const stroke = msg.payload as WhiteboardStroke;
        if (!stroke?.id || !Array.isArray(stroke.points) || stroke.points.length < 2) return;
        const exists = appState.liveClass.strokes.some((s) => s.id === stroke.id);
        if (!exists) {
          appState.liveClass.strokes.push(stroke);
          if (appState.liveClass.strokes.length > 80) {
            appState.liveClass.strokes = appState.liveClass.strokes.slice(-80);
          }
          saveState(appState);
          broadcast('class:stroke', stroke);
        }
      } else if (msg.event === 'class:clear') {
        appState.liveClass.strokes = [];
        saveState(appState);
        broadcast('class:clear', {});
      } else if (msg.event === 'class:hand') {
        const name = String(msg.payload?.name || 'You').slice(0, 40);
        const idx = appState.liveClass.raisedHands.indexOf(name);
        if (idx >= 0) {
          appState.liveClass.raisedHands.splice(idx, 1);
        } else {
          appState.liveClass.raisedHands.push(name);
        }
        saveState(appState);
        broadcast('class:hands', appState.liveClass.raisedHands);
      }
    } catch {
      // Ignore malformed WS frames
    }
  });
});

// Full initial state
app.get('/api/state', (_req, res) => {
  res.json(appState);
});

// Log a completed training session (VR, AR, Video, Written)
app.post('/api/sessions', (req, res) => {
  const body = req.body;
  const record: SessionAnalyticsRecord = {
    id: `sess-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    sport: body.sport || 'Cricket',
    role: body.role || 'batsman',
    moduleTitle: String(body.moduleTitle || 'Skill Calibration Drill'),
    modality: body.modality || 'vr',
    durationMin: Number(body.durationMin) || 20,
    accuracyPct: Math.min(100, Math.max(10, Number(body.accuracyPct) || 85)),
    reactionMs: Math.max(120, Number(body.reactionMs) || 210),
    speedMetric: Number(body.speedMetric) || 122,
    speedUnit: String(body.speedUnit || 'km/h'),
    heartRateAvg: Number(body.heartRateAvg) || 146,
    workloadScore: Number(body.workloadScore) || 74,
    notes: String(body.notes || 'Session completed and telemetry logged.'),
  };
  appState.sessions.unshift(record);
  saveState(appState);
  broadcast('session:new', record);
  res.json(record);
});

// Reply to coach feedback or add new coach note
app.post('/api/feedback/:id/reply', (req, res) => {
  const fb = appState.feedbacks.find((f) => f.id === req.params.id);
  if (!fb) {
    res.status(404).json({ error: 'Feedback not found' });
    return;
  }
  fb.studentReply = String(req.body.reply || '').trim();
  saveState(appState);
  broadcast('feedback:update', fb);
  res.json(fb);
});

// Certification enrollment & assessment pass
app.post('/api/certifications/:id/complete-module', (req, res) => {
  const cert = appState.certifications.find((c) => c.id === req.params.id);
  if (!cert) {
    res.status(404).json({ error: 'Certification not found' });
    return;
  }
  cert.enrolled = true;
  if (cert.modulesCompleted < cert.modulesTotal) {
    cert.modulesCompleted += 1;
  }
  saveState(appState);
  broadcast('cert:update', cert);
  res.json(cert);
});

app.post('/api/certifications/:id/exam', (req, res) => {
  const cert = appState.certifications.find((c) => c.id === req.params.id);
  if (!cert) {
    res.status(404).json({ error: 'Certification not found' });
    return;
  }
  const scorePct = Math.min(100, Math.max(0, Number(req.body.scorePct) || 0));
  cert.scorePct = scorePct;
  if (scorePct >= 70) {
    cert.passed = true;
    cert.modulesCompleted = cert.modulesTotal;
    cert.certificateCode = `APX-${cert.track.toUpperCase().slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`;
    cert.issuedAt = new Date().toISOString().slice(0, 10);
  }
  saveState(appState);
  broadcast('cert:update', cert);
  res.json(cert);
});

// Book a coach / umpire / institute with automated conflict detection
const ALL_DAY_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '18:00'];

app.post('/api/bookings', (req, res) => {
  const { providerId, date, timeSlot, sessionType, paymentMethod } = req.body;
  const provider = appState.providers.find((p) => p.id === providerId);
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }
  const slotKey = `${date}|${timeSlot}`;
  const isConflict = provider.unavailableSlots.includes(slotKey) || provider.bookedSlots.includes(slotKey);

  if (isConflict) {
    const alternatives = ALL_DAY_SLOTS
      .filter((t) => !provider.unavailableSlots.includes(`${date}|${t}`) && !provider.bookedSlots.includes(`${date}|${t}`))
      .slice(0, 3)
      .map((t) => `${date}|${t}`);

    const notif: NotificationRecord = {
      id: `notif-${Date.now()}`,
      type: 'conflict',
      title: `Scheduling Conflict: ${provider.name}`,
      message: `${provider.name} is unavailable on ${date} at ${timeSlot}. Automated conflict guard found ${alternatives.length} open slots.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      suggestedSlots: alternatives,
      providerId: provider.id,
    };
    appState.notifications.unshift(notif);
    saveState(appState);
    broadcast('notification:new', notif);

    res.status(409).json({
      conflict: true,
      message: `${provider.name} is unavailable on ${date} at ${timeSlot}.`,
      suggestedSlots: alternatives,
      notification: notif,
    });
    return;
  }

  provider.bookedSlots.push(slotKey);
  const booking: BookingRecord = {
    id: `bk-${Date.now()}`,
    providerId: provider.id,
    providerName: provider.name,
    providerType: provider.type,
    date,
    timeSlot,
    sessionType: sessionType || '1-on-1 Online Video',
    status: 'Confirmed',
    feeUsd: provider.rateUsd,
    meetingRoomId: `room-${provider.id}-${timeSlot.replace(':', '')}`,
    createdAt: new Date().toISOString(),
  };
  appState.bookings.unshift(booking);

  const tx: TransactionRecord = {
    id: `tx-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    description: `${booking.sessionType} — ${provider.name} (${date} ${timeSlot})`,
    amountUsd: provider.rateUsd,
    method: paymentMethod || 'Card',
    status: 'Paid',
    referenceCode: `APX-${Math.floor(100000 + Math.random() * 900000)}`,
  };
  appState.transactions.unshift(tx);

  const notif: NotificationRecord = {
    id: `notif-${Date.now() + 1}`,
    type: 'booking',
    title: 'Session Confirmed',
    message: `Booked ${provider.name} on ${date} at ${timeSlot} (${booking.sessionType}).`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
  };
  appState.notifications.unshift(notif);

  saveState(appState);
  broadcast('booking:new', { booking, notification: notif, transaction: tx });
  res.json({ booking, notification: notif, transaction: tx });
});

// Add user review for coach / institute
app.post('/api/providers/:id/reviews', (req, res) => {
  const provider = appState.providers.find((p) => p.id === req.params.id);
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }
  const rating = Math.min(5, Math.max(1, Number(req.body.rating) || 5));
  const review = {
    id: `rev-${Date.now()}`,
    author: String(req.body.author || 'Verified Athlete'),
    rating,
    comment: String(req.body.comment || '').trim(),
    date: new Date().toISOString().slice(0, 10),
  };
  if (!review.comment) {
    res.status(400).json({ error: 'Review comment required' });
    return;
  }
  provider.reviews.unshift(review);
  provider.reviewCount += 1;
  provider.rating = Number(
    ((provider.rating * (provider.reviewCount - 1) + rating) / provider.reviewCount).toFixed(2)
  );
  saveState(appState);
  broadcast('provider:update', provider);
  res.json(provider);
});

// Mark notifications read
app.post('/api/notifications/read-all', (_req, res) => {
  appState.notifications.forEach((n) => {
    n.read = true;
  });
  saveState(appState);
  res.json(appState.notifications);
});

// Wearables toggle & real-time telemetry sync
app.post('/api/wearables/:id/toggle', (req, res) => {
  const dev = appState.wearables.find((w) => w.id === req.params.id);
  if (!dev) {
    res.status(404).json({ error: 'Device not found' });
    return;
  }
  dev.connected = !dev.connected;
  if (dev.connected) {
    dev.lastSynced = new Date().toISOString().slice(0, 16).replace('T', ' ');
    dev.heartRateBpm = 64 + Math.floor(Math.random() * 14);
    dev.hrvMs = 68 + Math.floor(Math.random() * 18);
    dev.vo2Max = Number((54 + Math.random() * 6).toFixed(1));
    dev.sprintLoad = 280 + Math.floor(Math.random() * 65);
    dev.caloriesBurned = 520 + Math.floor(Math.random() * 240);
    dev.recoveryPct = 82 + Math.floor(Math.random() * 14);
  }
  saveState(appState);
  broadcast('wearable:update', dev);
  res.json(dev);
});

app.post('/api/wearables/sync-all', (_req, res) => {
  const connected = appState.wearables.filter((w) => w.connected);
  connected.forEach((dev) => {
    dev.lastSynced = new Date().toISOString().slice(0, 16).replace('T', ' ');
    dev.heartRateBpm = Math.max(54, Math.min(182, dev.heartRateBpm + Math.floor(Math.random() * 9 - 3)));
    dev.hrvMs = Math.max(45, Math.min(98, dev.hrvMs + Math.floor(Math.random() * 5 - 2)));
    dev.sprintLoad += Math.floor(Math.random() * 18);
    dev.caloriesBurned += Math.floor(Math.random() * 45);
  });
  saveState(appState);
  broadcast('wearables:sync', appState.wearables);
  res.json(appState.wearables);
});

// Live Match Ball-by-Ball scoring engine (updates match & nationwide leaderboard)
app.post('/api/match/ball', (req, res) => {
  const outcome = String(req.body.outcome || '1'); // '0','1','2','4','6','W'
  const m = appState.liveMatch;
  m.ballsA += 1;
  const oversComplete = Math.floor(m.ballsA / 6);
  const ballsRem = m.ballsA % 6;
  m.oversA = `${oversComplete}.${ballsRem}`;

  let runs = 0;
  if (outcome === 'W') {
    m.wicketsA = Math.min(10, m.wicketsA + 1);
    m.bowler.wickets += 1;
  } else {
    runs = Number(outcome) || 0;
    m.runsA += runs;
    m.striker.runs += runs;
    m.striker.balls += 1;
    if (runs === 4) m.striker.fours += 1;
    if (runs === 6) m.striker.sixes += 1;
    m.bowler.runs += runs;

    if (runs > 0) {
      m.shotZones.push({
        angleDeg: Math.floor(Math.random() * 360),
        distancePct: runs === 6 ? 96 : runs === 4 ? 86 : 45 + runs * 10,
        runs,
      });
      if (m.shotZones.length > 24) m.shotZones = m.shotZones.slice(-24);
    }
  }

  m.scoreA = `${m.runsA}/${m.wicketsA}`;
  m.bowler.speedKmh = Number((137 + Math.random() * 8).toFixed(1));
  const bOvers = Math.floor((m.ballsA % 24) / 6);
  const bRem = m.ballsA % 6;
  m.bowler.overs = `${bOvers}.${bRem}`;
  m.recentBalls = [...m.recentBalls.slice(-11), outcome];

  // Update top leaderboard row dynamically for live synergy
  const topBatter = appState.leaderboard.find((r) => r.athleteName === m.striker.name);
  if (topBatter && runs > 0) {
    topBatter.primaryStatValue += runs;
    topBatter.ratingPoints += runs >= 4 ? 3 : 1;
  }

  saveState(appState);
  broadcast('match:update', { liveMatch: m, leaderboard: appState.leaderboard });
  res.json({ liveMatch: m, leaderboard: appState.leaderboard });
});

// Live Multi-Sport Match Event Scoring (Football, Kabaddi, Golf)
app.post('/api/other-match/:id/event', (req, res) => {
  const match = appState.otherLiveMatches.find((item) => item.id === req.params.id);
  if (!match) {
    res.status(404).json({ error: 'Match not found' });
    return;
  }
  const label = String(req.body.label || '').trim();
  if (label) {
    match.recentEvents = [...match.recentEvents.slice(-5), label];
    if (match.sport === 'Football' && label.includes('Goal')) {
      const [a, b] = match.scoreSummary.split('-').map((n) => parseInt(n.trim(), 10) || 0);
      match.scoreSummary = `${a + 1} - ${b}`;
    } else if (match.sport === 'Kabaddi') {
      const [a, b] = match.scoreSummary.split('-').map((n) => parseInt(n.trim(), 10) || 0);
      const pts = label.includes('+3') ? 3 : label.includes('+2') ? 2 : 1;
      match.scoreSummary = `${a + pts} - ${b}`;
    } else if (match.sport === 'Golf') {
      const curr = parseInt(match.scoreSummary, 10) || -11;
      const delta = label.includes('Eagle') ? -2 : label.includes('Birdie') ? -1 : 0;
      match.scoreSummary = `${curr + delta} Thru 17`;
    }
  }
  saveState(appState);
  broadcast('otherMatch:update', match);
  res.json(match);
});

// Club roster & schedule
app.post('/api/club/roster', (req, res) => {
  const member: RosterMember = {
    id: `ros-${Date.now()}`,
    name: String(req.body.name || '').trim(),
    sport: req.body.sport || 'Cricket',
    role: req.body.role || 'all-rounder',
    age: Number(req.body.age) || 20,
    readinessPct: 92,
    status: 'Active',
    jerseyNo: Number(req.body.jerseyNo) || Math.floor(10 + Math.random() * 88),
    inStartingXI: Boolean(req.body.inStartingXI),
  };
  if (!member.name) {
    res.status(400).json({ error: 'Player name required' });
    return;
  }
  appState.roster.push(member);
  saveState(appState);
  broadcast('roster:update', appState.roster);
  res.json(member);
});

app.post('/api/club/roster/:id/toggle-xi', (req, res) => {
  const player = appState.roster.find((r) => r.id === req.params.id);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }
  player.inStartingXI = !player.inStartingXI;
  saveState(appState);
  broadcast('roster:update', appState.roster);
  res.json(player);
});

app.post('/api/club/schedule', (req, res) => {
  const evt: ClubScheduleEvent = {
    id: `cs-${Date.now()}`,
    title: String(req.body.title || '').trim(),
    sport: req.body.sport || 'Football',
    type: req.body.type || 'Net Practice',
    date: String(req.body.date || '2026-11-22'),
    time: String(req.body.time || '09:00'),
    venue: String(req.body.venue || 'Main Turf Pitch'),
  };
  if (!evt.title) {
    res.status(400).json({ error: 'Event title required' });
    return;
  }
  appState.clubSchedule.unshift(evt);
  saveState(appState);
  broadcast('clubSchedule:update', appState.clubSchedule);
  res.json(evt);
});

// Scouting shortlist & trial invite
app.post('/api/scouting/:id/shortlist', (req, res) => {
  const p = appState.prospects.find((item) => item.id === req.params.id);
  if (!p) {
    res.status(404).json({ error: 'Prospect not found' });
    return;
  }
  p.shortlisted = !p.shortlisted;
  saveState(appState);
  res.json(p);
});

app.post('/api/scouting/:id/invite', (req, res) => {
  const p = appState.prospects.find((item) => item.id === req.params.id);
  if (!p) {
    res.status(404).json({ error: 'Prospect not found' });
    return;
  }
  p.trialInvited = true;
  p.shortlisted = true;
  const notif: NotificationRecord = {
    id: `notif-${Date.now()}`,
    type: 'tournament',
    title: 'Trial Invitation Dispatched',
    message: `Official National Combine trial invitation sent to ${p.name} (${p.city}).`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
  };
  appState.notifications.unshift(notif);
  saveState(appState);
  broadcast('notification:new', notif);
  res.json({ prospect: p, notification: notif });
});

// Social feed
app.post('/api/feed', (req, res) => {
  const post: SocialPost = {
    id: `post-${Date.now()}`,
    authorName: String(req.body.authorName || 'Aarav Mehta'),
    authorRole: String(req.body.authorRole || 'Multi-Sport Athlete · TossMore'),
    sport: req.body.sport || 'Cricket',
    timestamp: 'Just now',
    category: req.body.category || 'Milestone',
    content: String(req.body.content || '').trim(),
    metricSummary: req.body.metricSummary ? String(req.body.metricSummary) : undefined,
    likes: 0,
    likedByMe: false,
    comments: [],
  };
  if (!post.content) {
    res.status(400).json({ error: 'Post content required' });
    return;
  }
  appState.socialPosts.unshift(post);
  saveState(appState);
  broadcast('feed:new', post);
  res.json(post);
});

app.post('/api/feed/:id/like', (req, res) => {
  const post = appState.socialPosts.find((p) => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  post.likedByMe = !post.likedByMe;
  post.likes += post.likedByMe ? 1 : -1;
  saveState(appState);
  broadcast('feed:update', post);
  res.json(post);
});

app.post('/api/feed/:id/comment', (req, res) => {
  const post = appState.socialPosts.find((p) => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  const text = String(req.body.text || '').trim();
  if (!text) {
    res.status(400).json({ error: 'Comment text required' });
    return;
  }
  post.comments.push({
    id: `c-${Date.now()}`,
    author: String(req.body.author || 'Aarav Mehta'),
    text,
    timestamp: 'Just now',
  });
  saveState(appState);
  broadcast('feed:update', post);
  res.json(post);
});

// Sports Podcasts & News
app.post('/api/podcasts/:id/question', (req, res) => {
  const ep = appState.podcastEpisodes.find((p) => p.id === req.params.id);
  if (!ep) {
    res.status(404).json({ error: 'Podcast episode not found' });
    return;
  }
  const question = String(req.body.question || '').trim();
  if (!question) {
    res.status(400).json({ error: 'Question required' });
    return;
  }
  ep.listenerQuestions.unshift({
    id: `pq-${Date.now()}`,
    author: String(req.body.author || 'Aarav Mehta'),
    question,
    timestamp: 'Just now',
  });
  saveState(appState);
  broadcast('podcast:update', ep);
  res.json(ep);
});

app.post('/api/podcasts/:id/bookmark', (req, res) => {
  const ep = appState.podcastEpisodes.find((p) => p.id === req.params.id);
  if (!ep) {
    res.status(404).json({ error: 'Podcast episode not found' });
    return;
  }
  ep.bookmarked = !ep.bookmarked;
  saveState(appState);
  broadcast('podcast:update', ep);
  res.json(ep);
});

app.post('/api/news', (req, res) => {
  const item: SportsNewsItem = {
    id: `news-${Date.now()}`,
    title: String(req.body.title || '').trim(),
    sport: req.body.sport || 'Cricket',
    category: req.body.category || 'Tournament Desk',
    publishedAt: 'Just now',
    readTimeMin: 3,
    summary: String(req.body.summary || '').trim(),
    body: String(req.body.body || req.body.summary || '').trim(),
  };
  if (!item.title || !item.summary) {
    res.status(400).json({ error: 'Title and summary required' });
    return;
  }
  appState.sportsNews.unshift(item);
  saveState(appState);
  broadcast('news:new', item);
  res.json(item);
});

// Marketplace sell listing
app.post('/api/marketplace/listings', (req, res) => {
  const item: MarketplaceProduct = {
    id: `mkt-${Date.now()}`,
    title: String(req.body.title || '').trim(),
    category: req.body.category || 'Bats & Blades',
    sport: req.body.sport || 'Cricket',
    condition: req.body.condition || 'Pro-Used',
    priceUsd: Math.max(5, Number(req.body.priceUsd) || 50),
    sellerName: String(req.body.sellerName || 'Aarav Mehta'),
    sellerRating: 4.9,
    reviewCount: 1,
    specs: String(req.body.specs || 'Verified athlete listing · Inspected by ApexGear'),
    inStock: 1,
  };
  if (!item.title) {
    res.status(400).json({ error: 'Listing title required' });
    return;
  }
  appState.marketplace.unshift(item);
  saveState(appState);
  broadcast('marketplace:new', item);
  res.json(item);
});

// Unified secure checkout for Cart, Certifications, and Open Tournaments (Organiser, Sponsor, Team)
app.post('/api/checkout', (req, res) => {
  const {
    description,
    amountUsd,
    method,
    kind,
    targetId,
    teamName,
    teamEntryPayload,
    tournamentHostPayload,
    sponsorPayload,
  } = req.body;
  const tx: TransactionRecord = {
    id: `tx-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    description: String(description || 'TossMore Order'),
    amountUsd: Number(amountUsd) || 0,
    method: method || 'Card',
    status: 'Paid',
    referenceCode: `APX-${String(method || 'PAY').toUpperCase().slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`,
  };
  appState.transactions.unshift(tx);

  if (kind === 'certification' && targetId) {
    const cert = appState.certifications.find((c) => c.id === targetId);
    if (cert) {
      cert.enrolled = true;
      if (cert.modulesCompleted === 0) cert.modulesCompleted = 1;
    }
  } else if (kind === 'tournament' && targetId) {
    const tourn = appState.tournaments.find((t) => t.id === targetId);
    if (tourn) {
      const resolvedTeam = String(teamName || 'Mumbai Mavericks XI').trim();
      tourn.registered = true;
      tourn.registeredTeamName = resolvedTeam;
      tourn.spotsRemaining = Math.max(0, tourn.spotsRemaining - 1);
      if (!Array.isArray(tourn.joinedTeams)) tourn.joinedTeams = [];
      tourn.joinedTeams.unshift({
        id: `jte-${Date.now()}`,
        teamName: resolvedTeam,
        captainName: String(teamEntryPayload?.captainName || 'Aarav Mehta').trim(),
        city: String(teamEntryPayload?.city || tourn.city).trim(),
        feePaidUsd: tourn.entryFeeUsd,
        date: new Date().toISOString().slice(0, 10),
      });
    }
  } else if (kind === 'tournament-host' && tournamentHostPayload) {
    const maxTeams = Math.max(4, Number(tournamentHostPayload.maxTeams) || 16);
    appState.tournaments.unshift({
      id: `tourn-${Date.now()}`,
      name: String(tournamentHostPayload.name || 'Open Multi-Sport Championship').trim(),
      organizerName: String(tournamentHostPayload.organizerName || 'TossMore Partner Club').trim(),
      sport: tournamentHostPayload.sport || 'Cricket',
      tier: tournamentHostPayload.tier || 'Open Nationals',
      startDate: String(tournamentHostPayload.startDate || '2027-02-01'),
      city: String(tournamentHostPayload.city || 'Mumbai').trim(),
      prizePoolUsd: Math.max(500, Number(tournamentHostPayload.prizePoolUsd) || 5000),
      entryFeeUsd: Math.max(10, Number(tournamentHostPayload.entryFeeUsd) || 45),
      spotsRemaining: maxTeams,
      registered: false,
      hostFeePaid: true,
      sponsors: [],
      joinedTeams: [],
    });
  } else if (kind === 'tournament-sponsor' && sponsorPayload) {
    const tourn = appState.tournaments.find((t) => t.id === sponsorPayload.tournamentId);
    if (tourn) {
      if (!Array.isArray(tourn.sponsors)) tourn.sponsors = [];
      const contribution = Number(amountUsd) || 400;
      tourn.sponsors.unshift({
        id: `spn-${Date.now()}`,
        brandName: String(sponsorPayload.brandName || 'Official Brand Partner').trim(),
        tier: sponsorPayload.tier || 'Title Sponsor',
        contributionUsd: contribution,
        date: new Date().toISOString().slice(0, 10),
      });
      tourn.prizePoolUsd += Math.round(contribution * 0.8);
    }
  }

  const isTournamentKind =
    kind === 'tournament' || kind === 'tournament-host' || kind === 'tournament-sponsor';
  const notif: NotificationRecord = {
    id: `notif-${Date.now()}`,
    type: isTournamentKind ? 'tournament' : 'booking',
    title: 'Payment Verified',
    message: `Paid $${tx.amountUsd} via ${tx.method} (${tx.referenceCode}) for ${tx.description}.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
  };
  appState.notifications.unshift(notif);
  saveState(appState);
  broadcast('checkout:complete', { transaction: tx, notification: notif, state: appState });
  res.json({ transaction: tx, notification: notif, state: appState });
});

function extractYoutubeVideoId(raw: string): string | null {
  const input = raw.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  try {
    const parsed = new URL(input);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const vParam = parsed.searchParams.get('v');
    if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;
    const match = parsed.pathname.match(/\/(?:embed|live|shorts)\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
  } catch {
    // Ignore invalid URL
  }
  return null;
}

app.post('/api/youtube-podcasts', (req, res) => {
  const youtubeId = extractYoutubeVideoId(String(req.body.urlOrId || ''));
  if (!youtubeId) {
    res.status(400).json({ error: 'Provide a valid YouTube URL or 11-character video ID.' });
    return;
  }
  const stream: YouTubeLiveStream = {
    id: `yt-${Date.now()}`,
    youtubeId,
    title: String(req.body.title || 'Live Sports Podcast Broadcast').trim(),
    channelName: String(req.body.channelName || 'YouTube Live Stream').trim(),
    sport: req.body.sport || 'Cricket',
    hostAndGuest: String(req.body.hostAndGuest || 'TossMore Live Guest Session').trim(),
    isLive: req.body.isLive !== false,
    viewerCount: 320,
    featuredProductId: req.body.featuredProductId || 'mkt-1',
    startedLabel: 'Live Stream · Added Just Now',
    chatMessages: [],
  };
  appState.youtubeLiveStreams.unshift(stream);
  appState.activeYoutubeStreamId = stream.id;
  saveState(appState);
  broadcast('youtube:update', {
    youtubeLiveStreams: appState.youtubeLiveStreams,
    activeYoutubeStreamId: appState.activeYoutubeStreamId,
  });
  res.json(stream);
});

app.post('/api/youtube-podcasts/:id/activate', (req, res) => {
  const found = appState.youtubeLiveStreams.find((s) => s.id === req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Stream not found' });
    return;
  }
  appState.activeYoutubeStreamId = found.id;
  saveState(appState);
  broadcast('youtube:update', {
    youtubeLiveStreams: appState.youtubeLiveStreams,
    activeYoutubeStreamId: appState.activeYoutubeStreamId,
  });
  res.json({ activeYoutubeStreamId: found.id });
});

app.post('/api/youtube-podcasts/:id/chat', (req, res) => {
  const found = appState.youtubeLiveStreams.find((s) => s.id === req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Stream not found' });
    return;
  }
  const text = String(req.body.text || '').trim();
  if (!text) {
    res.status(400).json({ error: 'Message required' });
    return;
  }
  found.chatMessages.push({
    id: `ytc-${Date.now()}`,
    author: String(req.body.author || 'Aarav Mehta').slice(0, 40),
    text: text.slice(0, 300),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  saveState(appState);
  broadcast('youtube:update', {
    youtubeLiveStreams: appState.youtubeLiveStreams,
    activeYoutubeStreamId: appState.activeYoutubeStreamId,
  });
  res.json(found);
});

app.post('/api/player-reviews', (req, res) => {
  const playerName = String(req.body.playerName || 'Aarav Mehta').trim();
  const reviewText = String(req.body.reviewText || '').trim();
  if (!playerName || !reviewText) {
    res.status(400).json({ error: 'Player name and review text are required.' });
    return;
  }
  const review: PlayerReview = {
    id: `rev-${Date.now()}`,
    playerName: playerName.slice(0, 60),
    sport: req.body.sport || 'Cricket',
    roleOrAcademy: String(req.body.roleOrAcademy || 'Verified Athlete').trim().slice(0, 80),
    rating: Math.min(5, Math.max(1, Number(req.body.rating) || 5)),
    reasonHighlight: String(req.body.reasonHighlight || 'All-in-One Multi-Sport Ecosystem').trim(),
    reviewText: reviewText.slice(0, 500),
    verifiedStudent: true,
    helpfulCount: 1,
    date: new Date().toISOString().slice(0, 10),
  };
  appState.playerReviews.unshift(review);
  saveState(appState);
  broadcast('playerReview:new', review);
  res.json(review);
});

app.post('/api/player-reviews/:id/helpful', (req, res) => {
  const found = appState.playerReviews.find((r) => r.id === req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }
  found.helpfulCount += 1;
  saveState(appState);
  broadcast('playerReview:update', found);
  res.json(found);
});

app.post('/api/tournament-videos', (req, res) => {
  const youtubeId = extractYoutubeVideoId(String(req.body.urlOrId || ''));
  if (!youtubeId) {
    res.status(400).json({ error: 'Provide a valid YouTube URL or 11-character video ID.' });
    return;
  }
  const video: TournamentVideo = {
    id: `tv-${Date.now()}`,
    title: String(req.body.title || 'Live Tournament Match Highlights').trim(),
    tournamentName: String(req.body.tournamentName || 'TossMore National Open').trim(),
    sport: req.body.sport || 'Cricket',
    stageLabel: String(req.body.stageLabel || 'Ongoing Tournament Match').trim(),
    youtubeId,
    durationLabel: 'Live / Clip',
    location: String(req.body.location || 'National Arena').trim(),
  };
  appState.tournamentVideos.unshift(video);
  saveState(appState);
  broadcast('tournamentVideo:new', video);
  res.json(video);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`TossMore full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
