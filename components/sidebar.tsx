"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const EMAIL = "hello@ilmora.com";
const WHATSAPP_URL = "https://wa.me/1234567890";
const LINKEDIN_URL = "https://linkedin.com/company/ilmora";

const navItems = [
  {
    label: "My Journey",
    href: "/my-journey",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M18 6 7 17l-5-5" />
        <path d="m22 10-7.5 7.5L13 16" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 0 0-16 0" />
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

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function LoginIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Simulated auth state - replace with real auth later
  const [isLoggedIn] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b border-border bg-card px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="ml-3 text-base font-bold tracking-tight text-primary">
          ilmora
        </span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-dvh flex-col border-r border-border bg-card transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:z-30 lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-64 ${collapsed ? "lg:w-16" : "lg:w-60"}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Close navigation menu"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {/* Mobile brand header */}
        <div className="flex items-center px-5 pt-5 pb-2 lg:hidden">
          <span className="text-lg font-bold tracking-tight text-primary">
            ilmora
          </span>
        </div>

        {/* Nav wrapper - full height, flex column with bottom pinned */}
        <nav className="flex flex-1 flex-col px-3 pt-3 lg:pt-4 overflow-y-auto" aria-label="Main navigation">
          {/* Top nav items */}
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                      ${collapsed ? "lg:justify-center lg:px-0" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={`hidden lg:inline-flex shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {item.icon}
                    </span>
                    <span className={`${collapsed ? "lg:hidden" : ""}`}>
                      {item.label}
                    </span>
                    {collapsed && (
                      <span className="absolute left-full ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-lg lg:group-hover:block">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Spacer pushes everything below to the bottom */}
          <div className="flex-1" />

          {/* Auth link - pinned above social links */}
          <div className="pb-3">
            {isLoggedIn ? (
              <button
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
                title={collapsed ? "Logout" : undefined}
              >
                <LogoutIcon className="hidden lg:block h-5 w-5 shrink-0" />
                <span className={`${collapsed ? "lg:hidden" : ""}`}>Logout</span>
                {collapsed && (
                  <span className="absolute left-full ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-lg lg:group-hover:block">
                    Logout
                  </span>
                )}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${pathname === "/login"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                  ${collapsed ? "lg:justify-center lg:px-0" : ""}
                `}
                title={collapsed ? "Login / Sign Up" : undefined}
              >
                <LoginIcon className={`hidden lg:block h-5 w-5 shrink-0 ${pathname === "/login" ? "text-primary" : ""}`} />
                <span className={`${collapsed ? "lg:hidden" : ""}`}>
                  Login / Sign Up
                </span>
                {collapsed && (
                  <span className="absolute left-full ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-lg lg:group-hover:block">
                    Login / Sign Up
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Social links - pinned at very bottom */}
          <div className={`relative flex items-center border-t border-border py-4 ${collapsed ? "lg:flex-col lg:gap-2 lg:justify-center" : "gap-3"}`}>
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

            {/* Copied toast */}
            {copied && (
              <span className={`absolute -top-9 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg ${collapsed ? "left-1/2 -translate-x-1/2" : "left-0"}`}>
                Copied!
              </span>
            )}
          </div>
        </nav>

        {/* Desktop collapse toggle arrow -- on the right border */}
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
