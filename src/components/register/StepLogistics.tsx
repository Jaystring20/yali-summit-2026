import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormState } from "@/lib/register/schema";

const HOW_HEARD_OPTIONS = [
  "YALI Network Nigeria",
  "Social media (Instagram, X, Facebook)",
  "WhatsApp group",
  "Friend or colleague",
  "Email newsletter",
  "News article",
  "Other",
] as const;

export function StepLogistics({
  value,
  errors,
  onChange,
}: {
  value: FormState;
  errors: Record<string, string>;
  onChange: (patch: FormState) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Checkboxes */}
      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer min-h-[48px]">
          <Checkbox
            id="accommodation_needed"
            checked={!!value.accommodation_needed}
            onCheckedChange={(c) => onChange({ accommodation_needed: !!c })}
            className="mt-0.5"
          />
          <div>
            <div className="font-medium" style={{ color: "var(--text-primary)" }}>
              Accommodation needed
            </div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Request a room at a partner hotel for the duration of the summit.
            </div>
          </div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer min-h-[48px]">
          <Checkbox
            id="travel_support_needed"
            checked={!!value.travel_support_needed}
            onCheckedChange={(c) => onChange({ travel_support_needed: !!c })}
            className="mt-0.5"
          />
          <div>
            <div className="font-medium" style={{ color: "var(--text-primary)" }}>
              Travel support
            </div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Apply for a travel subsidy if you are travelling from outside Lagos.
            </div>
          </div>
        </label>
      </div>

      {/* How did you hear about the summit */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="heard_about_summit" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          How did you hear about the summit?{" "}
          <span className="font-normal" style={{ color: "var(--text-secondary)" }}>(optional)</span>
        </Label>
        <Select
          value={value.heard_about_summit ?? ""}
          onValueChange={(v) => onChange({ heard_about_summit: v })}
        >
          <SelectTrigger id="heard_about_summit">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {HOW_HEARD_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}