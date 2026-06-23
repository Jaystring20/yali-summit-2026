import { getRequestHost } from "@tanstack/react-start/server";

type TicketEmailInput = {
  to: string;
  fullName: string;
  ticketCode: string;
  track?: string | null;
  attendeeType?: string | null;
};

function resolveOrigin(): string {
  const envUrl = process.env.VITE_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  try {
    const host = getRequestHost();
    if (host) {
      const proto = host.includes("localhost") ? "http" : "https";
      return `${proto}://${host}`;
    }
  } catch {
    // not in request context
  }
  return "https://summit-connect-flow.netlify.app";
}

function renderHtml(input: TicketEmailInput, ticketUrl: string) {
  const firstName = input.fullName.split(" ")[0] || input.fullName;
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0A1128;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e9f2;">
        <tr><td style="background:#0A1128;padding:28px 32px;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.7;">YALI Summit 2026</div>
          <div style="font-size:22px;font-weight:700;margin-top:6px;">You're in, ${escapeHtml(firstName)}!</div>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">Your registration for <strong>AIDIFILN 2026</strong> is confirmed. Bring this ticket to check-in.</p>
          <div style="margin:20px 0;padding:14px 18px;border-radius:10px;background:#f1f5fb;border:1px dashed #0A1128;text-align:center;">
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5b6577;">Ticket code</div>
            <div style="font-family:'SFMono-Regular',Consolas,monospace;font-size:16px;font-weight:600;margin-top:4px;word-break:break-all;">${escapeHtml(input.ticketCode)}</div>
          </div>
          ${input.track || input.attendeeType ? `<table role="presentation" width="100%" style="margin:8px 0 20px;font-size:14px;">
            ${input.track ? `<tr><td style="color:#5b6577;padding:4px 0;">Track</td><td style="text-align:right;font-weight:600;">${escapeHtml(input.track)}</td></tr>` : ""}
            ${input.attendeeType ? `<tr><td style="color:#5b6577;padding:4px 0;">Attendee</td><td style="text-align:right;font-weight:600;text-transform:capitalize;">${escapeHtml(input.attendeeType)}</td></tr>` : ""}
          </table>` : ""}
          <div style="text-align:center;margin:28px 0 8px;">
            <a href="${ticketUrl}" style="display:inline-block;background:#22D3EE;color:#0A1128;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;">View your ticket</a>
          </div>
          <p style="margin:24px 0 0;font-size:13px;color:#5b6577;line-height:1.55;">Or open this link: <br/><a href="${ticketUrl}" style="color:#0A1128;">${ticketUrl}</a></p>
        </td></tr>
        <tr><td style="padding:18px 32px;background:#0A1128;color:#ffffff;font-size:12px;">
          Lagos (venue TBA) — Sept 11–14, 2026
        </td></tr>
      </table>
      <div style="font-size:11px;color:#8a93a6;margin-top:14px;">YALI Network Nigeria</div>
    </td></tr>
  </table>
</body></html>`;
}

function renderText(input: TicketEmailInput, ticketUrl: string) {
  return [
    `You're in, ${input.fullName.split(" ")[0] || input.fullName}!`,
    "",
    "Your registration for AIDIFILN 2026 (YALI Summit) is confirmed.",
    `Ticket code: ${input.ticketCode}`,
    input.track ? `Track: ${input.track}` : "",
    input.attendeeType ? `Attendee: ${input.attendeeType}` : "",
    "",
    `View your ticket: ${ticketUrl}`,
    "",
    "Lagos (venue TBA) — Sept 11–14, 2026",
  ].filter(Boolean).join("\n");
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export async function sendTicketEmail(input: TicketEmailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not configured" };
  if (!input.to) return { ok: false, error: "missing recipient" };

  const origin = resolveOrigin();
  const ticketUrl = `${origin}/ticket/${encodeURIComponent(input.ticketCode)}`;

  try {
    // 8-second timeout — don't let a slow/failing email block registration
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "YALI Summit <onboarding@resend.dev>",
        to: [input.to],
        subject: `Your YALI Summit 2026 ticket — ${input.ticketCode}`,
        html: renderHtml(input, ticketUrl),
        text: renderText(input, ticketUrl),
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg.includes("abort") ? "Email timed out (registration still saved)" : msg };
  }
}