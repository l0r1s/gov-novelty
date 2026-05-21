import * as React from "react";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { SlideShell } from "@/components/SlideShell";
import {
  REVIEW_CANCEL_THRESHOLD,
  REVIEW_FAST_TRACK_THRESHOLD,
  REVIEW_INITIAL_DELAY_HOURS,
  REVIEW_MAX_DELAY_HOURS,
  computeDelayHours,
} from "@/data/governance";
import { fmtHours } from "@/lib/utils";

const REVIEW_TOTAL = 32;
const FAST_TRACK_VOTES = Math.ceil(REVIEW_FAST_TRACK_THRESHOLD * REVIEW_TOTAL);
const CANCEL_VOTES = Math.ceil(REVIEW_CANCEL_THRESHOLD * REVIEW_TOTAL);

export function CurveSlide() {
  const [aye, setAye] = React.useState(0);
  const [nay, setNay] = React.useState(0);

  // Clamp so aye+nay never exceeds total.
  const setAyeClamped = (v: number) =>
    setAye(Math.min(v, FAST_TRACK_VOTES, REVIEW_TOTAL - nay));
  const setNayClamped = (v: number) =>
    setNay(Math.min(v, CANCEL_VOTES, REVIEW_TOTAL - aye));

  const ayeFrac = aye / REVIEW_TOTAL;
  const nayFrac = nay / REVIEW_TOTAL;
  const { hours, mode } = computeDelayHours({ approveFrac: ayeFrac, rejectFrac: nayFrac });

  const data = React.useMemo(() => buildCurveData(), []);

  const currentNetFrac = ayeFrac - nayFrac; // positive = approving, negative = rejecting
  const formula =
    mode === "fast-track"
      ? "approval ≥ 75% → fast-track (dispatch next block)"
      : mode === "cancel"
        ? "rejection ≥ 51% → cancel (no dispatch)"
        : mode === "neutral"
          ? "no net vote → delay stays at the initial 24h"
          : mode === "approving"
            ? "ease-out progress = 1 − (1 − net approval / 75%)³"
            : "ease-out progress = 1 − (1 − net rejection / 51%)³";

  return (
    <SlideShell
      eyebrow="The adjustable curve"
      title={
        <>
          Votes don't just decide.{" "}
          <span className="text-ink-3">They slide the dispatch time.</span>
        </>
      }
      subtitle="Review votes move dispatch along an ease-out curve: early net votes move time quickly, then the curve flattens near the threshold."
      className="gap-5 overflow-hidden pt-8 pb-4"
    >
      <div className="grid min-h-0 flex-1 grid-cols-[1.4fr_1fr] gap-5 overflow-hidden">
        {/* Chart */}
        <Card className="flex min-h-0 flex-col overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
                Net votes → dispatch delay
              </div>
              <div className="mt-1 text-[13px] text-ink-2">
                Ease-out between the cancel and fast-track thresholds.
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
                Current dispatch
              </div>
              <div className="font-mono text-[28px] font-semibold tabular-nums">
                {mode === "fast-track" ? "now" : fmtHours(hours)}
              </div>
              <Badge
                className="mt-1"
                variant={
                  mode === "fast-track" || mode === "approving"
                    ? "approve"
                    : mode === "cancel" || mode === "delaying"
                      ? "reject"
                      : "outline"
                }
              >
                {mode === "fast-track" && "fast-tracked"}
                {mode === "approving" && "shortening"}
                {mode === "neutral" && "neutral"}
                {mode === "delaying" && "lengthening"}
                {mode === "cancel" && "cancelled"}
              </Badge>
            </div>
          </div>

          <div className="mt-3 min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 18, bottom: 24, left: 8 }}
              >
                <ReferenceArea
                  x1={-REVIEW_CANCEL_THRESHOLD}
                  x2={-1}
                  fill="var(--color-reject-bg)"
                  fillOpacity={1}
                  stroke="none"
                />
                <ReferenceArea
                  x1={REVIEW_FAST_TRACK_THRESHOLD}
                  x2={1}
                  fill="var(--color-approve-bg)"
                  fillOpacity={1}
                  stroke="none"
                />
                <ReferenceLine
                  x={-REVIEW_CANCEL_THRESHOLD}
                  stroke="var(--color-reject)"
                  strokeDasharray="3 3"
                  label={{
                    value: "cancel 51%",
                    position: "insideBottomLeft",
                    fontSize: 10,
                    fill: "var(--color-reject)",
                  }}
                />
                <ReferenceLine
                  x={REVIEW_FAST_TRACK_THRESHOLD}
                  stroke="var(--color-approve)"
                  strokeDasharray="3 3"
                  label={{
                    value: "fast-track 75%",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "var(--color-approve)",
                  }}
                />
                <ReferenceLine x={0} stroke="var(--color-line)" />
                <ReferenceLine
                  y={REVIEW_INITIAL_DELAY_HOURS}
                  stroke="var(--color-line)"
                  strokeDasharray="2 4"
                  label={{
                    value: "initial 24h",
                    position: "insideRight",
                    fontSize: 10,
                    fill: "var(--color-ink-3)",
                  }}
                />
                <XAxis
                  dataKey="net"
                  type="number"
                  domain={[-1, 1]}
                  ticks={[-1, -0.51, -0.25, 0, 0.25, 0.5, 0.75, 1]}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                  stroke="var(--color-ink-3)"
                  fontSize={10}
                  label={{
                    value: "net votes  (rejecting ← → approving)",
                    position: "insideBottom",
                    offset: -16,
                    fontSize: 11,
                    fill: "var(--color-ink-3)",
                  }}
                />
                <YAxis
                  domain={[0, REVIEW_MAX_DELAY_HOURS]}
                  ticks={[0, 12, 24, 36, 48]}
                  tickFormatter={(v) => `${v}h`}
                  stroke="var(--color-ink-3)"
                  fontSize={10}
                  width={36}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(1)}h`, "delay"]}
                  labelFormatter={(v) => `net ${(Number(v) * 100).toFixed(0)}%`}
                  contentStyle={{
                    border: "1px solid var(--color-line)",
                    background: "var(--color-canvas)",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="var(--color-ink)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <ReferenceLine
                  x={currentNetFrac}
                  stroke="var(--color-focus)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="shrink-0 border-t border-line pt-2 font-mono text-[11px] leading-none text-ink-3">
            {formula}
          </div>
        </Card>

        {/* Controls */}
        <Card className="flex min-h-0 flex-col gap-4 overflow-hidden p-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
              Simulate Review tally
            </div>
            <div className="mt-1 text-[13px] text-ink-3">
              32 voters in the Economic ∪ Building snapshot. Move the sliders.
            </div>
          </div>

          <SliderRow
            label="Aye votes"
            value={aye}
            tone="approve"
            onChange={setAyeClamped}
            frac={ayeFrac}
            threshold={REVIEW_FAST_TRACK_THRESHOLD}
            thresholdLabel="75% to fast-track"
            max={Math.min(FAST_TRACK_VOTES, REVIEW_TOTAL - nay)}
          />
          <SliderRow
            label="Nay votes"
            value={nay}
            tone="reject"
            onChange={setNayClamped}
            frac={nayFrac}
            threshold={REVIEW_CANCEL_THRESHOLD}
            thresholdLabel="51% to cancel"
            max={Math.min(CANCEL_VOTES, REVIEW_TOTAL - aye)}
          />

          <div className="mt-auto border-t border-line pt-4">
            <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
              Outcome at this tally
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
              <KV label="Net" value={`${Math.round(currentNetFrac * 100)}%`} />
              <KV
                label="Delay"
                value={mode === "fast-track" ? "next block" : fmtHours(hours)}
              />
              <KV label="Initial" value="24h" />
              <KV label="Max" value="48h" />
            </div>
          </div>
        </Card>
      </div>

      <footer className="mt-4 grid grid-cols-3 gap-5 border-t border-line pt-3 text-[12.5px] leading-snug text-ink-3">
        <Note title="Pluggable curve" body="The runtime chooses the curve shape." />
        <Note title="Rules snapshotted" body="Existing polls keep their thresholds." />
        <Note title="No overlap" body="51% cancel and 75% fast-track cannot both hold." />
      </footer>
    </SlideShell>
  );
}

function SliderRow({
  label,
  value,
  tone,
  onChange,
  frac,
  threshold,
  thresholdLabel,
  max,
}: {
  label: string;
  value: number;
  tone: "approve" | "reject";
  onChange: (v: number) => void;
  frac: number;
  threshold: number;
  thresholdLabel: string;
  max: number;
}) {
  const reached = frac >= threshold;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-ink">{label}</span>
        <span className="font-mono text-[13px] tabular-nums text-ink">
          {value}
          <span className="text-ink-3"> / {REVIEW_TOTAL}</span>
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={max}
        step={1}
        className="mt-2"
      />
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className="text-ink-3">
          {Math.round(frac * 100)}%
        </span>
        <span
          className={
            reached
              ? tone === "approve"
                ? "font-medium text-approve"
                : "font-medium text-reject"
              : "text-ink-3"
          }
        >
          {thresholdLabel}
          {reached ? " — reached" : ""}
        </span>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-3">
        {label}
      </div>
      <div className="font-mono text-[13px] text-ink">{value}</div>
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <p>
      <span className="font-medium text-ink">{title}.</span>{" "}
      <span className="text-ink-3">{body}</span>
    </p>
  );
}

function buildCurveData() {
  const out: { net: number; hours: number }[] = [];
  // Sweep from -1 (all nay) to +1 (all aye).
  for (let i = -100; i <= 100; i++) {
    const net = i / 100;
    let approveFrac = 0;
    let rejectFrac = 0;
    if (net >= 0) approveFrac = net;
    else rejectFrac = -net;
    const { hours } = computeDelayHours({ approveFrac, rejectFrac });
    out.push({ net, hours });
  }
  return out;
}
