// Governance constants pulled from the live runtime wiring in
// runtime/src/governance/{tracks.rs,collectives.rs} and the configured
// referenda + signed-voting parameters in runtime/src/governance/mod.rs.

export const TRIUMVIRATE_DECISION_PERIOD_DAYS = 7;
export const TRIUMVIRATE_APPROVE_THRESHOLD = 2 / 3;
export const TRIUMVIRATE_REJECT_THRESHOLD = 2 / 3;
export const TRIUMVIRATE_SIZE = 3;

export const REVIEW_INITIAL_DELAY_HOURS = 24;
export const REVIEW_MAX_DELAY_HOURS = 48;
export const REVIEW_FAST_TRACK_THRESHOLD = 0.75;
export const REVIEW_CANCEL_THRESHOLD = 0.51;

export const ECONOMIC_SIZE = 16;
export const BUILDING_SIZE = 16;
export const ECONOMIC_ELIGIBLE_CAP = 64;
export const ECONOMIC_ELIGIBILITY_SAMPLES = 210;
export const EMA_ALPHA = 0.02;
export const ECONOMIC_WARMUP_DAYS = 30;
export const TERM_DURATION_DAYS = 60;
export const MIN_SUBNET_AGE_DAYS = 180;

export const MAX_QUEUED = 20;
export const MAX_ACTIVE_PER_PROPOSER = 5;
export const MAX_VOTER_SET_SIZE = 64;
export const MAX_PENDING_CLEANUP = 40;
export const CLEANUP_CHUNK_SIZE = 16;

export type CollectiveId =
  | "Proposers"
  | "Triumvirate"
  | "Economic"
  | "Building"
  | "EconomicEligible";

export interface CollectiveSpec {
  id: CollectiveId;
  label: string;
  heldBy?: string;
  min: number;
  max: number;
  memberSummary?: string;
  termDays: number | null;
  role: string;
  tagline: string;
  selection: string;
}

export const COLLECTIVES: CollectiveSpec[] = [
  {
    id: "Proposers",
    label: "Proposers",
    heldBy: "OTF",
    min: 1,
    max: 20,
    memberSummary: "up to 20",
    termDays: null,
    role: "Submit proposals",
    tagline: "Files proposals on track 0.",
    selection: "Curated by governance; currently OTF-held.",
  },
  {
    id: "Triumvirate",
    label: "Triumvirate",
    min: 3,
    max: 3,
    memberSummary: "3",
    termDays: null,
    role: "First-stage approval body",
    tagline: "Approves or rejects track 0 proposals.",
    selection: "Curated today; can move to on-chain election.",
  },
  {
    id: "Economic",
    label: "Economic",
    min: 16,
    max: 16,
    memberSummary: "16",
    termDays: 60,
    role: "Validator review voter",
    tagline: "Top 16 root-registered validator coldkeys.",
    selection: "Rotates every 60d by EMA stake value.",
  },
  {
    id: "Building",
    label: "Building",
    min: 16,
    max: 16,
    memberSummary: "16",
    termDays: 60,
    role: "Builder review voter",
    tagline: "Top 16 mature subnet-owner coldkeys.",
    selection: "Rotates every 60d by best subnet price.",
  },
  {
    id: "EconomicEligible",
    label: "Economic eligible",
    min: 0,
    max: 64,
    memberSummary: "root-registered",
    termDays: null,
    role: "Staging pool",
    tagline: "Coldkeys with a root-registered hotkey.",
    selection: "Auto-synced staging pool; no voting role.",
  },
];

export interface TrackSpec {
  id: 0 | 1;
  name: string;
  proposer: CollectiveId | null;
  voter: { kind: "single"; id: CollectiveId } | { kind: "union"; ids: CollectiveId[] };
  strategy: "PassOrFail" | "Adjustable";
  description: string;
  details: { label: string; value: string }[];
}

export const TRACKS: TrackSpec[] = [
  {
    id: 0,
    name: "Triumvirate",
    proposer: "Proposers",
    voter: { kind: "single", id: "Triumvirate" },
    strategy: "PassOrFail",
    description:
      "Pass-or-fail decision by the three Triumvirate members. Approval hands the call to the Review track.",
    details: [
      { label: "Decision period", value: "7 days" },
      { label: "Approve threshold", value: "2 / 3" },
      { label: "Reject threshold", value: "2 / 3" },
      { label: "On approval", value: "Delegate to Review (track 1)" },
    ],
  },
  {
    id: 1,
    name: "Review",
    proposer: null,
    voter: { kind: "union", ids: ["Economic", "Building"] },
    strategy: "Adjustable",
    description:
      "Wider, time-bounded review. Economic and Building voters can fast-track, slow-walk, or cancel the call before it dispatches.",
    details: [
      { label: "Initial delay", value: "24 hours" },
      { label: "Max delay", value: "48 hours (adjustable)" },
      { label: "Fast-track at", value: "75% approval" },
      { label: "Cancel at", value: "51% rejection" },
    ],
  },
];

// Adjustable delay curve used by the Review track visualization and
// simulator. Progress is normalized against the relevant threshold, then
// mapped through an ease-out curve: 1 - (1 - p)^3.
function easeOutCubic(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  return 1 - (1 - p) ** 3;
}

export function computeDelayHours(input: {
  approveFrac: number;
  rejectFrac: number;
  initialHours?: number;
  maxHours?: number;
  fastTrackThreshold?: number;
  cancelThreshold?: number;
}): { hours: number; mode: "fast-track" | "approving" | "neutral" | "delaying" | "cancel" } {
  const {
    approveFrac,
    rejectFrac,
    initialHours = REVIEW_INITIAL_DELAY_HOURS,
    maxHours = REVIEW_MAX_DELAY_HOURS,
    fastTrackThreshold = REVIEW_FAST_TRACK_THRESHOLD,
    cancelThreshold = REVIEW_CANCEL_THRESHOLD,
  } = input;
  if (approveFrac >= fastTrackThreshold) return { hours: 0, mode: "fast-track" };
  if (rejectFrac >= cancelThreshold) return { hours: maxHours, mode: "cancel" };
  if (approveFrac >= rejectFrac) {
    const net = approveFrac - rejectFrac;
    const progress = easeOutCubic(net / fastTrackThreshold);
    const hours = initialHours * (1 - progress);
    return {
      hours,
      mode: net === 0 ? "neutral" : "approving",
    };
  } else {
    const net = rejectFrac - approveFrac;
    const progress = easeOutCubic(net / cancelThreshold);
    const hours = initialHours + progress * (maxHours - initialHours);
    return { hours, mode: "delaying" };
  }
}
