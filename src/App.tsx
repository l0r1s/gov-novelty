import { PresentationFrame, type SlideEntry } from "@/components/PresentationFrame";
import { ClosingSlide } from "@/slides/ClosingSlide";
import { CollectivesSlide } from "@/slides/CollectivesSlide";
import { CurveSlide } from "@/slides/CurveSlide";
import { ExtensionsSlide } from "@/slides/ExtensionsSlide";
import { LifecycleSlide } from "@/slides/LifecycleSlide";
import { SafetySlide } from "@/slides/SafetySlide";
import { SelectionSlide } from "@/slides/SelectionSlide";
import { TitleSlide } from "@/slides/TitleSlide";
import { TracksSlide } from "@/slides/TracksSlide";
import { TradeoffsSlide } from "@/slides/TradeoffsSlide";
import { WhySlide } from "@/slides/WhySlide";

const SLIDES: SlideEntry[] = [
  { id: "title", label: "Title", render: () => <TitleSlide /> },
  { id: "why", label: "Why this design", render: () => <WhySlide /> },
  { id: "collectives", label: "Five collectives", render: () => <CollectivesSlide /> },
  { id: "tracks", label: "Two tracks", render: () => <TracksSlide /> },
  { id: "lifecycle", label: "Live simulation", render: () => <LifecycleSlide /> },
  { id: "curve", label: "Adjustable curve", render: () => <CurveSlide /> },
  { id: "selection", label: "Earning a seat", render: () => <SelectionSlide /> },
  { id: "safety", label: "Safety", render: () => <SafetySlide /> },
  { id: "tradeoffs", label: "Trade-offs", render: () => <TradeoffsSlide /> },
  { id: "extensions", label: "Extension points", render: () => <ExtensionsSlide /> },
  { id: "closing", label: "Wrap-up", render: () => <ClosingSlide /> },
];

export default function App() {
  return <PresentationFrame slides={SLIDES} />;
}
