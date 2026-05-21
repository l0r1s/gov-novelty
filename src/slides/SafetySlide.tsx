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
      subtitle="Each constraint targets a concrete failure mode. Together they put a hard cap on the blast radius of a single compromised key, a buggy proposal, or a partisan rotation."
    >
      <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-4 pt-1">
        <SafetyCard
          icon={<Camera className="h-4 w-4" />}
          tag="snapshot voting"
          title="Voter set is frozen at submission."
          body="When a referendum opens, the eligible voter list is snapshotted and sorted. Later rotations can't add new voters to live polls or strip rights from voters who already cast."
          example="A 60-day rotation in the middle of a 7-day Triumvirate decision changes nothing for that referendum."
        />
        <SafetyCard
          icon={<Lock className="h-4 w-4" />}
          tag="no back door"
          title="Track 1 has no proposer set."
          body="The only way to land a root call in the 24-hour Review delay is through Triumvirate approval. No direct submission. No shortcut."
          example="A compromised Proposer key still has to convince two of three Triumvirate members."
        />
        <SafetyCard
          icon={<Gauge className="h-4 w-4" />}
          tag="quotas"
          title="Hard caps on the queue."
          body="A maximum of 20 active referenda system-wide, and 5 per single proposer. The chain rejects new submissions over those limits."
          example="A compromised proposer key can hold at most 5 of the 20 queue slots."
        />
        <SafetyCard
          icon={<ShieldAlert className="h-4 w-4" />}
          tag="atomic dispatch"
          title="One block, one outcome."
          body="The chain wraps the governed call in a dispatch envelope that marks the referendum enacted in the same step that runs the call. Dispatch and bookkeeping land together."
          example="A stale envelope can never run the call twice."
        />
        <SafetyCard
          icon={<ShieldAlert className="h-4 w-4" />}
          tag="emergency stop"
          title="Governance can kill anything before dispatch."
          body="An emergency stop terminates an active, approved, or fast-tracked referendum and cancels its scheduled dispatch. There is no proposer-cancel — emergency stop is the only stop button."
          example="A circuit breaker for catastrophic mistakes, gated by governance itself."
        />
        <SafetyCard
          icon={<Trash2 className="h-4 w-4" />}
          tag="cleanup"
          title="Vote storage is reclaimed lazily."
          body="When a poll completes, the tally is removed immediately. Per-voter records drain in small chunks over the following blocks so cleanup never spikes block weight."
          example="Storage hygiene, not correctness — backlogs leak bytes, not votes."
        />
      </div>
    </SlideShell>
  );
}

function SafetyCard({
  icon,
  tag,
  title,
  body,
  example,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  body: string;
  example: string;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <div className="rounded border border-line bg-soft p-2 text-ink-2">
          {icon}
        </div>
        <Badge variant="outline" className="text-[10px]">
          {tag}
        </Badge>
      </div>
      <h3 className="mt-3 text-[15px] font-semibold leading-snug">{title}</h3>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{body}</p>
      <div className="mt-auto pt-3">
        <div className="rounded border border-dashed border-line bg-soft/50 p-2.5 text-[11px] leading-relaxed text-ink-3">
          <span className="font-medium text-ink-2">e.g.</span> {example}
        </div>
      </div>
    </Card>
  );
}
