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
    tagline: "Authorized to file proposals on the Triumvirate track.",
    selection:
      "Curated. Held by the Open Tensor Foundation today; membership is set by governance itself.",
  },
  {
    id: "Triumvirate",
    label: "Triumvirate",
    min: 3,
    max: 3,
    memberSummary: "3",
    termDays: null,
    role: "First-stage approval body",
    tagline: "Three-member committee that approves or rejects proposals.",
    selection: "Curated. Three named seats, later elected via on-chain voting.",
  },
  {
    id: "Economic",
    label: "Economic",
    min: 16,
    max: 16,
    memberSummary: "16",
    termDays: 60,
    role: "Validator-side review voter",
    tagline: "Top 16 root-registered validator coldkeys by smoothed stake value.",
    selection:
      "Selected automatically every 60 days from EconomicEligible, ranked by EMA of (liquid TAO + alpha value).",
  },
  {
    id: "Building",
    label: "Building",
    min: 16,
    max: 16,
    memberSummary: "16",
    termDays: 60,
    role: "Builder-side review voter",
    tagline: "Top 16 subnet-owner coldkeys, weighted by their best mature subnet.",
    selection:
      "Selected automatically every 60 days from owners of subnets older than 180 days, ranked by best moving subnet price.",
  },
  {
    id: "EconomicEligible",
    label: "Economic eligible",
    min: 0,
    max: 64,
    memberSummary: "root-registered",
    termDays: null,
    role: "Staging pool",
    tagline: "Mirror of coldkeys with at least one root-registered hotkey.",
    selection:
      "Synced automatically from root registration. No voting role.",
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

// Adjustable delay curve, mirrored from runtime/src/governance/tracks.rs
// (`LinearAdjustmentCurve`).  The pallet-side math lives in
// pallets/referenda; the runtime currently passes net progress straight
// through, so the mapping is identity.
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
    const progress = Math.min(1, net / fastTrackThreshold);
    const hours = initialHours * (1 - progress);
    return {
      hours,
      mode: net === 0 ? "neutral" : "approving",
    };
  } else {
    const net = rejectFrac - approveFrac;
    const progress = Math.min(1, net / cancelThreshold);
    const hours = initialHours + progress * (maxHours - initialHours);
    return { hours, mode: "delaying" };
  }
}
