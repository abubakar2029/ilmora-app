"use client";

import { useState, useEffect } from "react";

export default function SplashScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 600);
    const holdTimer = setTimeout(() => setPhase("exit"), 1800);
    const exitTimer = setTimeout(() => onComplete(), 2400);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo text with letter-by-letter animation */}
        <div className="flex items-baseline">
          {"ilmora".split("").map((char, i) => (
            <span
              key={i}
              className="inline-block text-5xl font-bold tracking-tight text-primary md:text-6xl"
              style={{
                animation: `letterPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s both`,
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Tagline fade in */}
        <p
          className="text-sm font-medium text-muted-foreground md:text-base"
          style={{
            animation: "fadeSlideUp 0.6s ease-out 0.6s both",
          }}
        >
          Clarity for every student
        </p>

        {/* Loading bar */}
        <div
          className="mt-2 h-0.5 w-32 overflow-hidden rounded-full bg-border"
          style={{ animation: "fadeSlideUp 0.5s ease-out 0.8s both" }}
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{
              animation: "loadBar 1.2s ease-in-out 0.9s both",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes letterPop {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes loadBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
