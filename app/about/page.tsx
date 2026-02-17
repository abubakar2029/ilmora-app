import AppShell from "@/components/app-shell";

export default function AboutPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          About Us
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Coming soon -- learn more about ilmora and our mission.
        </p>
      </div>
    </AppShell>
  );
}
