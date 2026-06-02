"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import * as auth from "@/lib/auth";
import type { JwtUserPayload } from "@/lib/auth";
import { getQueryClient } from "@/providers/query-provider";

export type AuthContextValue = {
  user: JwtUserPayload | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  syncUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Restored on reload so the sidebar can show role-specific links before refresh finishes. */
export const NAV_ROLE_STORAGE_KEY = "ilmora_nav_role";

const NAV_ROLE_EVENT = "ilmora-nav-role";

export function persistNavRole(role: string | null | undefined): void {
  if (typeof window === "undefined") return;
  if (role === "student" || role === "mentor" || role === "admin") {
    sessionStorage.setItem(NAV_ROLE_STORAGE_KEY, role);
  } else {
    sessionStorage.removeItem(NAV_ROLE_STORAGE_KEY);
  }
  window.dispatchEvent(new Event(NAV_ROLE_EVENT));
}

export function getCachedNavRole(): string | null {
  if (typeof window === "undefined") return null;
  const role = sessionStorage.getItem(NAV_ROLE_STORAGE_KEY);
  if (role === "student" || role === "mentor" || role === "admin") return role;
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtUserPayload | null>(() => auth.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  const syncUser = useCallback(() => {
    const next = auth.getCurrentUser();
    setUser(next);
    persistNavRole(typeof next?.role === "string" ? next.role : null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await auth.refreshToken();
      if (cancelled) return;
      if (ok) {
        syncUser();
      } else {
        persistNavRole(null);
        setUser(null);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [syncUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      await auth.login(email, password);
      syncUser();
    },
    [syncUser],
  );

  const register = useCallback(async (email: string, password: string, role: string) => {
    await auth.register(email, password, role);
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    getQueryClient().clear();
    persistNavRole(null);
    syncUser();
  }, [syncUser]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      syncUser,
    }),
    [user, isLoading, login, register, logout, syncUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
