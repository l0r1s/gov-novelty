import { ArrowRight } from "lucide-react";

export function TitleSlide() {
  return (
    <section className="relative flex flex-1 flex-col px-12 py-16">
      <div className="dot-bg absolute inset-0 opacity-50" />
      <div className="relative flex flex-1 flex-col justify-center">
        <div className="max-w-5xl space-y-7">
          <h1 className="text-balance text-[88px] font-semibold leading-[0.95] tracking-[-0.025em]">
            Two-stage,
            <br />
            <span className="text-ink-3">on-chain governance.</span>
          </h1>
          <p className="max-w-2xl text-[20px] leading-relaxed text-ink-2">
            A small committee decides quickly. A broader, automatically-selected
            assembly reviews the decision before it takes effect. Both stages
            live entirely on-chain.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-ink-2">
              <span className="inline-block size-1.5 rounded-full bg-focus" />
              5 collectives
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-ink-2">
              <span className="inline-block size-1.5 rounded-full bg-focus" />
              2 tracks
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-ink-2">
              <span className="inline-block size-1.5 rounded-full bg-focus" />1
              adjustable curve
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-ink-2">
              <span className="inline-block size-1.5 rounded-full bg-focus" />0
              off-chain trust
            </span>
          </div>
        </div>

        <footer className="flex items-end justify-end text-xs uppercase tracking-[0.22em] text-ink-3">
          <div className="flex items-center gap-2 text-ink-2">
            <span>Press</span>
            <kbd className="rounded border border-line bg-soft px-2 py-1 font-sans text-[10px] tracking-normal text-ink">
              →
            </kbd>
            <span>to begin</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </footer>
      </div>
    </section>
  );
}
