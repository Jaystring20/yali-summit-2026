import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const sponsorSchema = z.object({
  company_name: z.string().trim().min(2).max(160),
  contact_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20).regex(/^[\d+\-\s()]+$/),
  preferred_tier: z.string().trim().min(1).max(40),
  budget_range: z.string().trim().min(1).max(40),
  decision_timeline: z.string().trim().min(1).max(40),
  goals: z.string().trim().min(10).max(1500),
});

export const submitSponsorInquiry = createServerFn({ method: "POST" })
  .inputValidator((input) => sponsorSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabase.from("sponsor_inquiries").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(2000),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabase.from("contact_submissions").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });