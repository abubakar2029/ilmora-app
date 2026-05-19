import { roleLabel } from "@/lib/profile-fields";

/** Read-only account type — set at registration or OAuth onboarding. */
export default function AccountTypeBadge({ role }: { role: string | undefined }) {
  const label = roleLabel(role);
  return (
    <div
      className="mt-6 rounded-lg border border-border bg-muted/40 px-4 py-3"
      aria-label={`Account type: ${label}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account type</p>
      <p className="mt-1 text-sm font-semibold capitalize text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Set when you signed up. To change it, contact support.
      </p>
    </div>
  );
}
