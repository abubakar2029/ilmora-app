import AppShell from "@/components/app-shell";
import JourneyRoadmap, {
  type JourneyStep,
} from "@/components/journey-roadmap";

// Dynamic data - will come from backend later
const journeySteps: JourneyStep[] = [
  {
    id: 1,
    title: "Discover Your Gaps",
    description: "Take the initial assessment to uncover your academic blind spots.",
    status: "completed",
    color: "pink",
  },
  {
    id: 2,
    title: "Build Foundations",
    description: "Strengthen core concepts with curated learning modules.",
    status: "completed",
    color: "yellow",
  },
  {
    id: 3,
    title: "Deep Dive",
    description: "Explore advanced topics and connect the dots across subjects.",
    status: "active",
    color: "blue",
  },
  {
    id: 4,
    title: "Practice & Apply",
    description: "Test your understanding with real-world problems and scenarios.",
    status: "upcoming",
    color: "peach",
  },
  {
    id: 5,
    title: "Master & Share",
    description: "Achieve mastery and help other students on their journey.",
    status: "upcoming",
    color: "green",
  },
  {
    id: 6,
    title: "Peer Review",
    description: "Review and critique work from peers to sharpen your analysis skills.",
    status: "upcoming",
    color: "pink",
  },
  {
    id: 7,
    title: "Case Studies",
    description: "Dive into real-world case studies and apply your knowledge practically.",
    status: "upcoming",
    color: "yellow",
  },
  {
    id: 8,
    title: "Research Methods",
    description: "Learn structured research techniques for deeper academic exploration.",
    status: "upcoming",
    color: "blue",
  },
  {
    id: 9,
    title: "Capstone Project",
    description: "Bring everything together in a comprehensive capstone project.",
    status: "upcoming",
    color: "peach",
  },
  {
    id: 10,
    title: "Certification",
    description: "Earn your certificate and showcase your verified knowledge.",
    status: "upcoming",
    color: "green",
  },
];

export default function MyJourneyPage() {
  return (
    <AppShell>
      <div className="mx-auto">
        <header className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl text-balance">
            My Journey
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:text-base text-pretty">
            Track your progress, see where you are, and discover what comes
            next. Every step brings more clarity.
          </p>
        </header>

        <JourneyRoadmap steps={journeySteps} />

        {/* Legend */}
        <div className="mt-10 flex flex-wrap items-center gap-5 rounded-lg border border-border bg-card px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
              <svg
                className="h-2.5 w-2.5 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
            </span>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-xs text-muted-foreground">Upcoming</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
