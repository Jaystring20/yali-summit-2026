import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NIGERIAN_STATES } from "@/lib/register/states";
import {
  MEDIA_TYPES,
  SPONSOR_TIERS,
  TSHIRT_SIZES,
  VOLUNTEER_AVAILABILITY,
  type FormState,
} from "@/lib/register/schema";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function StepPersonalInfo({
  value,
  errors,
  onChange,
}: {
  value: FormState;
  errors: Record<string, string>;
  onChange: (patch: FormState) => void;
}) {
  const type = value.attendee_type;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name" error={errors.full_name} fieldId="full_name">
          <Input
            id="full_name"
            autoComplete="name"
            value={value.full_name ?? ""}
            onChange={(e) => onChange({ full_name: e.target.value })}
            maxLength={120}
            placeholder="Chinwe Okafor"
          />
        </Field>
        <Field label="Email" error={errors.email} fieldId="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={value.email ?? ""}
            onChange={(e) => onChange({ email: e.target.value })}
            maxLength={255}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone" error={errors.phone} fieldId="phone">
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={value.phone ?? ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            maxLength={20}
            placeholder="+234 800 000 0000"
          />
        </Field>
        <Field label="State" error={errors.state} fieldId="state">
          <Select value={value.state ?? ""} onValueChange={(v) => onChange({ state: v })}>
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {NIGERIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {type === "delegate" && (
        <TypeSection title="YALI membership" subtitle="We verify every delegate against the YALI Network roster.">
          <Field label="YALI ID" error={errors.yali_id}>
            <Input
              value={value.yali_id ?? ""}
              onChange={(e) => onChange({ yali_id: e.target.value })}
              maxLength={40}
              placeholder="YALI-NG-XXXXXX"
            />
          </Field>
          <Field label="YALI membership certificate (required)" error={errors.yali_certificate_url}>
            <CertificateUpload
              value={value.yali_certificate_url ?? ""}
              onChange={(url) => onChange({ yali_certificate_url: url })}
            />
          </Field>
        </TypeSection>
      )}

      {type === "sponsor" && (
        <TypeSection title="Sponsor details" subtitle="Helps us tailor activations and brief our partnerships team.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Organisation" error={errors.organization}>
              <Input
                value={value.organization ?? ""}
                onChange={(e) => onChange({ organization: e.target.value })}
                maxLength={160}
                placeholder="Acme Foundation"
              />
            </Field>
            <Field label="Your role" error={errors.role_title}>
              <Input
                value={value.role_title ?? ""}
                onChange={(e) => onChange({ role_title: e.target.value })}
                maxLength={120}
                placeholder="Partnerships Lead"
              />
            </Field>
            <Field label="Preferred sponsorship tier" error={errors.sponsor_tier} className="sm:col-span-2">
              <Select
                value={value.sponsor_tier ?? ""}
                onValueChange={(v) => onChange({ sponsor_tier: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select a tier (optional)" /></SelectTrigger>
                <SelectContent>
                  {SPONSOR_TIERS.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="What does your organisation hope to achieve?" error={errors.sponsor_goals} className="sm:col-span-2">
              <Textarea
                value={value.sponsor_goals ?? ""}
                onChange={(e) => onChange({ sponsor_goals: e.target.value })}
                maxLength={600}
                rows={3}
                placeholder="Brand visibility, talent recruitment, policy conversations…"
              />
            </Field>
          </div>
        </TypeSection>
      )}

      {type === "media" && (
        <TypeSection title="Media credentials" subtitle="Used to approve press passes and brief the media desk.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Outlet or publication" error={errors.media_outlet}>
              <Input
                value={value.media_outlet ?? ""}
                onChange={(e) => onChange({ media_outlet: e.target.value })}
                maxLength={160}
                placeholder="Channels TV, TechCabal, independent…"
              />
            </Field>
            <Field label="Coverage type" error={errors.media_type}>
              <Select
                value={value.media_type ?? ""}
                onValueChange={(v) => onChange({ media_type: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select coverage type" /></SelectTrigger>
                <SelectContent>
                  {MEDIA_TYPES.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Estimated audience reach" error={errors.audience_reach}>
              <Input
                value={value.audience_reach ?? ""}
                onChange={(e) => onChange({ audience_reach: e.target.value })}
                maxLength={80}
                placeholder="e.g. 50k weekly readers"
              />
            </Field>
            <Field label="Your role" error={errors.role_title}>
              <Input
                value={value.role_title ?? ""}
                onChange={(e) => onChange({ role_title: e.target.value })}
                maxLength={120}
                placeholder="Reporter, Producer, Creator…"
              />
            </Field>
            <Field label="What angle will you cover?" error={errors.media_coverage_focus} className="sm:col-span-2">
              <Textarea
                value={value.media_coverage_focus ?? ""}
                onChange={(e) => onChange({ media_coverage_focus: e.target.value })}
                maxLength={600}
                rows={3}
                placeholder="AI policy, youth innovation, on-the-ground reporting…"
              />
            </Field>
          </div>
        </TypeSection>
      )}

      {type === "public" && (
        <TypeSection title="A little about you" subtitle="Helps our hosts pair you with the right sessions and people.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Profession or current role" error={errors.profession}>
              <Input
                value={value.profession ?? ""}
                onChange={(e) => onChange({ profession: e.target.value })}
                maxLength={120}
                placeholder="Student, founder, civil servant…"
              />
            </Field>
            <Field label="Organisation (optional)" error={errors.organization}>
              <Input
                value={value.organization ?? ""}
                onChange={(e) => onChange({ organization: e.target.value })}
                maxLength={160}
                placeholder="Where you work or study"
              />
            </Field>
            <Field label="Why do you want to attend?" error={errors.reason_for_attending} className="sm:col-span-2">
              <Textarea
                value={value.reason_for_attending ?? ""}
                onChange={(e) => onChange({ reason_for_attending: e.target.value })}
                maxLength={600}
                rows={3}
                placeholder="What are you hoping to learn, build, or contribute?"
              />
            </Field>
          </div>
        </TypeSection>
      )}

      {type === "volunteer" && (
        <TypeSection title="Volunteer profile" subtitle="The ops team uses this to schedule you on the right crew.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Availability" error={errors.volunteer_availability}>
              <Select
                value={value.volunteer_availability ?? ""}
                onValueChange={(v) => onChange({ volunteer_availability: v })}
              >
                <SelectTrigger><SelectValue placeholder="When can you help?" /></SelectTrigger>
                <SelectContent>
                  {VOLUNTEER_AVAILABILITY.map((a) => (
                    <SelectItem key={a} value={a} className="capitalize">
                      {a.replace(/-/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="T-shirt size" error={errors.tshirt_size}>
              <Select
                value={value.tshirt_size ?? ""}
                onValueChange={(v) => onChange({ tshirt_size: v })}
              >
                <SelectTrigger><SelectValue placeholder="Pick a size" /></SelectTrigger>
                <SelectContent>
                  {TSHIRT_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Skills you can bring" error={errors.volunteer_skills} className="sm:col-span-2">
              <Textarea
                value={value.volunteer_skills ?? ""}
                onChange={(e) => onChange({ volunteer_skills: e.target.value })}
                maxLength={600}
                rows={3}
                placeholder="Registration desk, photography, translation, AV/tech, social media…"
              />
            </Field>
            <Field label="Prior volunteer or event experience" error={errors.prior_volunteer_experience} className="sm:col-span-2">
              <Textarea
                value={value.prior_volunteer_experience ?? ""}
                onChange={(e) => onChange({ prior_volunteer_experience: e.target.value })}
                maxLength={600}
                rows={3}
                placeholder="Optional — events you've helped run before."
              />
            </Field>
          </div>
        </TypeSection>
      )}
    </div>
  );
}

function TypeSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border p-4 sm:p-5 space-y-4"
      style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
    >
      <div>
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</div>
        {subtitle && (
          <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function CertificateUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const MAX_BYTES = 5 * 1024 * 1024;
  const ALLOWED = [
    { mime: "application/pdf", label: "PDF" },
    { mime: "image/png", label: "PNG" },
    { mime: "image/jpeg", label: "JPG" },
  ];

  async function handleFile(file: File) {
    setErr(null);
    setFileName(file.name);
    if (!ALLOWED.some((a) => a.mime === file.type)) {
      setErr(
        `"${file.name}" is a ${file.type || "unknown"} file. Please upload a PDF, PNG, or JPG.`,
      );
      return;
    }
    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setErr(`File is ${mb}MB — maximum allowed is 5MB. Please choose a smaller file.`);
      return;
    }
    if (file.size === 0) {
      setErr("This file appears to be empty. Please choose a different file.");
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const extByMime: Record<string, string> = {
        "application/pdf": "pdf",
        "image/png": "png",
        "image/jpeg": "jpg",
      };
      const ext = extByMime[file.type] ?? "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { data: signed, error: signErr } = await supabase.storage
        .from("yali-certificates")
        .createSignedUploadUrl(path);
      if (signErr || !signed) throw signErr ?? new Error("Could not start upload");

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signed.signedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve();
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });
      onChange(path);
    } catch (e: unknown) {
      setErr(
        e instanceof Error
          ? `Upload failed: ${e.message}. Please try again.`
          : "Upload failed. Please try again.",
      );
      setProgress(0);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="text-sm file:mr-3 file:rounded-full file:border-0 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:cursor-pointer"
        style={{
          color: "var(--text-secondary)",
        }}
      />
      {busy && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
            <span>Uploading {fileName ? `"${fileName}"` : "file"}…</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: "var(--border-strong)" }}
          >
            <div
              className="h-full transition-all duration-150"
              style={{ width: `${progress}%`, background: "var(--accent-cyan)" }}
            />
          </div>
        </div>
      )}
      {!busy && value && !err && (
        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--success, #22C55E)" }}>
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Certificate uploaded{fileName ? ` — ${fileName}` : ""}. Choose another file to replace it.
        </span>
      )}
      {err && (
        <span className="text-xs" style={{ color: "var(--error)" }}>
          {err}
        </span>
      )}
      {!value && !busy && !err && (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Required for delegates. Accepted formats: PDF, PNG, or JPG. Maximum size: 5MB.
        </span>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
  fieldId,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  fieldId?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label
        htmlFor={fieldId}
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </Label>
      {children}
      {error && (
        <span className="text-xs" role="alert" style={{ color: "var(--error)" }}>
          {error}
        </span>
      )}
    </div>
  );
}