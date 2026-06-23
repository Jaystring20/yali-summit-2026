import { useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

type Partner = { name: string; logo: string };

const partners: Partner[] = [
  {
    name: "HP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
  },
  {
    name: "U.S. Mission Nigeria",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seal_of_an_Embassy_of_the_United_States_of_America.svg/1200px-Seal_of_an_Embassy_of_the_United_States_of_America.svg.png",
  },
  {
    name: "U.S. Consulate General Lagos",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Seal_of_a_Consulate_General_of_the_United_States_of_America.svg/1200px-Seal_of_a_Consulate_General_of_the_United_States_of_America.svg.png",
  },
  {
    name: "UNFPA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/UNFPA_logo.svg/1200px-UNFPA_logo.svg.png",
  },
];

function LogoCard({ name, logo }: Partner) {
  return (
    <div
      className="rounded-xl border p-4 flex items-center justify-center h-[120px]"
      style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
    >
      <img
        src={logo}
        alt={`${name} logo`}
        width={200}
        height={100}
        loading="lazy"
        className="max-h-[80px] object-contain bg-white/95 rounded-md p-2"
      />
    </div>
  );
}

export function Partners() {
  const autoplay = useRef(
    Autoplay({ delay: 2200, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    [autoplay.current],
  );

  // duplicate the list so the loop is visually seamless even with few items
  const items = [...partners, ...partners];

  return (
    <section className="py-16 md:py-24 px-6" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-center font-bold mb-12"
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "32px",
            color: "var(--text-primary)",
          }}
        >
          Partners From Our Previous Edition
        </h2>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {items.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex-[0_0_50%] sm:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0"
              >
                <LogoCard name={p.name} logo={p.logo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}