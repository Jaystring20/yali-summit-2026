import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { Partners } from "@/components/home/Partners";
import { StateHubs } from "@/components/home/StateHubs";
import { FAQ } from "@/components/home/FAQ";
import { AboutSection } from "@/components/sections/AboutSection";
import { ScheduleSection } from "@/components/sections/ScheduleSection";
import { TracksSection } from "@/components/sections/TracksSection";
import { SponsorsSection } from "@/components/sections/SponsorsSection";
import { ContactSection } from "@/components/sections/ContactSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YALI Network Nigeria National Summit 2026 — AIDIFILN" },
      {
        name: "description",
        content:
          "AI, Digital Innovation and the Future of Inclusive Leadership in Nigeria. Sept 10–13, 2026, Lagos. Register free.",
      },
      { property: "og:title", content: "YALI Network Nigeria National Summit 2026" },
      {
        property: "og:description",
        content:
          "AI, Digital Innovation and the Future of Inclusive Leadership in Nigeria. Sept 10–13, 2026, Lagos.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ScheduleSection />
      <TracksSection />
      <SponsorsSection />
      <section id="partners" className="scroll-mt-24">
        <Partners />
      </section>
      <section id="state-hubs" className="scroll-mt-24">
        <StateHubs />
      </section>
      <ContactSection />
      <section id="faq" className="scroll-mt-24">
        <FAQ />
      </section>
    </>
  );
}
