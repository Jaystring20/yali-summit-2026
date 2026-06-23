import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fullRegistrationSchema } from "@/lib/register/schema";
import { sendTicketEmail } from "@/lib/email/ticket-email.server";

/** Normalize Nigerian phone numbers to +234XXXXXXXXXX.
 *  Accepts: 08012345678, 8012345678, +2348012345678, 234-801-234-5678, etc.
 *  Falls back to the original value if it doesn't look Nigerian. */
function normalizeNigerianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, ""); // strip everything except digits
  if (digits.startsWith("234") && digits.length === 13) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  // already has + prefix?
  const cleaned = raw.trim();
  if (cleaned.startsWith("+")) return cleaned;
  return raw.trim(); // unknown format — pass through, constraint is now relaxed
}

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((input) => fullRegistrationSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nn = (v: string | null | undefined) => (v?.trim() ? v.trim() : null);
    const payload = {
      ...data,
      phone: normalizeNigerianPhone(data.phone),
      yali_id: nn(data.yali_id),
      yali_certificate_url: nn(data.yali_certificate_url),
      heard_about_summit: nn(data.heard_about_summit),
      paystack_reference: data.paystack_reference || null,
      organization: nn(data.organization),
      role_title: nn(data.role_title),
      sponsor_tier: nn(data.sponsor_tier),
      sponsor_goals: nn(data.sponsor_goals),
      media_outlet: nn(data.media_outlet),
      media_type: nn(data.media_type),
      media_coverage_focus: nn(data.media_coverage_focus),
      audience_reach: nn(data.audience_reach),
      profession: nn(data.profession),
      reason_for_attending: nn(data.reason_for_attending),
      volunteer_skills: nn(data.volunteer_skills),
      volunteer_availability: nn(data.volunteer_availability),
      tshirt_size: nn(data.tshirt_size),
      prior_volunteer_experience: nn(data.prior_volunteer_experience),
    };
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .insert(payload)
      .select("id, full_name, email, ticket_code, track_selection, attendee_type, created_at, payment_status, amount_kobo")
      .single();
    if (error) {
      const msg = error.message ?? "";
      if (msg.includes("registrations_email_key") || msg.includes("duplicate key")) {
        throw new Error(
          "This email address is already registered. If you believe this is a mistake, please contact the summit team."
        );
      }
      throw new Error(msg);
    }
    // Fire-and-forget — do NOT await the email so it never blocks registration
    if (row?.email) {
      sendTicketEmail({
        to: row.email,
        fullName: row.full_name,
        ticketCode: row.ticket_code,
        track: row.track_selection,
        attendeeType: row.attendee_type,
      }).then((result) => {
        if (!result.ok) console.error("ticket email failed:", result.error);
      }).catch((e) => console.error("ticket email threw:", e));
    }
    return row;
  });

export const getRegistrationById = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.rpc(
      "get_public_registration_confirmation",
      { registration_id: data.id },
    );
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Registration not found");
    return row as {
      id: string;
      full_name: string;
      email: string;
      ticket_code: string;
      track_selection: string | null;
      attendee_type: string;
      created_at: string;
      payment_status: string;
      amount_kobo: number | null;
    };
  });