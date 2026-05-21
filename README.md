# gov-novelty

A live, interactive walkthrough of Subtensor's on-chain governance system.

Designed to be presented to a non-technical audience. Eleven slides total,
two of which are real-time simulations so the system can be demonstrated
end-to-end without ever leaving the deck.

## Running

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:5173/`. Press `F11` (or your OS shortcut) for
fullscreen.

## Navigating

- `→` / `Space` / `PageDown` — next slide
- `←` / `PageUp` — previous slide
- `Home` / `End` — first / last slide
- `1`–`9`, `0` — jump to slides 1–9, 10
- Click the dots in the bottom bar to jump directly

## The deck

| # | Slide | What it shows |
| - | ----- | ------------- |
| 01 | Title | Set the stage: two-stage on-chain governance. |
| 02 | Why this design | Three goals — decisive, checked, predictable. |
| 03 | Five collectives | The actors and how their seats are filled. |
| 04 | Two tracks | The pipeline. Track 0 → Track 1 handoff. |
| 05 | **Live simulation** | Click voters, advance the clock, watch the lifecycle play out. |
| 06 | **Adjustable curve** | Two sliders for Aye/Nay; the dispatch delay updates in real time. |
| 07 | Earning a seat | Economic + Building rotation mechanics. |
| 08 | Safety | Snapshot voting, quotas, kill switch. |
| 09 | Trade-offs | Where we landed on six axes and why. |
| 10 | Extension points | Future tracks, collectives, curves. |
| 11 | Wrap-up | Three takeaways. |

## Source map

| File | Concern |
| ---- | ------- |
| `src/data/governance.ts` | Runtime constants (thresholds, sizes, delays) and the `LinearAdjustmentCurve` math. |
| `src/sim/lifecycle.ts` | State machine for the live simulation — mirrors `pallet-referenda`'s PassOrFail + Adjustable strategies. |
| `src/slides/*` | One file per slide. |
| `src/components/PresentationFrame.tsx` | Keyboard nav and slide chrome. |
| `src/components/ui/*` | shadcn-style primitives (Button, Card, Slider, etc.). |

Numbers come from `runtime/src/governance/{tracks.rs,collectives.rs,mod.rs}`
and the pallet READMEs.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- shadcn-style components on top of Radix UI primitives
- Recharts (curve chart)
- framer-motion (slide transitions, dispatch marker)
- lucide-react (icons)
