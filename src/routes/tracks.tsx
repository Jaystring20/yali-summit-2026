import { createFileRoute } from "@tanstack/react-router";
import { TracksSection } from "@/components/sections/TracksSection";

export const Route = createFileRoute("/tracks")({
  head: () => ({
    meta: [
      { title: "Tracks — YALI Summit 2026" },
      { name: "description", content: "Explore the 7 sector tracks at the AIDIFILN Summit 2026." },
      { property: "og:title", content: "Tracks — YALI Summit 2026" },
      { property: "og:description", content: "Explore the 7 sector tracks at the AIDIFILN Summit 2026." },
    ],
  }),
  component: TracksPage,
});

function TracksPage() {
  return <div className="pt-20"><TracksSection /></div>;
}