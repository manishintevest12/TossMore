import fs from 'fs';
import path from 'path';

export type SportType =
  | 'Cricket'
  | 'Football'
  | 'Kabaddi'
  | 'Golf'
  | 'Tennis'
  | 'Athletics'
  | 'Basketball'
  | 'Badminton';

export interface SessionAnalyticsRecord {
  id: string;
  date: string;
  sport: SportType;
  role: string;
  moduleTitle: string;
  modality: 'written' | 'video' | 'vr' | 'ar';
  durationMin: number;
  accuracyPct: number;
  reactionMs: number;
  speedMetric: number;
  speedUnit: string;
  heartRateAvg: number;
  workloadScore: number;
  notes: string;
}

export interface CoachFeedbackRecord {
  id: string;
  sessionId: string;
  coachName: string;
  coachRole: string;
  sport: SportType;
  date: string;
  rating: number;
  summary: string;
  actionItems: string[];
  studentReply?: string;
}

export interface CertificationState {
  id: string;
  title: string;
  track: 'Player' | 'Coach' | 'Umpire' | 'Analyst';
  level: string;
  sport: SportType;
  modulesTotal: number;
  modulesCompleted: number;
  enrolled: boolean;
  passed: boolean;
  scorePct?: number;
  certificateCode?: string;
  issuedAt?: string;
  feeUsd: number;
}

export interface CoachProfile {
  id: string;
  name: string;
  type: 'coach' | 'umpire' | 'institute';
  specialty: string;
  sport: SportType;
  rating: number;
  reviewCount: number;
  rateUsd: number;
  location: string;
  avatarUrl?: string;
  credentials: string;
  unavailableSlots: string[];
  bookedSlots: string[];
  reviews: { id: string; author: string; rating: number; comment: string; date: string }[];
}

export interface BookingRecord {
  id: string;
  providerId: string;
  providerName: string;
  providerType: 'coach' | 'umpire' | 'institute';
  date: string;
  timeSlot: string;
  sessionType: '1-on-1 Online Video' | 'In-Person Turf / Net' | 'Doubt Clearing';
  status: 'Confirmed' | 'Completed';
  feeUsd: number;
  meetingRoomId: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  type: 'conflict' | 'booking' | 'feedback' | 'tournament' | 'wearable';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  suggestedSlots?: string[];
  providerId?: string;
}

export interface WearableDeviceState {
  id: string;
  name: string;
  brand: string;
  connected: boolean;
  lastSynced: string;
  heartRateBpm: number;
  hrvMs: number;
  vo2Max: number;
  sprintLoad: number;
  caloriesBurned: number;
  recoveryPct: number;
}

export interface LiveMatchState {
  id: string;
  tournamentName: string;
  level: 'Grassroots' | 'Collegiate' | 'Semi-Pro' | 'Nationals';
  sport: SportType;
  teamA: string;
  teamB: string;
  scoreA: string;
  oversA: string;
  runsA: number;
  wicketsA: number;
  ballsA: number;
  targetRuns: number;
  status: 'Live' | 'Innings Break' | 'Final';
  striker: { name: string; runs: number; balls: number; fours: number; sixes: number };
  bowler: { name: string; overs: string; runs: number; wickets: number; speedKmh: number };
  recentBalls: string[];
  shotZones: { angleDeg: number; distancePct: number; runs: number }[];
}

export interface MultiSportLiveMatch {
  id: string;
  sport: SportType;
  tournamentName: string;
  teamA: string;
  teamB: string;
  scoreSummary: string;
  clockOrPhase: string;
  keyStatLabel: string;
  keyStatValue: string;
  recentEvents: string[];
}

export interface LeaderboardRow {
  id: string;
  rank: number;
  athleteName: string;
  academy: string;
  city: string;
  sport: SportType;
  role: string;
  matches: number;
  primaryStatLabel: string;
  primaryStatValue: number;
  secondaryStatLabel: string;
  secondaryStatValue: number;
  strikeRate: number;
  ratingPoints: number;
}

export interface TournamentSponsor {
  id: string;
  brandName: string;
  tier: 'Title Sponsor' | 'Kit & Ball Partner' | 'Streaming Partner';
  contributionUsd: number;
  date: string;
}

export interface TournamentTeamEntry {
  id: string;
  teamName: string;
  captainName: string;
  city: string;
  feePaidUsd: number;
  date: string;
}

export interface TournamentItem {
  id: string;
  name: string;
  sport: SportType;
  tier: 'Grassroots U-16' | 'Collegiate' | 'Semi-Pro' | 'Open Nationals';
  startDate: string;
  city: string;
  prizePoolUsd: number;
  entryFeeUsd: number;
  spotsRemaining: number;
  registered: boolean;
  registeredTeamName?: string;
  organizerName?: string;
  hostFeePaid?: boolean;
  sponsors?: TournamentSponsor[];
  joinedTeams?: TournamentTeamEntry[];
}

export interface RosterMember {
  id: string;
  name: string;
  sport: SportType;
  role: string;
  age: number;
  readinessPct: number;
  status: 'Active' | 'Rehab' | 'National Duty';
  jerseyNo: number;
  inStartingXI: boolean;
}

export interface ClubScheduleEvent {
  id: string;
  title: string;
  sport: SportType;
  type: 'Net Practice' | 'Fitness Combine' | 'League Match' | 'Tactical Review';
  date: string;
  time: string;
  venue: string;
}

export interface ScoutProspect {
  id: string;
  name: string;
  age: number;
  city: string;
  sport: SportType;
  role: string;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
  sprint20mSec: number;
  combinePercentile: number;
  shortlisted: boolean;
  trialInvited: boolean;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorRole: string;
  sport: SportType;
  timestamp: string;
  category: 'Milestone' | 'Match Highlight' | 'Certification' | 'Training Clip';
  content: string;
  metricSummary?: string;
  likes: number;
  likedByMe: boolean;
  comments: { id: string; author: string; text: string; timestamp: string }[];
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  category:
    | 'Bats & Blades'
    | 'Balls & Shuttles'
    | 'Protective & Gloves'
    | 'Rackets & Clubs'
    | 'Training Machines'
    | 'Footwear & Turf'
    | 'Smart Sensors'
    | 'Kabaddi & Mat Gear';
  sport: SportType;
  condition: 'New' | 'Pro-Used';
  priceUsd: number;
  sellerName: string;
  sellerRating: number;
  reviewCount: number;
  imageUrl?: string;
  specs: string;
  inStock: number;
}

export interface TransactionRecord {
  id: string;
  date: string;
  description: string;
  amountUsd: number;
  method: 'Card' | 'UPI' | 'NetBanking';
  status: 'Paid';
  referenceCode: string;
}

export interface LiveClassMessage {
  id: string;
  sender: string;
  role: 'Coach' | 'Student';
  text: string;
  timestamp: string;
}

export interface WhiteboardStroke {
  id: string;
  color: string;
  points: { x: number; y: number }[];
}

export interface PodcastEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  sport: SportType;
  guestName: string;
  guestRole: string;
  hostName: string;
  durationSec: number;
  publishedAt: string;
  summary: string;
  bookmarked: boolean;
  chapters: { timeSec: number; label: string; quote: string }[];
  listenerQuestions: { id: string; author: string; question: string; timestamp: string }[];
}

export interface SportsNewsItem {
  id: string;
  title: string;
  sport: SportType;
  category: 'Tournament Desk' | 'Transfer & Scouting' | 'Sports Science' | 'Player Spotlight';
  publishedAt: string;
  readTimeMin: number;
  summary: string;
  body: string;
}

export interface YouTubeLiveStream {
  id: string;
  youtubeId: string;
  title: string;
  channelName: string;
  sport: SportType;
  hostAndGuest: string;
  isLive: boolean;
  viewerCount: number;
  featuredProductId?: string;
  startedLabel: string;
  chatMessages: { id: string; author: string; text: string; timestamp: string }[];
}

export interface PlayerReview {
  id: string;
  playerName: string;
  sport: SportType;
  roleOrAcademy: string;
  rating: number;
  reasonHighlight: string;
  reviewText: string;
  verifiedStudent: boolean;
  helpfulCount: number;
  date: string;
}

export interface TournamentVideo {
  id: string;
  title: string;
  tournamentName: string;
  sport: SportType;
  stageLabel: string;
  youtubeId: string;
  durationLabel: string;
  location: string;
}

export interface AppState {
  sessions: SessionAnalyticsRecord[];
  feedbacks: CoachFeedbackRecord[];
  certifications: CertificationState[];
  providers: CoachProfile[];
  bookings: BookingRecord[];
  notifications: NotificationRecord[];
  wearables: WearableDeviceState[];
  liveMatch: LiveMatchState;
  otherLiveMatches: MultiSportLiveMatch[];
  leaderboard: LeaderboardRow[];
  tournaments: TournamentItem[];
  roster: RosterMember[];
  clubSchedule: ClubScheduleEvent[];
  prospects: ScoutProspect[];
  socialPosts: SocialPost[];
  podcastEpisodes: PodcastEpisode[];
  sportsNews: SportsNewsItem[];
  youtubeLiveStreams: YouTubeLiveStream[];
  activeYoutubeStreamId: string;
  playerReviews: PlayerReview[];
  tournamentVideos: TournamentVideo[];
  marketplace: MarketplaceProduct[];
  transactions: TransactionRecord[];
  liveClass: {
    title: string;
    instructor: string;
    topic: string;
    attendeesCount: number;
    raisedHands: string[];
    messages: LiveClassMessage[];
    strokes: WhiteboardStroke[];
  };
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'tossmore_state.json');

function createInitialState(): AppState {
  return {
    sessions: [
      {
        id: 'sess-101',
        date: '2026-11-15',
        sport: 'Cricket',
        role: 'batsman',
        moduleTitle: 'VR Pace Reaction: 145 km/h Corridor',
        modality: 'vr',
        durationMin: 42,
        accuracyPct: 86,
        reactionMs: 218,
        speedMetric: 124,
        speedUnit: 'km/h bat speed',
        heartRateAvg: 148,
        workloadScore: 78,
        notes: 'Late wrist release on back-of-length outswinger improved in final 12 deliveries.',
      },
      {
        id: 'sess-102',
        date: '2026-11-14',
        sport: 'Football',
        role: 'striker',
        moduleTitle: 'VR Curled Free-Kick & Penalty Placement Lab',
        modality: 'vr',
        durationMin: 48,
        accuracyPct: 88,
        reactionMs: 204,
        speedMetric: 112,
        speedUnit: 'km/h shot velocity',
        heartRateAvg: 164,
        workloadScore: 84,
        notes: 'Consistent top-corner curl past 4-player wall; plant-foot angle 15 cm beside ball.',
      },
      {
        id: 'sess-103',
        date: '2026-11-13',
        sport: 'Kabaddi',
        role: 'raider',
        moduleTitle: 'AR Raid Escape & Toe-Touch Mat Reflex Drill',
        modality: 'ar',
        durationMin: 40,
        accuracyPct: 91,
        reactionMs: 168,
        speedMetric: 28,
        speedUnit: 'sec raid hold',
        heartRateAvg: 171,
        workloadScore: 89,
        notes: 'Rapid ankle escape from left corner chain; breath-control cant held cleanly.',
      },
      {
        id: 'sess-104',
        date: '2026-11-12',
        sport: 'Golf',
        role: 'driver',
        moduleTitle: 'AR Swing Plane & 290-Yard Fairway Dispersion',
        modality: 'ar',
        durationMin: 50,
        accuracyPct: 87,
        reactionMs: 190,
        speedMetric: 116,
        speedUnit: 'mph clubhead',
        heartRateAvg: 108,
        workloadScore: 62,
        notes: 'Shallow inside-out path reduced side spin by 420 RPM on driver tee shots.',
      },
      {
        id: 'sess-105',
        date: '2026-11-10',
        sport: 'Cricket',
        role: 'bowler',
        moduleTitle: 'AR Biomechanics: Seam Release & Front-Foot Brace',
        modality: 'ar',
        durationMin: 55,
        accuracyPct: 89,
        reactionMs: 195,
        speedMetric: 136,
        speedUnit: 'km/h release',
        heartRateAvg: 162,
        workloadScore: 84,
        notes: 'Front knee brace held at 166 degrees through release; zero lateral hip drop.',
      },
    ],
    feedbacks: [
      {
        id: 'fb-1',
        sessionId: 'sess-101',
        coachName: 'Coach Vikram Rathore',
        coachRole: 'Head Batting Coach · Cricket',
        sport: 'Cricket',
        date: '2026-11-15',
        rating: 5,
        summary: 'Head stillness through the crease is noticeably steadier. Keep your top elbow slightly higher during the trigger movement so you access the extra-cover gap cleanly.',
        actionItems: [
          'Complete 30 drop-feed drives keeping head inside the line of off-stump',
          'Maintain bat-speed target above 120 km/h without losing balance',
        ],
      },
      {
        id: 'fb-2',
        sessionId: 'sess-102',
        coachName: 'Coach Mateo Silva',
        coachRole: 'UEFA Pro Striker & Set-Piece Coach · Football',
        sport: 'Football',
        date: '2026-11-14',
        rating: 5,
        summary: 'Your hip wrap on curled strikes outside the box generated 2,400 RPM topspin. Focus on scanning the weak-side fullback 0.5 seconds before receiving in the half-space.',
        actionItems: [
          'Run 20 one-touch half-turn finishes from edge of the D-box',
          'Maintain plant foot stability on wet turf',
        ],
      },
      {
        id: 'fb-3',
        sessionId: 'sess-103',
        coachName: 'Coach Rajesh Narwal',
        coachRole: 'National Kabaddi Mat Tactician · Kabaddi',
        sport: 'Kabaddi',
        date: '2026-11-13',
        rating: 5,
        summary: 'Explosive running hand-touch speed on the left cover. Keep your center of gravity 6cm lower on the retreat back across the midline to neutralize ankle holds.',
        actionItems: [
          'Complete 15 chain-escape agility sprints under 30s cant',
        ],
      },
    ],
    certifications: [
      {
        id: 'cert-player-cr',
        title: 'Foundations of High-Performance Cricket',
        track: 'Player',
        level: 'Diploma · Tier 1',
        sport: 'Cricket',
        modulesTotal: 8,
        modulesCompleted: 6,
        enrolled: true,
        passed: false,
        feeUsd: 79,
      },
      {
        id: 'cert-coach-fb',
        title: 'Tactical Football Coaching & Match Analysis License',
        track: 'Coach',
        level: 'Level 2 Pro Diploma',
        sport: 'Football',
        modulesTotal: 10,
        modulesCompleted: 3,
        enrolled: true,
        passed: false,
        feeUsd: 139,
      },
      {
        id: 'cert-ref-kb',
        title: 'Pro Kabaddi Mat Official & Raider Biomechanics Cert',
        track: 'Umpire',
        level: 'National Mat Panel',
        sport: 'Kabaddi',
        modulesTotal: 6,
        modulesCompleted: 0,
        enrolled: false,
        passed: false,
        feeUsd: 89,
      },
      {
        id: 'cert-golf-pga',
        title: 'Golf Swing Kinematics, Ball Flight & Rules Certification',
        track: 'Coach',
        level: 'Tour Teaching Track',
        sport: 'Golf',
        modulesTotal: 8,
        modulesCompleted: 0,
        enrolled: false,
        passed: false,
        feeUsd: 159,
      },
      {
        id: 'cert-umpire-official',
        title: 'Official Cricket Match Umpire & DRS Protocol Certification',
        track: 'Umpire',
        level: 'National Panel',
        sport: 'Cricket',
        modulesTotal: 6,
        modulesCompleted: 0,
        enrolled: false,
        passed: false,
        feeUsd: 99,
      },
      {
        id: 'cert-analyst-bio',
        title: 'Multi-Sport Biomechanics & Wearable Telemetry Degree',
        track: 'Analyst',
        level: 'Certificate Degree',
        sport: 'Athletics',
        modulesTotal: 12,
        modulesCompleted: 0,
        enrolled: false,
        passed: false,
        feeUsd: 199,
      },
    ],
    providers: [
      {
        id: 'prov-vikram',
        name: 'Vikram Rathore',
        type: 'coach',
        specialty: 'Cricket Batting Mechanics, Power-Hitting & VR Video Analysis',
        sport: 'Cricket',
        rating: 4.9,
        reviewCount: 142,
        rateUsd: 65,
        location: 'Mumbai / Online Live',
        avatarUrl: '/src/assets/images/coach_portrait_one_1794825376366.jpg',
        credentials: 'Former First-Class Captain · ICC Level 3 Coach',
        unavailableSlots: ['2026-11-17|10:00', '2026-11-17|14:00', '2026-11-18|11:00'],
        bookedSlots: ['2026-11-17|16:00'],
        reviews: [
          { id: 'r1', author: 'Aarav Mehta', rating: 5, comment: 'Fixed my back-foot weight transfer in two live video sessions.', date: '2026-11-11' },
        ],
      },
      {
        id: 'prov-mateo',
        name: 'Mateo Silva',
        type: 'coach',
        specialty: 'Football Finishing, Pressing Triggers & Set-Piece Curve Mechanics',
        sport: 'Football',
        rating: 4.93,
        reviewCount: 118,
        rateUsd: 75,
        location: 'Goa / Online Live',
        credentials: 'UEFA Pro Coaching Badge · Former Striker Coach',
        unavailableSlots: ['2026-11-17|11:00', '2026-11-17|15:00'],
        bookedSlots: [],
        reviews: [
          { id: 'r-fb', author: 'Zidane D’Souza', rating: 5, comment: 'Transformed my weak-foot finishing inside the box.', date: '2026-11-12' },
        ],
      },
      {
        id: 'prov-rajesh',
        name: 'Rajesh Narwal',
        type: 'coach',
        specialty: 'Kabaddi Mat Raiding Footwork, Ankle Holds & Chain Defense',
        sport: 'Kabaddi',
        rating: 4.88,
        reviewCount: 86,
        rateUsd: 45,
        location: 'Sonipat / Online Live',
        credentials: 'Asian Games Gold Medalist · Pro Kabaddi Head Tactician',
        unavailableSlots: ['2026-11-17|09:00', '2026-11-17|14:00'],
        bookedSlots: [],
        reviews: [
          { id: 'r-kb', author: 'Pardeep Hooda', rating: 5, comment: 'Best dubki & bonus-line footwork drills available online.', date: '2026-11-08' },
        ],
      },
      {
        id: 'prov-golf-claire',
        name: 'Claire Henderson',
        type: 'coach',
        specialty: 'Golf Launch Monitor Kinematics, Short Game & Course Management',
        sport: 'Golf',
        rating: 4.96,
        reviewCount: 74,
        rateUsd: 95,
        location: 'Gurugram DLF / Online Live',
        avatarUrl: '/src/assets/images/coach_portrait_two_1794825377222.jpg',
        credentials: 'PGA Class-A Master Professional · TrackMan Certified',
        unavailableSlots: ['2026-11-17|10:00'],
        bookedSlots: [],
        reviews: [
          { id: 'r-gf', author: 'Vikramaditya Sen', rating: 5, comment: 'Dropped 4 strokes off my handicap with AR swing-plane tweaks.', date: '2026-11-10' },
        ],
      },
      {
        id: 'prov-umpire-sen',
        name: 'Suresh Menon',
        type: 'umpire',
        specialty: 'Cricket & Multi-Sport Officiating Mentorship, VAR/DRS Protocols',
        sport: 'Cricket',
        rating: 4.85,
        reviewCount: 64,
        rateUsd: 45,
        location: 'Bengaluru / Online Live',
        credentials: 'National Panel Official · 180+ First-Class Matches',
        unavailableSlots: ['2026-11-17|15:00'],
        bookedSlots: [],
        reviews: [
          { id: 'r4', author: 'Neha Verma', rating: 5, comment: 'Best mock-DRS decision training on the platform.', date: '2026-11-02' },
        ],
      },
      {
        id: 'inst-apex-hp',
        name: 'TossMore Multi-Sport Turf, Kabaddi Mat & Golf Simulator Campus',
        type: 'institute',
        specialty: 'FIFA Turf Pitch, Indoor Kabaddi Mats, TrackMan Golf Bays & Cricket Nets',
        sport: 'Football',
        rating: 4.92,
        reviewCount: 310,
        rateUsd: 40,
        location: 'Bandra-Kurla Sports Complex, Mumbai',
        avatarUrl: '/src/assets/images/hero_cricket_stadium_1794825376251.jpg',
        credentials: 'Accredited National Multi-Sport High-Performance Center',
        unavailableSlots: ['2026-11-17|18:00'],
        bookedSlots: [],
        reviews: [
          { id: 'r5', author: 'Siddharth Rao', rating: 5, comment: 'Turf, mats, and golf bays export biomechanics straight to our profile.', date: '2026-11-14' },
        ],
      },
    ],
    bookings: [
      {
        id: 'bk-1001',
        providerId: 'prov-vikram',
        providerName: 'Vikram Rathore',
        providerType: 'coach',
        date: '2026-11-17',
        timeSlot: '16:00',
        sessionType: '1-on-1 Online Video',
        status: 'Confirmed',
        feeUsd: 65,
        meetingRoomId: 'room-vikram-1600',
        createdAt: '2026-11-15T10:30:00Z',
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        type: 'feedback',
        title: 'New Coach Biomechanics Feedback',
        message: 'Mateo Silva posted tactical finishing notes on your Football VR Free-Kick session.',
        timestamp: '2026-11-15 18:20',
        read: false,
      },
      {
        id: 'notif-2',
        type: 'conflict',
        title: 'Schedule Conflict Guard Active',
        message: 'Vikram Rathore is unavailable on 2026-11-17 at 10:00 & 14:00 (National Camp). Alternative slots ready.',
        timestamp: '2026-11-15 09:00',
        read: false,
        suggestedSlots: ['2026-11-17|11:00', '2026-11-17|15:00', '2026-11-18|10:00'],
        providerId: 'prov-vikram',
      },
    ],
    wearables: [
      {
        id: 'wear-garmin',
        name: 'Forerunner 965 Pro',
        brand: 'Garmin',
        connected: true,
        lastSynced: '2026-11-16 02:30',
        heartRateBpm: 62,
        hrvMs: 74,
        vo2Max: 58.4,
        sprintLoad: 312,
        caloriesBurned: 640,
        recoveryPct: 88,
      },
      {
        id: 'wear-whoop',
        name: 'WHOOP 4.0 Athletic Strap',
        brand: 'WHOOP',
        connected: false,
        lastSynced: 'Not synced',
        heartRateBpm: 0,
        hrvMs: 0,
        vo2Max: 0,
        sprintLoad: 0,
        caloriesBurned: 0,
        recoveryPct: 0,
      },
      {
        id: 'wear-apple',
        name: 'Apple Watch Ultra 2',
        brand: 'Apple',
        connected: false,
        lastSynced: 'Not synced',
        heartRateBpm: 0,
        hrvMs: 0,
        vo2Max: 0,
        sprintLoad: 0,
        caloriesBurned: 0,
        recoveryPct: 0,
      },
    ],
    liveMatch: {
      id: 'match-nat-01',
      tournamentName: 'TossMore National T20 Cup — Quarterfinal 2',
      level: 'Nationals',
      sport: 'Cricket',
      teamA: 'Mumbai Mavericks',
      teamB: 'Bengaluru Blazers',
      scoreA: '148/3',
      oversA: '15.4',
      runsA: 148,
      wicketsA: 3,
      ballsA: 94,
      targetRuns: 186,
      status: 'Live',
      striker: { name: 'Aarav Mehta', runs: 64, balls: 39, fours: 6, sixes: 3 },
      bowler: { name: 'Pranav Kulkarni', overs: '3.4', runs: 29, wickets: 1, speedKmh: 141.6 },
      recentBalls: ['1', '4', '0', '6', '1', '2'],
      shotZones: [
        { angleDeg: 35, distancePct: 88, runs: 4 },
        { angleDeg: 110, distancePct: 95, runs: 6 },
        { angleDeg: 245, distancePct: 75, runs: 4 },
        { angleDeg: 310, distancePct: 98, runs: 6 },
        { angleDeg: 165, distancePct: 52, runs: 2 },
        { angleDeg: 75, distancePct: 45, runs: 1 },
      ],
    },
    otherLiveMatches: [
      {
        id: 'match-fb-01',
        sport: 'Football',
        tournamentName: 'TossMore National Super League — Matchday 11',
        teamA: 'Goa Mariners FC',
        teamB: 'Kerala Strikers FC',
        scoreSummary: '2 - 1',
        clockOrPhase: '74:18 · 2nd Half',
        keyStatLabel: 'xG / Shots on Target',
        keyStatValue: '2.41 xG · 7 SOT',
        recentEvents: ["18' Goal (Mariners)", "44' Goal (Strikers)", "67' Free-Kick Goal (Mariners)"],
      },
      {
        id: 'match-kb-01',
        sport: 'Kabaddi',
        tournamentName: 'Pro Kabaddi Mat Masters — Semifinal',
        teamA: 'Haryana Warriors',
        teamB: 'Pune Titans',
        scoreSummary: '34 - 31',
        clockOrPhase: '36:10 · 2nd Half',
        keyStatLabel: 'Raid Pts / Super Tackles',
        keyStatValue: '21 Raid · 3 Super Tackles',
        recentEvents: ['Super Raid +3', 'Ankle Hold +1', 'Do-or-Die Raid +2', 'Bonus +1'],
      },
      {
        id: 'match-gf-01',
        sport: 'Golf',
        tournamentName: 'TossMore National Amateur Masters — Round 4',
        teamA: 'Rohan Malhotra (-11)',
        teamB: 'Karan Oberoi (-9)',
        scoreSummary: '-11 Thru 16',
        clockOrPhase: 'Hole 17 · Par 3 (198 yds)',
        keyStatLabel: 'Fairways / GIR',
        keyStatValue: '86% FIR · 81% GIR',
        recentEvents: ['Hole 14 Birdie', 'Hole 15 Par', 'Hole 16 Eagle'],
      },
    ],
    leaderboard: [
      { id: 'lb-1', rank: 1, athleteName: 'Aarav Mehta', academy: 'TossMore Mumbai HP', city: 'Mumbai', sport: 'Cricket', role: 'batsman', matches: 14, primaryStatLabel: 'Runs', primaryStatValue: 712, secondaryStatLabel: 'Wickets', secondaryStatValue: 2, strikeRate: 152.4, ratingPoints: 942 },
      { id: 'lb-2', rank: 2, athleteName: 'Zidane D’Souza', academy: 'Goa Pro Turf', city: 'Panaji', sport: 'Football', role: 'striker', matches: 16, primaryStatLabel: 'Goals', primaryStatValue: 19, secondaryStatLabel: 'Assists', secondaryStatValue: 8, strikeRate: 71.5, ratingPoints: 934 },
      { id: 'lb-3', rank: 3, athleteName: 'Naveen Malik', academy: 'Sonipat Mat Guild', city: 'Sonipat', sport: 'Kabaddi', role: 'raider', matches: 18, primaryStatLabel: 'Raid Pts', primaryStatValue: 214, secondaryStatLabel: 'Tackles', secondaryStatValue: 14, strikeRate: 64.2, ratingPoints: 931 },
      { id: 'lb-4', rank: 4, athleteName: 'Kabir Sharma', academy: 'Delhi Pace Lab', city: 'New Delhi', sport: 'Cricket', role: 'bowler', matches: 14, primaryStatLabel: 'Runs', primaryStatValue: 118, secondaryStatLabel: 'Wickets', secondaryStatValue: 27, strikeRate: 119.0, ratingPoints: 928 },
      { id: 'lb-5', rank: 5, athleteName: 'Rohan Malhotra', academy: 'DLF Links Academy', city: 'Gurugram', sport: 'Golf', role: 'driver', matches: 11, primaryStatLabel: 'Birdies', primaryStatValue: 54, secondaryStatLabel: 'Eagles', secondaryStatValue: 6, strikeRate: 81.4, ratingPoints: 921 },
      { id: 'lb-6', rank: 6, athleteName: 'Devika Nair', academy: 'Kochi Turf Club', city: 'Kochi', sport: 'Cricket', role: 'all-rounder', matches: 13, primaryStatLabel: 'Runs', primaryStatValue: 486, secondaryStatLabel: 'Wickets', secondaryStatValue: 19, strikeRate: 144.8, ratingPoints: 915 },
      { id: 'lb-7', rank: 7, athleteName: 'Ishaan Verma', academy: 'Bengaluru Strikers', city: 'Bengaluru', sport: 'Cricket', role: 'wicketkeeper', matches: 14, primaryStatLabel: 'Runs', primaryStatValue: 540, secondaryStatLabel: 'Dismissals', secondaryStatValue: 22, strikeRate: 148.2, ratingPoints: 896 },
    ],
    tournaments: [
      {
        id: 'tourn-open',
        name: 'TossMore Nationwide Pro-Am Cricket Cup',
        sport: 'Cricket',
        tier: 'Open Nationals',
        startDate: '2027-01-10',
        city: 'Mumbai',
        prizePoolUsd: 50000,
        entryFeeUsd: 90,
        spotsRemaining: 6,
        registered: false,
        organizerName: 'Western Cricket Collective',
        hostFeePaid: true,
        sponsors: [
          {
            id: 'spn-1',
            brandName: 'Kookaburra Certified Pro Shop',
            tier: 'Title Sponsor',
            contributionUsd: 1200,
            date: '2026-11-12',
          },
        ],
        joinedTeams: [
          {
            id: 'jte-1',
            teamName: 'BKC Titans XI',
            captainName: 'Rohan Iyer',
            city: 'Mumbai',
            feePaidUsd: 90,
            date: '2026-11-14',
          },
        ],
      },
      {
        id: 'tourn-foot',
        name: 'National 11v11 & 7v7 Football Championship',
        sport: 'Football',
        tier: 'Semi-Pro',
        startDate: '2026-12-22',
        city: 'Goa',
        prizePoolUsd: 18000,
        entryFeeUsd: 55,
        spotsRemaining: 10,
        registered: false,
        organizerName: 'Coastal Turf Federation',
        hostFeePaid: true,
        sponsors: [
          {
            id: 'spn-2',
            brandName: 'EuroTurf Direct',
            tier: 'Kit & Ball Partner',
            contributionUsd: 650,
            date: '2026-11-13',
          },
        ],
        joinedTeams: [
          {
            id: 'jte-2',
            teamName: 'Goa Mariners Reserves',
            captainName: 'Zidane D’Souza',
            city: 'Panaji',
            feePaidUsd: 55,
            date: '2026-11-15',
          },
        ],
      },
      {
        id: 'tourn-kabaddi',
        name: 'All-India Pro Mat Kabaddi Challenge',
        sport: 'Kabaddi',
        tier: 'Collegiate',
        startDate: '2026-12-12',
        city: 'Jaipur',
        prizePoolUsd: 14000,
        entryFeeUsd: 40,
        spotsRemaining: 9,
        registered: false,
        organizerName: 'MatPro National Guild',
        hostFeePaid: true,
        sponsors: [
          {
            id: 'spn-3',
            brandName: 'MatPro Athletics',
            tier: 'Streaming Partner',
            contributionUsd: 400,
            date: '2026-11-14',
          },
        ],
        joinedTeams: [],
      },
      {
        id: 'tourn-golf',
        name: 'TossMore National Amateur Golf Strokeplay Open',
        sport: 'Golf',
        tier: 'Open Nationals',
        startDate: '2027-01-24',
        city: 'Gurugram',
        prizePoolUsd: 25000,
        entryFeeUsd: 75,
        spotsRemaining: 12,
        registered: false,
        organizerName: 'DLF Links Academy',
        hostFeePaid: true,
        sponsors: [],
        joinedTeams: [],
      },
      {
        id: 'tourn-u16',
        name: 'National Grassroots U-16 Multi-Sport Shield',
        sport: 'Athletics',
        tier: 'Grassroots U-16',
        startDate: '2026-12-05',
        city: 'Pune',
        prizePoolUsd: 6000,
        entryFeeUsd: 25,
        spotsRemaining: 14,
        registered: false,
        organizerName: 'Patiala Youth Athletics',
        hostFeePaid: true,
        sponsors: [],
        joinedTeams: [],
      },
    ],
    roster: [
      { id: 'ros-1', name: 'Aarav Mehta', sport: 'Cricket', role: 'batsman', age: 21, readinessPct: 94, status: 'Active', jerseyNo: 18, inStartingXI: true },
      { id: 'ros-2', name: 'Zidane D’Souza', sport: 'Football', role: 'striker', age: 20, readinessPct: 93, status: 'Active', jerseyNo: 9, inStartingXI: true },
      { id: 'ros-3', name: 'Naveen Malik', sport: 'Kabaddi', role: 'raider', age: 22, readinessPct: 95, status: 'Active', jerseyNo: 11, inStartingXI: true },
      { id: 'ros-4', name: 'Rohan Malhotra', sport: 'Golf', role: 'tour player', age: 24, readinessPct: 91, status: 'Active', jerseyNo: 1, inStartingXI: true },
      { id: 'ros-5', name: 'Kabir Sharma', sport: 'Cricket', role: 'bowler', age: 20, readinessPct: 88, status: 'Active', jerseyNo: 99, inStartingXI: true },
      { id: 'ros-6', name: 'Siddharth Rao', sport: 'Football', role: 'goalkeeper', age: 24, readinessPct: 72, status: 'Rehab', jerseyNo: 24, inStartingXI: false },
    ],
    clubSchedule: [
      { id: 'cs-1', title: 'High-Intensity Turf Net & Football Finishing', sport: 'Football', type: 'Net Practice', date: '2026-11-17', time: '07:00', venue: 'TossMore Turf Pitch 1' },
      { id: 'cs-2', title: 'Kabaddi Mat Chain Tackle & Endurance Test', sport: 'Kabaddi', type: 'Fitness Combine', date: '2026-11-19', time: '08:30', venue: 'Indoor Mat Arena B' },
      { id: 'cs-3', title: 'TrackMan Golf Dispersion & Short-Game Clinic', sport: 'Golf', type: 'Tactical Review', date: '2026-11-20', time: '10:00', venue: 'Sim Bay 4' },
      { id: 'cs-4', title: 'League Match vs Western Strikers', sport: 'Cricket', type: 'League Match', date: '2026-11-21', time: '14:30', venue: 'BKC Stadium Oval' },
    ],
    prospects: [
      { id: 'sp-1', name: 'Yashvardhan Singh', age: 18, city: 'Jaipur', sport: 'Cricket', role: 'bowler', primaryMetricLabel: 'Bowl Speed', primaryMetricValue: '142.4 km/h', secondaryMetricLabel: 'Bat Speed', secondaryMetricValue: '108 km/h', sprint20mSec: 2.84, combinePercentile: 97, shortlisted: true, trialInvited: false },
      { id: 'sp-2', name: 'Arjun Chhetri', age: 19, city: 'Shillong', sport: 'Football', role: 'striker', primaryMetricLabel: 'Shot Speed', primaryMetricValue: '116 km/h', secondaryMetricLabel: 'Dribble Index', secondaryMetricValue: '94%', sprint20mSec: 2.71, combinePercentile: 96, shortlisted: true, trialInvited: false },
      { id: 'sp-3', name: 'Pawan Hooda', age: 18, city: 'Rohtak', sport: 'Kabaddi', role: 'raider', primaryMetricLabel: 'Raid Strike', primaryMetricValue: '71%', secondaryMetricLabel: 'Escape Reflex', secondaryMetricValue: '164 ms', sprint20mSec: 2.78, combinePercentile: 95, shortlisted: false, trialInvited: false },
      { id: 'sp-4', name: 'Meera Kapoor', age: 20, city: 'Chandigarh', sport: 'Golf', role: 'driver', primaryMetricLabel: 'Carry Avg', primaryMetricValue: '268 yds', secondaryMetricLabel: 'GIR %', secondaryMetricValue: '82%', sprint20mSec: 3.12, combinePercentile: 94, shortlisted: false, trialInvited: false },
    ],
    socialPosts: [
      {
        id: 'post-1',
        authorName: 'Aarav Mehta',
        authorRole: 'All-Rounder · Cricket',
        sport: 'Cricket',
        timestamp: '2 hours ago',
        category: 'Milestone',
        content: 'Shaved 24ms off my 145 km/h outswinger pick-up in the VR Pitch Simulator today.',
        metricSummary: '218ms reaction · 124 km/h bat speed',
        likes: 42,
        likedByMe: false,
        comments: [
          { id: 'c1', author: 'Vikram Rathore', text: 'Clean head alignment throughout the last two overs.', timestamp: '1 hour ago' },
        ],
      },
      {
        id: 'post-2',
        authorName: 'Zidane D’Souza',
        authorRole: 'Forward · Goa Mariners FC',
        sport: 'Football',
        timestamp: '3 hours ago',
        category: 'Match Highlight',
        content: 'Hit 8/10 top-corner free-kicks in the VR Set-Piece Lab before today’s turf session.',
        metricSummary: '112 km/h strike · 2,400 RPM',
        likes: 51,
        likedByMe: false,
        comments: [],
      },
      {
        id: 'post-3',
        authorName: 'Naveen Malik',
        authorRole: 'Lead Raider · Sonipat Mat Guild',
        sport: 'Kabaddi',
        timestamp: '5 hours ago',
        category: 'Training Clip',
        content: 'Completed 20 consecutive chain-escape raids with Coach Rajesh under 170ms reaction threshold.',
        metricSummary: '168ms mat reflex · 91% escape',
        likes: 38,
        likedByMe: true,
        comments: [],
      },
    ],
    podcastEpisodes: [
      {
        id: 'pod-24',
        episodeNumber: 24,
        title: 'Reading 145 km/h Late Swing & Trigger Discipline Under Lights',
        sport: 'Cricket',
        guestName: 'Aarav Mehta & Vikram Rathore',
        guestRole: 'Mumbai Mavericks Captain & ICC Level 3 Coach',
        hostName: 'Rhea Kapoor',
        durationSec: 1620,
        publishedAt: '2026-11-15',
        summary: 'How VR pace pods and 240fps trigger adjustments helped Aarav shave 24ms off his decision window against high-pace outswingers.',
        bookmarked: true,
        chapters: [
          { timeSec: 0, label: '00:00 · Pre-Match Mental Routine', quote: 'You don’t wait for the crease; your eyes lock on the bowler’s wrist two steps before release.' },
          { timeSec: 340, label: '05:40 · VR Corridor Reaction Drills', quote: 'Seeing 60 simulated 145 km/h deliveries in VR trained my front shoulder to stay closed longer.' },
          { timeSec: 910, label: '15:10 · Transitioning to T20 Death Overs', quote: 'Balance beats brute force—keep your head still even when clearing the front hip.' },
        ],
        listenerQuestions: [
          { id: 'pq-1', author: 'Ishaan Verma', question: 'How do you reset mentally after playing and missing two consecutive corridor deliveries?', timestamp: '1 hour ago' },
        ],
      },
      {
        id: 'pod-23',
        episodeNumber: 23,
        title: 'Inside the 24-Yard Curled Free-Kick & Half-Space Scanning',
        sport: 'Football',
        guestName: 'Zidane D’Souza',
        guestRole: 'Leading Striker · Goa Mariners FC',
        hostName: 'Rhea Kapoor',
        durationSec: 1480,
        publishedAt: '2026-11-12',
        summary: 'Zidane breaks down his pre-reception shoulder scans, plant-foot geometry, and how GPS sprint telemetry shapes his matchday workload.',
        bookmarked: false,
        chapters: [
          { timeSec: 0, label: '00:00 · Finding Pockets Between Lines', quote: 'Scanning twice before the pass arrives gives you half a second nobody else sees.' },
          { timeSec: 420, label: '07:00 · Topspin Whip Mechanics', quote: 'Lock the ankle and brush the lower outer quadrant—spin brings the ball down over the wall.' },
          { timeSec: 980, label: '16:20 · Recovery & HRV Monitoring', quote: 'My WHOOP recovery score tells Coach Mateo when to push sprints vs technical finishing.' },
        ],
        listenerQuestions: [],
      },
      {
        id: 'pod-22',
        episodeNumber: 22,
        title: 'Surviving the 30-Second Do-or-Die Raid & Chain Breaks',
        sport: 'Kabaddi',
        guestName: 'Naveen Malik',
        guestRole: 'Lead Raider · Haryana Warriors',
        hostName: 'Arjun Bedi',
        durationSec: 1320,
        publishedAt: '2026-11-09',
        summary: 'An inside look at Pro Kabaddi mat tactics, ankle-hold escapes, breath-cant stamina, and scouting young rural raiders.',
        bookmarked: false,
        chapters: [
          { timeSec: 0, label: '00:00 · Reading the Corner Defender’s Weight', quote: 'Watch the defender’s outside heel—if it lifts, the ankle dive is coming.' },
          { timeSec: 390, label: '06:30 · The Dubki Timing Window', quote: 'Drop your shoulders 15 cm lower the instant the cover chain commits forward.' },
          { timeSec: 860, label: '14:20 · Mat Shoes & Knee Protection', quote: 'Lateral grip on synthetic mats decides whether you pivot back over the midline.' },
        ],
        listenerQuestions: [],
      },
      {
        id: 'pod-21',
        episodeNumber: 21,
        title: 'Dropping 4 Strokes via AR Swing-Plane Kinematics',
        sport: 'Golf',
        guestName: 'Rohan Malhotra',
        guestRole: 'Tour Amateur Leader · DLF Links Academy',
        hostName: 'Arjun Bedi',
        durationSec: 1540,
        publishedAt: '2026-11-05',
        summary: 'Rohan shares how shallowing the shaft on AR biomechanics and tracking greens-in-regulation under crosswinds propelled his -11 run.',
        bookmarked: false,
        chapters: [
          { timeSec: 0, label: '00:00 · Tee Strategy in 15mph Crosswinds', quote: 'Take one extra club, grip down half an inch, and commit to a smooth 80% swing.' },
          { timeSec: 480, label: '08:00 · Fixing Over-the-Top Dispersion', quote: 'Visualizing the AR lead-elbow window cut my lateral dispersion in half.' },
          { timeSec: 1020, label: '17:00 · Pressure Putting on Final Holes', quote: 'Pick a dimple two inches ahead of the ball and trust your pre-shot speed.' },
        ],
        listenerQuestions: [],
      },
    ],
    sportsNews: [
      {
        id: 'news-1',
        title: 'Mumbai Mavericks Chase 186 in Thrilling National T20 Quarterfinal',
        sport: 'Cricket',
        category: 'Tournament Desk',
        publishedAt: '35 mins ago',
        readTimeMin: 3,
        summary: 'Aarav Mehta’s unbeaten 64 off 39 balls keeps Mumbai ahead of the asking rate heading into the death overs.',
        body: 'In front of a packed BKC Oval, Mumbai Mavericks kept pace with Bengaluru Blazers’ 186 target thanks to clinical corridor driving and smart strike rotation. TossMore live telemetry recorded a peak bat speed of 128 km/h during Aarav’s extra-cover lofted six in the 14th over.',
      },
      {
        id: 'news-2',
        title: 'Goa Mariners FC Clinch Late Set-Piece Lead Behind Zidane D’Souza Brace',
        sport: 'Football',
        category: 'Player Spotlight',
        publishedAt: '1 hour ago',
        readTimeMin: 4,
        summary: 'A 24-yard curled free-kick in the 67th minute pushed Goa Mariners to 2-1 over Kerala Strikers in National Super League action.',
        body: 'Goa Mariners FC showcased crisp half-space pressing triggers throughout the second half. Forward Zidane D’Souza bent a 2,400 RPM strike over the four-player wall after generating 2.41 expected goals (xG) across 74 minutes of high-tempo football.',
      },
      {
        id: 'news-3',
        title: 'Haryana Warriors Edge Pune Titans in High-Scoring Kabaddi Mat Semifinal',
        sport: 'Kabaddi',
        category: 'Tournament Desk',
        publishedAt: '2 hours ago',
        readTimeMin: 3,
        summary: 'Three super tackles and a decisive 3-point super raid swung momentum 34-31 late in the second half.',
        body: 'With both defenses locking down the bonus line early, Haryana Warriors’ raiders shifted to rapid toe-touches against the right cover before unleashing a three-point super raid with under four minutes left on the match clock.',
      },
      {
        id: 'news-4',
        title: 'Rohan Malhotra Cards 65 to Open Two-Shot Lead at National Amateur Golf Masters',
        sport: 'Golf',
        category: 'Sports Science',
        publishedAt: '4 hours ago',
        readTimeMin: 3,
        summary: 'An eagle on Hole 16 and 86% fairway accuracy separated Malhotra from the chasing pack in Gurugram.',
        body: 'Working closely with PGA coach Claire Henderson, Malhotra leaned on knockdown iron flights to hold firm greens despite swirling afternoon winds, hitting 81% Greens in Regulation across Round 4.',
      },
      {
        id: 'news-5',
        title: 'National Scouting Combine Invites Top 12 U-19 Multi-Sport Prospects',
        sport: 'Athletics',
        category: 'Transfer & Scouting',
        publishedAt: '6 hours ago',
        readTimeMin: 2,
        summary: 'Verified 20m sprint splits, wearable VO2 Max scores, and AR biomechanics grades unlock direct academy trials.',
        body: 'Scouts across Cricket, Football, Kabaddi, and Golf academies finalized this month’s National Combine shortlist using verified wearable recovery and reaction metrics recorded directly on TossMore.',
      },
    ],
    activeYoutubeStreamId: 'yt-1',
    youtubeLiveStreams: [
      {
        id: 'yt-1',
        youtubeId: 'Nhg5-krCGDc',
        title: 'Kane Williamson: The Fab Four, World Cup Heartbreak & Life After Cricket',
        channelName: 'Stick to Cricket · YouTube Live',
        sport: 'Cricket',
        hostAndGuest: 'Kane Williamson with Michael Vaughan, Alastair Cook & David Lloyd',
        isLive: true,
        viewerCount: 1840,
        featuredProductId: 'mkt-1',
        startedLabel: 'Live Stream · Cricket Edition',
        chatMessages: [
          { id: 'ytc-1', author: 'Aarav Mehta', text: 'Watching Williamson explain soft-hand defence against late seam movement!', timestamp: '03:04' },
          { id: 'ytc-2', author: 'Vikram Rathore', text: 'Notice how he talks about bat balance—matches the Grade-A English Willow specs in the store.', timestamp: '03:08' },
        ],
      },
      {
        id: 'yt-2',
        youtubeId: 'gHQo3UafM54',
        title: 'Sunil Chhetri on Indian Football, Leadership, Recovery & Mindset',
        channelName: 'Figuring Out Sports · YouTube Live',
        sport: 'Football',
        hostAndGuest: 'Sunil Chhetri interviewed by Raj Shamani',
        isLive: true,
        viewerCount: 1420,
        featuredProductId: 'mkt-3',
        startedLabel: 'Live Stream · Football Edition',
        chatMessages: [
          { id: 'ytc-3', author: 'Zidane D’Souza', text: 'Great breakdown on longevity, ankle conditioning, and off-ball movement.', timestamp: '02:51' },
        ],
      },
      {
        id: 'yt-3',
        youtubeId: 'SiG5aurp9GY',
        title: 'Mohammadreza Shadloui Secrets to Kabaddi Mat Dominance | The Panga Podcast',
        channelName: 'Pro Kabaddi Official · YouTube',
        sport: 'Kabaddi',
        hostAndGuest: 'Mohammadreza Shadloui · Corner Defender Breakdown',
        isLive: true,
        viewerCount: 960,
        featuredProductId: 'mkt-4',
        startedLabel: 'Live Stream · Kabaddi Edition',
        chatMessages: [
          { id: 'ytc-4', author: 'Naveen Malik', text: 'Essential watch for anyone working on ankle-hold timing and lateral mat grip.', timestamp: '02:39' },
        ],
      },
      {
        id: 'yt-4',
        youtubeId: 'JsaIj1rEnco',
        title: 'Kuldeep Yadav Interview: Wrist Spin Mechanics, RPM & Match Strategy',
        channelName: 'Following On Cricket · YouTube',
        sport: 'Cricket',
        hostAndGuest: 'Kuldeep Yadav · Spin Biomechanics & Radar Review',
        isLive: false,
        viewerCount: 715,
        featuredProductId: 'mkt-6',
        startedLabel: 'Featured YouTube Broadcast',
        chatMessages: [],
      },
    ],
    marketplace: [
      {
        id: 'mkt-1',
        title: 'Grade-A English Willow Pro Bat + Swing Telemetry',
        category: 'Bats & Blades',
        sport: 'Cricket',
        condition: 'New',
        priceUsd: 295,
        sellerName: 'Kookaburra Certified Pro Shop',
        sellerRating: 4.9,
        reviewCount: 84,
        imageUrl: '/src/assets/images/gear_cricket_bat_1794825377795.jpg',
        specs: '1180g · 9 straight grains · Includes Bluetooth handle sensor',
        inStock: 7,
      },
      {
        id: 'mkt-2',
        title: 'Carbon-Shell Helmet & Pro Kangaroo Wicketkeeping Gloves',
        category: 'Protective & Gloves',
        sport: 'Cricket',
        condition: 'New',
        priceUsd: 185,
        sellerName: 'TossMore Gear Exchange',
        sellerRating: 4.85,
        reviewCount: 51,
        imageUrl: '/src/assets/images/gear_wk_gloves_1794825378790.jpg',
        specs: 'BS7928 certified titanium grille · Octopus-grip palm',
        inStock: 12,
      },
      {
        id: 'mkt-7',
        title: '4-Piece Hand-Stitched Alum-Tanned Match Cricket Balls (6-Pack)',
        category: 'Balls & Shuttles',
        sport: 'Cricket',
        condition: 'New',
        priceUsd: 96,
        sellerName: 'SG Pro Match Supply',
        sellerRating: 4.93,
        reviewCount: 112,
        imageUrl: '/src/assets/images/gear_sports_balls_1794827806613.jpg',
        specs: '156g match weight · Pronounced seam for 80-over swing & bounce',
        inStock: 24,
      },
      {
        id: 'mkt-8',
        title: 'Pro Split-Finger Leather Batting Gloves (Pair)',
        category: 'Protective & Gloves',
        sport: 'Cricket',
        condition: 'New',
        priceUsd: 64,
        sellerName: 'TossMore Gear Exchange',
        sellerRating: 4.88,
        reviewCount: 73,
        imageUrl: '/src/assets/images/gear_wk_gloves_1794825378790.jpg',
        specs: 'Pittards sheep-leather palm · High-density dual-layer finger armor',
        inStock: 19,
      },
      {
        id: 'mkt-3',
        title: 'Carbon-Plate Firm-Ground Football Boots + GPS Vest Pod',
        category: 'Footwear & Turf',
        sport: 'Football',
        condition: 'New',
        priceUsd: 215,
        sellerName: 'EuroTurf Direct',
        sellerRating: 4.91,
        reviewCount: 63,
        imageUrl: '/src/assets/images/gear_football_boots_1794827806809.jpg',
        specs: '195g knitted upper · 10Hz sprint GPS vest syncs to TossMore',
        inStock: 9,
      },
      {
        id: 'mkt-9',
        title: 'FIFA Quality Pro Thermally Bonded Match Football',
        category: 'Balls & Shuttles',
        sport: 'Football',
        condition: 'New',
        priceUsd: 118,
        sellerName: 'EuroTurf Direct',
        sellerRating: 4.95,
        reviewCount: 94,
        imageUrl: '/src/assets/images/gear_sports_balls_1794827806613.jpg',
        specs: 'Size 5 · Zero-stitch panel flight stability · All-weather textured PU',
        inStock: 16,
      },
      {
        id: 'mkt-10',
        title: 'Pro 4mm Contact-Latex Goalkeeper Grip Gloves',
        category: 'Protective & Gloves',
        sport: 'Football',
        condition: 'New',
        priceUsd: 78,
        sellerName: 'KeeperLab Europe',
        sellerRating: 4.89,
        reviewCount: 47,
        imageUrl: '/src/assets/images/gear_football_boots_1794827806809.jpg',
        specs: 'Negative-cut thumb wrap · Removable finger spines · Dual wrist strap',
        inStock: 14,
      },
      {
        id: 'mkt-4',
        title: 'Pro Mat-Grip Kabaddi Shoes & Compression Knee Armor',
        category: 'Kabaddi & Mat Gear',
        sport: 'Kabaddi',
        condition: 'New',
        priceUsd: 88,
        sellerName: 'MatPro Athletics',
        sellerRating: 4.87,
        reviewCount: 44,
        imageUrl: '/src/assets/images/gear_football_boots_1794827806809.jpg',
        specs: 'Zero-slip gum rubber mat sole · Dual-hinge shock knee sleeves',
        inStock: 18,
      },
      {
        id: 'mkt-11',
        title: 'Raider Compression Elbow, Ankle & Wrist Guard Kit',
        category: 'Protective & Gloves',
        sport: 'Kabaddi',
        condition: 'New',
        priceUsd: 54,
        sellerName: 'MatPro Athletics',
        sellerRating: 4.84,
        reviewCount: 38,
        imageUrl: '/src/assets/images/gear_wk_gloves_1794825378790.jpg',
        specs: 'Anti-abrasion neoprene weave · Stabilizes ankles on mat pivots',
        inStock: 22,
      },
      {
        id: 'mkt-5',
        title: 'Titanium 460cc Tour Driver + Laser Slope Rangefinder',
        category: 'Rackets & Clubs',
        sport: 'Golf',
        condition: 'Pro-Used',
        priceUsd: 460,
        sellerName: 'Links Guild Pro Shop',
        sellerRating: 4.94,
        reviewCount: 29,
        imageUrl: '/src/assets/images/gear_golf_athletics_1794827807713.jpg',
        specs: '9.5° stiff graphite shaft · 1,200-yd tournament slope rangefinder',
        inStock: 3,
      },
      {
        id: 'mkt-12',
        title: 'Cabretta Leather Tour Golf Glove + 12-Pack Urethane Balls',
        category: 'Balls & Shuttles',
        sport: 'Golf',
        condition: 'New',
        priceUsd: 68,
        sellerName: 'Links Guild Pro Shop',
        sellerRating: 4.91,
        reviewCount: 57,
        imageUrl: '/src/assets/images/gear_golf_athletics_1794827807713.jpg',
        specs: '3-piece tour spin urethane golf balls + ultra-thin cabretta glove',
        inStock: 15,
      },
      {
        id: 'mkt-13',
        title: '305g Carbon Tour Tennis Racket + 4 Pressurized Ball Cans',
        category: 'Rackets & Clubs',
        sport: 'Tennis',
        condition: 'New',
        priceUsd: 235,
        sellerName: 'Baseline Court Exchange',
        sellerRating: 4.92,
        reviewCount: 66,
        imageUrl: '/src/assets/images/gear_rackets_shuttles_1794827807111.jpg',
        specs: '16x19 open spin string bed · 100 sq in head · Pro felt tour balls',
        inStock: 11,
      },
      {
        id: 'mkt-14',
        title: 'Graphite Smash Badminton Racket + 12 Feather Shuttlecocks',
        category: 'Rackets & Clubs',
        sport: 'Badminton',
        condition: 'New',
        priceUsd: 165,
        sellerName: 'ShuttleCraft Pro',
        sellerRating: 4.9,
        reviewCount: 81,
        imageUrl: '/src/assets/images/gear_rackets_shuttles_1794827807111.jpg',
        specs: '4U head-heavy frame (30 lbs tension) · Grade-1 goose feather tube',
        inStock: 17,
      },
      {
        id: 'mkt-15',
        title: 'Official Size-7 Composite Leather Match Basketball',
        category: 'Balls & Shuttles',
        sport: 'Basketball',
        condition: 'New',
        priceUsd: 74,
        sellerName: 'HoopLab Direct',
        sellerRating: 4.89,
        reviewCount: 53,
        imageUrl: '/src/assets/images/gear_sports_balls_1794827806613.jpg',
        specs: 'Deep-channel microfiber cover · Indoor hardwood & outdoor grip',
        inStock: 21,
      },
      {
        id: 'mkt-16',
        title: 'Carbon-Plate Track Sprint Spikes (7-Pin Titanium)',
        category: 'Footwear & Turf',
        sport: 'Athletics',
        condition: 'New',
        priceUsd: 192,
        sellerName: 'TrackVelocity Lab',
        sellerRating: 4.94,
        reviewCount: 41,
        imageUrl: '/src/assets/images/gear_golf_athletics_1794827807713.jpg',
        specs: '148g ultra-light Pebax plate · Ideal for 100m–400m & hurdles',
        inStock: 8,
      },
      {
        id: 'mkt-6',
        title: 'Smart Ball Seam & Spin Radar Pod (160 km/h)',
        category: 'Smart Sensors',
        sport: 'Cricket',
        condition: 'New',
        priceUsd: 240,
        sellerName: 'Velocity Sports Lab',
        sellerRating: 4.92,
        reviewCount: 39,
        imageUrl: '/src/assets/images/gear_cricket_bat_1794825377795.jpg',
        specs: 'Doppler release speed, RPM & pitch-map syncs directly to TossMore',
        inStock: 5,
      },
      {
        id: 'mkt-17',
        title: 'Pro Dual-Wheel Digital Bowling Machine (160 km/h + Swing & Spin)',
        category: 'Training Machines',
        sport: 'Cricket',
        condition: 'New',
        priceUsd: 1250,
        sellerName: 'Velocity Sports Lab',
        sellerRating: 4.96,
        reviewCount: 42,
        imageUrl: '/src/assets/images/gear_bowling_batting_machine_1794828159509.jpg',
        specs: '60–160 km/h variable pace · Inswing, outswing, off-spin & leg-spin dials · 12-ball auto-feeder',
        inStock: 4,
      },
      {
        id: 'mkt-18',
        title: 'Auto-Feed Batting Practice & Soft-Toss Machine (24-Ball Hopper)',
        category: 'Training Machines',
        sport: 'Cricket',
        condition: 'New',
        priceUsd: 690,
        sellerName: 'TossMore Gear Exchange',
        sellerRating: 4.91,
        reviewCount: 58,
        imageUrl: '/src/assets/images/gear_bowling_batting_machine_1794828159509.jpg',
        specs: 'Adjustable 4–12s interval timer · Supports leather, dimple & tennis balls · Battery/AC power',
        inStock: 9,
      },
      {
        id: 'mkt-19',
        title: 'Programmable Multi-Sport Ball Launcher Machine (Football & Tennis)',
        category: 'Training Machines',
        sport: 'Football',
        condition: 'New',
        priceUsd: 840,
        sellerName: 'EuroTurf Direct',
        sellerRating: 4.89,
        reviewCount: 27,
        imageUrl: '/src/assets/images/gear_bowling_batting_machine_1794828159509.jpg',
        specs: 'Random oscillation & topspin curve feeds · App-controlled drill sequences up to 120 km/h',
        inStock: 6,
      },
    ],
    transactions: [
      {
        id: 'tx-9001',
        date: '2026-11-15',
        description: '1-on-1 Online Video Session — Vikram Rathore',
        amountUsd: 65,
        method: 'UPI',
        status: 'Paid',
        referenceCode: 'APX-UPI-849201',
      },
    ],
    liveClass: {
      title: 'Multi-Sport Doubt Clearing: Reaction Speed, Finishing & Mat Footwork',
      instructor: 'Vikram Rathore, Mateo Silva & Rajesh Narwal',
      topic: 'Open Interactive Tactical Board & Video Q&A',
      attendeesCount: 46,
      raisedHands: ['Rohan Iyer'],
      messages: [
        { id: 'msg-1', sender: 'Vikram Rathore', role: 'Coach', text: 'Welcome everyone! Drop your Cricket, Football, Kabaddi, or Golf doubts below or raise your hand to share camera.', timestamp: '02:20' },
        { id: 'msg-2', sender: 'Rohan Iyer', role: 'Student', text: 'Coach Mateo, when taking a curled free-kick from 24 yards, how wide should my approach angle be?', timestamp: '02:24' },
        { id: 'msg-3', sender: 'Mateo Silva', role: 'Coach', text: 'Keep a 35–40° approach angle and lock your ankle while brushing across the lower outer quadrant.', timestamp: '02:26' },
      ],
      strokes: [
        {
          id: 'stroke-seed-1',
          color: '#059669',
          points: [
            { x: 140, y: 40 },
            { x: 145, y: 120 },
            { x: 162, y: 210 },
          ],
        },
      ],
    },
    playerReviews: [
      {
        id: 'rev-1',
        playerName: 'Aarav Mehta',
        sport: 'Cricket',
        roleOrAcademy: 'All-Rounder · Mumbai Mavericks Academy',
        rating: 5,
        reasonHighlight: 'VR Reaction Pods & Direct Coach Feedback',
        reviewText: 'Before TossMore I struggled with 145 km/h late outswingers. Running 60 deliveries a day inside the VR pace pod and getting frame-by-frame notes from Coach Vikram cut my trigger delay by 24ms in three weeks.',
        verifiedStudent: true,
        helpfulCount: 38,
        date: '2026-11-15',
      },
      {
        id: 'rev-2',
        playerName: 'Zidane D’Souza',
        sport: 'Football',
        roleOrAcademy: 'Striker · Goa Mariners FC Youth',
        rating: 5,
        reasonHighlight: 'Wearable GPS Telemetry & Live Doubt Clearing',
        reviewText: 'Every sports student chooses TossMore because nothing is guesswork anymore. My sprint load, heart-rate recovery, and curled free-kick angle all sit in one place where Coach Mateo reviews them live.',
        verifiedStudent: true,
        helpfulCount: 29,
        date: '2026-11-14',
      },
      {
        id: 'rev-3',
        playerName: 'Naveen Malik',
        sport: 'Kabaddi',
        roleOrAcademy: 'Lead Raider · Haryana Warriors',
        rating: 5,
        reasonHighlight: 'Nationwide Tournaments & Pro Scouting',
        reviewText: 'In rural academies we never had direct pathways to national selectors. After uploading my raid stats and competing in the TossMore National Open Cup, three pro scouts invited me to trials.',
        verifiedStudent: true,
        helpfulCount: 34,
        date: '2026-11-12',
      },
      {
        id: 'rev-4',
        playerName: 'Rohan Malhotra',
        sport: 'Golf',
        roleOrAcademy: 'Amateur Tour · DLF Links Guild',
        rating: 5,
        reasonHighlight: 'AR Swing-Plane Kinematics & Gear Store',
        reviewText: 'Seeing my shaft plane in AR right after each range session shaved 4 strokes off my tournament card—and ordering my rangefinder and Cabretta gloves on the same platform saved days of setup.',
        verifiedStudent: true,
        helpfulCount: 21,
        date: '2026-11-10',
      },
      {
        id: 'rev-5',
        playerName: 'Ananya Rao',
        sport: 'Tennis',
        roleOrAcademy: 'Collegiate Captain · Bengaluru Baseline',
        rating: 5,
        reasonHighlight: 'Accredited Coaching Degrees & Conflict Guard',
        reviewText: 'I completed my Player Mechanics track while coaching juniors on weekends. The calendar conflict alert automatically suggests open slots so I never miss a biomechanical review class.',
        verifiedStudent: true,
        helpfulCount: 19,
        date: '2026-11-08',
      },
      {
        id: 'rev-6',
        playerName: 'Kabir Singh',
        sport: 'Athletics',
        roleOrAcademy: '200m Sprinter · Patiala Track Club',
        rating: 5,
        reasonHighlight: 'All-in-One Multi-Sport Ecosystem',
        reviewText: 'From sprint spike shopping to live smartwatch VO2 Max syncing and verified combine percentiles, TossMore gives every student-athlete pro-level infrastructure from day one.',
        verifiedStudent: true,
        helpfulCount: 25,
        date: '2026-11-05',
      },
    ],
    tournamentVideos: [
      {
        id: 'tv-1',
        title: 'U-19 National & Asia Cup Knockout Semifinal Highlights',
        tournamentName: 'TossMore All-India U-19 Cricket Championship',
        sport: 'Cricket',
        stageLabel: 'Ongoing Quarterfinal & Semifinal Stage',
        youtubeId: '9J8yJbtuf7w',
        durationLabel: '08:42',
        location: 'BKC Oval · Mumbai',
      },
      {
        id: 'tv-2',
        title: 'National Super Cup Final: High-Tempo Attacking & Set-Piece Highlights',
        tournamentName: 'TossMore National Super Football Cup',
        sport: 'Football',
        stageLabel: 'Matchweek 6 · Knockout Feed',
        youtubeId: 'yTSpu7tV01Q',
        durationLabel: '06:18',
        location: 'Fatorda Turf · Goa',
      },
      {
        id: 'tv-3',
        title: 'National Kabaddi Mat Championship: Super Raids & Corner Holds',
        tournamentName: 'Pro Kabaddi Grassroots & Mat Open',
        sport: 'Kabaddi',
        stageLabel: 'Semifinal · Live Mat Replay',
        youtubeId: 'l0d2S5p8bRE',
        durationLabel: '07:15',
        location: 'Balewadi Arena · Pune',
      },
      {
        id: 'tv-4',
        title: 'Women’s T20 League Clash: Powerplay Batting & Death Bowling',
        tournamentName: 'TossMore Women’s National T20 Open',
        sport: 'Cricket',
        stageLabel: 'League Round 4 Highlights',
        youtubeId: '0_6E1VQmnIc',
        durationLabel: '05:54',
        location: 'Chinnaswamy · Bengaluru',
      },
    ],
  };
}

export function loadState(): AppState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<AppState>;
      const defaults = createInitialState();
      return {
        ...defaults,
        ...parsed,
        podcastEpisodes:
          Array.isArray(parsed.podcastEpisodes) && parsed.podcastEpisodes.length > 0
            ? parsed.podcastEpisodes
            : defaults.podcastEpisodes,
        sportsNews:
          Array.isArray(parsed.sportsNews) && parsed.sportsNews.length > 0
            ? parsed.sportsNews
            : defaults.sportsNews,
        youtubeLiveStreams:
          Array.isArray(parsed.youtubeLiveStreams) && parsed.youtubeLiveStreams.length > 0
            ? parsed.youtubeLiveStreams
            : defaults.youtubeLiveStreams,
        activeYoutubeStreamId:
          parsed.activeYoutubeStreamId || defaults.activeYoutubeStreamId,
        marketplace:
          Array.isArray(parsed.marketplace) && parsed.marketplace.length >= 19
            ? parsed.marketplace
            : defaults.marketplace,
        playerReviews:
          Array.isArray(parsed.playerReviews) && parsed.playerReviews.length > 0
            ? parsed.playerReviews
            : defaults.playerReviews,
        tournamentVideos:
          Array.isArray(parsed.tournamentVideos) && parsed.tournamentVideos.length > 0
            ? parsed.tournamentVideos
            : defaults.tournamentVideos,
      };
    }
  } catch {
    // Fall back to clean initial state if file is unreadable
  }
  const initial = createInitialState();
  saveState(initial);
  return initial;
}

export function saveState(state: AppState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist state:', err);
  }
}
