/** First-name style label from email (e.g. jane.doe@x.com → Jane). */
export function displayFirstName(email?: string | null): string {
  if (!email || typeof email !== "string") return "there";
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return "there";
  const segment = local.split(/[._+-]/)[0] ?? local;
  if (!segment) return "there";
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

export function displayInitial(email?: string | null, fallback = "U"): string {
  const name = displayFirstName(email);
  if (name === "there") return fallback;
  return name.charAt(0).toUpperCase();
}
