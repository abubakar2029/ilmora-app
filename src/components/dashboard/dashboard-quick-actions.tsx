import Link from "next/link";

type Props = {
  role: string;
  publicUserId?: number | null;
};

export default function DashboardQuickActions({ role, publicUserId }: Props) {
  const pill =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary";

  if (role === "mentor") {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/inbox" className={`${pill} border-primary/30 bg-primary/10 text-primary`}>
          <InboxIcon />
          Mentee inbox
        </Link>
        <Link href="/dashboard/inbox?find=1" className={pill}>
          <SearchIcon />
          Find students
        </Link>
        <Link href="/dashboard/write" className={pill}>
          <PenIcon />
          Write story
        </Link>
        {publicUserId ? (
          <Link href={`/mentors/${publicUserId}`} className={pill}>
            <GlobeIcon />
            Public page
          </Link>
        ) : null}
      </div>
    );
  }

  if (role === "student") {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href="/journey" className={`${pill} border-primary/30 bg-primary/10 text-primary`}>
          <JourneyIcon />
          My Journey
        </Link>
        <Link href="/dashboard/inbox?find=1" className={pill}>
          <SearchIcon />
          Find mentors
        </Link>
        <Link href="/dashboard/my-feed?find=1" className={pill}>
          <FeedIcon />
          Find blogs
        </Link>
        <Link href="/mentors" className={pill}>
          <UsersIcon />
          Browse mentors
        </Link>
      </div>
    );
  }

  return null;
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M22 12h-6l-2 3H10l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function JourneyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}
