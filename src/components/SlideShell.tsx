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
    <section className={cn("flex flex-1 flex-col gap-7 px-12 pt-10 pb-6", className)}>
      {!bare && (
        <header className="flex flex-col gap-2">
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
      <div className="flex flex-1 min-h-0 flex-col">{children}</div>
    </section>
  );
}
