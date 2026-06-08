import Link from "next/link";

import AppShell from "@/components/app-shell";

export const metadata = {
  title: "About ilmora",
  description:
    "ilmora connects students with the right mentors and gives every learner an AI-built journey toward their goals.",
};

const VALUES = [
  {
    title: "AI-built journeys",
    body: "Every student gets a personalised roadmap generated from their goals, skills, and interests — so the next step is always clear.",
    icon: (
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l2.5 2.5M16.5 16.5 19 19M19 5l-2.5 2.5M7.5 16.5 5 19M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    ),
  },
  {
    title: "Real mentors",
    body: "Browse verified mentors, see their weekly availability, and book one-hour sessions only within the hours they actually offer.",
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    title: "Sessions that stick",
    body: "Request, confirm, and track mentorship sessions in one place. Both sides get email and in-app confirmations automatically.",
    icon: (
      <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm4 11 2 2 4-4" />
    ),
  },
  {
    title: "Stories worth sharing",
    body: "Mentors publish stories and lessons from their own path. Students learn from real journeys, not generic advice.",
    icon: (
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15ZM9 7h6M9 11h4" />
    ),
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us your goal",
    body: "Set up your profile with where you are and where you want to go.",
  },
  {
    n: "02",
    title: "Get matched",
    body: "Our AI suggests mentors and builds a step-by-step journey for you.",
  },
  {
    n: "03",
    title: "Book & grow",
    body: "Connect, book sessions inside a mentor's real hours, and move forward.",
  },
];

function HeroGraphic() {
  return (
    <svg
      viewBox="0 0 400 320"
      role="img"
      aria-label="Students connected to mentors along a guided path"
      className="h-auto w-full max-w-md"
    >
      <defs>
        <linearGradient id="ilmoraGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {/* soft background blobs */}
      <circle cx="320" cy="70" r="70" fill="currentColor" opacity="0.06" />
      <circle cx="70" cy="250" r="90" fill="currentColor" opacity="0.05" />

      {/* winding journey path */}
      <path
        d="M40 270 C 120 220, 120 150, 200 150 S 300 80, 360 60"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />

      {/* node: start (student) */}
      <g>
        <circle cx="40" cy="270" r="26" fill="url(#ilmoraGrad)" />
        <circle cx="40" cy="262" r="7" fill="white" opacity="0.95" />
        <path d="M28 284c0-8 5-13 12-13s12 5 12 13Z" fill="white" opacity="0.95" />
      </g>

      {/* node: middle (AI / journey) */}
      <g>
        <circle cx="200" cy="150" r="30" fill="currentColor" opacity="0.12" />
        <circle cx="200" cy="150" r="20" fill="url(#ilmoraGrad)" />
        <path
          d="M200 140v20M190 150h20M194 144l12 12M206 144l-12 12"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* node: end (mentor) */}
      <g>
        <circle cx="360" cy="60" r="26" fill="url(#ilmoraGrad)" />
        <circle cx="360" cy="52" r="7" fill="white" opacity="0.95" />
        <path d="M348 74c0-8 5-13 12-13s12 5 12 13Z" fill="white" opacity="0.95" />
      </g>

      {/* small accent stars */}
      <path d="M300 200l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="currentColor" opacity="0.3" />
      <path d="M120 90l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl pb-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-10 sm:px-10 lg:py-14">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary/[0.07] blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/15">
                About ilmora
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground text-balance lg:text-4xl">
                Clarity for every student
              </h1>
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground lg:text-base text-pretty">
                ilmora is a mentorship platform that pairs students with the right mentors and turns
                ambition into a clear, step-by-step plan. We combine human guidance with an AI that
                builds a personal journey for every learner.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/mentors"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Find a mentor
                </Link>
                <Link
                  href="/journey"
                  className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  See your journey
                </Link>
              </div>
            </div>
            <div className="flex justify-center text-primary lg:justify-end">
              <HeroGraphic />
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-linear-to-br from-primary/8 to-transparent p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground">Our mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              Talent is everywhere, but guidance is not. Too many students are unsure of their next
              step simply because they lack access to someone who has walked the path before them.
              ilmora closes that gap — making quality mentorship and a clear roadmap available to
              every learner, regardless of where they start.
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              Guidance + a plan, for anyone who wants to grow.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight text-foreground">What makes ilmora different</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Four things we care about, built into the product.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    {v.icon}
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-12 rounded-3xl border border-border bg-muted/20 px-6 py-10 sm:px-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">How it works</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 ? (
                  <span className="absolute left-12 top-5 hidden h-px w-full bg-border md:block" aria-hidden />
                ) : null}
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/12 via-primary/5 to-transparent px-6 py-12 text-center sm:px-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
            Set up your profile, get matched with a mentor, and start your guided journey today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/mentors"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Explore mentors
            </Link>
            <Link
              href="/dashboard/profile"
              className="rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Complete your profile
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
