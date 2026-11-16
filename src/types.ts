export type CricketRole = 'batsman' | 'wicketkeeper' | 'bowler' | 'all-rounder';
export type SportType =
  | 'Cricket'
  | 'Football'
  | 'Kabaddi'
  | 'Golf'
  | 'Tennis'
  | 'Athletics'
  | 'Basketball'
  | 'Badminton';
export type LanguageCode = 'en' | 'hi' | 'es' | 'fr' | 'ta';

export type NavSectionId =
  | 'overview'
  | 'training'
  | 'certifications'
  | 'analytics'
  | 'coaching'
  | 'tournaments'
  | 'club'
  | 'social'
  | 'podcasts'
  | 'marketplace';

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

export interface CartItem {
  product: MarketplaceProduct;
  quantity: number;
}

export interface PendingCheckout {
  description: string;
  amountUsd: number;
  kind:
    | 'cart'
    | 'certification'
    | 'tournament'
    | 'booking'
    | 'tournament-host'
    | 'tournament-sponsor';
  targetId?: string;
  teamName?: string;
  teamEntryPayload?: {
    captainName: string;
    city: string;
  };
  tournamentHostPayload?: {
    name: string;
    organizerName: string;
    sport: SportType;
    tier: TournamentItem['tier'];
    startDate: string;
    city: string;
    prizePoolUsd: number;
    entryFeeUsd: number;
    maxTeams: number;
  };
  sponsorPayload?: {
    tournamentId: string;
    brandName: string;
    tier: 'Title Sponsor' | 'Kit & Ball Partner' | 'Streaming Partner';
  };
  bookingPayload?: {
    providerId: string;
    date: string;
    timeSlot: string;
    sessionType: BookingRecord['sessionType'];
  };
}
