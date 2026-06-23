import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Users, MapPin, CalendarDays, Target, Globe } from "lucide-react";
import {
  Reveal,
  Stagger,
  staggerChild,
  SideLabel,
  HalftoneBackdrop,
  Eyebrow,
} from "@/components/motion-primitives";
import { EditorialImage } from "@/components/editorial/EditorialImage";
import civicGathering from "@/assets/editorial/about-civic-gathering.jpg";
import techTraining from "@/assets/editorial/why-now-tech-training.jpg";
import mobileMoney from "@/assets/editorial/why-now-mobile-money.jpg";

export function AboutSection({ id = "about" }: { id?: string }) {
  return (
    <div id={id} className="scroll-mt-24">
      <section className="relative px-5 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-28 bg-background text-text-primary overflow-hidden">
        <HalftoneBackdrop />
        <SideLabel>Presents · AIDIFILN 2026</SideLabel>
        <SideLabel side="right" tone="muted">YALI Network Nigeria</SideLabel>
        <div className="relative max-w-4xl mx-auto">
          <Reveal><Eyebrow>For Nigeria's civic &amp; social-impact leaders</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.05] mt-5 mb-7">
              Inclusive leadership is the work.{" "}
              <span className="text-accent-cyan">
                AI and digital innovation are the new tools on the table.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
              AIDIFILN brings together the people who already lead Nigerian
              communities — civic actors, social entrepreneurs, educators,
              organisers, public servants — for four days of getting fluent,
              getting connected, and deciding together how AI and digital systems
              get built around the people we serve.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Full-bleed editorial break — sets the human stakes */}
      <section className="px-5 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto -mt-6 md:-mt-10">
          <EditorialImage
            src={civicGathering}
            alt="Nigerian civic leaders in animated discussion around a conference table in a sunlit Lagos meeting room"
            aspect="aspect-[16/9] md:aspect-[21/9]"
            caption="Civic leaders · Lagos · convening 2025"
            sizes="(min-width: 1280px) 1200px, (min-width: 768px) 90vw, 100vw"
            width={1920}
            height={1080}
          />
        </div>
      </section>

      <section className="px-5 sm:px-6 lg:px-8 py-14 md:py-20 bg-surface text-text-primary">
        <Stagger className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[
            { Icon: CalendarDays, label: "Dates", value: "Sept 10 – 13, 2026" },
            { Icon: MapPin, label: "Venue", value: "Lagos · venue TBA" },
            { Icon: Users, label: "Delegates", value: "700+ expected" },
            { Icon: Globe, label: "Reach", value: "All 36 states + FCT" },
          ].map(({ Icon, label, value }) => (
            <motion.div
              key={label}
              variants={staggerChild}
              className="rounded-2xl border border-border-strong p-6 bg-background hover:border-accent-cyan/60 transition-colors"
            >
              <Icon className="w-7 h-7 text-accent-cyan mb-4" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-secondary mb-1">
                {label}
              </p>
              <p className="text-lg font-display font-semibold">{value}</p>
            </motion.div>
          ))}
        </Stagger>
      </section>

      <section className="px-5 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-28 bg-background text-text-primary">
        <div className="max-w-5xl mx-auto">
          <Reveal><Eyebrow>Why this, why now</Eyebrow></Reveal>
          <Reveal delay={0.06}>
            <h3 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mt-5 mb-10 leading-tight">
              The systems shaping Nigerian lives are being rewritten.{" "}
              <span className="text-accent-cyan">
                Civic leadership has to be in the room.
              </span>
            </h3>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="space-y-8 text-text-secondary leading-relaxed text-lg max-w-4xl">
              <p>
                <span className="text-text-primary font-medium">
                  What's already shifted.
                </span>{" "}
                The National AI Strategy was published in August 2024. The Data
                Protection Act has been law since July 2023. 3MTT has put 360,000+
                Nigerians into technical training across all 774 LGAs, on the way
                to three million. Awarri's government-backed LLM speaks Yoruba,
                Igbo, Hausa, Pidgin and Ibibio. OPay clears nine million
                transactions a day. The infrastructure is being poured — fast.
              </p>

              <div className="md:float-right md:ml-8 md:w-[42%] md:max-w-[420px] mb-2">
                <EditorialImage
                  src={techTraining}
                  alt="A young Nigerian instructor teaching coding to attentive students with laptops in a digital skills classroom"
                  aspect="aspect-[4/3]"
                  caption="Digital skills training · 3MTT-style classroom"
                  sizes="(min-width: 768px) 420px, 100vw"
                  width={1280}
                  height={960}
                />
              </div>

              <p>
                <span className="text-text-primary font-medium">
                  What that means for civic leaders.
                </span>{" "}
                Welfare decisions, credit scores, classroom assessments,
                healthcare triage, voter information, identity systems —
                increasingly mediated by models and platforms whose defaults
                nobody in your community signed off on. Inclusion isn't a value
                statement anymore; it's a design choice someone is making whether
                you're at the table or not.
              </p>

              <div className="md:float-left md:mr-8 md:w-[42%] md:max-w-[420px] mb-2 clear-both">
                <EditorialImage
                  src={mobileMoney}
                  alt="A Nigerian market trader in Ankara print accepting a mobile-money payment on a smartphone at her produce stall in Lagos"
                  aspect="aspect-[4/3]"
                  caption="Mobile money · Lagos market · 2024"
                  sizes="(min-width: 768px) 420px, 100vw"
                  width={1280}
                  height={960}
                />
              </div>

              <p>
                <span className="text-text-primary font-medium">
                  Why this summit, this room.
                </span>{" "}
                Civic actors, social-impact founders, educators, community
                organisers, public servants — the people Nigerians already trust
                — getting fluent enough in AI and digital systems to lead them,
                challenge them, procure them, regulate them, and build with them.
                Not to become engineers. To stop being end-users of decisions
                made elsewhere.
              </p>
              <p className="clear-both">
                <span className="text-text-primary font-medium">
                  What leaves the room.
                </span>{" "}
                Named commitments. Working partnerships across civic, tech,
                policy and capital. A 12-month follow-through plan owned by YALI
                Network Nigeria. Not a tote bag of slides.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 font-mono text-xs leading-relaxed text-text-secondary/60">
              Sources: FMCIDE National AI Strategy (2024) · NDPA 2023 · 3MTT programme
              data (FMCIDE, 2024) · DataReportal Digital Nigeria 2024 · Awarri / NITDA
              (2024).
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-28 bg-surface text-text-primary">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow>Theme pillars</Eyebrow>
              <h3 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mt-5">
                Three commitments.{" "}
                <span className="text-accent-cyan">
                  Inclusive leadership is the anchor.
                </span>
              </h3>
            </div>
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                Icon: Users,
                title: "Inclusive leadership (the anchor)",
                body: "Women, youth, persons with disabilities, rural communities, frontline organisers — leadership that looks like, and answers to, the Nigeria it serves.",
              },
              {
                Icon: Sparkles,
                title: "Applied AI & digital innovation",
                body: "Past the demos. Real deployments solving civic and social-impact problems at Nigerian scale — health, education, livelihoods, governance, climate.",
              },
              {
                Icon: Target,
                title: "Action over talk",
                body: "Every track closes with named commitments, working partnerships, and a 12-month follow-through plan. No exceptions.",
              },
            ].map(({ Icon, title, body }, i) => (
              <motion.div
                key={title}
                variants={staggerChild}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="relative rounded-3xl border border-border-strong p-7 bg-background overflow-hidden hover:border-accent-cyan/60 transition-colors"
              >
                <span
                  aria-hidden
                  className="absolute top-3 right-4 font-mono text-[10px] tracking-[0.3em] text-text-secondary/60"
                >
                  0{i + 1}
                </span>
                <Icon className="w-8 h-8 text-accent-cyan mb-5" />
                <h4 className="font-display font-semibold text-xl mb-2">{title}</h4>
                <p className="text-text-secondary leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative px-5 sm:px-6 lg:px-8 py-20 md:py-24 bg-background text-text-primary text-center overflow-hidden">
        <HalftoneBackdrop intensity="soft" />
        <div className="relative max-w-2xl mx-auto">
          <Reveal>
            <h3 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-5 leading-tight">
              Take a seat at the table.
            </h3>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-text-secondary mb-8 text-lg">
              Civic actors, social-impact founders, educators, organisers, public
              servants — registration is open. Verified YALI delegates attend
              free; everyone else pays the ticket price.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 min-h-12 rounded-full text-base font-semibold bg-accent-cyan text-brand-navy hover:scale-[1.03] active:scale-100 transition-transform"
            >
              Claim your seat
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}