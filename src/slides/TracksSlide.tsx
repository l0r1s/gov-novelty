import { SlideShell } from "@/components/SlideShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Gavel, Users2, Lock } from "lucide-react";
import { TRACKS, type TrackSpec } from "@/data/governance";
import { cn } from "@/lib/utils";

export function TracksSlide() {
  return (
    <SlideShell
      eyebrow="The pipeline"
      title={
        <>
          Two tracks.{" "}
          <span className="text-ink-3">One is the only way in.</span>
        </>
      }
      subtitle="Every proposal enters through Track 0. Approval there is the only way to reach Track 1. There is no other on-chain entry point into the review delay."
    >
      <div className="relative flex flex-1 min-h-0 items-stretch gap-6 pt-1">
        <div className="flex flex-1 flex-col min-w-0">
          <TrackCard track={TRACKS[0]} side="left" />
        </div>
        <div className="flex flex-col items-center justify-center gap-3 pt-2">
          <ApprovalArrow />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <TrackCard track={TRACKS[1]} side="right" />
        </div>
      </div>

      <footer className="mt-6 grid grid-cols-3 gap-6 border-t border-line pt-5 text-[13px] leading-relaxed text-ink-3">
        <Note
          icon={<Lock className="h-3.5 w-3.5" />}
          title="No back door"
          body="Track 1 has no submission entry point. The only way a call reaches the 24-hour delay is through Triumvirate approval on Track 0."
        />
        <Note
          icon={<Users2 className="h-3.5 w-3.5" />}
          title="Voter set is frozen"
          body="When a referendum opens, the eligible voter list is snapshotted. Later rotations don't affect ongoing polls."
        />
        <Note
          icon={<Gavel className="h-3.5 w-3.5" />}
          title="Only governance can stop it"
          body="There is no proposer-cancel. Once a proposal is in flight, only an emergency stop from governance itself can terminate it."
        />
      </footer>
    </SlideShell>
  );
}

function TrackCard({ track, side }: { track: TrackSpec; side: "left" | "right" }) {
  const isStage0 = track.id === 0;
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden",
        isStage0 ? "border-ink" : "border-focus-line",
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          isStage0 ? "bg-ink" : "bg-focus",
        )}
      />
      <CardContent className="p-6 pt-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={isStage0 ? "solid" : "focus"} className="text-[10px]">
                track {track.id}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {track.strategy}
              </Badge>
            </div>
            <h3 className="mt-2 text-[22px] font-semibold tracking-tight">
              {track.name}
            </h3>
            <p className="mt-1 min-h-[40px] text-[12.5px] leading-relaxed text-ink-3">
              {track.description}
            </p>
          </div>
          <div className="text-right text-[10px] uppercase tracking-[0.18em] text-ink-3">
            <p>{side === "left" ? "decides" : "reviews"}</p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Proposer set"
            value={track.proposer ?? "—"}
            tone={track.proposer ? "ink" : "muted"}
          />
          <Field
            label="Voter set"
            value={
              track.voter.kind === "single"
                ? track.voter.id
                : `${track.voter.ids.join(" ∪ ")}`
            }
            tone={isStage0 ? "ink" : "focus"}
          />
        </div>

        <div className="mt-3 space-y-1.5 rounded-md border border-line bg-soft p-3">
          {track.details.map((d) => (
            <div
              key={d.label}
              className="flex items-baseline justify-between gap-3 text-[12px]"
            >
              <span className="text-ink-3">{d.label}</span>
              <span className="font-medium text-ink">{d.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ink" | "focus" | "muted";
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-3">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-mono text-[13px]",
          tone === "ink" && "text-ink",
          tone === "focus" && "text-focus",
          tone === "muted" && "text-ink-3",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ApprovalArrow() {
  return (
    <div className="flex flex-col items-center gap-2 px-2">
      <div className="rounded-md border border-line bg-canvas px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ink-3">
        on approval
      </div>
      <ArrowRight className="h-5 w-5 text-ink" strokeWidth={1.5} />
      <div className="rounded-md border border-line bg-canvas px-2 py-1 text-center text-[10px] uppercase tracking-[0.18em] text-ink-3">
        hand off
      </div>
    </div>
  );
}

function Note({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 rounded border border-line bg-soft p-1.5 text-ink-2">
        {icon}
      </div>
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p>{body}</p>
      </div>
    </div>
  );
}
