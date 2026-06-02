"use client";

import Link from "next/link";
import { useState } from "react";

import DashboardCard from "@/components/dashboard/dashboard-card";
import DashboardNotificationsPanel from "@/components/dashboard/dashboard-notifications-panel";
import MentorSessionsSummary from "@/components/dashboard/mentor-sessions-summary";
import MentorProfileEditModal, {
  type MentorProfileData,
} from "@/components/dashboard/mentor-profile-edit-modal";
import MentorAvailabilitySection from "@/components/mentor/mentor-availability-section";
import MentorBadgeGrid from "@/components/mentor/mentor-badge-grid";
import MentorSocialLinks from "@/components/mentor/mentor-social-links";
import { InlineLoader, Skeleton } from "@/components/ui/loading";
import { displayFirstName } from "@/lib/display-name";
import type { MentorBadge } from "@/lib/mentor-api";

type MentorProfile = MentorProfileData & { user: number };

type Props = {
  email?: string;
  mentorProfile: MentorProfile | null;
  badges: MentorBadge[];
  publicUserId: number | null;
  profileLoading: boolean;
  onProfileUpdate: (profile: MentorProfile) => void;
};

export default function MentorDashboard({
  email,
  mentorProfile,
  badges,
  publicUserId,
  profileLoading,
  onProfileUpdate,
}: Props) {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const displayName = displayFirstName(email);

  return (
    <div className="space-y-8">
      {/* Hero + profile */}
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="border-b border-border/60 bg-gradient-to-r from-primary/[0.07] via-transparent to-transparent px-6 py-6 lg:px-8 lg:py-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/90">
                Mentor
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground lg:text-[1.65rem]">
                Hello, {displayName}
              </h1>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                Your overview — availability, activity, and how students see you.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-6 lg:gap-8">
              <Stat label="Badges" value={String(badges.length)} />
              <Stat
                label="Profile"
                value={mentorProfile ? "Ready" : "Setup"}
                accent={!mentorProfile}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          {profileLoading ? (
            <div className="flex flex-1 flex-col gap-2" role="status" aria-busy="true">
              <InlineLoader label="Loading profile…" className="text-xs" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : mentorProfile ? (
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Public headline
              </p>
              <p className="mt-0.5 truncate text-base font-semibold text-foreground">
                {mentorProfile.headline}
              </p>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{mentorProfile.expertise}</p>
              <MentorSocialLinks links={mentorProfile} className="mt-3" size="sm" />
            </div>
          ) : (
            <p className="flex-1 text-sm text-muted-foreground">
              Add your headline and expertise so students can find and trust you.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {publicUserId ? (
              <Link
                href={`/mentors/${publicUserId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                View public page
                <span className="text-muted-foreground" aria-hidden>
                  ↗
                </span>
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {mentorProfile ? "Edit profile" : "Set up profile"}
            </button>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-6 lg:col-span-5">
          <MentorSessionsSummary />
          <DashboardNotificationsPanel />
        </div>
        <div className="lg:col-span-7">
          {mentorProfile ? (
            <DashboardCard
              title="Weekly availability"
              description="Students and AI matching use hours calculated from your slots."
              bodyClassName="px-5 pb-5"
            >
              <MentorAvailabilitySection embedded />
            </DashboardCard>
          ) : (
            <DashboardCard
              title="Weekly availability"
              bodyClassName="flex flex-col items-center justify-center px-6 py-12 text-center"
            >
              <p className="max-w-xs text-sm text-muted-foreground">
                Complete your profile to set the hours you are available for students.
              </p>
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Set up profile
              </button>
            </DashboardCard>
          )}
        </div>
      </div>

      <DashboardCard
        title="Achievements"
        description="Earn badges by completing your profile, setting availability, and connecting with students."
        bodyClassName="px-5 py-5"
      >
        <MentorBadgeGrid badges={badges} showLockedHints />
      </DashboardCard>

      <MentorProfileEditModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initial={mentorProfile}
        onSaved={(saved) => onProfileUpdate(saved)}
      />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center lg:text-right">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-xl font-semibold tabular-nums ${
          accent ? "text-amber-600 dark:text-amber-400" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
