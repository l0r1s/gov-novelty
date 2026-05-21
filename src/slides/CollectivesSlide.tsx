import { SlideShell } from "@/components/SlideShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COLLECTIVES, type CollectiveSpec } from "@/data/governance";
import { cn } from "@/lib/utils";
import {
  FilePlus2,
  Gavel,
  TrendingUp,
  Building2,
  Boxes,
} from "lucide-react";
import type { ReactNode } from "react";

const ROLE_META: Record<
  string,
  { icon: ReactNode; tone: "ink" | "focus" | "approve" | "accent" | "muted" }
> = {
  Proposers: { icon: <FilePlus2 className="h-4 w-4" />, tone: "ink" },
  Triumvirate: { icon: <Gavel className="h-4 w-4" />, tone: "ink" },
  Economic: { icon: <TrendingUp className="h-4 w-4" />, tone: "focus" },
  Building: { icon: <Building2 className="h-4 w-4" />, tone: "accent" },
  EconomicEligible: { icon: <Boxes className="h-4 w-4" />, tone: "muted" },
};

export function CollectivesSlide() {
  return (
    <SlideShell
      eyebrow="Stage 0 — the actors"
      title={
        <>
          Five collectives.{" "}
          <span className="text-ink-3">Two roles. Two selection styles.</span>
        </>
      }
      subtitle="Membership lives on-chain. Two collectives are curated by governance itself; two more rotate automatically based on on-chain merit; one is a staging pool that mirrors root registration."
    >
      <div className="grid flex-1 grid-cols-5 gap-4 pt-2">
        {COLLECTIVES.map((c) => (
          <CollectiveCard key={c.id} spec={c} />
        ))}
      </div>

      <footer className="mt-6 grid grid-cols-3 gap-6 border-t border-line pt-5 text-[13px] leading-relaxed text-ink-3">
        <div>
          <Badge variant="solid" className="mb-2">
            Submitting
          </Badge>
          <p>
            Only members of <span className="text-ink">Proposers</span> can file
            a new proposal — and only on track 0.
          </p>
        </div>
        <div>
          <Badge variant="focus" className="mb-2">
            Deciding
          </Badge>
          <p>
            <span className="text-ink">Triumvirate</span> votes pass-or-fail on
            track 0. <span className="text-ink">Economic ∪ Building</span> votes
            on the Review track 1.
          </p>
        </div>
        <div>
          <Badge variant="accent" className="mb-2">
            Earning a seat
          </Badge>
          <p>
            Curated collectives are set by governance.{" "}
            <span className="text-ink">Economic</span> and{" "}
            <span className="text-ink">Building</span> rotate from on-chain
            metrics every 60 days.
          </p>
        </div>
      </footer>
    </SlideShell>
  );
}

function CollectiveCard({ spec }: { spec: CollectiveSpec }) {
  const meta = ROLE_META[spec.id];
  const isRotating = spec.termDays !== null;
  const isStaging = spec.id === "EconomicEligible";
  return (
    <Card className={cn("flex flex-col", isStaging && "border-dashed")}>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md border",
              meta.tone === "ink" && "border-line bg-ink text-canvas",
              meta.tone === "focus" && "border-focus-line bg-focus-bg text-focus",
              meta.tone === "accent" &&
                "border-accent-line bg-accent-bg text-accent",
              meta.tone === "muted" && "border-line bg-soft text-ink-3",
            )}
          >
            {meta.icon}
          </span>
          {isRotating ? (
            <Badge variant="focus" className="text-[10px]">
              auto, 60d
            </Badge>
          ) : isStaging ? (
            <Badge variant="outline" className="text-[10px]">
              auto sync
            </Badge>
          ) : (
            <Badge variant="default" className="text-[10px]">
              curated
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CardTitle className="text-[15px]">{spec.label}</CardTitle>
          {spec.heldBy && (
            <span className="inline-flex items-center rounded-sm bg-ink px-1.5 py-px font-mono text-[10px] font-medium uppercase tracking-wider text-canvas">
              {spec.heldBy}
            </span>
          )}
        </div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-3">
          {spec.role}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pt-0">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <Stat label="Min" value={spec.min} />
          <Stat label="Max" value={spec.max} />
        </div>
        <p className="text-[12.5px] leading-relaxed text-ink-2">{spec.tagline}</p>
        <p className="text-[11.5px] leading-snug text-ink-3">{spec.selection}</p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-line bg-soft px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-3">
        {label}
      </div>
      <div className="font-mono text-[13px] text-ink">{value}</div>
    </div>
  );
}
