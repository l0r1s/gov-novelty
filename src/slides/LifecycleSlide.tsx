import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  FastForward,
  Play,
  RotateCw,
  Skull,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SlideShell } from "@/components/SlideShell";
import {
  REVIEW_CANCEL_THRESHOLD,
  REVIEW_FAST_TRACK_THRESHOLD,
  REVIEW_INITIAL_DELAY_HOURS,
  REVIEW_MAX_DELAY_HOURS,
  TRIUMVIRATE_APPROVE_THRESHOLD,
  TRIUMVIRATE_REJECT_THRESHOLD,
} from "@/data/governance";
import { cn, fmtHours } from "@/lib/utils";
import {
  initialSimState,
  phaseLabel,
  phaseTone,
  reducer,
  tally,
  type Phase,
  type SimEvent,
  type Voter,
} from "@/sim/lifecycle";

export function LifecycleSlide() {
  const [state, dispatch] = React.useReducer(reducer, undefined, initialSimState);
  const [autoplay, setAutoplay] = React.useState(false);

  // Auto-advance the simulated clock while a phase is ongoing.
  React.useEffect(() => {
    if (!autoplay) return;
    if (state.phase !== "review_ongoing" && state.phase !== "track0_ongoing") {
      return;
    }
    const interval = setInterval(() => dispatch({ type: "tick", hours: 1 }), 350);
    return () => clearInterval(interval);
  }, [autoplay, state.phase]);

  React.useEffect(() => {
    if (
      state.phase !== "track0_ongoing" &&
      state.phase !== "review_ongoing" &&
      autoplay
    ) {
      setAutoplay(false);
    }
  }, [state.phase, autoplay]);

  const t0 = tally(state.triumvirate);
  const t1 = tally(state.reviewVoters);

  return (
    <SlideShell
      eyebrow="Live simulation"
      title={
        <>
          Watch a proposal{" "}
          <span className="text-ink-3">travel the system end-to-end.</span>
        </>
      }
      subtitle="Cast votes on either track, advance the clock, or let it run. The state machine — submission → Triumvirate → Review → enactment — is exactly what runs on-chain."
    >
      <div className="flex flex-1 min-h-0 gap-5">
        {/* Left column: tracks */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          <ProposalHeader phase={state.phase} />
          <div className="grid flex-1 grid-cols-2 gap-4 min-h-0">
            <Track0Panel
              voters={state.triumvirate}
              phase={state.phase}
              ayeFrac={t0.ayeFrac}
              nayFrac={t0.nayFrac}
              onVote={(id, vote) =>
                dispatch({ type: "vote_triumvirate", id, vote })
              }
            />
            <Track1Panel
              voters={state.reviewVoters}
              phase={state.phase}
              ayeFrac={t1.ayeFrac}
              nayFrac={t1.nayFrac}
              delayHours={state.reviewDelayHours}
              elapsedHours={state.reviewElapsedHours}
              onVote={(id, vote) =>
                dispatch({ type: "vote_review", id, vote })
              }
              onBulk={(aye, nay) =>
                dispatch({ type: "vote_review_bulk", aye, nay })
              }
            />
          </div>
        </div>

        {/* Right column: controls + timeline */}
        <aside className="flex w-[280px] shrink-0 flex-col gap-4">
          <Controls
            phase={state.phase}
            autoplay={autoplay}
            onSubmit={() => dispatch({ type: "submit" })}
            onTick={(h) => dispatch({ type: "tick", hours: h })}
            onAutoplay={() => setAutoplay((v) => !v)}
            onKill={() => dispatch({ type: "kill" })}
            onReset={() => {
              setAutoplay(false);
              dispatch({ type: "reset" });
            }}
          />
          <Timeline phase={state.phase} events={state.events} />
        </aside>
      </div>
    </SlideShell>
  );
}

/* ---------- Header ---------- */

function ProposalHeader({ phase }: { phase: Phase }) {
  const tone = phaseTone(phase);
  return (
    <Card className="relative overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          tone === "focus" && "bg-focus",
          tone === "approve" && "bg-approve",
          tone === "reject" && "bg-reject",
          tone === "default" && "bg-ink-3",
        )}
      />
      <div className="flex items-center gap-5 px-5 py-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-ink-3">
            <span>Proposal #1029</span>
            <span>•</span>
            <span>Proposer P01</span>
          </div>
          <div className="mt-0.5 font-mono text-[13.5px] text-ink">
            balances.forceSetBalance(
            <span className="text-ink-3">target</span>,{" "}
            <span className="text-ink-3">2 TAO</span>)
          </div>
        </div>
        <Badge
          variant={
            tone === "approve"
              ? "approve"
              : tone === "reject"
                ? "reject"
                : tone === "focus"
                  ? "focus"
                  : "outline"
          }
        >
          {phaseLabel(phase)}
        </Badge>
      </div>
    </Card>
  );
}

/* ---------- Track 0 ---------- */

function Track0Panel({
  voters,
  phase,
  ayeFrac,
  nayFrac,
  onVote,
}: {
  voters: Voter[];
  phase: Phase;
  ayeFrac: number;
  nayFrac: number;
  onVote: (id: string, vote: "aye" | "nay" | null) => void;
}) {
  const active = phase === "track0_ongoing";
  const done =
    phase === "track0_rejected" ||
    phase === "review_ongoing" ||
    phase === "review_fast_tracked" ||
    phase === "review_cancelled" ||
    phase === "review_enacted" ||
    phase === "killed" ||
    phase === "track0_expired";

  return (
    <Card
      className={cn(
        "flex flex-col p-5 transition-opacity",
        !active && !done && "opacity-60",
        done && phase !== "track0_rejected" && phase !== "track0_expired" && "opacity-80",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={active ? "solid" : "default"} className="text-[10px]">
              track 0
            </Badge>
            <h3 className="text-[15px] font-semibold">Triumvirate decision</h3>
          </div>
          <p className="mt-0.5 text-[11.5px] text-ink-3">
            2/3 aye → delegate · 2/3 nay → reject · 7 day deadline
          </p>
        </div>
        <Clock className="h-4 w-4 text-ink-3" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {voters.map((v) => (
          <TriumvirateVoter
            key={v.id}
            voter={v}
            disabled={!active}
            onVote={(vote) => onVote(v.id, vote)}
          />
        ))}
      </div>

      <Separator className="my-4" />

      <ThresholdMeter
        label="Approve"
        value={ayeFrac}
        threshold={TRIUMVIRATE_APPROVE_THRESHOLD}
        thresholdLabel="2/3"
        tone="approve"
      />
      <div className="h-3" />
      <ThresholdMeter
        label="Reject"
        value={nayFrac}
        threshold={TRIUMVIRATE_REJECT_THRESHOLD}
        thresholdLabel="2/3"
        tone="reject"
      />
    </Card>
  );
}

function TriumvirateVoter({
  voter,
  disabled,
  onVote,
}: {
  voter: Voter;
  disabled: boolean;
  onVote: (vote: "aye" | "nay" | null) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-2",
        voter.vote === "aye" && "border-approve-line bg-approve-bg",
        voter.vote === "nay" && "border-reject-line bg-reject-bg",
        voter.vote === null && "border-line bg-canvas",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11.5px] font-medium text-ink">
          {voter.id}
        </span>
        {voter.vote && (
          <button
            type="button"
            onClick={() => onVote(null)}
            disabled={disabled}
            className="text-[10px] text-ink-3 hover:text-ink"
          >
            clear
          </button>
        )}
      </div>
      <div className="mt-1.5 flex gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onVote("aye")}
          className={cn(
            "flex h-7 flex-1 items-center justify-center gap-1 rounded text-[10.5px] font-medium uppercase tracking-wider transition-colors",
            voter.vote === "aye"
              ? "bg-approve text-canvas"
              : "border border-line text-ink-3 hover:border-approve-line hover:text-approve",
            disabled && "cursor-not-allowed opacity-40",
          )}
        >
          <Check className="h-3 w-3" />
          aye
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onVote("nay")}
          className={cn(
            "flex h-7 flex-1 items-center justify-center gap-1 rounded text-[10.5px] font-medium uppercase tracking-wider transition-colors",
            voter.vote === "nay"
              ? "bg-reject text-canvas"
              : "border border-line text-ink-3 hover:border-reject-line hover:text-reject",
            disabled && "cursor-not-allowed opacity-40",
          )}
        >
          <X className="h-3 w-3" />
          nay
        </button>
      </div>
    </div>
  );
}

/* ---------- Track 1 ---------- */

function Track1Panel({
  voters,
  phase,
  ayeFrac,
  nayFrac,
  delayHours,
  elapsedHours,
  onVote,
  onBulk,
}: {
  voters: Voter[];
  phase: Phase;
  ayeFrac: number;
  nayFrac: number;
  delayHours: number;
  elapsedHours: number;
  onVote: (id: string, vote: "aye" | "nay" | null) => void;
  onBulk: (aye: number, nay: number) => void;
}) {
  const active = phase === "review_ongoing";
  const reachedT0 =
    phase === "review_ongoing" ||
    phase === "review_fast_tracked" ||
    phase === "review_cancelled" ||
    phase === "review_enacted";

  return (
    <Card
      className={cn(
        "flex flex-col p-5 transition-opacity",
        !reachedT0 && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={active ? "focus" : "default"} className="text-[10px]">
              track 1
            </Badge>
            <h3 className="text-[15px] font-semibold">Review</h3>
          </div>
          <p className="mt-0.5 text-[11.5px] text-ink-3">
            Economic ∪ Building · 75% fast-track · 51% cancel
          </p>
        </div>
        <Clock className="h-4 w-4 text-ink-3" />
      </div>

      <DispatchTimeline
        delayHours={delayHours}
        elapsedHours={elapsedHours}
        phase={phase}
      />

      <div className="mt-3 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[3px]">
        {voters.map((v) => (
          <ReviewVoterDot
            key={v.id}
            voter={v}
            disabled={!active}
            onVote={(vote) => onVote(v.id, vote)}
          />
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <BulkBtn label="+5 aye" tone="approve" disabled={!active} onClick={() => onBulk(5, 0)} />
        <BulkBtn label="+12 aye" tone="approve" disabled={!active} onClick={() => onBulk(12, 0)} />
        <BulkBtn label="+24 aye" tone="approve" disabled={!active} onClick={() => onBulk(24, 0)} />
        <span className="mx-1 text-[10px] text-ink-3">/</span>
        <BulkBtn label="+5 nay" tone="reject" disabled={!active} onClick={() => onBulk(0, 5)} />
        <BulkBtn label="+17 nay" tone="reject" disabled={!active} onClick={() => onBulk(0, 17)} />
        <span className="mx-1 text-[10px] text-ink-3">/</span>
        <BulkBtn label="clear" tone="muted" disabled={!active} onClick={() => onBulk(0, 0)} />
      </div>

      <Separator className="my-3" />

      <ThresholdMeter
        label="Fast-track"
        value={ayeFrac}
        threshold={REVIEW_FAST_TRACK_THRESHOLD}
        thresholdLabel="75%"
        tone="approve"
      />
      <div className="h-2" />
      <ThresholdMeter
        label="Cancel"
        value={nayFrac}
        threshold={REVIEW_CANCEL_THRESHOLD}
        thresholdLabel="51%"
        tone="reject"
      />
    </Card>
  );
}

function ReviewVoterDot({
  voter,
  disabled,
  onVote,
}: {
  voter: Voter;
  disabled: boolean;
  onVote: (vote: "aye" | "nay" | null) => void;
}) {
  const cycleVote = () => {
    if (voter.vote === null) onVote("aye");
    else if (voter.vote === "aye") onVote("nay");
    else onVote(null);
  };
  const tooltip = `${voter.id} (${voter.collective})`;
  return (
    <button
      type="button"
      title={tooltip}
      disabled={disabled}
      onClick={cycleVote}
      className={cn(
        "h-5 rounded-[3px] border transition-all",
        voter.vote === "aye" && "border-approve bg-approve",
        voter.vote === "nay" && "border-reject bg-reject",
        voter.vote === null &&
          voter.collective === "Economic" &&
          "border-line bg-canvas hover:border-focus",
        voter.vote === null &&
          voter.collective === "Building" &&
          "border-line bg-soft hover:border-accent",
        disabled && "cursor-not-allowed opacity-50",
      )}
    />
  );
}

function BulkBtn({
  label,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  tone: "approve" | "reject" | "muted";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-6 rounded border px-2 text-[10.5px] font-medium transition-colors",
        tone === "approve" &&
          "border-approve-line bg-approve-bg text-approve hover:bg-approve hover:text-canvas",
        tone === "reject" &&
          "border-reject-line bg-reject-bg text-reject hover:bg-reject hover:text-canvas",
        tone === "muted" &&
          "border-line bg-canvas text-ink-3 hover:bg-soft",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {label}
    </button>
  );
}

/* ---------- Dispatch timeline ---------- */

function DispatchTimeline({
  delayHours,
  elapsedHours,
  phase,
}: {
  delayHours: number;
  elapsedHours: number;
  phase: Phase;
}) {
  const dispatchPct = Math.min(100, (delayHours / REVIEW_MAX_DELAY_HOURS) * 100);
  const elapsedPct = Math.min(100, (elapsedHours / REVIEW_MAX_DELAY_HOURS) * 100);
  const initialPct = (REVIEW_INITIAL_DELAY_HOURS / REVIEW_MAX_DELAY_HOURS) * 100;

  let status: { text: string; tone: "focus" | "approve" | "reject" | "muted" };
  if (phase === "review_fast_tracked") status = { text: "Fast-tracked", tone: "approve" };
  else if (phase === "review_enacted") status = { text: "Enacted", tone: "approve" };
  else if (phase === "review_cancelled") status = { text: "Cancelled", tone: "reject" };
  else if (phase === "review_ongoing") {
    const remaining = Math.max(0, delayHours - elapsedHours);
    status = {
      text: `Dispatch in ${fmtHours(remaining)}`,
      tone: "focus",
    };
  } else status = { text: "Awaiting Track 0", tone: "muted" };

  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <span className="text-ink-3">Scheduled dispatch</span>
        <span
          className={cn(
            "font-medium",
            status.tone === "approve" && "text-approve",
            status.tone === "reject" && "text-reject",
            status.tone === "focus" && "text-focus",
            status.tone === "muted" && "text-ink-3",
          )}
        >
          {status.text}
        </span>
      </div>
      <div className="relative h-8 rounded-md border border-line bg-soft">
        {/* Elapsed shaded region */}
        <div
          className="absolute inset-y-0 left-0 rounded-l-md bg-ink-2/10"
          style={{ width: `${elapsedPct}%` }}
        />
        {/* Initial delay marker */}
        <div
          className="absolute inset-y-0 border-l border-dashed border-ink-3/40"
          style={{ left: `${initialPct}%` }}
        >
          <span className="absolute -top-[14px] -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-wider text-ink-3">
            initial 24h
          </span>
        </div>
        {/* Max marker */}
        <div className="absolute inset-y-0 right-0 border-r-2 border-reject-line" />
        {/* Dispatch dot */}
        <motion.div
          className={cn(
            "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
            phase === "review_fast_tracked" || phase === "review_enacted"
              ? "border-approve bg-approve"
              : phase === "review_cancelled"
                ? "border-reject bg-reject"
                : "border-focus bg-canvas",
          )}
          animate={{ left: `${dispatchPct}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
        <span>0h</span>
        <span>24h</span>
        <span>48h</span>
      </div>
    </div>
  );
}

/* ---------- Threshold meter ---------- */

function ThresholdMeter({
  label,
  value,
  threshold,
  thresholdLabel,
  tone,
}: {
  label: string;
  value: number;
  threshold: number;
  thresholdLabel: string;
  tone: "approve" | "reject";
}) {
  const reached = value >= threshold;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-ink-3">{label}</span>
        <span
          className={cn(
            "font-mono font-medium tabular-nums",
            tone === "approve" && reached && "text-approve",
            tone === "reject" && reached && "text-reject",
            !reached && "text-ink-2",
          )}
        >
          {Math.round(value * 100)}%
          <span className="text-ink-3"> / {thresholdLabel}</span>
        </span>
      </div>
      <div className="relative mt-1 h-1.5 rounded-full bg-soft">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            tone === "approve" && "bg-approve",
            tone === "reject" && "bg-reject",
          )}
          style={{ width: `${Math.min(100, value * 100)}%` }}
        />
        <div
          className={cn(
            "absolute -top-0.5 h-3 w-px",
            tone === "approve" && "bg-approve",
            tone === "reject" && "bg-reject",
          )}
          style={{ left: `${threshold * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Controls + Timeline ---------- */

function Controls({
  phase,
  autoplay,
  onSubmit,
  onTick,
  onAutoplay,
  onKill,
  onReset,
}: {
  phase: Phase;
  autoplay: boolean;
  onSubmit: () => void;
  onTick: (h: number) => void;
  onAutoplay: () => void;
  onKill: () => void;
  onReset: () => void;
}) {
  const tickable =
    phase === "track0_ongoing" || phase === "review_ongoing";
  return (
    <Card className="p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
        Stage controls
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          variant={phase === "idle" ? "default" : "outline"}
          size="sm"
          disabled={phase !== "idle"}
          onClick={onSubmit}
        >
          <Play className="h-3.5 w-3.5" />
          Submit
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!tickable}
          onClick={() => onTick(1)}
        >
          <Clock className="h-3.5 w-3.5" />
          +1 hour
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!tickable}
          onClick={() => onTick(6)}
        >
          <FastForward className="h-3.5 w-3.5" />
          +6 hours
        </Button>
        <Button
          variant={autoplay ? "default" : "outline"}
          size="sm"
          disabled={!tickable && !autoplay}
          onClick={onAutoplay}
          className="col-span-2"
        >
          <Zap className="h-3.5 w-3.5" />
          {autoplay ? "Pause clock" : "Run clock"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={
            phase === "idle" ||
            phase === "review_enacted" ||
            phase === "review_cancelled" ||
            phase === "review_fast_tracked" ||
            phase === "track0_rejected" ||
            phase === "track0_expired" ||
            phase === "killed"
          }
          onClick={onKill}
          className="col-span-2 border-reject-line text-reject hover:bg-reject hover:text-canvas"
        >
          <Skull className="h-3.5 w-3.5" />
          Root kill
        </Button>
      </div>
    </Card>
  );
}

function Timeline({
  phase,
  events,
}: {
  phase: Phase;
  events: SimEvent[];
}) {
  return (
    <Card className="flex flex-1 min-h-0 flex-col p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
          Event log
        </div>
        <Badge variant="outline" className="text-[10px]">
          {phaseLabel(phase)}
        </Badge>
      </div>
      <div className="mt-3 flex-1 min-h-0 overflow-auto pr-1">
        {events.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-[12px] text-ink-3">
            Submit the proposal to begin.
          </div>
        ) : (
          <ol className="space-y-2">
            <AnimatePresence initial={false}>
              {events.map((e) => (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-start gap-2 text-[11.5px]"
                >
                  <EventDot kind={e.kind} />
                  <span className="text-ink-2">{e.text}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </div>
    </Card>
  );
}

function EventDot({ kind }: { kind: string }) {
  const tone =
    kind === "delegate" || kind === "fast_track" || kind === "enact"
      ? "approve"
      : kind === "cancel" ||
          kind === "reject" ||
          kind === "expire" ||
          kind === "kill"
        ? "reject"
        : kind === "submit"
          ? "focus"
          : "default";
  return (
    <span className="relative mt-1 inline-flex">
      <span
        className={cn(
          "inline-block size-1.5 rounded-full",
          tone === "approve" && "bg-approve",
          tone === "reject" && "bg-reject",
          tone === "focus" && "bg-focus",
          tone === "default" && "bg-ink-3",
        )}
      />
    </span>
  );
}

