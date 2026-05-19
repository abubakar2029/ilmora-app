import type { ProfileFieldDef } from "@/lib/profile-fields";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring";

export function ProfileFieldInput({
  field,
  value,
  onChange,
  readOnly,
  disabled,
  idPrefix = "",
}: {
  field: ProfileFieldDef;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
  idPrefix?: string;
}) {
  const id = `${idPrefix}${field.id}`;
  const common = `${inputClass} ${readOnly ? "cursor-default resize-none bg-muted/40" : ""}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {field.label}
      </label>
      <p className="text-xs leading-relaxed text-muted-foreground">{field.hint}</p>
      <p className="text-xs text-primary/80">
        <span className="font-medium">Used for AI:</span> {field.aiPurpose}
      </p>
      {field.rows && field.rows >= 2 ? (
        <textarea
          id={id}
          required={!readOnly}
          readOnly={readOnly}
          rows={field.rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={common}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          id={id}
          required={!readOnly}
          readOnly={readOnly}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={common}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export function ProfileAiNotice() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      <p className="font-medium text-foreground">How we use this information</p>
      <p className="mt-1 text-pretty">
        Your answers are sent to our AI to build your embedding profile, power mentor/story matches, and
        (soon) your personalized journey. We do not use your account type field for matching — only the
        details below.
      </p>
    </div>
  );
}
