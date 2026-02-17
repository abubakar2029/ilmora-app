"use client";

import { useState, useCallback } from "react";
import Sidebar from "./sidebar";
import SplashScreen from "./splash-screen";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden px-4 pt-16 pb-8 lg:px-10 lg:pt-8">
          {children}
        </main>
      </div>
    </>
  );
}
