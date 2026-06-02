export type NotificationDisplay = {
  label: string;
  icon: string;
  accentClass: string;
};

const DISPLAY: Record<string, NotificationDisplay> = {
  welcome_signup: {
    label: "Welcome",
    icon: "👋",
    accentClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  blog_approved: {
    label: "Story published",
    icon: "✓",
    accentClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  blog_revision: {
    label: "Edits requested",
    icon: "✎",
    accentClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  },
  weekly_digest: {
    label: "Story picks",
    icon: "📖",
    accentClass: "bg-sky-500/15 text-sky-800 dark:text-sky-200",
  },
  monthly_match: {
    label: "Monthly matches",
    icon: "◎",
    accentClass: "bg-violet-500/15 text-violet-800 dark:text-violet-200",
  },
  match: {
    label: "Match",
    icon: "◎",
    accentClass: "bg-violet-500/15 text-violet-800 dark:text-violet-200",
  },
  connection_request: {
    label: "Connection request",
    icon: "👋",
    accentClass: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  },
  connection_accepted: {
    label: "Connection accepted",
    icon: "🤝",
    accentClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
};

const DEFAULT_DISPLAY: NotificationDisplay = {
  label: "Notification",
  icon: "•",
  accentClass: "bg-muted text-muted-foreground",
};

export function getNotificationDisplay(notifType: string): NotificationDisplay {
  return DISPLAY[notifType] ?? DEFAULT_DISPLAY;
}
