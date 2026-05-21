import { SlideShell } from "@/components/SlideShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Gauge,
  Lock,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SafetySlide() {
  return (
    <SlideShell
      eyebrow="What stops abuse"
      title={
        <>
          A few small rules{" "}
          <span className="text-ink-3">do most of the safety work.</span>
        </>
      }
      subtitle="Small constraints cap the blast radius of bad keys, bad calls, and mid-vote rotations."
      className="gap-5"
    >
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-4">
        <SafetyCard
          icon={<Camera className="h-4 w-4" />}
          tone="focus"
          tag="snapshot voting"
          title="Frozen voter set"
          body="Eligible voters are snapshotted when the referendum opens."
          example="Later rotations cannot change a live poll."
        />
        <SafetyCard
          icon={<Lock className="h-4 w-4" />}
          tone="ink"
          tag="no back door"
          title="Track 1 is not submittable"
          body="Review is only reached through Triumvirate approval."
          example="A Proposer key cannot bypass track 0."
        />
        <SafetyCard
          icon={<Gauge className="h-4 w-4" />}
          tone="accent"
          tag="quotas"
          title="Queue caps"
          body="20 active referenda total; 5 per proposer."
          example="A single key cannot fill the queue."
        />
        <SafetyCard
          icon={<ShieldAlert className="h-4 w-4" />}
          tone="approve"
          tag="atomic dispatch"
          title="Atomic dispatch"
          body="Execution and referendum bookkeeping land together."
          example="No stale envelope can run twice."
        />
        <SafetyCard
          icon={<ShieldAlert className="h-4 w-4" />}
          tone="reject"
          tag="emergency stop"
          title="Governance kill"
          body="Active or scheduled referenda can be terminated before dispatch."
          example="No proposer-cancel path."
        />
        <SafetyCard
          icon={<Trash2 className="h-4 w-4" />}
          tone="muted"
          tag="cleanup"
          title="Chunked cleanup"
          body="Tally clears immediately; voter records drain over idle blocks."
          example="Cleanup cannot spike block weight."
        />
      </div>
    </SlideShell>
  );
}

function SafetyCard({
  icon,
  tone,
  tag,
  title,
  body,
  example,
}: {
  icon: React.ReactNode;
  tone: "ink" | "focus" | "approve" | "accent" | "reject" | "muted";
  tag: string;
  title: string;
  body: string;
  example: string;
}) {
  return (
    <Card className="flex min-h-0 flex-col p-4">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded border",
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
        <Badge variant="outline" className="text-[10px]">
          {tag}
        </Badge>
      </div>
      <h3 className="mt-3 text-[14px] font-semibold leading-snug">{title}</h3>
      <p className="mt-2 text-[12px] leading-snug text-ink-2">{body}</p>
      <p className="mt-auto pt-3 text-[11.5px] leading-snug text-ink-3">
        <span className="font-medium text-ink-2">e.g.</span> {example}
      </p>
    </Card>
  );
}
