import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import lockupFull from "@/assets/aidifiln-lockup-full.png";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/schedule", label: "Schedule" },
  { to: "/tracks", label: "Tracks" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/contact", label: "Contact" },
] as const;

const socials = [
  { Icon: Facebook, href: "https://facebook.com/yalinetworkng", label: "Facebook" },
  { Icon: Twitter, href: "https://twitter.com/yalinetworkng", label: "Twitter" },
  { Icon: Linkedin, href: "https://linkedin.com/company/yalinetworkng", label: "LinkedIn" },
  { Icon: Instagram, href: "https://instagram.com/yalinetworkng", label: "Instagram" },
];

export function Footer() {
  return (
    <footer
      className="border-t mt-16"
      style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <img
            src={lockupFull}
            alt="AIDIFILN — Artificial Intelligence, Digital Innovation and the Future of Inclusive Leadership in Nigeria"
            className="w-full max-w-[320px] h-auto select-none dark:invert dark:brightness-110 opacity-90"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div>
          <h4
            className="text-sm font-semibold mb-4 uppercase tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            Quick Links
          </h4>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4
            className="text-sm font-semibold mb-4 uppercase tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            Contact
          </h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <li>
              <a
                href="mailto:info@summit.yalinetwork.ng"
                className="hover:opacity-80 transition-opacity"
              >
                info@summit.yalinetwork.ng
              </a>
            </li>
            <li>
              <a href="tel:+234000000000" className="hover:opacity-80 transition-opacity">
                +234 xxx xxx xxxx
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-4 mt-5">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="hover:scale-110 transition-transform"
                style={{ color: "var(--text-secondary)" }}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        className="border-t"
        style={{ borderColor: "var(--border-strong)" }}
      >
        <div
          className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          <p>© 2026 YALI Network Nigeria</p>
          <a href="/privacy" className="hover:opacity-80 transition-opacity">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}