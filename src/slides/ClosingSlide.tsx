import { Check } from "lucide-react";

export function ClosingSlide() {
  return (
    <section className="relative flex flex-1 flex-col px-12 pt-10 pb-6">
      <div className="grid-bg absolute inset-0 opacity-[0.35]" />
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-ink-3">
          <span className="h-px w-8 bg-ink-3" />
          <span>Wrap-up</span>
        </div>
        <h1 className="mt-2 text-[34px] font-semibold leading-[1.1] tracking-tight">
          Three things to remember.
        </h1>

        <div className="grid max-w-6xl flex-1 grid-cols-3 items-center gap-10">
          <Takeaway
            n="01"
            title="A decision body and a review body, separated."
            body="The Triumvirate decides fast. Economic and Building can fast-track, slow-walk, or cancel before dispatch. Two bodies, two roles, one pipeline."
          />
          <Takeaway
            n="02"
            title="On-chain selection where it matters."
            body="The Review voter set is computed every 60 days from on-chain metrics. No off-chain process picks the seats that get to push a root call through."
          />
          <Takeaway
            n="03"
            title="Designed to grow."
            body="More tracks. More collectives. Different curves. The underlying machinery is generic; the runtime ships with a deliberate minimum."
          />
        </div>

        <footer className="flex items-end justify-end pt-4">
          <p className="text-[13px] text-ink-3">Questions?</p>
        </footer>
      </div>
    </section>
  );
}

function Takeaway({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink bg-canvas font-mono text-[11px] font-medium">
          {n}
        </span>
        <Check className="h-4 w-4 text-approve" />
      </div>
      <h3 className="text-[22px] font-semibold leading-tight tracking-tight">
        {title}
      </h3>
      <p className="text-[13.5px] leading-relaxed text-ink-2">{body}</p>
    </div>
  );
}
