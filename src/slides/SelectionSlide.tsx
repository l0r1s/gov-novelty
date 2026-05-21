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
      subtitle="Every 60 days the runtime rotates Economic and Building seats from on-chain metrics. No off-chain committee selection."
      className="gap-5"
    >
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <RotationCard
          tone="focus"
          icon={<TrendingUp className="h-4 w-4" />}
          collective="Economic"
          summary="Top 16 root-registered validator coldkeys by smoothed stake value."
          steps={[
            {
              title: "Eligibility pool",
              body: (
                <>
                  Coldkeys with at least one root-registered hotkey; capped at 64.
                </>
              ),
            },
            {
              title: "Sample value",
              body: (
                <>
                  Each block samples <span className="text-ink">liquid TAO + alpha value</span>.
                </>
              ),
            },
            {
              title: "Smoothing",
              body: <>EMA dampens one-block balance spikes.</>,
            },
            {
              title: "Warmup gate",
              body: (
                <>
                  Roughly <span className="text-ink">30 days</span> of samples before ranking.
                </>
              ),
            },
            {
              title: "Selection",
              body: <>Sort by EMA value; take the top 16.</>,
            },
          ]}
        />
        <RotationCard
          tone="accent"
          icon={<Building2 className="h-4 w-4" />}
          collective="Building"
          summary="Top 16 subnet-owner coldkeys by best mature subnet."
          steps={[
            {
              title: "Maturity filter",
              body: (
                <>
                  Skip subnets younger than <span className="text-ink">180 days</span>.
                </>
              ),
            },
            {
              title: "Owner scoring",
              body: (
                <>
                  Score each owner by their <span className="text-ink">best</span> mature subnet price.
                </>
              ),
            },
            {
              title: "One owner, one seat",
              body: <>Multiple high-priced subnets do not stack.</>,
            },
            {
              title: "No staging pool",
              body: <>Computed fresh at rotation time.</>,
            },
          ]}
        />
      </div>

      <footer className="mt-4 grid grid-cols-3 gap-5 border-t border-line pt-3 text-[12.5px] leading-snug text-ink-3">
        <FooterStat
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Rotation cadence"
          value="every 60 days"
          detail="Runtime recomputes both lists."
        />
        <FooterStat
          icon={<ListFilter className="h-3.5 w-3.5" />}
          label="Failure mode"
          value="keep previous set"
          detail="If fewer than 16 qualify, keep the prior set."
        />
        <FooterStat
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Why both sides"
          value="validators + builders"
          detail="Two pools unioned at review time."
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
    <Card className="relative flex min-h-0 flex-col overflow-hidden">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          tone === "focus" ? "bg-focus" : "bg-accent"
        }`}
      />
      <div className="p-4 pt-5">
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
              <h3 className="text-[17px] font-semibold tracking-tight">
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
        <p className="mt-2 text-[12.5px] leading-snug text-ink-2">{summary}</p>
      </div>
      <Separator />
      <ol className="flex flex-1 flex-col">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="flex gap-3 border-b border-line px-4 py-2.5 last:border-0"
          >
            <div className="font-mono text-[11px] text-ink-3">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-medium text-ink">{s.title}</div>
              <div className="mt-0.5 text-[11.5px] leading-snug text-ink-3">
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
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line bg-soft text-ink-2">
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
          {label}
        </div>
        <div className="text-[12.5px] font-medium text-ink">{value}</div>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-3">{detail}</p>
      </div>
    </div>
  );
}
