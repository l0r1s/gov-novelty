import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SlideEntry {
  id: string;
  label: string;
  render: () => React.ReactNode;
}

interface PresentationFrameProps {
  slides: SlideEntry[];
}

function parseHash(total: number): number {
  if (typeof window === "undefined") return 0;
  const raw = window.location.hash.replace(/^#/, "");
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(total - 1, Math.max(0, n - 1));
}

export function PresentationFrame({ slides }: PresentationFrameProps) {
  const [index, setIndex] = React.useState(() => parseHash(slides.length));

  // Keep URL hash in sync with the current slide so screenshots and direct
  // links can target a specific slide.
  React.useEffect(() => {
    const desired = `#${index + 1}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, "", desired);
    }
  }, [index]);

  React.useEffect(() => {
    const onHash = () => setIndex(parseHash(slides.length));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [slides.length]);

  const go = React.useCallback(
    (delta: number) => {
      setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + delta)));
    },
    [slides.length],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
      }
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        setIndex(0);
      } else if (e.key === "End") {
        setIndex(slides.length - 1);
      } else if (/^[0-9]$/.test(e.key)) {
        const n = Number(e.key);
        const target = n === 0 ? 9 : n - 1;
        if (target < slides.length) setIndex(target);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, slides.length]);

  const current = slides[index];

  return (
    <div className="flex h-full w-full flex-col bg-canvas text-ink">
      <TopBar slides={slides} index={index} onJump={setIndex} />
      <main className="flex flex-1 min-h-0 flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-1 min-h-0 flex-col"
          >
            {current.render()}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomBar
        slides={slides}
        index={index}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onJump={setIndex}
      />
    </div>
  );
}

function TopBar({
  slides,
  index,
  onJump,
}: {
  slides: SlideEntry[];
  index: number;
  onJump: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line px-12 py-3 text-[11px] uppercase tracking-[0.22em] text-ink-3">
      <div className="flex items-center gap-3">
        <span className="inline-block size-2 rounded-full bg-ink" />
        <span className="font-medium text-ink">Subtensor governance</span>
        <span className="text-ink-3">/ a walkthrough</span>
      </div>
      <div className="flex items-center gap-4">
        <span>
          {String(index + 1).padStart(2, "0")}
          <span className="text-ink-3"> / {String(slides.length).padStart(2, "0")}</span>
        </span>
        <span className="hidden text-ink-3 md:inline">
          {slides[index].label}
        </span>
        <button
          type="button"
          onClick={() => onJump(0)}
          className="rounded border border-line px-2 py-1 text-[10px] tracking-[0.18em] hover:bg-soft"
        >
          Restart
        </button>
      </div>
    </div>
  );
}

function BottomBar({
  slides,
  index,
  onPrev,
  onNext,
  onJump,
}: {
  slides: SlideEntry[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-line px-12 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-ink-3">
        <kbd className="rounded border border-line bg-soft px-1.5 py-0.5 font-sans text-[10px] text-ink-2">
          ←
        </kbd>
        <kbd className="rounded border border-line bg-soft px-1.5 py-0.5 font-sans text-[10px] text-ink-2">
          →
        </kbd>
        <span className="ml-1">to navigate</span>
      </div>
      <div className="flex items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Go to slide ${i + 1}: ${s.label}`}
            onClick={() => onJump(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-ink" : "w-1.5 bg-line hover:bg-ink-3",
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={index === 0}
        >
          <ChevronLeft />
          Back
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onNext}
          disabled={index === slides.length - 1}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
