import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Play, Pause, RotateCcw, Eye, Cpu, CheckCircle2 } from 'lucide-react';
import type { LanguageCode, SportType } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface TrainingStudioViewProps {
  language: LanguageCode;
  initialSport: SportType;
  onLogSession: (payload: {
    sport: SportType;
    role: string;
    moduleTitle: string;
    modality: 'written' | 'video' | 'vr' | 'ar';
    durationMin: number;
    accuracyPct: number;
    reactionMs: number;
    speedMetric: number;
    speedUnit: string;
    notes: string;
  }) => Promise<void>;
}

const SPORTS: SportType[] = [
  'Cricket',
  'Football',
  'Kabaddi',
  'Golf',
  'Tennis',
  'Athletics',
  'Basketball',
  'Badminton',
];

interface SportCurriculum {
  roles: { id: string; label: string; title: string; speedUnit: string; baseSpeed: number }[];
  vrScenarios: string[];
  vrActions: string[];
  writtenSteps: { heading: string; detail: string; cue: string }[];
  videoPhases: { name: string; timeSec: number; coachingCue: string; targetAngle: string }[];
  arTarget: { elbowOpt: [number, number]; kneeOpt: [number, number]; headOffsetMax: number };
}

const SPORT_CURRICULA: Record<SportType, SportCurriculum> = {
  Cricket: {
    roles: [
      { id: 'batsman', label: 'Batsman', title: 'Corridor Batting & Front-Foot Drive', speedUnit: 'km/h bat speed', baseSpeed: 124 },
      { id: 'wicketkeeper', label: 'Wicketkeeper', title: 'Blind-Side Glovework & Rapid Stumping', speedUnit: '% clean takes', baseSpeed: 94 },
      { id: 'bowler', label: 'Bowler', title: 'Fast Seam Release & Braced Front Leg', speedUnit: 'km/h release', baseSpeed: 138 },
      { id: 'all-rounder', label: 'All-Rounder', title: 'Death-Overs Power & Bowling Variations', speedUnit: 'm/s sprint peak', baseSpeed: 8.2 },
    ],
    vrScenarios: ['Outswinger 145 km/h', 'Leg-Spin Googly', 'Yorker 138 km/h'],
    vrActions: ['Cover Drive', 'Pull Shot', 'Forward Block', 'Leave'],
    writtenSteps: [
      { heading: '1. Balanced Setup & Eye-Level Trigger', detail: 'Feet shoulder-width apart with weight 55/45 on the balls of your feet. Keep eyes horizontal over the lead shoulder before release.', cue: 'Head still at release point.' },
      { heading: '2. High Top-Hand Backlift & Alignment', detail: 'Lift the bat toward second slip with the top wrist firm while front foot strides cleanly to the pitch of the ball.', cue: 'Lead elbow points toward extra cover.' },
      { heading: '3. Late Impact Under Eyes & Extension', detail: 'Meet the ball directly beneath your eyes with a bent front knee absorbing momentum through the seam line.', cue: 'Hold balance for 1 second.' },
    ],
    videoPhases: [
      { name: 'Stance & Trigger', timeSec: 0.0, coachingCue: 'Eyes level, settle inside off-stump', targetAngle: 'Knee 155°' },
      { name: 'Backlift Peak', timeSec: 0.32, coachingCue: 'Blade angled toward 2nd slip', targetAngle: 'Elbow 108°' },
      { name: 'Front Stride', timeSec: 0.58, coachingCue: 'Heel-to-toe plant beside delivery line', targetAngle: 'Stride 78 cm' },
      { name: 'Impact Zone', timeSec: 0.84, coachingCue: 'Vertical blade under eyes', targetAngle: '126 km/h' },
    ],
    arTarget: { elbowOpt: [132, 148], kneeOpt: [148, 165], headOffsetMax: 8 },
  },
  Football: {
    roles: [
      { id: 'striker', label: 'Striker', title: 'Curled Free-Kicks, Half-Turn Finishing & xG Shots', speedUnit: 'km/h shot speed', baseSpeed: 112 },
      { id: 'midfielder', label: 'Midfielder', title: '360° Pre-Scan, Line-Breaking Pass & Press Trap', speedUnit: '% pass accuracy', baseSpeed: 91 },
      { id: 'defender', label: 'Defender', title: '1v1 Jockeying Stance, Aerial Clearance & Offside Line', speedUnit: 'm/s recovery', baseSpeed: 8.6 },
      { id: 'goalkeeper', label: 'Goalkeeper', title: 'Penalty Dive Explosiveness & Near-Post Set Position', speedUnit: 'ms dive reflex', baseSpeed: 185 },
    ],
    vrScenarios: ['22m Curled Free-Kick', '1v1 Keeper Rush', 'Penalty Top-Corner'],
    vrActions: ['Top-Right Curl', 'Low Driven Corner', 'Chip Shot', 'Fake & Cut'],
    writtenSteps: [
      { heading: '1. Non-Kicking Plant Foot & Hip Open', detail: 'Plant the support foot 15 cm beside the ball pointing at the target post, creating space for the striking leg arc.', cue: 'Keep chest slightly over the ball to prevent skying.' },
      { heading: '2. Locked Ankle & Inside-Instep Brush', detail: 'Strike across the lower outer quadrant with a locked ankle to generate 2,200+ RPM topspin dip over the defensive wall.', cue: 'Follow through across your body smoothly.' },
      { heading: '3. Pre-Reception Shoulder Scan', detail: 'Check weak-side spaces twice before the pass arrives so your first touch immediately opens a shooting lane.', cue: 'Scan 0.5s prior to ball contact.' },
    ],
    videoPhases: [
      { name: 'Approach Angle', timeSec: 0.0, coachingCue: '35° run-up arc relative to target post', targetAngle: 'Approach 38°' },
      { name: 'Plant Foot Lock', timeSec: 0.26, coachingCue: 'Firm knee bend 15 cm beside ball', targetAngle: 'Knee 144°' },
      { name: 'Instep Whip', timeSec: 0.44, coachingCue: 'Ankle locked, hips snap forward', targetAngle: '114 km/h' },
      { name: 'Landing Stride', timeSec: 0.72, coachingCue: 'Land on striking foot with balance', targetAngle: 'Spin 2,400 RPM' },
    ],
    arTarget: { elbowOpt: [120, 145], kneeOpt: [138, 158], headOffsetMax: 9 },
  },
  Kabaddi: {
    roles: [
      { id: 'raider', label: 'Raider', title: 'Bonus-Line Toe Touch, Dubki & Midline Escape', speedUnit: 'sec raid cant', baseSpeed: 26 },
      { id: 'corner', label: 'Corner Defender', title: 'Explosive Ankle Hold & Timing Chain Block', speedUnit: 'ms tackle reflex', baseSpeed: 172 },
      { id: 'cover', label: 'Cover Defender', title: 'Dash Block & Waist-Lock Support Mechanics', speedUnit: 'N grip force', baseSpeed: 420 },
      { id: 'all-rounder', label: 'Mat All-Rounder', title: 'Do-or-Die Raid Pacing & Super Tackle Defense', speedUnit: '% raid success', baseSpeed: 74 },
    ],
    vrScenarios: ['Left Corner Ankle-Hold Trap', '2-Defender Chain Dash', 'Bonus Line Squeeze'],
    vrActions: ['Running Hand Touch', 'Dubki Duck', 'Toe-Touch Retreat', 'Jump Over Chain'],
    writtenSteps: [
      { heading: '1. Low Center-of-Gravity Mat Stance', detail: 'Maintain hips low and weight centered over the balls of both feet while shuffling laterally along the baulk line.', cue: 'Never cross your ankles when facing corner defenders.' },
      { heading: '2. Explosive Toe-Touch & Instant Pullback', detail: 'Extend the lead foot onto the bonus line or corner shoe while already shifting torso weight back toward the midline.', cue: 'Retract within 180 milliseconds of touch.' },
      { heading: '3. Dubki & Chain-Breaker Escape', detail: 'Drop shoulders beneath an incoming two-defender dash and drive powerfully off the outside leg back over the midline.', cue: 'Keep cant steady and eyes locked on the corner’s hips.' },
    ],
    videoPhases: [
      { name: 'Baulk Cross', timeSec: 0.0, coachingCue: 'Wide base, hands active probing cover', targetAngle: 'Knee 128°' },
      { name: 'Toe Feint', timeSec: 0.24, coachingCue: 'Draw left corner forward with shoulder dip', targetAngle: 'Hip Drop 14 cm' },
      { name: 'Touch & Pivot', timeSec: 0.48, coachingCue: 'Explosive hand touch on right cover', targetAngle: '168 ms' },
      { name: 'Midline Dash', timeSec: 0.82, coachingCue: 'Drive chest low through chain block', targetAngle: '7.9 m/s' },
    ],
    arTarget: { elbowOpt: [110, 138], kneeOpt: [118, 142], headOffsetMax: 7 },
  },
  Golf: {
    roles: [
      { id: 'driver', label: 'Driver & Tee', title: 'Shallow Swing Plane & 290-Yard Fairway Dispersion', speedUnit: 'mph clubhead', baseSpeed: 116 },
      { id: 'iron', label: 'Iron Approach', title: 'Ball-First Compression & Wedge Spin Control', speedUnit: 'ft proximity', baseSpeed: 14 },
      { id: 'shortgame', label: 'Short Game', title: 'Bunker Splash Release & Lob Trajectory Control', speedUnit: '% up-and-down', baseSpeed: 78 },
      { id: 'putting', label: 'Putting Precision', title: 'Green Slope Read, Face Squareness & Speed Control', speedUnit: '% 8-ft make', baseSpeed: 84 },
    ],
    vrScenarios: ['285-Yd Narrow Fairway (12mph Crosswind)', '148-Yd Pin-High Approach', '14-Ft Breaking Birdie Putt'],
    vrActions: ['Power Fade', 'Controlled Draw', 'Knockdown Iron', 'Firm Center-Cup Putt'],
    writtenSteps: [
      { heading: '1. Athletic Spine Tilt & Neutral Grip', detail: 'Hinge from the hip sockets with relaxed arms hanging vertically beneath shoulders and slight trail-shoulder tilt.', cue: 'Keep grip pressure 4/10 throughout takeaway.' },
      { heading: '2. Sequenced Kinematic Downswing', detail: 'Initiate the downswing with a subtle lead-hip shift and rotation before the hands drop cleanly into the slot.', cue: 'Hands trail hip turn to shallow the club.' },
      { heading: '3. Ball-First Compression & Balanced Finish', detail: 'Strike down and through with lead wrist flat at impact, rotating cleanly onto a braced lead leg.', cue: 'Hold full finish facing the target.' },
    ],
    videoPhases: [
      { name: 'Address Posture', timeSec: 0.0, coachingCue: 'Neutral spine hinge, balanced weight 50/50', targetAngle: 'Spine 34°' },
      { name: 'Top of Backswing', timeSec: 0.42, coachingCue: 'Full 90° shoulder turn against stable trail hip', targetAngle: 'Turn 92°' },
      { name: 'Slot Transition', timeSec: 0.68, coachingCue: 'Club shaft shallows parallel to target line', targetAngle: 'Lag 84°' },
      { name: 'Impact & Release', timeSec: 0.86, coachingCue: 'Lead wrist flat, forward shaft lean', targetAngle: '116 mph' },
    ],
    arTarget: { elbowOpt: [152, 172], kneeOpt: [148, 166], headOffsetMax: 4 },
  },
  Tennis: {
    roles: [
      { id: 'baseline', label: 'Baseline Striker', title: 'Heavy Topspin Forehand & Open-Stance Recovery', speedUnit: 'km/h forehand', baseSpeed: 134 },
      { id: 'server', label: 'Serve & Volley', title: '205 km/h Trophy Pose & Pronation Snap', speedUnit: 'km/h 1st serve', baseSpeed: 196 },
      { id: 'returner', label: 'Return Specialist', title: 'Split-Step Timing & Compact Block Return', speedUnit: 'ms split react', baseSpeed: 182 },
    ],
    vrScenarios: ['200 km/h Wide Serve', 'Deep Cross-Court Topspin', 'Break-Point Passing Shot'],
    vrActions: ['Topspin Forehand', 'Two-Hand Backhand', 'Slice Approach', 'Drop Volley'],
    writtenSteps: [
      { heading: '1. Synchronized Split-Step Timing', detail: 'Land on the balls of both feet just as the opponent’s racket strikes the ball so elastic leg energy drives your first push.', cue: 'Time landing at opponent contact.' },
      { heading: '2. Unit Turn & Racket Drop Lag', detail: 'Rotate shoulders as a unit while keeping the non-dominant hand on the throat, dropping the racket head beneath ball height.', cue: 'Brush low-to-high through contact.' },
      { heading: '3. Pronation Snap on Serve', detail: 'Lead with the edge of the frame up to contact and pronate the forearm through the ball at full extension.', cue: 'Toss 30 cm inside baseline.' },
    ],
    videoPhases: [
      { name: 'Split-Step', timeSec: 0.0, coachingCue: 'Wide athletic base ready to push laterally', targetAngle: 'Knee 136°' },
      { name: 'Unit Turn', timeSec: 0.25, coachingCue: '90° torso coil with non-hitting arm across', targetAngle: 'Coil 88°' },
      { name: 'Contact Point', timeSec: 0.52, coachingCue: 'Strike cleanly out in front of lead hip', targetAngle: '134 km/h' },
    ],
    arTarget: { elbowOpt: [138, 158], kneeOpt: [135, 156], headOffsetMax: 6 },
  },
  Athletics: {
    roles: [
      { id: 'sprinter', label: '100m/200m Sprinter', title: 'Block Start Drive Phase & Max-Velocity Mechanics', speedUnit: 'm/s peak velocity', baseSpeed: 10.4 },
      { id: 'hurdler', label: 'Hurdler', title: 'Lead-Leg Attack & 3-Stride Rhythm Clearance', speedUnit: 'ms ground contact', baseSpeed: 98 },
      { id: 'distance', label: 'Endurance / VO2', title: 'Running Economy, Cadence & Lactate Threshold Pacing', speedUnit: 'spm cadence', baseSpeed: 184 },
    ],
    vrScenarios: ['Reaction Gun Block Start', '60m Drive-to-Upright Transition', 'Final 30m Kick'],
    vrActions: ['Explosive Gun Start', 'Drive Shin Angle', 'High-Knee Cycling', 'Dip at Tape'],
    writtenSteps: [
      { heading: '1. 45° Block Clearance Projection', detail: 'Push horizontally through both pedals with aggressive triple extension of ankle, knee, and hip for the first 15 meters.', cue: 'Keep eyes on track 2m ahead early.' },
      { heading: '2. Front-Side Mechanics & Dorsiflexion', detail: 'Keep toes pulled up (dorsiflexed) before ground strike beneath your center of mass to minimize braking impulse.', cue: 'Strike under hips, never in front.' },
    ],
    videoPhases: [
      { name: 'Set Position', timeSec: 0.0, coachingCue: 'Hips slightly above shoulders, front shin 45°', targetAngle: 'Front Knee 94°' },
      { name: 'First Stride', timeSec: 0.19, coachingCue: 'Full triple extension from rear block', targetAngle: 'Proj 44°' },
      { name: 'Top Speed', timeSec: 0.65, coachingCue: 'Tall posture, 94ms ground contact', targetAngle: '10.4 m/s' },
    ],
    arTarget: { elbowOpt: [85, 105], kneeOpt: [148, 172], headOffsetMax: 5 },
  },
  Basketball: {
    roles: [
      { id: 'guard', label: 'Point Guard', title: 'Pick-and-Roll Reads, Floater & Perimeter Defense', speedUnit: '% assist/TO', baseSpeed: 89 },
      { id: 'shooter', label: 'Wing Shooter', title: '48° Catch-and-Shoot Arc & Off-Screen Footwork', speedUnit: '° release arc', baseSpeed: 48 },
      { id: 'forward', label: 'Forward / Big', title: 'Box-Out Leverage, Rim Protection & Short-Roll Finish', speedUnit: 'cm vert reach', baseSpeed: 84 },
    ],
    vrScenarios: ['Contested Corner 3-Pointer', 'Pick-and-Roll Split Read', 'Buzzer Free-Throws'],
    vrActions: ['Catch & Shoot 3', 'Step-Back Jumper', 'Pocket Bounce Pass', 'Euro-Step Layup'],
    writtenSteps: [
      { heading: '1. Dip-Free Shot Pocket & 48° Arc', detail: 'Catch with knees loaded and elbow aligned directly under the ball so upward energy transfers seamlessly to your fingertips.', cue: 'Target 48°–50° entry angle at the rim.' },
      { heading: '2. Low Defensive Slide Without Crossing Feet', detail: 'Push off the trail foot while keeping chest square to the ball handler’s hip.', cue: 'Active hands contest without reaching.' },
    ],
    videoPhases: [
      { name: 'Catch & Load', timeSec: 0.0, coachingCue: 'Feet staggered toward rim, hips low', targetAngle: 'Knee 132°' },
      { name: 'Set Point', timeSec: 0.24, coachingCue: 'Shooting elbow directly under ball', targetAngle: 'Elbow 92°' },
      { name: 'High Release', timeSec: 0.44, coachingCue: 'Snap index & middle finger through rim', targetAngle: 'Arc 48°' },
    ],
    arTarget: { elbowOpt: [88, 104], kneeOpt: [132, 154], headOffsetMax: 6 },
  },
  Badminton: {
    roles: [
      { id: 'singles', label: 'Singles Tactician', title: '6-Corner Split-Step & Deceptive Net Hairpin', speedUnit: 'ms court react', baseSpeed: 168 },
      { id: 'smash', label: 'Smash Specialist', title: '360 km/h Jump Smash & Pronation Whip', speedUnit: 'km/h shuttle', baseSpeed: 342 },
      { id: 'doubles', label: 'Doubles Net', title: 'Flat Drive Exchange & Front-Court Interception', speedUnit: '% net kill', baseSpeed: 87 },
    ],
    vrScenarios: ['350 km/h Body Smash Defense', 'Tight Tumbling Net Drop', 'Backhand Corner Clear'],
    vrActions: ['Jump Smash', 'Forehand Net Spin', 'Flat Backhand Drive', 'Cross-Court Lift'],
    writtenSteps: [
      { heading: '1. Scissor-Kick Rotation & Forearm Pronation', detail: 'Rotate hips during the aerial scissor kick while relaxing grip until the final millisecond of forearm pronation.', cue: 'Lead with elbow, whip the racket head late.' },
      { heading: '2. Lunge Heel-First Braking', detail: 'Land heel-to-toe on the racket-side lunge with knee aligned over toes to rebound immediately to center court.', cue: 'Racket stays up after net shot.' },
    ],
    videoPhases: [
      { name: 'Split-Step', timeSec: 0.0, coachingCue: 'Wide base before opponent shuttle impact', targetAngle: 'Knee 138°' },
      { name: 'Arch & Coil', timeSec: 0.22, coachingCue: 'Non-racket arm aims shuttle trajectory', targetAngle: 'Shoulder 142°' },
      { name: 'Pronation Whip', timeSec: 0.41, coachingCue: 'High contact point with scissor kick', targetAngle: '342 km/h' },
    ],
    arTarget: { elbowOpt: [148, 170], kneeOpt: [132, 156], headOffsetMax: 7 },
  },
};

export const TrainingStudioView: React.FC<TrainingStudioViewProps> = ({
  language,
  initialSport,
  onLogSession,
}) => {
  const t = TRANSLATIONS[language];
  const [sport, setSport] = useState<SportType>(initialSport);
  const [roleIdx, setRoleIdx] = useState(0);
  const [modality, setModality] = useState<'written' | 'video' | 'vr' | 'ar'>('vr');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Video drill state
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoPhaseIdx, setVideoPhaseIdx] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<'0.25x' | '0.5x' | '1.0x'>('0.5x');

  // VR Simulator state
  const vrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [simActive, setSimActive] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [vrResult, setVrResult] = useState<{
    action: string;
    reactionMs: number;
    accuracyPct: number;
    outcome: string;
  } | null>(null);
  const launchTimeRef = useRef<number>(0);

  // AR Biomechanics state
  const arCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [elbowAngle, setElbowAngle] = useState(142);
  const [kneeAngle, setKneeAngle] = useState(154);
  const [headOffsetCm, setHeadOffsetCm] = useState(4);

  useEffect(() => {
    setSport(initialSport);
    setRoleIdx(0);
    setScenarioIdx(0);
    setVideoPhaseIdx(0);
    setVrResult(null);
  }, [initialSport]);

  const curriculum = SPORT_CURRICULA[sport];
  const activeRole = curriculum.roles[roleIdx] || curriculum.roles[0];
  const activeScenario = curriculum.vrScenarios[scenarioIdx] || curriculum.vrScenarios[0];

  // Video playback timer
  useEffect(() => {
    if (!videoPlaying || modality !== 'video') return;
    const intervalMs = playbackSpeed === '0.25x' ? 1500 : playbackSpeed === '0.5x' ? 950 : 600;
    const id = setInterval(() => {
      setVideoPhaseIdx((prev) => (prev + 1) % curriculum.videoPhases.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [videoPlaying, modality, playbackSpeed, curriculum.videoPhases.length]);

  // VR animation loop
  useEffect(() => {
    if (!simActive) return;
    let rafId = 0;
    const duration = sport === 'Golf' ? 1100 : sport === 'Kabaddi' ? 880 : 820;

    function tick() {
      const elapsed = performance.now() - launchTimeRef.current;
      const p = Math.min(1, elapsed / duration);
      setSimProgress(p);
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setSimActive(false);
        setVrResult((prev) =>
          prev && prev.reactionMs > 0
            ? prev
            : {
                action: 'Window Missed',
                reactionMs: duration,
                accuracyPct: 45,
                outcome: `Optimal ${sport} execution window elapsed before trigger.`,
              }
        );
      }
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [simActive, sport]);

  // Draw sport-specific VR 3D-perspective canvas
  useEffect(() => {
    if (modality !== 'vr') return;
    const canvas = vrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Arena backdrop
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.44);
    sky.addColorStop(0, '#0F172A');
    sky.addColorStop(1, '#1E293B');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.44);

    const p = simActive ? simProgress : vrResult ? 0.88 : 0.1;

    if (sport === 'Football') {
      // Floodlit turf + perspective penalty box + goalframe
      ctx.fillStyle = '#065F46';
      ctx.fillRect(0, h * 0.44, w, h * 0.56);
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 2;
      // Goalframe
      ctx.strokeRect(w * 0.34, h * 0.24, w * 0.32, h * 0.2);
      // Penalty box
      ctx.beginPath();
      ctx.moveTo(w * 0.22, h * 0.44);
      ctx.lineTo(w * 0.78, h * 0.44);
      ctx.lineTo(w * 0.92, h);
      ctx.lineTo(w * 0.08, h);
      ctx.closePath();
      ctx.stroke();

      // Target top-corner zone
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.beginPath();
      ctx.arc(w * 0.61, h * 0.29, 20, 0, Math.PI * 2);
      ctx.fill();

      // Football flight curve
      const bx = w * 0.5 + Math.sin(p * Math.PI) * 58 + p * 72;
      const by = h * 0.86 - p * (h * 0.57);
      const r = 13 - p * 5;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (sport === 'Kabaddi') {
      // Kabaddi mat arena
      ctx.fillStyle = '#9A3412';
      ctx.fillRect(0, h * 0.44, w, h * 0.56);
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(w * 0.12, h * 0.48, w * 0.76, h * 0.46);

      // Midline, Baulk line, Bonus line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      [0.56, 0.72, 0.84].forEach((row) => {
        ctx.beginPath();
        ctx.moveTo(w * 0.12, h * row);
        ctx.lineTo(w * 0.88, h * row);
        ctx.stroke();
      });

      // Defender chain closing in + Raider marker
      const defX = w * 0.26 + p * 120;
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(defX, h * 0.64, 15, 0, Math.PI * 2);
      ctx.arc(defX + 42, h * 0.66, 15, 0, Math.PI * 2);
      ctx.fill();

      // Raider dot moving into bonus/escape window
      const rx = w * 0.56 - p * 45;
      const ry = h * 0.8 - Math.sin(p * Math.PI) * 55;
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(rx, ry, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText('BONUS / ESCAPE WINDOW', w * 0.39, h * 0.89);
    } else if (sport === 'Golf') {
      // Fairway & elevated green with flagstick
      ctx.fillStyle = '#064E3B';
      ctx.fillRect(0, h * 0.44, w, h * 0.56);
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.5, 95, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flagstick
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.52, h * 0.5);
      ctx.lineTo(w * 0.52, h * 0.28);
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(w * 0.52, h * 0.28);
      ctx.lineTo(w * 0.58, h * 0.31);
      ctx.lineTo(w * 0.52, h * 0.34);
      ctx.closePath();
      ctx.fill();

      // Ball carry tracer arc
      const bx = w * 0.44 + p * 56;
      const by = h * 0.88 - Math.sin(p * Math.PI * 0.85) * (h * 0.56) - p * 70;
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(w * 0.44, h * 0.88);
      ctx.quadraticCurveTo(w * 0.48, h * 0.14, w * 0.52, h * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(bx, by, 7 - p * 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cricket & Net/Court Sports perspective turf pitch/court
      ctx.fillStyle = '#064E3B';
      ctx.fillRect(0, h * 0.44, w, h * 0.56);
      ctx.fillStyle = sport === 'Cricket' ? '#D6C7A9' : '#0284C7';
      ctx.beginPath();
      ctx.moveTo(w * 0.42, h * 0.44);
      ctx.lineTo(w * 0.58, h * 0.44);
      ctx.lineTo(w * 0.78, h);
      ctx.lineTo(w * 0.22, h);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.28, h * 0.86);
      ctx.lineTo(w * 0.72, h * 0.86);
      ctx.stroke();

      const bx = w * 0.5 + (p > 0.6 ? (p - 0.6) * 55 : 0);
      const by = h * 0.42 + p * (h * 0.44) - Math.sin(p * Math.PI) * 32;
      ctx.fillStyle = sport === 'Tennis' ? '#BEF264' : '#DC2626';
      ctx.beginPath();
      ctx.arc(bx, by, 4 + p * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [modality, sport, simActive, simProgress, vrResult]);

  // Draw AR Biomechanics Skeleton Canvas
  useEffect(() => {
    if (modality !== 'ar') return;
    const canvas = arCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const elbowOk = elbowAngle >= curriculum.arTarget.elbowOpt[0] && elbowAngle <= curriculum.arTarget.elbowOpt[1];
    const kneeOk = kneeAngle >= curriculum.arTarget.kneeOpt[0] && kneeAngle <= curriculum.arTarget.kneeOpt[1];
    const headOk = headOffsetCm <= curriculum.arTarget.headOffsetMax;

    const hip = { x: w * 0.48, y: h * 0.54 };
    const shoulder = { x: w * 0.48 + headOffsetCm * 1.4, y: h * 0.32 };
    const head = { x: shoulder.x + headOffsetCm * 1.1, y: h * 0.2 };
    const kneeRad = ((180 - kneeAngle) * Math.PI) / 180;
    const frontKnee = { x: hip.x + 48 + Math.sin(kneeRad) * 30, y: hip.y + 62 };
    const frontFoot = { x: frontKnee.x + 12, y: h * 0.88 };
    const backFoot = { x: hip.x - 54, y: h * 0.88 };
    const elbowRad = ((180 - elbowAngle) * Math.PI) / 180;
    const elbow = { x: shoulder.x + 44, y: shoulder.y + 18 + Math.sin(elbowRad) * 28 };
    const wrist = { x: elbow.x + 36, y: elbow.y + 34 };

    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    ctx.lineTo(shoulder.x, shoulder.y);
    ctx.moveTo(hip.x, hip.y);
    ctx.lineTo(backFoot.x, backFoot.y);
    ctx.stroke();

    ctx.strokeStyle = kneeOk ? '#10B981' : '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    ctx.lineTo(frontKnee.x, frontKnee.y);
    ctx.lineTo(frontFoot.x, frontFoot.y);
    ctx.stroke();

    ctx.strokeStyle = elbowOk ? '#10B981' : '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(elbow.x, elbow.y);
    ctx.lineTo(wrist.x, wrist.y);
    ctx.stroke();

    ctx.fillStyle = headOk ? '#10B981' : '#F59E0B';
    ctx.beginPath();
    ctx.arc(head.x, head.y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText(`Arm/Elbow ${elbowAngle}°`, elbow.x + 12, elbow.y - 8);
    ctx.fillText(`Knee ${kneeAngle}°`, frontKnee.x + 12, frontKnee.y);
    ctx.fillText(`Head Δ ${headOffsetCm}cm`, head.x + 20, head.y + 4);
  }, [modality, elbowAngle, kneeAngle, headOffsetCm, curriculum]);

  const handleLaunchVR = () => {
    setVrResult(null);
    setSimProgress(0);
    launchTimeRef.current = performance.now();
    setSimActive(true);
  };

  const handleVRAction = async (action: string) => {
    if (!simActive) return;
    const reactionMs = Math.round(performance.now() - launchTimeRef.current);
    setSimActive(false);

    const timingDelta = Math.abs(simProgress - 0.74);
    const accuracyPct = Math.max(48, Math.min(99, Math.round(97 - timingDelta * 90)));
    const outcome =
      accuracyPct >= 86
        ? `Optimal ${sport} Execution · Clean biomechanical timing`
        : accuracyPct >= 70
          ? `Solid Execution · Minor timing adjustment needed`
          : `Off-Timing Trigger · Practice slow-motion drill phase`;

    setVrResult({ action, reactionMs, accuracyPct, outcome });

    await onLogSession({
      sport,
      role: activeRole.id,
      moduleTitle: `VR ${sport}: ${activeScenario} (${action})`,
      modality: 'vr',
      durationMin: 18,
      accuracyPct,
      reactionMs,
      speedMetric: activeRole.baseSpeed,
      speedUnit: activeRole.speedUnit,
      notes: `${action} during ${activeScenario}. ${outcome}`,
    });
    setStatusBanner(`Logged ${sport} VR drill (${accuracyPct}% accuracy · ${reactionMs}ms) to analytics.`);
  };

  const handleSaveAR = async () => {
    const elbowOk = elbowAngle >= curriculum.arTarget.elbowOpt[0] && elbowAngle <= curriculum.arTarget.elbowOpt[1];
    const kneeOk = kneeAngle >= curriculum.arTarget.kneeOpt[0] && kneeAngle <= curriculum.arTarget.kneeOpt[1];
    const headOk = headOffsetCm <= curriculum.arTarget.headOffsetMax;
    const score = (elbowOk ? 34 : 22) + (kneeOk ? 34 : 22) + (headOk ? 32 : 20);

    await onLogSession({
      sport,
      role: activeRole.id,
      moduleTitle: `AR ${sport} Biomechanics (${activeRole.label})`,
      modality: 'ar',
      durationMin: 20,
      accuracyPct: score,
      reactionMs: 188,
      speedMetric: elbowAngle,
      speedUnit: '° lead joint',
      notes: `Elbow ${elbowAngle}°, Knee ${kneeAngle}°, Head offset ${headOffsetCm}cm.`,
    });
    setStatusBanner(`Saved ${sport} AR calibration (${score}% alignment score).`);
  };

  const handleCompleteWrittenOrVideo = async (mode: 'written' | 'video') => {
    await onLogSession({
      sport,
      role: activeRole.id,
      moduleTitle: `${mode === 'video' ? 'Video Drill' : 'Written Manual'}: ${activeRole.title}`,
      modality: mode,
      durationMin: mode === 'video' ? 25 : 18,
      accuracyPct: 91,
      reactionMs: 196,
      speedMetric: activeRole.baseSpeed,
      speedUnit: activeRole.speedUnit,
      notes: `Completed ${sport} ${mode} module for ${activeRole.label}.`,
    });
    setStatusBanner(`Completed ${sport} ${mode} module and updated progress tracker.`);
  };

  const elbowOptimal = elbowAngle >= curriculum.arTarget.elbowOpt[0] && elbowAngle <= curriculum.arTarget.elbowOpt[1];
  const kneeOptimal = kneeAngle >= curriculum.arTarget.kneeOpt[0] && kneeAngle <= curriculum.arTarget.kneeOpt[1];
  const headOptimal = headOffsetCm <= curriculum.arTarget.headOffsetMax;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 [text-wrap:balance]">
            {t.sections.trainingHeadline}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Train across Cricket, Football, Kabaddi, Golf, Tennis, Athletics, Basketball, and Badminton.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70">
          {SPORTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setSport(item);
                setRoleIdx(0);
                setScenarioIdx(0);
                setVideoPhaseIdx(0);
                setVrResult(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                sport === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Sport-Specific Roles & Modality Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-y border-slate-200 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">{sport} Specialization:</span>
          {curriculum.roles.map((r, idx) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setRoleIdx(idx);
                setVideoPhaseIdx(0);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                roleIdx === idx
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
          {(
            [
              { id: 'written', label: 'Written', icon: BookOpen },
              { id: 'video', label: 'Video Drill', icon: Play },
              { id: 'vr', label: 'VR Sim', icon: Eye },
              { id: 'ar', label: 'AR Biomech', icon: Cpu },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setModality(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  modality === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {statusBanner && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {modality === 'written' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-medium text-slate-500">
                {sport} · {activeRole.label} · Technical Manual
              </div>
              <h2 className="font-display text-xl font-semibold text-slate-900 mt-0.5">
                {activeRole.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleCompleteWrittenOrVideo('written')}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
            >
              Mark Guide Complete & Log Progress
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {curriculum.writtenSteps.map((step) => (
              <div key={step.heading} className="rounded-lg border border-slate-200 bg-slate-50 p-5 space-y-2.5">
                <h3 className="text-sm font-semibold text-slate-900">{step.heading}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.detail}</p>
                <div className="pt-2 border-t border-slate-200 text-xs font-medium text-emerald-800">
                  Coaching Cue: {step.cue}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modality === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-900 p-6 text-white flex flex-col justify-between min-h-[360px]">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>240fps High-Speed Video Breakdown · {sport} ({activeRole.label})</span>
              <span className="font-mono tabular-nums">
                Phase {videoPhaseIdx + 1}/{curriculum.videoPhases.length} ·{' '}
                {curriculum.videoPhases[videoPhaseIdx].timeSec.toFixed(2)}s
              </span>
            </div>

            <div className="my-6 rounded-lg border border-slate-700 bg-slate-950/70 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-semibold text-white">
                  {curriculum.videoPhases[videoPhaseIdx].name}
                </span>
                <span className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
                  {curriculum.videoPhases[videoPhaseIdx].targetAngle}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                {curriculum.videoPhases[videoPhaseIdx].coachingCue}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {curriculum.videoPhases.map((phase, idx) => (
                  <button
                    key={phase.name}
                    type="button"
                    onClick={() => {
                      setVideoPlaying(false);
                      setVideoPhaseIdx(idx);
                    }}
                    className={`rounded-md px-2 py-2 text-left text-xs transition-colors ${
                      idx === videoPhaseIdx
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-mono text-[11px] tabular-nums">{phase.timeSec.toFixed(2)}s</div>
                    <div className="truncate">{phase.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVideoPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  {videoPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{videoPlaying ? 'Pause Drill' : 'Play Loop'}</span>
                </button>
                <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
                  {(['0.25x', '0.5x', '1.0x'] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        playbackSpeed === spd ? 'bg-white text-slate-900 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCompleteWrittenOrVideo('video')}
                className="rounded-lg border border-slate-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Complete Video Drill
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              {sport} Phase Checklist
            </h3>
            <div className="divide-y divide-slate-100">
              {curriculum.videoPhases.map((p, idx) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setVideoPhaseIdx(idx)}
                  className="w-full py-3 text-left flex items-start justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.coachingCue}</div>
                  </div>
                  <span className="font-mono text-xs text-emerald-700 tabular-nums shrink-0">
                    {p.targetAngle}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {modality === 'vr' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-900 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-2">
              <div className="text-xs font-medium text-slate-300">
                VR {sport} Simulator · {activeRole.label}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {curriculum.vrScenarios.map((sc, idx) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setScenarioIdx(idx)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      scenarioIdx === idx
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            <canvas
              ref={vrCanvasRef}
              width={720}
              height={360}
              className="w-full rounded-lg border border-slate-800 bg-slate-950"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 px-2">
              <button
                type="button"
                onClick={handleLaunchVR}
                disabled={simActive}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {simActive ? 'Sequence Active...' : 'Start VR Sequence'}
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {curriculum.vrActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled={!simActive}
                    onClick={() => handleVRAction(action)}
                    className="rounded-lg border border-slate-600 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40 whitespace-nowrap shrink-0"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                VR Telemetry Readout
              </h3>
              <p className="text-sm text-slate-600">
                Launch the <strong>{sport}</strong> scenario and execute your skill move inside the optimal reaction window.
              </p>

              {vrResult ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="text-xs font-medium text-slate-500">Execution Result</div>
                  <div className="text-base font-semibold text-slate-900">{vrResult.action}</div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="text-xs text-slate-500">Reaction Time</div>
                      <div className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
                        {vrResult.reactionMs} ms
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Timing Accuracy</div>
                      <div className="font-mono text-xl font-semibold text-emerald-700 tabular-nums">
                        {vrResult.accuracyPct}%
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                    {vrResult.outcome}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  Press Start VR Sequence to capture live millisecond reaction and {sport} execution accuracy.
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
              Completed {sport} drills sync straight to Analytics & Coach Review.
            </div>
          </div>
        </div>
      )}

      {modality === 'ar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between px-2 text-xs text-slate-300">
              <span>AR Skeletal Biomechanics · {sport} ({activeRole.label})</span>
              <span className="font-mono">60fps Pose Calibration</span>
            </div>
            <canvas
              ref={arCanvasRef}
              width={700}
              height={360}
              className="w-full rounded-lg border border-slate-800 bg-slate-950"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {sport} Joint Calibration
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tune joint angles into the biomechanical target window for {activeRole.label}.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-700">Arm / Elbow: <strong className="font-mono tabular-nums">{elbowAngle}°</strong></span>
                  <span className={elbowOptimal ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {elbowOptimal ? '● OPTIMAL' : '▲ ADJUST'}
                  </span>
                </div>
                <input
                  type="range"
                  min={75}
                  max={180}
                  value={elbowAngle}
                  onChange={(e) => setElbowAngle(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  Target: {curriculum.arTarget.elbowOpt[0]}°–{curriculum.arTarget.elbowOpt[1]}°
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-700">Knee Flexion: <strong className="font-mono tabular-nums">{kneeAngle}°</strong></span>
                  <span className={kneeOptimal ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {kneeOptimal ? '● OPTIMAL' : '▲ ADJUST'}
                  </span>
                </div>
                <input
                  type="range"
                  min={75}
                  max={178}
                  value={kneeAngle}
                  onChange={(e) => setKneeAngle(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  Target: {curriculum.arTarget.kneeOpt[0]}°–{curriculum.arTarget.kneeOpt[1]}°
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-700">Head Offset: <strong className="font-mono tabular-nums">{headOffsetCm} cm</strong></span>
                  <span className={headOptimal ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {headOptimal ? '● OPTIMAL' : '▲ ADJUST'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={18}
                  value={headOffsetCm}
                  onChange={(e) => setHeadOffsetCm(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  Target: ≤ {curriculum.arTarget.headOffsetMax} cm
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setElbowAngle(Math.round((curriculum.arTarget.elbowOpt[0] + curriculum.arTarget.elbowOpt[1]) / 2));
                  setKneeAngle(Math.round((curriculum.arTarget.kneeOpt[0] + curriculum.arTarget.kneeOpt[1]) / 2));
                  setHeadOffsetCm(2);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Preset</span>
              </button>
              <button
                type="button"
                onClick={handleSaveAR}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Save AR Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
