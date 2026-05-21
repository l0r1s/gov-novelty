// Simulation state machine for the on-chain governance lifecycle.
// Mirrors pallet-referenda's PassOrFail + Adjustable strategies on top
// of the runtime constants in runtime/src/governance.

import {
  REVIEW_CANCEL_THRESHOLD,
  REVIEW_FAST_TRACK_THRESHOLD,
  REVIEW_INITIAL_DELAY_HOURS,
  TRIUMVIRATE_APPROVE_THRESHOLD,
  TRIUMVIRATE_REJECT_THRESHOLD,
  computeDelayHours,
} from "@/data/governance";

export type Phase =
  | "idle"
  | "track0_ongoing"
  | "track0_rejected"
  | "track0_expired"
  | "review_ongoing"
  | "review_fast_tracked"
  | "review_cancelled"
  | "review_enacted"
  | "killed";

export type Vote = "aye" | "nay" | null;
export interface Voter {
  id: string;
  collective: "Triumvirate" | "Economic" | "Building";
  vote: Vote;
}

export type EventKind =
  | "submit"
  | "vote"
  | "delegate"
  | "delay_change"
  | "fast_track"
  | "cancel"
  | "enact"
  | "reject"
  | "expire"
  | "kill"
  | "tick";

export interface SimEvent {
  id: number;
  at: string;
  kind: EventKind;
  text: string;
}

let _eventCounter = 0;
function nextEventId() {
  _eventCounter += 1;
  return _eventCounter;
}

function ev(kind: EventKind, at: string, text: string): SimEvent {
  return { id: nextEventId(), kind, at, text };
}

export interface SimState {
  phase: Phase;
  triumvirate: Voter[];
  reviewVoters: Voter[];
  reviewDelayHours: number;
  reviewElapsedHours: number;
  reviewDecisionDeadlineHours: number;
  track0ElapsedHours: number;
  track0DecisionDeadlineHours: number;
  events: SimEvent[];
}

export const REVIEW_VOTER_COUNT = 32; // Economic (16) + Building (16)
const TRACK0_DEADLINE_HOURS = 7 * 24;

function makeId(prefix: string, i: number) {
  return `${prefix}${String(i + 1).padStart(2, "0")}`;
}

export function initialSimState(): SimState {
  return {
    phase: "idle",
    triumvirate: Array.from({ length: 3 }, (_, i) => ({
      id: makeId("T", i),
      collective: "Triumvirate",
      vote: null,
    })),
    reviewVoters: Array.from({ length: REVIEW_VOTER_COUNT }, (_, i) => ({
      id: i < 16 ? makeId("E", i) : makeId("B", i - 16),
      collective: i < 16 ? "Economic" : "Building",
      vote: null,
    })),
    reviewDelayHours: REVIEW_INITIAL_DELAY_HOURS,
    reviewElapsedHours: 0,
    reviewDecisionDeadlineHours: REVIEW_INITIAL_DELAY_HOURS,
    track0ElapsedHours: 0,
    track0DecisionDeadlineHours: TRACK0_DEADLINE_HOURS,
    events: [],
  };
}

export function tally(voters: Voter[]) {
  let aye = 0;
  let nay = 0;
  for (const v of voters) {
    if (v.vote === "aye") aye++;
    else if (v.vote === "nay") nay++;
  }
  return {
    aye,
    nay,
    total: voters.length,
    ayeFrac: voters.length === 0 ? 0 : aye / voters.length,
    nayFrac: voters.length === 0 ? 0 : nay / voters.length,
  };
}

export type Action =
  | { type: "submit" }
  | { type: "reset" }
  | { type: "kill" }
  | { type: "vote_triumvirate"; id: string; vote: Vote }
  | { type: "vote_review"; id: string; vote: Vote }
  | { type: "vote_review_bulk"; aye: number; nay: number }
  | { type: "tick"; hours: number };

function maybeAdvancePhase(state: SimState): SimState {
  if (state.phase === "track0_ongoing") {
    const t = tally(state.triumvirate);
    if (t.ayeFrac >= TRIUMVIRATE_APPROVE_THRESHOLD) {
      return {
        ...state,
        phase: "review_ongoing",
        reviewElapsedHours: 0,
        events: [
          ...state.events,
          ev(
            "delegate",
            "approved",
            `Triumvirate ${t.aye}/${t.total} aye — handed off to Review track`,
          ),
        ],
      };
    }
    if (t.nayFrac >= TRIUMVIRATE_REJECT_THRESHOLD) {
      return {
        ...state,
        phase: "track0_rejected",
        events: [
          ...state.events,
          ev(
            "reject",
            "rejected",
            `Triumvirate ${t.nay}/${t.total} nay — referendum rejected`,
          ),
        ],
      };
    }
  }
  if (state.phase === "review_ongoing") {
    const r = tally(state.reviewVoters);
    if (r.ayeFrac >= REVIEW_FAST_TRACK_THRESHOLD) {
      return {
        ...state,
        phase: "review_fast_tracked",
        reviewDelayHours: 0,
        events: [
          ...state.events,
          ev(
            "fast_track",
            "fast-tracked",
            `Review ${r.aye}/${r.total} (${Math.round(
              r.ayeFrac * 100,
            )}%) — fast-track threshold reached, dispatch next block`,
          ),
          ev("enact", "enacted", "Inner call dispatched as root"),
        ],
      };
    }
    if (r.nayFrac >= REVIEW_CANCEL_THRESHOLD) {
      return {
        ...state,
        phase: "review_cancelled",
        events: [
          ...state.events,
          ev(
            "cancel",
            "cancelled",
            `Review ${r.nay}/${r.total} (${Math.round(
              r.nayFrac * 100,
            )}%) — cancel threshold reached`,
          ),
        ],
      };
    }
  }
  return state;
}

function recomputeDelay(state: SimState): SimState {
  if (state.phase !== "review_ongoing") return state;
  const r = tally(state.reviewVoters);
  const { hours } = computeDelayHours({
    approveFrac: r.ayeFrac,
    rejectFrac: r.nayFrac,
  });
  return { ...state, reviewDelayHours: hours };
}

export function reducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case "reset":
      return initialSimState();
    case "submit": {
      if (state.phase !== "idle") return state;
      return {
        ...state,
        phase: "track0_ongoing",
        events: [
          ev(
            "submit",
            "submitted",
            "Proposer files system.setCode(new_runtime_blob) on track 0",
          ),
        ],
      };
    }
    case "kill": {
      if (
        state.phase === "review_enacted" ||
        state.phase === "review_cancelled" ||
        state.phase === "review_fast_tracked" ||
        state.phase === "track0_rejected" ||
        state.phase === "killed" ||
        state.phase === "idle"
      ) {
        return state;
      }
      return {
        ...state,
        phase: "killed",
        events: [
          ...state.events,
          ev(
            "kill",
            "killed",
            "Root issued referenda.kill — referendum terminated",
          ),
        ],
      };
    }
    case "vote_triumvirate": {
      if (state.phase !== "track0_ongoing") return state;
      const triumvirate = state.triumvirate.map((v) =>
        v.id === action.id ? { ...v, vote: action.vote } : v,
      );
      const text =
        action.vote === null
          ? `${action.id} cleared vote`
          : `${action.id} voted ${action.vote.toUpperCase()}`;
      const next: SimState = {
        ...state,
        triumvirate,
        events: [...state.events, ev("vote", "track 0", text)],
      };
      return maybeAdvancePhase(next);
    }
    case "vote_review": {
      if (state.phase !== "review_ongoing") return state;
      const reviewVoters = state.reviewVoters.map((v) =>
        v.id === action.id ? { ...v, vote: action.vote } : v,
      );
      const text =
        action.vote === null
          ? `${action.id} cleared vote`
          : `${action.id} voted ${action.vote.toUpperCase()}`;
      const next = recomputeDelay({
        ...state,
        reviewVoters,
        events: [...state.events, ev("vote", "review", text)],
      });
      return maybeAdvancePhase(next);
    }
    case "vote_review_bulk": {
      if (state.phase !== "review_ongoing") return state;
      const reviewVoters = state.reviewVoters.map((v) => ({
        ...v,
        vote: null as Vote,
      }));
      let ayeAssigned = 0;
      let nayAssigned = 0;
      for (let i = 0; i < reviewVoters.length; i++) {
        if (ayeAssigned < action.aye) {
          reviewVoters[i] = { ...reviewVoters[i], vote: "aye" };
          ayeAssigned++;
        } else if (nayAssigned < action.nay) {
          reviewVoters[i] = { ...reviewVoters[i], vote: "nay" };
          nayAssigned++;
        }
      }
      const next = recomputeDelay({
        ...state,
        reviewVoters,
        events: [
          ...state.events,
          ev("vote", "review", `${action.aye} aye / ${action.nay} nay cast`),
        ],
      });
      return maybeAdvancePhase(next);
    }
    case "tick": {
      if (state.phase === "track0_ongoing") {
        const track0ElapsedHours = state.track0ElapsedHours + action.hours;
        if (track0ElapsedHours >= state.track0DecisionDeadlineHours) {
          return {
            ...state,
            track0ElapsedHours: state.track0DecisionDeadlineHours,
            phase: "track0_expired",
            events: [
              ...state.events,
              ev(
                "expire",
                "expired",
                "7-day decision period elapsed without a threshold — referendum expired",
              ),
            ],
          };
        }
        return { ...state, track0ElapsedHours };
      }
      if (state.phase === "review_ongoing") {
        const reviewElapsedHours = state.reviewElapsedHours + action.hours;
        if (reviewElapsedHours >= state.reviewDelayHours) {
          return {
            ...state,
            reviewElapsedHours: state.reviewDelayHours,
            phase: "review_enacted",
            events: [
              ...state.events,
              ev(
                "enact",
                "enacted",
                "Scheduler dispatched the inner call as root",
              ),
            ],
          };
        }
        return { ...state, reviewElapsedHours };
      }
      return state;
    }
  }
}

export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case "idle":
      return "Not submitted";
    case "track0_ongoing":
      return "Track 0 — Triumvirate ongoing";
    case "track0_rejected":
      return "Track 0 — Rejected";
    case "track0_expired":
      return "Track 0 — Expired";
    case "review_ongoing":
      return "Track 1 — Review ongoing";
    case "review_fast_tracked":
      return "Track 1 — Fast-tracked";
    case "review_cancelled":
      return "Track 1 — Cancelled";
    case "review_enacted":
      return "Track 1 — Enacted";
    case "killed":
      return "Killed by root";
  }
}

export function phaseTone(
  phase: Phase,
): "default" | "approve" | "reject" | "focus" | "accent" {
  switch (phase) {
    case "idle":
      return "default";
    case "track0_ongoing":
    case "review_ongoing":
      return "focus";
    case "track0_rejected":
    case "track0_expired":
    case "review_cancelled":
    case "killed":
      return "reject";
    case "review_fast_tracked":
    case "review_enacted":
      return "approve";
  }
}
