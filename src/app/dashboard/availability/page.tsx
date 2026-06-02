import { redirect } from "next/navigation";

/** Availability is managed on the dashboard weekly calendar. */
export default function AvailabilityRedirectPage() {
  redirect("/dashboard");
}
