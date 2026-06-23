import { z } from "zod";

export const ATTENDEE_TYPES = ["delegate", "sponsor", "media", "public", "volunteer"] as const;
export type AttendeeType = (typeof ATTENDEE_TYPES)[number];

export const MEDIA_TYPES = ["press", "broadcast", "creator", "photographer"] as const;
export const SPONSOR_TIERS = ["platinum", "gold", "silver", "bronze", "community", "exploring"] as const;
export const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const VOLUNTEER_AVAILABILITY = [
  "full-summit",
  "day-1",
  "day-2",
  "day-3",
  "day-4",
  "setup-only",
  "teardown-only",
] as const;

export const step1Schema = z.object({
  attendee_type: z.enum(ATTENDEE_TYPES, {
    message: "Please choose an attendee type",
  }),
});

const optStr = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const step2Schema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(120),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(20)
      .regex(/^[\d+\-\s()]+$/, "Digits, spaces, +, - and () only"),
    state: z.string().min(1, "Select your state").max(40),
    yali_id: optStr(40),
    yali_certificate_url: optStr(500),
    organization: optStr(160),
    role_title: optStr(120),
    sponsor_tier: optStr(40),
    sponsor_goals: optStr(600),
    media_outlet: optStr(160),
    media_type: optStr(40),
    media_coverage_focus: optStr(600),
    audience_reach: optStr(80),
    profession: optStr(120),
    reason_for_attending: optStr(600),
    volunteer_skills: optStr(600),
    volunteer_availability: optStr(40),
    tshirt_size: optStr(8),
    prior_volunteer_experience: optStr(600),
    attendee_type: z.enum(ATTENDEE_TYPES),
  })
  .superRefine((val, ctx) => {
    const req = (key: string, val: string | undefined, message: string) => {
      if (!val?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message });
    };
    if (val.attendee_type === "delegate") {
      req("yali_id", val.yali_id, "YALI ID is required for delegates");
      req("yali_certificate_url", val.yali_certificate_url, "Upload your YALI membership certificate");
    }
    if (val.attendee_type === "sponsor") {
      req("organization", val.organization, "Organization is required");
      req("role_title", val.role_title, "Your role at the organization is required");
    }
    if (val.attendee_type === "media") {
      req("media_outlet", val.media_outlet, "Outlet or publication is required");
      req("media_type", val.media_type, "Select the type of coverage");
    }
    if (val.attendee_type === "volunteer") {
      req("volunteer_skills", val.volunteer_skills, "Tell us what you can help with");
      req("volunteer_availability", val.volunteer_availability, "Select your availability");
    }
  });

export const step3Schema = z.object({
  track_selection: z.string().min(1, "Pick a track").max(40),
});

export const step4Schema = z.object({
  accommodation_needed: z.boolean(),
  travel_support_needed: z.boolean(),
});

export const fullRegistrationSchema = z.object({
  attendee_type: z.enum(ATTENDEE_TYPES),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  state: z.string().min(1).max(40),
  yali_id: z.string().trim().max(40).nullable().optional(),
  yali_certificate_url: z.string().trim().max(500).nullable().optional(),
  organization: z.string().trim().max(160).nullable().optional(),
  role_title: z.string().trim().max(120).nullable().optional(),
  sponsor_tier: z.string().trim().max(40).nullable().optional(),
  sponsor_goals: z.string().trim().max(600).nullable().optional(),
  media_outlet: z.string().trim().max(160).nullable().optional(),
  media_type: z.string().trim().max(40).nullable().optional(),
  media_coverage_focus: z.string().trim().max(600).nullable().optional(),
  audience_reach: z.string().trim().max(80).nullable().optional(),
  profession: z.string().trim().max(120).nullable().optional(),
  reason_for_attending: z.string().trim().max(600).nullable().optional(),
  volunteer_skills: z.string().trim().max(600).nullable().optional(),
  volunteer_availability: z.string().trim().max(40).nullable().optional(),
  tshirt_size: z.string().trim().max(8).nullable().optional(),
  prior_volunteer_experience: z.string().trim().max(600).nullable().optional(),
  track_selection: z.string().min(1).max(40),
  accommodation_needed: z.boolean(),
  travel_support_needed: z.boolean(),
  heard_about_summit: z.string().trim().max(120).nullable().optional(),
  paystack_reference: z.string().trim().max(120).nullable().optional(),
  amount_kobo: z.number().int().nonnegative().nullable().optional(),
  payment_status: z.enum(["pending", "paid", "failed", "free"]).default("pending"),
});

export type FullRegistration = z.infer<typeof fullRegistrationSchema>;

export type FormState = Partial<FullRegistration>;

export const initialFormState: FormState = {
  accommodation_needed: false,
  travel_support_needed: false,
};