import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is YALI Summit?",
    a: "It's Nigeria's flagship gathering of young leaders working at the intersection of AI, digital innovation and inclusive leadership — hosted by the YALI Network Nigeria.",
  },
  {
    q: "When does it take place?",
    a: "Thursday 10 to Sunday 13 September 2026. Four days of keynotes, sector tracks, workshops, a hackathon and a closing showcase.",
  },
  {
    q: "Who should attend?",
    a: "Founders, policymakers, educators, civil-society leaders, investors, media — and anyone serious about Nigeria's digital future. You don't have to be a YALI member.",
  },
  {
    q: "Can I attend if I'm not a YALI member?",
    a: "Yes. General-public tickets are open. Verified YALI delegates get in free; everyone else pays the ticket price below.",
  },
  {
    q: "What are the sector tracks?",
    a: "Seven: Health & Wellbeing, Agriculture & Food, Education & Skills, FinTech & Inclusive Finance, Energy & Climate, Governance & Policy, and Creative Economy.",
  },
  {
    q: "How do I register?",
    a: "Hit \"Claim your seat\" and walk through the 5 short steps. It takes about three minutes.",
  },
  {
    q: "Is there a fee?",
    a: "Free for verified YALI delegates. General public: ₦15,000 early-bird until 30 June 2026, ₦20,000 after.",
  },
  {
    q: "Where is the venue?",
    a: "Lagos — the exact venue will be announced closer to the date. Travel and accommodation support is available for selected delegates.",
  },
  {
    q: "What do I leave with?",
    a: "Named commitments from your track, the contacts that can deliver them, and a 12-month YALI follow-through plan — not a tote bag of slides.",
  },
  {
    q: "How do I sponsor?",
    a: "Open the Sponsors page, pick a tier (or tell us your outcome) and we'll reply within 48 hours. Email: partnerships@summit.yalinetwork.ng.",
  },
];

export function FAQ() {
  return (
    <section className="py-16 md:py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-3xl mx-auto">
        <h2
          className="text-center font-bold mb-10"
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "32px",
            color: "var(--text-primary)",
          }}
        >
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="rounded-lg border px-4"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <AccordionTrigger
                className="text-left hover:no-underline data-[state=open]:text-[var(--accent-cyan)] [&>svg]:text-[var(--accent-cyan)]"
                style={{ color: "var(--text-primary)" }}
              >
                {f.q}
              </AccordionTrigger>
              <AccordionContent style={{ color: "var(--text-secondary)" }}>
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}