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

export type AuthContextValue = {
  user: JwtUserPayload | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  syncUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtUserPayload | null>(() => auth.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  const syncUser = useCallback(() => {
    setUser(auth.getCurrentUser());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await auth.refreshToken();
      if (cancelled) return;
      if (ok) syncUser();
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
