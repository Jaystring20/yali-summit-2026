import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase as publicSupabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const codeSchema = z.object({ code: z.string().trim().min(4).max(64) });

export type PublicTicket = {
  id: string;
  ticket_code: string;
  full_name: string;
  attendee_type: string;
  track_selection: string | null;
  verification_status: string;
  checked_in_at: string | null;
  created_at: string;
};

export const getTicketByCode = createServerFn({ method: "POST" })
  .inputValidator((input) => codeSchema.parse(input))
  .handler(async ({ data }): Promise<PublicTicket> => {
    const { data: row, error } = await publicSupabase.rpc(
      "get_public_ticket_by_code",
      { ticket_code_input: data.code },
    );
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Ticket not found");
    return row as PublicTicket;
  });

async function getUserRoles(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => r.role) as string[];
}

function assertHasStaffRole(roles: string[]) {
  if (!roles.includes("admin") && !roles.includes("staff")) {
    throw new Error("Forbidden: requires admin or staff role");
  }
}

function assertHasAdminRole(roles: string[]) {
  if (!roles.includes("admin")) {
    throw new Error("Forbidden: requires admin role");
  }
}

export const getMyRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { roles: (data ?? []).map((r: any) => r.role) as string[] };
  });

export const checkInTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => codeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const roles = await getUserRoles(supabase, userId);
    assertHasStaffRole(roles);

    const { data: existing, error: e1 } = await supabase
      .from("registrations")
      .select("id, full_name, attendee_type, track_selection, verification_status, checked_in_at")
      .eq("ticket_code", data.code)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!existing) throw new Error("Ticket not found");

    if (existing.checked_in_at) {
      return { alreadyCheckedIn: true, registration: existing };
    }

    const { data: updated, error: e2 } = await supabase
      .from("registrations")
      .update({ checked_in_at: new Date().toISOString(), checked_in_by: userId })
      .eq("id", existing.id)
      .select("id, full_name, attendee_type, track_selection, verification_status, checked_in_at")
      .single();
    if (e2) throw new Error(e2.message);
    return { alreadyCheckedIn: false, registration: updated };
  });

const listInput = z.object({
  verification: z.enum(["all", "pending", "verified", "suspicious", "rejected", "error"]).optional(),
  checkedIn: z.enum(["all", "yes", "no"]).optional(),
  search: z.string().trim().max(120).optional(),
});

export const listRegistrations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => listInput.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const roles = await getUserRoles(supabase, userId);
    assertHasStaffRole(roles);

    let q = supabase
      .from("registrations")
      .select(
        "id, ticket_code, full_name, email, phone, attendee_type, track_selection, verification_status, verification_reason, yali_id, yali_certificate_url, checked_in_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.verification && data.verification !== "all") {
      q = q.eq("verification_status", data.verification);
    }
    if (data.checkedIn === "yes") q = q.not("checked_in_at", "is", null);
    if (data.checkedIn === "no") q = q.is("checked_in_at", null);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, " ");
      q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,ticket_code.ilike.%${s}%`);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const overrideVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "verified", "suspicious", "rejected", "error"]),
        reason: z.string().trim().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const roles = await getUserRoles(supabase, userId);
    assertHasAdminRole(roles);
    const { error } = await supabase
      .from("registrations")
      .update({
        verification_status: data.status,
        verification_reason: data.reason ?? `Manually set by admin to ${data.status}`,
        verification_checked_at: new Date().toISOString(),
        verification_model: "admin-override",
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCertificateSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ path: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const roles = await getUserRoles(supabase, userId);
    assertHasStaffRole(roles);
    const { data: signed, error } = await supabase.storage
      .from("yali-certificates")
      .createSignedUrl(data.path, 60 * 10);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

export type DashboardStats = {
  totals: {
    total: number;
    paid: number;
    pending_payment: number;
    verified: number;
    checked_in: number;
    last_24h: number;
    revenue_kobo: number;
  };
  byAttendeeType: Array<{ key: string; count: number }>;
  byVerification: Array<{ key: string; count: number }>;
  byPayment: Array<{ key: string; count: number }>;
  byTrack: Array<{ key: string; count: number }>;
  byState: Array<{ key: string; count: number }>;
  trend30d: Array<{ date: string; count: number }>;
  recent: Array<{
    id: string;
    full_name: string;
    email: string;
    attendee_type: string;
    verification_status: string;
    payment_status: string;
    ticket_code: string;
    created_at: string;
  }>;
};

export const getAdminDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardStats> => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const roles = await getUserRoles(supabase, userId);
    assertHasStaffRole(roles);
    const { data, error } = await supabase.rpc("admin_dashboard_stats");
    if (error) throw new Error(error.message);
    return data as DashboardStats;
  });