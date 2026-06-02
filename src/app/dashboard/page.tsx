"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import MentorDashboard from "@/components/dashboard/mentor-dashboard";
import StudentDashboard from "@/components/dashboard/student-dashboard";
import AccountTypeBadge from "@/components/profile/account-type-badge";
import { useAuth } from "@/context/AuthContext";
import { useAuthMe, useMyProfile, isStudentProfile } from "@/hooks/queries";
import type { MentorBadge } from "@/lib/mentor-api";

type MentorProfile = {
  headline: string;
  expertise: string;
  user: number;
  badges?: MentorBadge[];
};

type StudentProfile = {
  headline: string;
  skills: string;
  goals: string;
  background: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = typeof user?.role === "string" ? user.role : "";

  useEffect(() => {
    if (role === "admin") {
      router.replace("/admin");
    }
  }, [role, router]);

  const { data: authMe } = useAuthMe();
  const email =
    typeof user?.email === "string"
      ? user.email
      : typeof authMe?.email === "string"
        ? authMe.email
        : undefined;

  const { data: profile, isLoading: profileLoading, refetch } = useMyProfile();

  if (role === "admin") {
    return null;
  }

  if (role === "mentor") {
    const mentorProfile =
      profile && !isStudentProfile(profile)
        ? {
            headline: profile.headline,
            expertise: profile.expertise,
            user: profile.user,
            badges: profile.badges,
          }
        : null;
    const badges = mentorProfile?.badges ?? [];
    const publicUserId = typeof mentorProfile?.user === "number" ? mentorProfile.user : null;

    return (
      <div className="mx-auto w-full max-w-6xl">
        <MentorDashboard
          email={email}
          mentorProfile={mentorProfile}
          badges={badges}
          publicUserId={publicUserId}
          profileLoading={profileLoading}
          onProfileUpdate={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  if (role === "student") {
    const studentProfile =
      profile && isStudentProfile(profile)
        ? {
            headline: profile.headline,
            skills: profile.skills,
            goals: profile.goals,
            background: profile.background,
          }
        : null;

    return (
      <div className="mx-auto w-full max-w-6xl">
        <StudentDashboard
          email={email}
          studentProfile={studentProfile}
          profileLoading={profileLoading}
          onProfileUpdate={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">You are signed in. Use the sidebar to continue.</p>
      <div className="mt-4">
        <AccountTypeBadge role={role} />
      </div>
    </div>
  );
}
