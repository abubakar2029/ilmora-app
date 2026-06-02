"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavSkeleton } from "@/components/ui/loading";
import { MailIcon, LinkedInIcon, WhatsAppIcon, CloseIcon, ChevronLeftIcon, LoginIcon, LogoutIcon, MenuIcon } from "@/icons";
import { getCachedNavRole, useAuth } from "@/context/AuthContext";

const EMAIL = "hello@ilmora.com";
const WHATSAPP_URL = "https://wa.me/1234567890";
const LINKEDIN_URL = "https://linkedin.com/company/ilmora";

type NavRole = "student" | "mentor" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  roles?: NavRole[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["student", "mentor"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: "My Journey",
    href: "/journey",
    roles: ["student"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M18 6 7 17l-5-5" />
        <path d="m22 10-7.5 7.5L13 16" />
      </svg>
    ),
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    roles: ["student", "mentor"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Sessions",
    href: "/dashboard/sessions",
    roles: ["student", "mentor"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Mentor inbox",
    href: "/dashboard/inbox",
    roles: ["student"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M22 12h-6l-2 3H10l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
  {
    label: "Mentee inbox",
    href: "/dashboard/inbox",
    roles: ["mentor"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M22 12h-6l-2 3H10l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
  {
    label: "My Feed",
    href: "/dashboard/my-feed",
    roles: ["student"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 11a9 9 0 0 1 9 9" />
        <path d="M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1" />
      </svg>
    ),
  },
  {
    label: "My Stories",
    href: "/dashboard/my-stories",
    roles: ["mentor"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </svg>
    ),
  },
  {
    label: "About Us",
    href: "/about",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (href === "/dashboard/my-stories") {
    return pathname === "/dashboard/my-stories" || pathname.startsWith("/dashboard/my-stories/");
  }
  if (href === "/dashboard/inbox") {
    return pathname === "/dashboard/inbox" || pathname.startsWith("/dashboard/inbox/");
  }
  if (href === "/dashboard/messages") {
    return pathname === "/dashboard/messages" || pathname.startsWith("/dashboard/messages/");
  }
  if (href === "/dashboard/sessions") {
    return pathname === "/dashboard/sessions" || pathname.startsWith("/dashboard/sessions/");
  }
  if (href === "/mentors") {
    return pathname === "/mentors" || pathname.startsWith("/mentors/");
  }
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Session role for nav — server snapshot is always null to avoid hydration mismatch. */
function subscribeNavRole(onStoreChange: () => void) {
  window.addEventListener("ilmora-nav-role", onStoreChange);
  return () => window.removeEventListener("ilmora-nav-role", onStoreChange);
}

function useCachedNavRole(): string | null {
  return useSyncExternalStore(
    subscribeNavRole,
    () => getCachedNavRole(),
    () => null,
  );
}

function resolveNavRole(
  userRole: string | undefined,
  isLoading: boolean,
  cachedNavRole: string | null,
): NavRole | undefined {
  if (userRole === "student" || userRole === "mentor" || userRole === "admin") {
    return userRole;
  }
  if (isLoading && cachedNavRole) {
    if (cachedNavRole === "student" || cachedNavRole === "mentor" || cachedNavRole === "admin") {
      return cachedNavRole;
    }
  }
  return undefined;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const cachedNavRole = useCachedNavRole();
  const isLoggedIn = Boolean(user) || isLoading;
  const role = resolveNavRole(
    typeof user?.role === "string" ? user.role : undefined,
    isLoading,
    cachedNavRole,
  );
  const navReady = Boolean(user) || Boolean(role) || !isLoading;

  const visibleNav = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b border-border bg-card px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="ml-3 text-base font-bold tracking-tight text-primary">ilmora</span>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-dvh flex-col border-r border-border bg-card transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:z-30 lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-64 ${collapsed ? "lg:w-16" : "lg:w-60"}
        `}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Close navigation menu"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="flex items-center px-5 pt-5 pb-2 lg:hidden">
          <span className="text-lg font-bold tracking-tight text-primary">ilmora</span>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto px-3 pt-3 lg:pt-4" aria-label="Main navigation">
          <ul className="flex flex-col gap-1">
            {!navReady ? (
              <NavSkeleton collapsed={collapsed} count={5} />
            ) : (
              visibleNav.map((item) => {
                const isActive = isNavActive(pathname, item.href);
                return (
                  <li key={`${item.href}-${item.label}`}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                        ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                        ${collapsed ? "lg:justify-center lg:px-0" : ""}
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      <span
                        className={`hidden shrink-0 lg:inline-flex ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                      >
                        {item.icon}
                      </span>
                      <span className={`${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                      {collapsed && (
                        <span className="absolute left-full ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-lg lg:group-hover:block">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>

          <div className="flex-1" />

          <div className="pb-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setMobileOpen(false);
                  router.push("/login");
                  router.refresh();
                }}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
                title={collapsed ? "Logout" : undefined}
              >
                <LogoutIcon className="hidden h-5 w-5 shrink-0 lg:block" />
                <span className={`${collapsed ? "lg:hidden" : ""}`}>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${pathname === "/login" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                  ${collapsed ? "lg:justify-center lg:px-0" : ""}
                `}
                title={collapsed ? "Login / Sign Up" : undefined}
              >
                <LoginIcon className={`hidden h-5 w-5 shrink-0 lg:block ${pathname === "/login" ? "text-primary" : ""}`} />
                <span className={`${collapsed ? "lg:hidden" : ""}`}>Login / Sign Up</span>
              </Link>
            )}
          </div>

          <div
            className={`relative flex items-center justify-center border-t border-border py-4 ${collapsed ? "lg:flex-col lg:gap-2" : "gap-3"}`}
          >
            <button
              onClick={handleCopyEmail}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
              aria-label="Copy email address"
            >
              <MailIcon className="h-4 w-4" />
            </button>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-[#0077b5]/15 hover:text-[#0077b5]"
              aria-label="Visit LinkedIn profile"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-[#25D366]/15 hover:text-[#25D366]"
              aria-label="Open WhatsApp chat"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            {copied && (
              <span
                className={`absolute -top-9 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg ${collapsed ? "left-1/2 -translate-x-1/2" : "left-0"}`}
              >
                Copied!
              </span>
            )}
          </div>
        </nav>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute top-1/2 -right-3 z-50 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeftIcon
            className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? "rotate-180" : "rotate-0"}`}
          />
        </button>
      </aside>
    </>
  );
}
