"use client";

import Link from "next/link";
import { useState } from "react";

import DashboardNotificationsPanel from "@/components/dashboard/dashboard-notifications-panel";
import DashboardProfileCard from "@/components/dashboard/dashboard-profile-card";
import StudentActivitySummary from "@/components/dashboard/student-activity-summary";
import StudentProfileEditModal, {
  type StudentProfileData,
} from "@/components/dashboard/student-profile-edit-modal";
import { displayFirstName } from "@/lib/display-name";

type StudentProfile = StudentProfileData;

type Props = {
  email?: string;
  studentProfile: StudentProfile | null;
  profileLoading: boolean;
  onProfileUpdate: (profile: StudentProfile & { user: number }) => void;
};

const quickLinks = [
  { href: "/dashboard/inbox?find=1", label: "Find mentors", primary: true },
  { href: "/dashboard/inbox", label: "Mentor inbox" },
  { href: "/journey", label: "My journey" },
  { href: "/dashboard/my-feed", label: "My feed" },
] as const;

export default function StudentDashboard({
  email,
  studentProfile,
  profileLoading,
  onProfileUpdate,
}: Props) {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const displayName = displayFirstName(email);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="border-b border-border/60 bg-gradient-to-r from-primary/[0.07] via-transparent to-transparent px-6 py-6 lg:px-8 lg:py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/90">Student</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground lg:text-[1.65rem]">
            Hello, {displayName}
          </h1>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted-foreground">
            Find mentors that fit your goals, track requests, and keep your profile up to date.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 px-6 py-4 lg:px-8">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors
                ${
                  "primary" in link && link.primary
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-6 lg:col-span-5">
          <StudentActivitySummary />
          <DashboardNotificationsPanel />
        </div>
        <div className="lg:col-span-7">
          <DashboardProfileCard
            role="student"
            loading={profileLoading}
            student={studentProfile}
            onStudentEdit={() => setProfileModalOpen(true)}
          />
        </div>
      </div>

      <StudentProfileEditModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initial={studentProfile}
        onSaved={(saved) => onProfileUpdate(saved)}
      />
    </div>
  );
}
