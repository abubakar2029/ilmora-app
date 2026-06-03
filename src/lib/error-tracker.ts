/**
 * Client-side error log for debugging (chat, API, WebSocket).
 * Stored in sessionStorage — survives navigation within the tab, cleared when the tab closes.
 *
 * In DevTools: `copy(JSON.stringify(window.__ilmoraErrors?.(), null, 2))`
 */

export type ErrorRecord = {
  id: string;
  at: string;
  area: string;
  message: string;
  detail?: Record<string, unknown>;
};

const STORAGE_KEY = "ilmora_error_log_v1";
const MAX_ENTRIES = 80;

function readLog(): ErrorRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ErrorRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLog(entries: ErrorRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    /* quota */
  }
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function trackError(
  area: string,
  error: unknown,
  detail?: Record<string, unknown>,
): ErrorRecord {
  const record: ErrorRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    area,
    message: toMessage(error),
    detail: detail
      ? {
          ...detail,
          ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
        }
      : error instanceof Error && error.stack
        ? { stack: error.stack }
        : undefined,
  };

  const next = [...readLog(), record].slice(-MAX_ENTRIES);
  writeLog(next);

  if (process.env.NODE_ENV === "development") {
    console.error(`[ilmora:${area}]`, error, detail ?? "");
  }

  return record;
}

export function getErrorLog(): ErrorRecord[] {
  return readLog();
}

export function clearErrorLog(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function exportErrorLogJson(): string {
  return JSON.stringify(getErrorLog(), null, 2);
}

/** Attach for support / manual copy in browser console. */
export function installErrorTrackerGlobal(): void {
  if (typeof window === "undefined") return;
  const w = window as Window & {
    __ilmoraErrors?: () => ErrorRecord[];
    __ilmoraClearErrors?: () => void;
  };
  w.__ilmoraErrors = getErrorLog;
  w.__ilmoraClearErrors = clearErrorLog;
}
