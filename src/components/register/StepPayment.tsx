import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { submitRegistration } from "@/lib/registrations.functions";
import { clearDraft } from "@/lib/register/storage";
import type { FormState } from "@/lib/register/schema";
import { TRACKS } from "@/lib/register/tracks";
import { staggerContainer, staggerChild, ctaButton, ease } from "@/lib/motion";

const ATTENDEE_LABELS: Record<string, string> = {
  delegate: "YALI Delegate",
  sponsor: "Sponsor Representative",
  media: "Media",
  public: "General Public",
  volunteer: "Volunteer",
};

export function StepPayment({ value }: { value: FormState }) {
  const navigate = useNavigate();
  const submit = useServerFn(submitRegistration);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { amountNaira, paymentLabel } = useMemo(() => {
    const manualPaymentTypes = ["delegate", "volunteer", "media", "sponsor"];
    const isManualOnly = manualPaymentTypes.includes(value.attendee_type ?? "");
    return {
      amountNaira: isManualOnly ? 0 : 20000,
      paymentLabel: isManualOnly
        ? "No online payment is required at this stage. Our team will confirm any offline payment details manually."
        : "Registration will be submitted now. Payment, if needed, will be handled manually after confirmation.",
    };
  }, [value.attendee_type]);

  const track = TRACKS.find((t) => t.slug === value.track_selection);

  async function persist() {
    const row = await submit({
      data: {
        ...value,
        payment_status: amountNaira > 0 ? "pending" : "free",
        amount_kobo: amountNaira * 100,
        paystack_reference: null,
      } as never,
    });
    clearDraft();
    navigate({ to: "/register/$id", params: { id: row.id } });
  }

  async function handleSubmit() {
    setError(null);
    setBusy(true);
    try {
      await persist();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Registration summary — staggered entrance */}
      <motion.div
        className="rounded-xl border divide-y overflow-hidden"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerChild} className="px-4 py-2.5">
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
            Your registration summary
          </p>
        </motion.div>
        <SummaryRow label="Name" value={value.full_name} />
        <SummaryRow label="Email" value={value.email} />
        <SummaryRow label="Type" value={value.attendee_type ? ATTENDEE_LABELS[value.attendee_type] : undefined} />
        <SummaryRow label="Track" value={track?.title ?? value.track_selection} />
        <SummaryRow label="State" value={value.state} />
        {value.accommodation_needed && <SummaryRow label="Accommodation" value="Requested" />}
        {value.travel_support_needed && <SummaryRow label="Travel support" value="Requested" />}
      </motion.div>

      {/* Price block */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
      >
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {paymentLabel}
        </div>
        <div
          className="mt-3 font-bold"
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: amountNaira > 0 ? "40px" : "28px",
            color: "var(--accent-cyan)",
            lineHeight: 1.2,
          }}
        >
          {amountNaira > 0
            ? `₦${amountNaira.toLocaleString("en-NG")}`
            : "Free — confirm your spot"}
        </div>
        {amountNaira === 0 && (
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            Your registration will be saved immediately. Our team will follow up with next steps.
          </p>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.22, ease: ease.out }}
            className="rounded-lg border px-4 py-3 text-sm overflow-hidden"
            role="alert"
            style={{
              background: "rgba(239,68,68,0.08)",
              borderColor: "rgba(239,68,68,0.35)",
              color: "var(--error)",
            }}
          >
            {error}
            {error.includes("already registered") && (
              <div className="mt-2">
                <a
                  href="/login"
                  className="underline font-semibold"
                  style={{ color: "var(--accent-cyan)" }}
                >
                  Sign in to view your ticket →
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={busy}
        variants={ctaButton}
        initial="rest"
        whileHover={busy ? {} : "hover"}
        whileTap={busy ? {} : "tap"}
        className="w-full px-7 py-4 rounded-full text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]"
        style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}
      >
        {busy ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Submitting…
          </>
        ) : (
          "Complete registration"
        )}
      </motion.button>

      <p className="text-center text-xs" style={{ color: "var(--text-secondary)" }}>
        By registering you agree to the summit's terms and privacy policy.
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <motion.div
      variants={staggerChild}
      className="flex items-center justify-between gap-4 px-4 py-2.5"
    >
      <span className="text-sm shrink-0" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        className="text-sm font-medium text-right break-all"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
    </motion.div>
  );
}
