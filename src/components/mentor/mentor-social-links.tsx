"use client";

import type { MentorSocialLinks } from "@/lib/mentor-api";

type Props = {
  links: MentorSocialLinks;
  className?: string;
  size?: "sm" | "md";
};

function IconLink({
  href,
  label,
  children,
  size,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  size: "sm" | "md";
}) {
  const box = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`inline-flex ${box} items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary`}
    >
      {children}
    </a>
  );
}

function MailIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.5 8.5h3v11h-3v-11zm1.5-6a2 2 0 110 4 2 2 0 010-4zm4 6h2.9v1.5h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5v5.2h-3v-4.6c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4v4.7h-3v-11z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8.5V7c0-.8.2-1.5 1.3-1.5H17V3h-2.8C12 3 11 4.8 11 7v1.5H9v3h2V21h3v-10.5h2.5l.5-3H14z" />
    </svg>
  );
}

export default function MentorSocialLinks({ links, className = "", size = "md" }: Props) {
  const email = links.contact_email?.trim();
  const linkedin = links.linkedin_url?.trim();
  const instagram = links.instagram_url?.trim();
  const facebook = links.facebook_url?.trim();

  if (!email && !linkedin && !instagram && !facebook) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {email ? (
        <a
          href={`mailto:${email}`}
          aria-label={`Email ${email}`}
          className={`inline-flex ${size === "sm" ? "h-8" : "h-9"} items-center gap-2 rounded-full border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary`}
        >
          <MailIcon />
          <span className="max-w-[12rem] truncate">{email}</span>
        </a>
      ) : null}
      {linkedin ? (
        <IconLink href={linkedin} label="LinkedIn profile" size={size}>
          <LinkedInIcon />
        </IconLink>
      ) : null}
      {instagram ? (
        <IconLink href={instagram} label="Instagram profile" size={size}>
          <InstagramIcon />
        </IconLink>
      ) : null}
      {facebook ? (
        <IconLink href={facebook} label="Facebook profile" size={size}>
          <FacebookIcon />
        </IconLink>
      ) : null}
    </div>
  );
}
