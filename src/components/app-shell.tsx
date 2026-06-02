"use client";

import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect, type ReactNode } from "react";
import AppTopBar from "./app-top-bar";
import Sidebar from "./sidebar";
import SplashScreen from "./splash-screen";
import { useAuth } from "@/context/AuthContext";

const SPLASH_KEY = "ilmora_splash_shown";

function getInitialSplash() {
  if (typeof window === "undefined") return false;
  return !sessionStorage.getItem(SPLASH_KEY);
}

export default function AppShell({
  children,
  topBar,
}: {
  children: ReactNode;
  /** Optional row rendered at the top of the main column (e.g. dashboard header). */
  topBar?: ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(false);

  // Check sessionStorage on mount only
  useEffect(() => {
    if (!sessionStorage.getItem(SPLASH_KEY)) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem(SPLASH_KEY, "1");
    setShowSplash(false);
  }, []);

  const pathname = usePathname();
  const { user } = useAuth();
  const role = typeof user?.role === "string" ? user.role : "";
  const hideSidebar = pathname.startsWith("/admin") || role === "admin";

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={`flex min-h-dvh bg-background transition-opacity duration-300 ${showSplash ? "opacity-0" : "opacity-100"}`}>
        {hideSidebar ? null : <Sidebar />}
        <main
          className={`flex-1 min-h-dvh overflow-x-hidden px-4 pb-8 lg:px-10 ${
            hideSidebar ? "pt-6" : "pt-16 lg:pt-6"
          }`}
        >
          {topBar ?? <AppTopBar />}
          {children}
        </main>
      </div>
    </>
  );
}
