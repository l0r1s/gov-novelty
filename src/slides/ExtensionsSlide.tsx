import { SlideShell } from "@/components/SlideShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  GitBranch,
  LineChart,
  Plus,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "ink" | "focus" | "approve" | "accent" | "reject" | "muted";

const EXTENSIONS: Array<{
  icon: React.ReactNode;
  tone: Tone;
  type: string;
  title: string;
  body: string;
  effort: string;
}> = [
  {
    icon: <Plus className="h-4 w-4" />,
    tone: "reject",
    type: "new track",
    title: "Emergency track",
    body: "Shorter deadline and lower approval threshold for urgent patches.",
    effort: "Track table entry.",
  },
  {
    icon: <Plus className="h-4 w-4" />,
    tone: "focus",
    type: "new track",
    title: "Low-stakes track",
    body: "Wider proposer set for small parameter changes.",
    effort: "Track plus proposer-set variant.",
  },
  {
    icon: <Users className="h-4 w-4" />,
    tone: "approve",
    type: "new collective",
    title: "Delegator pool",
    body: "Add Delegators to the Review voter union.",
    effort: "Collective id plus rotation rule.",
  },
  {
    icon: <LineChart className="h-4 w-4" />,
    tone: "accent",
    type: "new curve",
    title: "Sigmoid or conviction curve",
    body: "Swap ease-out delay for sigmoid or conviction-weighted progress.",
    effort: "Curve implementation.",
  },
  {
    icon: <GitBranch className="h-4 w-4" />,
    tone: "ink",
    type: "membership policy",
    title: "Weighted voting",
    body: "Weight snapshot voters by stake or another metric.",
    effort: "Return weights with members.",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    tone: "muted",
    type: "new origin",
    title: "Replace sudo with governance",
    body: "Route curated mutations through governance itself.",
    effort: "Swap root origins.",
  },
];

export function ExtensionsSlide() {
  return (
    <SlideShell
      eyebrow="Extension points"
      title={
        <>
          The machinery is{" "}
          <span className="text-ink-3">
            deliberately bigger than the runtime uses.
          </span>
        </>
      }
      subtitle="The runtime ships a minimum set, but the pallets accept new tracks, collectives, curves, and weights."
      className="gap-5"
    >
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-4">
        {EXTENSIONS.map((e) => (
          <ExtensionCard key={e.title} {...e} />
        ))}
      </div>

      <footer className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[12.5px] leading-snug text-ink-3">
        <p className="max-w-3xl">
          <span className="font-medium text-ink">The shape is the API.</span>{" "}
          A track is a proposer set, voter set, and decision strategy.
        </p>
        <Badge variant="outline" className="shrink-0">
          <ArrowUpRight className="h-3 w-3" />
          designed to grow
        </Badge>
      </footer>
    </SlideShell>
  );
}

function ExtensionCard({
  icon,
  tone,
  type,
  title,
  body,
  effort,
}: {
  icon: React.ReactNode;
  tone: Tone;
  type: string;
  title: string;
  body: string;
  effort: string;
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
          {type}
        </Badge>
      </div>
      <h3 className="mt-3 text-[14px] font-semibold leading-snug">{title}</h3>
      <p className="mt-2 flex-1 text-[12px] leading-snug text-ink-2">
        {body}
      </p>
      <div className="mt-3 border-t border-line pt-2 text-[11px] leading-snug text-ink-3">
        <span className="font-medium text-ink-2">cost </span>
        {effort}
      </div>
    </Card>
  );
}
