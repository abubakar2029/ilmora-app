"use client";

import DashboardCard from "@/components/dashboard/dashboard-card";
import MentorSocialLinks from "@/components/mentor/mentor-social-links";
import { InlineLoader, Skeleton } from "@/components/ui/loading";
import type { MentorSocialLinks as MentorSocialLinksType } from "@/lib/mentor-api";

type MentorProfile = {
  headline: string;
  expertise: string;
} & MentorSocialLinksType;

type StudentProfile = {
  headline: string;
  skills: string;
  goals: string;
};

type Props = {
  role: "mentor" | "student";
  loading: boolean;
  mentor?: MentorProfile | null;
  student?: StudentProfile | null;
  onMentorEdit?: () => void;
  onStudentEdit?: () => void;
};

export default function DashboardProfileCard({
  role,
  loading,
  mentor,
  student,
  onMentorEdit,
  onStudentEdit,
}: Props) {
  const hasProfile = role === "mentor" ? Boolean(mentor) : Boolean(student);
  const onEdit = role === "mentor" ? onMentorEdit : onStudentEdit;

  return (
    <DashboardCard
      title="Profile"
      description="Used for AI matching and your journey."
      action={
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
        >
          {hasProfile ? "Edit" : "Set up"}
        </button>
      }
      bodyClassName="px-5 py-5"
    >
      {loading ? (
        <div className="space-y-3" role="status" aria-busy="true">
          <InlineLoader label="Loading profile…" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !hasProfile ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {role === "mentor"
              ? "Tell students who you are and what you mentor on."
              : "Unlock matches and your journey with a complete profile."}
          </p>
          <button
            type="button"
            onClick={onEdit}
            className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Get started
          </button>
        </div>
      ) : role === "mentor" && mentor ? (
        <dl className="space-y-4">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Headline</dt>
            <dd className="mt-1 text-base font-semibold text-foreground">{mentor.headline}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Expertise</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{mentor.expertise}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Links</dt>
            <dd className="mt-2">
              <MentorSocialLinks links={mentor} size="sm" />
              {!mentor.contact_email &&
              !mentor.linkedin_url &&
              !mentor.instagram_url &&
              !mentor.facebook_url ? (
                <p className="text-xs text-muted-foreground">Add optional social links in Edit profile.</p>
              ) : null}
            </dd>
          </div>
        </dl>
      ) : student ? (
        <dl className="space-y-4">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Headline</dt>
            <dd className="mt-1 text-base font-semibold text-foreground">{student.headline}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Goals</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{student.goals}</dd>
          </div>
          {student.skills ? (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Skills</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{student.skills}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </DashboardCard>
  );
}
