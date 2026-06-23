import { createFileRoute } from "@tanstack/react-router";
import { ContactSection } from "@/components/sections/ContactSection";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — YALI Summit 2026" },
      { name: "description", content: "Get in touch with the YALI Network Nigeria team." },
      { property: "og:title", content: "Contact — YALI Summit 2026" },
      { property: "og:description", content: "Get in touch with the YALI Network Nigeria team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return <div className="pt-20"><ContactSection /></div>;
}