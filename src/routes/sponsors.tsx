import { createFileRoute } from "@tanstack/react-router";
import { SponsorsSection } from "@/components/sections/SponsorsSection";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors — YALI Summit 2026" },
      { name: "description", content: "Sponsor portal: deck download and inquiry form." },
      { property: "og:title", content: "Sponsors — YALI Summit 2026" },
      { property: "og:description", content: "Partner with the YALI Network Nigeria Summit 2026 (AIDIFILN)." },
    ],
  }),
  component: SponsorsPage,
});

function SponsorsPage() {
  return <div className="pt-20"><SponsorsSection /></div>;
}