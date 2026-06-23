import { motion } from "framer-motion";
import { GraduationCap, Building2, Newspaper, Users, HeartHandshake, type LucideIcon } from "lucide-react";
import type { AttendeeType, FormState } from "@/lib/register/schema";
import { staggerContainer, staggerChild, ease } from "@/lib/motion";

const options: Array<{ value: AttendeeType; title: string; desc: string; Icon: LucideIcon }> = [
  { value: "delegate", title: "YALI Delegate", desc: "Active YALI Network member with a valid YALI ID.", Icon: GraduationCap },
  { value: "sponsor", title: "Sponsor Representative", desc: "Attending on behalf of a sponsoring organisation.", Icon: Building2 },
  { value: "media", title: "Media", desc: "Press, broadcast, or content creator covering the summit.", Icon: Newspaper },
  { value: "public", title: "General Public", desc: "Open to anyone passionate about Nigeria's digital future.", Icon: Users },
  { value: "volunteer", title: "Volunteer", desc: "Help run the summit on the ground — registration, hospitality, tech, comms.", Icon: HeartHandshake },
];

export function StepAttendeeType({
  value,
  onChange,
}: {
  value: FormState;
  onChange: (patch: FormState) => void;
}) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="visible"
    >
      {options.map((o) => {
        const selected = value.attendee_type === o.value;
        return (
          <motion.button
            key={o.value}
            type="button"
            onClick={() => onChange({ attendee_type: o.value })}
            variants={staggerChild}
            whileHover={selected ? {} : {
              scale: 1.02,
              y: -2,
              transition: { type: "spring", stiffness: 400, damping: 22 },
            }}
            whileTap={{
              scale: 0.97,
              transition: { type: "spring", stiffness: 600, damping: 30 },
            }}
            className="relative text-left rounded-xl border p-5 transition-[border-color,background] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)]"
            style={{
              background: selected
                ? "color-mix(in oklab, var(--accent-cyan) 10%, transparent)"
                : "var(--surface)",
              borderColor: selected ? "var(--accent-cyan)" : "var(--border-strong)",
              boxShadow: selected
                ? "0 0 0 1.5px var(--accent-cyan), 0 0 20px color-mix(in oklab, var(--accent-cyan) 15%, transparent), inset 0 1px 0 color-mix(in oklab, var(--accent-cyan) 18%, transparent)"
                : "none",
            }}
            aria-pressed={selected}
          >
            {/* Icon with animated color + scale */}
            <motion.div
              animate={{
                color: selected ? "var(--accent-cyan)" : "var(--text-secondary)",
                scale: selected ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-7 h-7 mb-3"
            >
              <o.Icon className="w-full h-full" />
            </motion.div>

            <div
              className="font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {o.title}
            </div>
            <motion.div
              className="text-sm"
              animate={{ color: selected ? "var(--text-primary)" : "var(--text-secondary)" }}
              transition={{ duration: 0.2, ease: ease.out }}
            >
              {o.desc}
            </motion.div>

            {/* Selected indicator dot */}
            {selected && (
              <motion.div
                layoutId="attendee-selected-dot"
                className="absolute top-3 right-3 w-2 h-2 rounded-full"
                style={{ background: "var(--accent-cyan)" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
