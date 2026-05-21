import * as React from "react";
import { cn } from "@/lib/utils";

interface SlideShellProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bare?: boolean;
}

export function SlideShell({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  bare = false,
}: SlideShellProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-12 pt-8 pb-4",
        className,
      )}
    >
      {!bare && (
        <header className="flex shrink-0 flex-col gap-2">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-ink-3">
            <span className="h-px w-8 bg-ink-3" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="text-balance text-[34px] font-semibold leading-[1.1] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-3xl text-[15px] leading-relaxed text-ink-3">
              {subtitle}
            </p>
          )}
        </header>
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </section>
  );
}
