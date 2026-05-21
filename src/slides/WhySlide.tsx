import { SlideShell } from "@/components/SlideShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Eye } from "lucide-react";

export function WhySlide() {
  return (
    <SlideShell
      eyebrow="The problem"
      title={
        <>
          Governance has to be{" "}
          <span className="text-ink-3">decisive, checked, and predictable.</span>
        </>
      }
      subtitle="Most chains pick two of those three. Subtensor's approach gets all three by separating the decision from the review."
    >
      <div className="grid flex-1 grid-cols-3 gap-5 pt-2">
        <PrincipleCard
          icon={<Clock className="h-4 w-4" />}
          tag="Stage 1"
          title="Decisive."
          body="A three-member committee — the Triumvirate — votes yes or no within a fixed window. No rolling debate, no quorum-by-attrition."
          accent="ink"
        />
        <PrincipleCard
          icon={<Eye className="h-4 w-4" />}
          tag="Stage 2"
          title="Checked."
          body="If approved, the call doesn't fire immediately. It enters a Review window where a wider, automatically-selected assembly can fast-track, slow it down, or cancel it outright."
          accent="focus"
        />
        <PrincipleCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          tag="Always"
          title="Predictable."
          body="Voter sets, thresholds, delays, and execution all live on-chain. No multisig key holders. No off-chain timelock. No discretion at dispatch."
          accent="approve"
        />
      </div>
    </SlideShell>
  );
}

function PrincipleCard({
  icon,
  tag,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  body: string;
  accent: "ink" | "focus" | "approve";
}) {
  const accentLine =
    accent === "ink"
      ? "bg-ink"
      : accent === "focus"
        ? "bg-focus"
        : "bg-approve";
  const iconTone =
    accent === "ink"
      ? "border-line bg-ink text-canvas"
      : accent === "focus"
        ? "border-focus-line bg-focus-bg text-focus"
        : "border-approve-line bg-approve-bg text-approve";

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentLine}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded border",
              iconTone,
            )}
          >
            {icon}
          </div>
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
            {tag}
          </span>
        </div>
        <CardTitle className="mt-2 text-2xl font-semibold leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[14px] leading-relaxed text-ink-2">{body}</p>
      </CardContent>
    </Card>
  );
}
