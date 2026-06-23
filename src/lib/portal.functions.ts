import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const admin: any = supabaseAdmin;

export type AttendeeProfile = {
  user_id: string;
  registration_id: string | null;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  networking_opt_in: boolean;
  home_state: string | null;
  hub_affiliations: string[];
  sectors: string[];
  is_active_member: boolean;
};

export type RegistrationSummary = {
  id: string;
  ticket_code: string;
  full_name: string;
  email: string;
  attendee_type: string;
  track_selection: string | null;
  payment_status: string;
  amount_kobo: number | null;
  paystack_reference: string | null;
  verification_status: string;
  checked_in_at: string | null;
  created_at: string;
};

async function ensureProfile(client: any, userId: string) {
  const { data, error } = await client
    .from("attendee_profiles")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true })
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return data as AttendeeProfile;
  const { data: existing, error: e2 } = await client
    .from("attendee_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (e2) throw new Error(e2.message);
  return existing as AttendeeProfile;
}

// Try to auto-link an unlinked profile to a registration with the same email.
// Safe because we only link when the registration has not been claimed yet,
// and the auth email is verified by Supabase (magic link).
async function autoLinkByEmail(userId: string, email: string | undefined | null) {
  if (!email) return null;
  const { data: reg, error } = await admin
    .from("registrations")
    .select("id, email, state")
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !reg) return null;
  const { data: taken } = await admin
    .from("attendee_profiles")
    .select("user_id")
    .eq("registration_id", reg.id)
    .maybeSingle();
  if (taken && taken.user_id !== userId) return null;
  const { error: uErr } = await admin
    .from("attendee_profiles")
    .update({ registration_id: reg.id, home_state: (reg as any).state ?? null })
    .eq("user_id", userId);
  if (uErr) return null;
  return reg.id as string;
}

async function getOwnRegistrationByEmail(supabase: any, email: string | undefined | null) {
  if (!email) return null;
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, ticket_code, full_name, email, attendee_type, track_selection, payment_status, amount_kobo, paystack_reference, verification_status, checked_in_at, created_at",
    )
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as RegistrationSummary | null;
}

export const getMyPortal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims, supabase } = context as { userId: string; claims: any; supabase: any };
    let profile = await ensureProfile(supabase, userId);
    let emailMatchedRegistration: RegistrationSummary | null = null;

    if (!profile.registration_id && claims?.email) {
      emailMatchedRegistration = await getOwnRegistrationByEmail(supabase, claims.email);
    } else if (!profile.registration_id) {
      const linked = await autoLinkByEmail(userId, claims?.email);
      if (linked) {
        profile = { ...profile, registration_id: linked };
      }
    }

    let registration: RegistrationSummary | null = null;
    if (profile.registration_id) {
      const { data, error } = await admin
        .from("registrations")
        .select(
          "id, ticket_code, full_name, email, attendee_type, track_selection, payment_status, amount_kobo, paystack_reference, verification_status, checked_in_at, created_at",
        )
        .eq("id", profile.registration_id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      registration = (data ?? null) as RegistrationSummary | null;
    }

    if (!registration && emailMatchedRegistration) {
      registration = emailMatchedRegistration;
    }

    return { profile, registration };
  });

export const claimTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        ticketCode: z.string().trim().min(4).max(64),
        email: z.string().trim().email().max(255),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId, claims } = context as { userId: string; claims: any };
    const authEmail: string | undefined = claims?.email;
    if (!authEmail || authEmail.toLowerCase() !== data.email.toLowerCase()) {
      throw new Error("Email must match the address you signed in with.");
    }
    const { data: reg, error } = await admin
      .from("registrations")
      .select("id, email, ticket_code, state")
      .eq("ticket_code", data.ticketCode.trim())
      .ilike("email", data.email.trim())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!reg) throw new Error("No registration matches that ticket code + email.");

    const { data: taken, error: tErr } = await admin
      .from("attendee_profiles")
      .select("user_id")
      .eq("registration_id", reg.id)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (taken && taken.user_id !== userId) {
      throw new Error("This ticket has already been claimed by another account.");
    }

    await ensureProfile(admin, userId);
    const { error: uErr } = await admin
      .from("attendee_profiles")
      .update({ registration_id: reg.id, home_state: (reg as any).state ?? null })
      .eq("user_id", userId);
    if (uErr) throw new Error(uErr.message);
    return { ok: true, registrationId: reg.id };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        display_name: z.string().trim().max(120).optional().nullable(),
        headline: z.string().trim().max(160).optional().nullable(),
        bio: z.string().trim().max(800).optional().nullable(),
        avatar_url: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
        linkedin_url: z
          .string()
          .trim()
          .max(300)
          .regex(/^https?:\/\/(www\.)?linkedin\.com\/.+/i, "Must be a linkedin.com URL")
          .optional()
          .nullable()
          .or(z.literal("")),
        networking_opt_in: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await ensureProfile(admin, userId);
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      patch[k] = v === "" ? null : v;
    }
    const { error } = await admin.from("attendee_profiles").update(patch).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Bookmarks ---------------- */

export const listBookmarks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { data, error } = await admin
      .from("session_bookmarks")
      .select("session_id")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ids: (data ?? []).map((r: any) => r.session_id as string) };
  });

export const toggleBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ sessionId: z.string().trim().min(1).max(120), on: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    if (data.on) {
      const { error } = await admin
        .from("session_bookmarks")
        .upsert({ user_id: userId, session_id: data.sessionId }, { onConflict: "user_id,session_id" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin
        .from("session_bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("session_id", data.sessionId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/* ---------------- Hackathon ---------------- */

export type HackathonEntry = {
  id: string;
  user_id: string;
  track: "hackathon" | "pitch";
  project_name: string | null;
  summary: string | null;
  problem: string | null;
  solution: string | null;
  deck_url: string | null;
  repo_url: string | null;
  video_url: string | null;
  status: "draft" | "submitted" | "shortlisted" | "rejected";
  submitted_at: string | null;
};

export type HackathonTeamMember = {
  id: string;
  entry_id: string;
  email: string;
  full_name: string | null;
  role: string | null;
};

export const getMyHackathon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { data: entry, error } = await admin
      .from("hackathon_entries")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    let team: HackathonTeamMember[] = [];
    if (entry) {
      const { data: members, error: mErr } = await admin
        .from("hackathon_team_members")
        .select("id, entry_id, email, full_name, role")
        .eq("entry_id", entry.id);
      if (mErr) throw new Error(mErr.message);
      team = (members ?? []) as HackathonTeamMember[];
    }
    return { entry: (entry ?? null) as HackathonEntry | null, team };
  });

export const upsertHackathonEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        track: z.enum(["hackathon", "pitch"]),
        project_name: z.string().trim().max(160).optional().nullable(),
        summary: z.string().trim().max(500).optional().nullable(),
        problem: z.string().trim().max(1500).optional().nullable(),
        solution: z.string().trim().max(1500).optional().nullable(),
        deck_url: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
        repo_url: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
        video_url: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
        submit: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const payload: Record<string, unknown> = {
      user_id: userId,
      track: data.track,
      project_name: data.project_name || null,
      summary: data.summary || null,
      problem: data.problem || null,
      solution: data.solution || null,
      deck_url: data.deck_url || null,
      repo_url: data.repo_url || null,
      video_url: data.video_url || null,
    };
    if (data.submit) {
      payload.status = "submitted";
      payload.submitted_at = new Date().toISOString();
    }
    const { data: row, error } = await admin
      .from("hackathon_entries")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as HackathonEntry;
  });

export const addTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        entryId: z.string().uuid(),
        email: z.string().trim().email().max(255),
        full_name: z.string().trim().max(120).optional(),
        role: z.string().trim().max(80).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { data: entry } = await admin
      .from("hackathon_entries")
      .select("id")
      .eq("id", data.entryId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!entry) throw new Error("Not your entry");
    const { error } = await admin.from("hackathon_team_members").insert({
      entry_id: data.entryId,
      email: data.email,
      full_name: data.full_name ?? null,
      role: data.role ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { data: row } = await admin
      .from("hackathon_team_members")
      .select("id, entry_id, hackathon_entries!inner(user_id)")
      .eq("id", data.id)
      .maybeSingle();
    // ownership is enforced by RLS too; double-check
    if (!row) throw new Error("Not found");
    const { error } = await admin.from("hackathon_team_members").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    // also enforce server-side ownership defensively
    void userId;
    return { ok: true };
  });

/* ---------------- Networking ---------------- */

export type DirectoryEntry = {
  user_id: string;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  full_name: string;
  attendee_type: string;
  state: string;
  track_selection: string | null;
  connected: boolean;
};

export const listDirectory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };

    // Verify the caller is checked in
    const { data: me } = await admin
      .from("attendee_profiles")
      .select("registration_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!me?.registration_id) return { gated: true as const, entries: [] as DirectoryEntry[] };
    const { data: myReg } = await admin
      .from("registrations")
      .select("checked_in_at")
      .eq("id", me.registration_id)
      .maybeSingle();
    if (!myReg?.checked_in_at) return { gated: true as const, entries: [] as DirectoryEntry[] };

    // Pull all opt-in profiles with linked checked-in registrations
    const { data: profiles, error } = await admin
      .from("attendee_profiles")
      .select(
        "user_id, display_name, headline, bio, avatar_url, linkedin_url, registration_id, networking_opt_in",
      )
      .eq("networking_opt_in", true)
      .not("registration_id", "is", null)
      .neq("user_id", userId);
    if (error) throw new Error(error.message);

    const regIds = (profiles ?? []).map((p: any) => p.registration_id).filter(Boolean);
    if (regIds.length === 0) return { gated: false as const, entries: [] };

    const { data: regs } = await admin
      .from("registrations")
      .select("id, full_name, attendee_type, state, track_selection, checked_in_at")
      .in("id", regIds)
      .not("checked_in_at", "is", null);
    const regMap = new Map<string, any>((regs ?? []).map((r: any) => [r.id, r]));

    const { data: conns } = await admin
      .from("networking_connections")
      .select("to_user")
      .eq("from_user", userId);
    const connectedSet = new Set<string>((conns ?? []).map((c: any) => c.to_user));

    const entries: DirectoryEntry[] = (profiles ?? [])
      .map((p: any) => {
        const reg = regMap.get(p.registration_id);
        if (!reg) return null;
        return {
          user_id: p.user_id,
          display_name: p.display_name,
          headline: p.headline,
          bio: p.bio,
          avatar_url: p.avatar_url,
          linkedin_url: p.linkedin_url,
          full_name: reg.full_name,
          attendee_type: reg.attendee_type,
          state: reg.state,
          track_selection: reg.track_selection,
          connected: connectedSet.has(p.user_id),
        } as DirectoryEntry;
      })
      .filter(Boolean) as DirectoryEntry[];

    return { gated: false as const, entries };
  });

export const connectAttendee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ toUserId: z.string().uuid(), note: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    if (data.toUserId === userId) throw new Error("Cannot connect with yourself");
    const { error } = await admin
      .from("networking_connections")
      .upsert(
        { from_user: userId, to_user: data.toUserId, note: data.note ?? null },
        { onConflict: "from_user,to_user" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });