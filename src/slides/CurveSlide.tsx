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

export function CurveSlide() {
  const [aye, setAye] = React.useState(0);
  const [nay, setNay] = React.useState(0);

  // Clamp so aye+nay never exceeds total.
  const setAyeClamped = (v: number) => setAye(Math.min(v, REVIEW_TOTAL - nay));
  const setNayClamped = (v: number) => setNay(Math.min(v, REVIEW_TOTAL - aye));

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
            ? "delay = 24h × (1 − net approval / 75%)"
            : "delay = 24h + (net rejection / 51%) × 24h";

  return (
    <SlideShell
      eyebrow="The adjustable curve"
      title={
        <>
          Votes don't just decide.{" "}
          <span className="text-ink-3">They slide the dispatch time.</span>
        </>
      }
      subtitle="Each net vote in the Review track moves the scheduled dispatch by the same amount: net approval pulls it toward now, net rejection pushes it toward the 48-hour cap. Reach 75% and it fires next block. Reach 51% nay and it's cancelled."
    >
      <div className="grid flex-1 grid-cols-[1.4fr_1fr] gap-5 pt-1">
        {/* Chart */}
        <Card className="flex flex-col p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
                Net votes → dispatch delay
              </div>
              <div className="mt-1 text-[13px] text-ink-2">
                Linear interpolation between the cancel and fast-track
                thresholds.
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

          <div className="mt-4 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 12, right: 18, bottom: 28, left: 8 }}
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

          <div className="mt-3 rounded-md border border-line bg-soft px-3 py-2 font-mono text-[11px] text-ink-2">
            {formula}
          </div>
        </Card>

        {/* Controls */}
        <Card className="flex flex-col gap-5 p-5">
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
          />
          <SliderRow
            label="Nay votes"
            value={nay}
            tone="reject"
            onChange={setNayClamped}
            frac={nayFrac}
            threshold={REVIEW_CANCEL_THRESHOLD}
            thresholdLabel="51% to cancel"
          />

          <div className="mt-auto rounded-md border border-line bg-soft p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-ink-3">
              Outcome at this tally
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
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

      <footer className="mt-4 grid grid-cols-3 gap-6 border-t border-line pt-4 text-[12px] leading-relaxed text-ink-3">
        <p>
          <span className="font-medium text-ink">The curve is pluggable.</span>{" "}
          The shape of the curve is a single runtime knob. Swapping linear for
          sigmoid or conviction-weighted progress is a one-line change.
        </p>
        <p>
          <span className="font-medium text-ink">Live polls keep their rules.</span>{" "}
          Track thresholds are snapshotted into each referendum when it's
          submitted, so a runtime upgrade can't move the goal posts mid-vote.
        </p>
        <p>
          <span className="font-medium text-ink">Cancel beats fast-track.</span>{" "}
          The 75% fast-track and 51% cancel thresholds are deliberately set so
          the two zones can never overlap on a single tally.
        </p>
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
}: {
  label: string;
  value: number;
  tone: "approve" | "reject";
  onChange: (v: number) => void;
  frac: number;
  threshold: number;
  thresholdLabel: string;
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
        max={REVIEW_TOTAL}
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
