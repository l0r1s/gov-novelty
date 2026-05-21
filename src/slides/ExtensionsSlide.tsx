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

const EXTENSIONS = [
  {
    icon: <Plus className="h-4 w-4" />,
    type: "new track",
    title: "Emergency track",
    body: "A pass-or-fail track with a shorter deadline and a smaller approve threshold for time-sensitive runtime patches. Lives next to the Triumvirate track — same shape, different parameters.",
    effort: "Add one entry to the track table.",
  },
  {
    icon: <Plus className="h-4 w-4" />,
    type: "new track",
    title: "Low-stakes track",
    body: "A track with a wider proposer set — say, any registered subnet owner — for small parameter changes. Pair it with a lower max-delay and a higher cancel threshold so the assembly still has the final word.",
    effort: "Add one entry and one proposer-set variant.",
  },
  {
    icon: <Users className="h-4 w-4" />,
    type: "new collective",
    title: "Delegator pool",
    body: "Add a Delegators collective into the Review voter union. Rotation could be the top-N delegating coldkeys by smoothed alpha. No changes to the voting machinery itself.",
    effort: "Add one collective id and a rotation rule.",
  },
  {
    icon: <LineChart className="h-4 w-4" />,
    type: "new curve",
    title: "Sigmoid or conviction curve",
    body: "Today the dispatch delay slides linearly with net votes. Swapping in a sigmoid (fewer marginal votes near the middle) or conviction-weighted progress (longer locks pull harder) is a one-implementation swap.",
    effort: "Replace one curve implementation.",
  },
  {
    icon: <GitBranch className="h-4 w-4" />,
    type: "membership policy",
    title: "Weighted voting",
    body: "Today every voter in the snapshot counts once. A future scheme could weight by stake at snapshot time. The voting backend takes weights through the same interface that already feeds it members.",
    effort: "Return weights alongside members.",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    type: "new origin",
    title: "Replace sudo with governance",
    body: "Most curated mutations — adding a Proposer, swapping a Triumvirate seat, forcing a rotation — are root-gated today. Replacing root with the governance pipeline itself closes the loop.",
    effort: "Swap one origin everywhere root appears.",
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
      subtitle="The voting machinery is generic. The current runtime picks a deliberate minimum. New tracks, collectives, curves, or weight schemes plug in without touching the underlying code."
    >
      <div className="grid flex-1 grid-cols-3 gap-4 pt-1">
        {EXTENSIONS.map((e) => (
          <ExtensionCard key={e.title} {...e} />
        ))}
      </div>

      <footer className="mt-5 flex items-center justify-between border-t border-line pt-5 text-[12px] leading-relaxed text-ink-3">
        <p className="max-w-3xl">
          <span className="font-medium text-ink">The shape is the API.</span>{" "}
          A track is a name plus a proposer set, a voter set, and a decision
          strategy. Anything fitting that shape is a track. Anything that can
          enumerate members is a voter set.
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
  type,
  title,
  body,
  effort,
}: {
  icon: React.ReactNode;
  type: string;
  title: string;
  body: string;
  effort: string;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <div className="rounded border border-line bg-soft p-2 text-ink-2">
          {icon}
        </div>
        <Badge variant="outline" className="text-[10px]">
          {type}
        </Badge>
      </div>
      <h3 className="mt-3 text-[15px] font-semibold leading-snug">{title}</h3>
      <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-2">
        {body}
      </p>
      <div className="mt-4 rounded border border-dashed border-line bg-soft/50 px-2.5 py-1.5 text-[11px] leading-snug text-ink-3">
        <span className="font-medium text-ink-2">cost </span>
        {effort}
      </div>
    </Card>
  );
}
