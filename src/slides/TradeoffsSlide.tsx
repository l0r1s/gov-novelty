import { SlideShell } from "@/components/SlideShell";
import { Card } from "@/components/ui/card";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Ban,
  GitBranch,
  LockKeyhole,
  Route,
  UsersRound,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "ink" | "focus" | "approve" | "accent" | "reject" | "muted";

const TRADEOFFS: Array<{
  icon: ReactNode;
  tone: Tone;
  spectrum: string;
  left: string;
  right: string;
  landing: string;
}> = [
  {
    icon: <Zap className="h-4 w-4" />,
    tone: "accent",
    spectrum: "Speed of decision",
    left: "Small committee",
    right: "Large assembly",
    landing: "Triumvirate decides; Review adjusts timing.",
  },
  {
    icon: <UsersRound className="h-4 w-4" />,
    tone: "focus",
    spectrum: "Voter selection",
    left: "Curated seats",
    right: "Ranked seats",
    landing: "Curated decision body; computed review body.",
  },
  {
    icon: <LockKeyhole className="h-4 w-4" />,
    tone: "ink",
    spectrum: "Voter set stability",
    left: "Frozen at submission",
    right: "Live re-evaluation",
    landing: "Frozen snapshots keep thresholds predictable.",
  },
  {
    icon: <Activity className="h-4 w-4" />,
    tone: "approve",
    spectrum: "Adjustment curve",
    left: "Step thresholds",
    right: "Smooth interpolation",
    landing: "Ease-out curve between cancel and fast-track.",
  },
  {
    icon: <Ban className="h-4 w-4" />,
    tone: "reject",
    spectrum: "Cancellation paths",
    left: "Anyone can withdraw",
    right: "Governance stop",
    landing: "No proposer-cancel; emergency kill is governed.",
  },
  {
    icon: <Route className="h-4 w-4" />,
    tone: "muted",
    spectrum: "Track variety",
    left: "Many tracks",
    right: "One generic track",
    landing: "Two shipped tracks; machinery supports more.",
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
      subtitle="The runtime makes a few explicit choices instead of exposing every possible governance mode."
      className="gap-5"
    >
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-4">
        {TRADEOFFS.map((t) => (
          <TradeoffCard key={t.spectrum} {...t} />
        ))}
      </div>
    </SlideShell>
  );
}

function TradeoffCard({
  icon,
  tone,
  spectrum,
  left,
  right,
  landing,
}: {
  icon: ReactNode;
  tone: Tone;
  spectrum: string;
  left: string;
  right: string;
  landing: string;
}) {
  return (
    <Card className="flex min-h-0 flex-col p-4">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded border",
            tone === "ink" && "border-line bg-ink text-canvas",
            tone === "focus" && "border-focus-line bg-focus-bg text-focus",
            tone === "approve" && "border-approve-line bg-approve-bg text-approve",
            tone === "accent" && "border-accent-line bg-accent-bg text-accent",
            tone === "reject" && "border-reject-line bg-reject-bg text-reject",
            tone === "muted" && "border-line bg-soft text-ink-3",
          )}
        >
          {icon}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
            Trade-off
          </div>
          <h3 className="text-[14px] font-semibold leading-tight text-ink">
            {spectrum}
          </h3>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[10.5px]">
        <div className="flex items-start gap-1.5 text-ink-3">
          <ArrowLeft className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{left}</span>
        </div>
        <div className="h-px w-4 bg-line" />
        <div className="flex items-start justify-end gap-1.5 text-right text-ink-3">
          <span>{right}</span>
          <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
        </div>
      </div>

      <div className="mt-auto border-t border-line pt-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-ink-3">
          <GitBranch className="h-3 w-3" />
          We picked
        </div>
        <p className="mt-1 text-[13px] font-medium leading-snug text-ink">
          {landing}
        </p>
      </div>
    </Card>
  );
}
