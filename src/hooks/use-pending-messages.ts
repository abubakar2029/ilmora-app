"use client";

import { useEffect, useState } from "react";

import { subscribePendingMessages } from "@/lib/pending-messages";

/** Bump when pending message registry changes (forces chat UI to re-render). */
export function usePendingMessagesRevision(): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribePendingMessages(() => setRevision((n) => n + 1)), []);
  return revision;
}
