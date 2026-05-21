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
      className="gap-5 overflow-hidden pt-7 pb-4"
    >
      <div className="relative flex flex-1 min-h-0 items-stretch gap-6">
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

      <footer className="mt-4 grid grid-cols-3 gap-5 border-t border-line pt-3 text-[12.5px] leading-snug text-ink-3">
        <Note
          icon={<Lock className="h-3.5 w-3.5" />}
          title="No back door"
          body="Track 1 is reached only by Track 0 approval."
        />
        <Note
          icon={<Users2 className="h-3.5 w-3.5" />}
          title="Voter set is frozen"
          body="Opening a referendum snapshots eligible voters."
        />
        <Note
          icon={<Gavel className="h-3.5 w-3.5" />}
          title="Only governance can stop it"
          body="No proposer-cancel after submission."
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
      <CardContent className="p-5 pt-6">
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
          </div>
          <div className="text-right text-[10px] uppercase tracking-[0.18em] text-ink-3">
            <p>{side === "left" ? "decides" : "reviews"}</p>
          </div>
        </div>

        <Separator className="my-3" />

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

        <DetailRows track={track} />
      </CardContent>
    </Card>
  );
}

function DetailRows({ track }: { track: TrackSpec }) {
  const isStage0 = track.id === 0;

  return (
    <dl className="mt-3 overflow-hidden rounded-md border border-line bg-canvas">
      {track.details.map((d, index) => (
        <div
          key={d.label}
          className={cn(
            "grid min-h-9 grid-cols-[minmax(120px,0.38fr)_1fr] items-center gap-4 px-3 py-2 text-[12px]",
            index > 0 && "border-t border-line",
          )}
        >
          <dt className="text-ink-3">{d.label}</dt>
          <dd className="flex justify-end text-right">
            <span
              className={cn(
                "inline-flex items-center rounded-sm border bg-soft px-2 py-1 font-medium leading-none text-ink",
                (d.label === "Approve threshold" || d.label === "Fast-track at") &&
                  "border-approve-line bg-approve-bg text-approve",
                (d.label === "Reject threshold" || d.label === "Cancel at") &&
                  "border-reject-line bg-reject-bg text-reject",
                isStage0 && d.label === "On approval" && "border-ink bg-ink text-canvas",
              )}
            >
              {d.value}
            </span>
          </dd>
        </div>
      ))}
    </dl>
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
      <ArrowRight className="h-5 w-5 text-ink" strokeWidth={1.5} />
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
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line bg-soft text-ink-2">
        {icon}
      </div>
      <div>
        <p className="mb-0.5 font-medium leading-none text-ink">{title}</p>
        <p>{body}</p>
      </div>
    </div>
  );
}
