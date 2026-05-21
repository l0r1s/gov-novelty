import { SlideShell } from "@/components/SlideShell";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Scale } from "lucide-react";

const TRADEOFFS = [
  {
    spectrum: "Speed of decision",
    left: "Plain pass-or-fail by a small committee",
    right: "Long deliberation by a large assembly",
    landing:
      "Triumvirate decides quickly; the broader assembly only adjusts the timing.",
  },
  {
    spectrum: "Voter selection",
    left: "Fully curated seats",
    right: "Fully meritocratic ranking",
    landing:
      "Curated seats for the decision body, automatically-selected seats for the review body.",
  },
  {
    spectrum: "Voter set stability",
    left: "Frozen at submission",
    right: "Re-evaluated continuously",
    landing:
      "Frozen — rotations cannot retroactively change who voted on what. Predictable thresholds.",
  },
  {
    spectrum: "Adjustment curve",
    left: "Step thresholds (binary outcome)",
    right: "Continuous interpolation (smooth)",
    landing:
      "Linear interpolation between two step thresholds. Simple enough to explain on a single chart.",
  },
  {
    spectrum: "Cancellation paths",
    left: "Anyone can withdraw",
    right: "Only the chain itself can stop it",
    landing:
      "No proposer-cancel. Emergency termination is gated by governance itself — the same authority that governs everything else.",
  },
  {
    spectrum: "Track variety",
    left: "Many specialised tracks",
    right: "One generic track",
    landing:
      "Two tracks: a decision track and a review track. The underlying machinery supports more — Subtensor ships with the minimum.",
  },
];

export function TradeoffsSlide() {
  return (
    <SlideShell
      eyebrow="Trade-offs"
      title={
        <>
          Where we landed{" "}
          <span className="text-ink-3">and why.</span>
        </>
      }
      subtitle="Every governance design is a stack of explicit choices. These are ours, and what we picked on each axis."
    >
      <div className="grid flex-1 grid-cols-2 gap-4 pt-1">
        {TRADEOFFS.map((t) => (
          <TradeoffCard key={t.spectrum} {...t} />
        ))}
      </div>
    </SlideShell>
  );
}

function TradeoffCard({
  spectrum,
  left,
  right,
  landing,
}: {
  spectrum: string;
  left: string;
  right: string;
  landing: string;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center gap-2">
        <Scale className="h-3.5 w-3.5 text-ink-3" />
        <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
          {spectrum}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[12px]">
        <div className="flex items-start gap-2 text-ink-3">
          <ArrowLeft className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{left}</span>
        </div>
        <div className="h-px w-6 bg-line" />
        <div className="flex items-start justify-end gap-2 text-right text-ink-3">
          <span>{right}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        </div>
      </div>

      <div className="mt-4 rounded-md border border-ink/80 bg-ink/[0.03] p-3">
        <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
          We picked
        </div>
        <p className="mt-1 text-[13px] leading-snug text-ink">{landing}</p>
      </div>
    </Card>
  );
}
