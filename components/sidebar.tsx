"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MailIcon, LinkedInIcon, WhatsAppIcon, CloseIcon, ChevronLeftIcon, LoginIcon, LogoutIcon, MenuIcon } from "@/icons";

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
          <div className={`relative flex items-center border-t border-border py-4 justify-center ${collapsed ? "lg:flex-col lg:gap-2" : "gap-3"}`}>
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
