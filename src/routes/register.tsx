import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressIndicator } from "@/components/register/ProgressIndicator";
import { StepAttendeeType } from "@/components/register/StepAttendeeType";
import { StepPersonalInfo } from "@/components/register/StepPersonalInfo";
import { StepTrack } from "@/components/register/StepTrack";
import { StepLogistics } from "@/components/register/StepLogistics";
import { StepPayment } from "@/components/register/StepPayment";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  initialFormState,
  type FormState,
} from "@/lib/register/schema";
import { loadDraft, saveDraft } from "@/lib/register/storage";
import { supabase } from "@/integrations/supabase/client";
import { stepVariants, errorShake, ctaButton, ease } from "@/lib/motion";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — YALI Summit 2026" },
      { name: "description", content: "Register for the YALI Network Nigeria Summit 2026." },
      { property: "og:title", content: "Register — YALI Summit 2026" },
      { property: "og:description", content: "Register for the YALI Network Nigeria Summit 2026." },
    ],
  }),
  component: RegisterPage,
});

const TITLES = [
  "First — who's coming?",
  "Tell us about you",
  "Pick the room you want to shape",
  "Logistics and preferences",
  "Review and confirm your seat",
];

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // +1 = forward, -1 = back
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nextBusy, setNextBusy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const topRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) setForm({ ...initialFormState, ...draft });
  }, []);

  // Scroll to top of form on every step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function patch(p: FormState) {
    setForm((prev) => {
      const next = { ...prev, ...p };
      saveDraft(next);
      return next;
    });
  }

  const validateCurrent = useMemo(() => {
    return () => {
      const map: Record<string, string> = {};
      const collect = (
        res:
          | { success: true }
          | { success: false; error: { issues: Array<{ path: Array<string | number>; message: string }> } },
      ) => {
        if (!res.success) {
          for (const issue of res.error.issues) {
            const key = issue.path.join(".");
            if (key && !map[key]) map[key] = issue.message;
          }
        }
        return res.success;
      };
      let ok = false;
      if (step === 1) ok = collect(step1Schema.safeParse(form));
      else if (step === 2) ok = collect(step2Schema.safeParse(form));
      else if (step === 3) ok = collect(step3Schema.safeParse(form));
      else if (step === 4) ok = collect(step4Schema.safeParse(form));
      else ok = true;
      setErrors(map);
      return ok;
    };
  }, [step, form]);

  // Trigger shake animation on validation failure
  function triggerShake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }

  async function next() {
    if (!validateCurrent()) {
      triggerShake();
      return;
    }
    setErrors({});

    // On step 2: pre-check email uniqueness before advancing
    if (step === 2 && form.email) {
      setNextBusy(true);
      try {
        const { data } = await supabase
          .from("registrations")
          .select("id")
          .eq("email", form.email.trim().toLowerCase())
          .maybeSingle();
        if (data) {
          setErrors({
            email:
              "This email is already registered. Sign in to view your ticket, or use a different email address.",
          });
          triggerShake();
          setNextBusy(false);
          return;
        }
      } catch {
        // Let the insert catch it
      }
      setNextBusy(false);
    }

    setDirection(1);
    setStep((s) => Math.min(5, s + 1));
  }

  function back() {
    setErrors({});
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  }

  const canAdvance =
    (step === 1 && step1Schema.safeParse(form).success) ||
    (step === 2 && step2Schema.safeParse(form).success) ||
    (step === 3 && step3Schema.safeParse(form).success) ||
    (step === 4 && step4Schema.safeParse(form).success);

  const variants = stepVariants(direction);

  return (
    <section
      ref={topRef}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14 scroll-mt-20 register-ambient"
    >
      {/* Page entrance */}
      <motion.header
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: ease.out }}
      >
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "clamp(28px, 4vw, 40px)",
            color: "var(--text-primary)",
          }}
        >
          Claim your seat at AIDIFILN 2026
        </h1>
        {/* Animated subtitle crossfade on step change */}
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: ease.out }}
            style={{ color: "var(--text-secondary)" }}
          >
            {TITLES[step - 1]}
          </motion.p>
        </AnimatePresence>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: ease.out }}
      >
        <ProgressIndicator current={step} />
      </motion.div>

      {/* Step content with direction-aware slide transitions + error shake */}
      <motion.div
        animate={shaking ? errorShake.shake : errorShake.idle}
        className="overflow-hidden"
      >
        <div
          className="rounded-2xl border p-5 sm:p-7 overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {step === 1 && <StepAttendeeType value={form} onChange={patch} />}
              {step === 2 && <StepPersonalInfo value={form} errors={errors} onChange={patch} />}
              {step === 3 && (
                <StepTrack value={form} error={errors.track_selection} onChange={patch} />
              )}
              {step === 4 && <StepLogistics value={form} errors={errors} onChange={patch} />}
              {step === 5 && <StepPayment value={form} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: ease.out }}
      >
        {step < 5 ? (
          <div className="flex items-center justify-between mt-6 gap-3">
            <motion.button
              type="button"
              onClick={back}
              disabled={step === 1}
              whileHover={step === 1 ? {} : { scale: 1.03 }}
              whileTap={step === 1 ? {} : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="px-6 py-3 rounded-full text-sm font-semibold border disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
              style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
            >
              Back
            </motion.button>

            <motion.button
              type="button"
              onClick={next}
              disabled={!canAdvance || nextBusy}
              variants={ctaButton}
              initial="rest"
              whileHover={(!canAdvance || nextBusy) ? {} : "hover"}
              whileTap={(!canAdvance || nextBusy) ? {} : "tap"}
              className="flex-1 sm:flex-none px-8 py-3 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center gap-2"
              style={{
                background: "var(--accent-cyan)",
                color: "var(--brand-navy)",
                boxShadow: canAdvance && !nextBusy
                  ? "0 4px 20px color-mix(in oklab, var(--accent-cyan) 35%, transparent)"
                  : "none",
                transition: "box-shadow 0.3s",
              }}
            >
              {nextBusy ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Checking…
                </>
              ) : (
                <>
                  Next
                  <motion.span
                    animate={{ x: canAdvance ? 0 : 0 }}
                    className="opacity-60 text-xs"
                  >
                    →
                  </motion.span>
                </>
              )}
            </motion.button>
          </div>
        ) : (
          <div className="mt-6">
            <motion.button
              type="button"
              onClick={back}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="px-6 py-3 rounded-full text-sm font-semibold border min-h-[48px]"
              style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
            >
              ← Back
            </motion.button>
          </div>
        )}
      </motion.div>
    </section>
  );
}
