"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "./sidebar";
import SplashScreen from "./splash-screen";

const SPLASH_KEY = "ilmora_splash_shown";

function getInitialSplash() {
  if (typeof window === "undefined") return false;
  return !sessionStorage.getItem(SPLASH_KEY);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
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

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={`flex min-h-dvh bg-background transition-opacity duration-300 ${showSplash ? "opacity-0" : "opacity-100"}`}>
        <Sidebar />
        <main className="flex-1 min-h-dvh overflow-x-hidden px-4 pt-16 pb-8 lg:px-10 lg:pt-6">
          {children}
        </main>
      </div>
    </>
  );
}
