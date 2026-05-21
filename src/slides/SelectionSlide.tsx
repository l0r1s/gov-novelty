import { SlideShell } from "@/components/SlideShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Calendar,
  ListFilter,
  TrendingUp,
} from "lucide-react";

export function SelectionSlide() {
  return (
    <SlideShell
      eyebrow="Earning a seat"
      title={
        <>
          The Review voters{" "}
          <span className="text-ink-3">aren't appointed. They're computed.</span>
        </>
      }
      subtitle="Every 60 days the runtime rotates Economic and Building seats from on-chain metrics. No off-chain process, no committee selection, no signaling vote."
    >
      <div className="grid flex-1 grid-cols-2 gap-5 pt-1">
        <RotationCard
          tone="focus"
          icon={<TrendingUp className="h-4 w-4" />}
          collective="Economic"
          summary="Top 16 root-registered validator coldkeys, ranked by smoothed stake value."
          steps={[
            {
              title: "Eligibility pool",
              body: (
                <>
                  The chain tracks every coldkey with at least one root-registered
                  hotkey. Capped at 64 — the same upper bound as the root subnet.
                </>
              ),
            },
            {
              title: "Sample value",
              body: (
                <>
                  Each block, every eligible coldkey gets a fresh sample:{" "}
                  <span className="text-ink">
                    liquid TAO + the TAO value of alpha across their hotkeys
                  </span>
                  .
                </>
              ),
            },
            {
              title: "Smoothing",
              body: (
                <>
                  Samples blend into an exponential moving average. A one-block
                  balance spike can't buy a seat.
                </>
              ),
            },
            {
              title: "Warmup gate",
              body: (
                <>
                  A coldkey needs roughly{" "}
                  <span className="text-ink">30 days</span> of samples before it
                  can be ranked.
                </>
              ),
            },
            {
              title: "Selection",
              body: (
                <>
                  Sort eligible coldkeys by smoothed value, take the top 16.
                </>
              ),
            },
          ]}
        />
        <RotationCard
          tone="accent"
          icon={<Building2 className="h-4 w-4" />}
          collective="Building"
          summary="Top 16 subnet-owner coldkeys, ranked by their best mature subnet."
          steps={[
            {
              title: "Maturity filter",
              body: (
                <>
                  Iterate all subnets, skip any younger than{" "}
                  <span className="text-ink">180 days</span>. A new subnet can't
                  vote on its own launch.
                </>
              ),
            },
            {
              title: "Owner scoring",
              body: (
                <>
                  For each mature subnet, read its moving price and the owning
                  coldkey. An owner's score is the{" "}
                  <span className="text-ink">max</span> across all subnets they
                  own — multiple subnets don't stack.
                </>
              ),
            },
            {
              title: "One owner, one seat",
              body: (
                <>
                  Sort owners by best-price descending. Take the top 16. An owner
                  with three high-priced subnets still gets one seat.
                </>
              ),
            },
            {
              title: "No staging pool",
              body: (
                <>
                  Unlike Economic, no eligibility list. The full set of mature
                  subnets is computed at rotation time.
                </>
              ),
            },
          ]}
        />
      </div>

      <footer className="mt-4 grid grid-cols-3 gap-4 border-t border-line pt-4">
        <FooterStat
          icon={<Calendar className="h-4 w-4" />}
          label="Rotation cadence"
          value="every 60 days"
          detail="At the cadence boundary, the runtime recomputes both lists."
        />
        <FooterStat
          icon={<ListFilter className="h-4 w-4" />}
          label="Failure mode"
          value="keep previous set"
          detail="If selection returns fewer than 16 eligible accounts, the existing membership stays untouched."
        />
        <FooterStat
          icon={<TrendingUp className="h-4 w-4" />}
          label="Why both sides"
          value="validators + builders"
          detail="Two independently-selected pools, unioned at review time. Neither side can pass a vote alone."
        />
      </footer>
    </SlideShell>
  );
}

function RotationCard({
  tone,
  icon,
  collective,
  summary,
  steps,
}: {
  tone: "focus" | "accent";
  icon: React.ReactNode;
  collective: string;
  summary: string;
  steps: { title: string; body: React.ReactNode }[];
}) {
  return (
    <Card className="relative flex flex-col overflow-hidden">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          tone === "focus" ? "bg-focus" : "bg-accent"
        }`}
      />
      <div className="p-5 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border ${
                tone === "focus"
                  ? "border-focus-line bg-focus-bg text-focus"
                  : "border-accent-line bg-accent-bg text-accent"
              }`}
            >
              {icon}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
                Collective
              </div>
              <h3 className="text-[18px] font-semibold tracking-tight">
                {collective}
              </h3>
            </div>
          </div>
          <Badge
            variant={tone === "focus" ? "focus" : "accent"}
            className="text-[10px]"
          >
            16 seats, 60d
          </Badge>
        </div>
        <p className="mt-3 text-[13px] text-ink-2">{summary}</p>
      </div>
      <Separator />
      <ol className="flex flex-1 flex-col">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="flex gap-3 border-b border-line px-5 py-3 last:border-0"
          >
            <div className="font-mono text-[11px] text-ink-3">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="flex-1">
              <div className="text-[12.5px] font-medium text-ink">{s.title}</div>
              <div className="mt-0.5 text-[12px] leading-relaxed text-ink-3">
                {s.body}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function FooterStat({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 rounded border border-line bg-soft p-1.5 text-ink-2">
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
          {label}
        </div>
        <div className="text-[13px] font-medium text-ink">{value}</div>
        <p className="text-[11.5px] leading-snug text-ink-3">{detail}</p>
      </div>
    </div>
  );
}
