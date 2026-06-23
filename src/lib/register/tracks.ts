import {
  HeartPulse,
  Sprout,
  GraduationCap,
  Landmark,
  Zap,
  ScrollText,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type Track = {
  slug: string;
  title: string;
  description: string;
  Icon: LucideIcon;
};

export const TRACKS: Track[] = [
  { slug: "health", title: "Health & Wellbeing", description: "Digital health, AI in diagnostics, public-health innovation, and equitable access.", Icon: HeartPulse },
  { slug: "agriculture", title: "Agriculture & Food", description: "AgriTech, climate-smart farming, food security and rural prosperity.", Icon: Sprout },
  { slug: "education", title: "Education & Skills", description: "EdTech, AI literacy, future-of-work skills, and inclusive learning at scale.", Icon: GraduationCap },
  { slug: "fintech", title: "FinTech & Inclusive Finance", description: "Payments, lending, financial inclusion, and Naira-native digital products.", Icon: Landmark },
  { slug: "energy", title: "Energy & Climate", description: "Renewable energy, climate adaptation, and the green-jobs transition.", Icon: Zap },
  { slug: "governance", title: "Governance & Policy", description: "AI policy, digital rights, e-government and accountable institutions.", Icon: ScrollText },
  { slug: "creative", title: "Creative Economy", description: "Film, music, fashion, gaming and the IP-driven creator economy.", Icon: Palette },
];