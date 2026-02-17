import AppShell from "@/components/app-shell";

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Coming soon -- your profile and settings will appear here.
        </p>
      </div>
    </AppShell>
  );
}
