import { SlideShell } from "@/components/SlideShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          icon={<Clock className="h-5 w-5" />}
          tag="Stage 1"
          title="Decisive."
          body="A three-member committee — the Triumvirate — votes yes or no within a fixed window. No rolling debate, no quorum-by-attrition."
          accent="ink"
        />
        <PrincipleCard
          icon={<Eye className="h-5 w-5" />}
          tag="Stage 2"
          title="Checked."
          body="If approved, the call doesn't fire immediately. It enters a Review window where a wider, automatically-selected assembly can fast-track, slow it down, or cancel it outright."
          accent="focus"
        />
        <PrincipleCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          tag="Always"
          title="Predictable."
          body="Voter sets, thresholds, delays, and execution all live on-chain. No multisig key holders. No off-chain timelock. No discretion at dispatch."
          accent="approve"
        />
      </div>

      <footer className="mt-6 border-t border-line pt-5">
        <p className="max-w-3xl text-[13px] leading-relaxed text-ink-3">
          <span className="font-medium text-ink">Inspired by</span>{" "}
          Polkadot's OpenGov, but reduced and re-shaped. Two tracks instead of
          fifteen. A small committee for speed, plus a broad assembly for
          legitimacy. No conviction voting; no delegated nominators.
        </p>
      </footer>
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
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-[3px] ${accentLine}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="rounded-md border border-line bg-soft p-2 text-ink-2">
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
