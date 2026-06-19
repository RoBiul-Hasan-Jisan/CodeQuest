import {
  FileSearch,
  FolderOpen,
  Inbox,
  Lock,
  SearchX,
  ServerCrash,
  UploadCloud,
  WifiOff,
} from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ============================================================================
   Empty states — design system
   Follows Duolingo's clear, encouraging tone with Linear's visual precision
   ============================================================================ */

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  icon?: React.ReactNode;
}

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  size?: "sm" | "default" | "lg";
  iconColor?: "violet" | "green" | "amber" | "teal" | "red" | "muted";
}

const sizeMap = {
  sm: {
    wrapper: "py-8 px-4",
    iconWrapper: "h-12 w-12",
    icon: "h-6 w-6",
    title: "text-sm font-semibold",
    description: "text-xs",
    gap: "gap-3",
  },
  default: {
    wrapper: "py-12 px-6",
    iconWrapper: "h-16 w-16",
    icon: "h-8 w-8",
    title: "text-base font-semibold",
    description: "text-sm",
    gap: "gap-4",
  },
  lg: {
    wrapper: "py-16 px-8",
    iconWrapper: "h-20 w-20",
    icon: "h-10 w-10",
    title: "text-xl font-bold",
    description: "text-base",
    gap: "gap-5",
  },
};

const iconColorMap = {
  violet: "bg-ds-violet-muted text-ds-violet",
  green:  "bg-ds-green-muted  text-ds-green",
  amber:  "bg-ds-amber-muted  text-ds-amber",
  teal:   "bg-ds-teal-muted   text-ds-teal",
  red:    "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400",
  muted:  "bg-muted text-muted-foreground",
};

function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  size = "default",
  iconColor = "muted",
  className,
  ...props
}: EmptyStateProps) {
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        s.wrapper,
        s.gap,
        className
      )}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl",
            s.iconWrapper,
            iconColorMap[iconColor]
          )}
        >
          <span className={cn("[&>svg]:h-full [&>svg]:w-full", s.icon)}>{icon}</span>
        </div>
      )}

      {/* Text */}
      <div className="flex flex-col items-center gap-1.5">
        <p className={cn("text-foreground", s.title)}>{title}</p>
        {description && (
          <p className={cn("max-w-sm text-muted-foreground text-pretty", s.description)}>
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          {primaryAction && (
            <Button
              variant={primaryAction.variant ?? "default"}
              size={primaryAction.size ?? "default"}
              onClick={primaryAction.onClick}
              {...(primaryAction.href ? { asChild: true } : {})}
              leftIcon={primaryAction.icon}
            >
              {primaryAction.href ? (
                <a href={primaryAction.href}>{primaryAction.label}</a>
              ) : (
                primaryAction.label
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant ?? "ghost"}
              size={secondaryAction.size ?? "default"}
              onClick={secondaryAction.onClick}
              leftIcon={secondaryAction.icon}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Preset empty states ──────────────────────────────────────────────────── */

type PresetProps = Omit<EmptyStateProps, "icon" | "title" | "description"> & {
  title?: string;
  description?: string;
};

// No results / search
function EmptySearch({ title, description, ...props }: PresetProps) {
  return (
    <EmptyState
      icon={<SearchX />}
      iconColor="muted"
      title={title ?? "No results found"}
      description={
        description ??
        "We couldn't find anything matching your search. Try different keywords or clear the filters."
      }
      {...props}
    />
  );
}

// Empty list / data
function EmptyData({ title, description, ...props }: PresetProps) {
  return (
    <EmptyState
      icon={<FolderOpen />}
      iconColor="violet"
      title={title ?? "Nothing here yet"}
      description={
        description ?? "When you add items they'll appear here. Get started by creating your first one."
      }
      {...props}
    />
  );
}

// Empty inbox
function EmptyInbox({ title, description, ...props }: PresetProps) {
  return (
    <EmptyState
      icon={<Inbox />}
      iconColor="green"
      title={title ?? "You're all caught up"}
      description={description ?? "No new notifications right now. We'll let you know when something happens."}
      {...props}
    />
  );
}

// Server / API error
function EmptyError({ title, description, ...props }: PresetProps) {
  return (
    <EmptyState
      icon={<ServerCrash />}
      iconColor="red"
      title={title ?? "Something went wrong"}
      description={
        description ??
        "We ran into an unexpected error. Our team has been notified. Please try again."
      }
      {...props}
    />
  );
}

// No search results (specific)
function EmptyNoResults({ title, description, ...props }: PresetProps) {
  return (
    <EmptyState
      icon={<FileSearch />}
      iconColor="amber"
      title={title ?? "No matches"}
      description={description ?? "No items match the current filters. Try adjusting or clearing them."}
      {...props}
    />
  );
}

// Permission denied
function EmptyPermission({ title, description, ...props }: PresetProps) {
  return (
    <EmptyState
      icon={<Lock />}
      iconColor="muted"
      title={title ?? "Access restricted"}
      description={
        description ?? "You don't have permission to view this content. Contact your admin if you think this is a mistake."
      }
      {...props}
    />
  );
}

// Upload / file drop
function EmptyUpload({ title, description, ...props }: PresetProps) {
  return (
    <EmptyState
      icon={<UploadCloud />}
      iconColor="teal"
      title={title ?? "Drop files here"}
      description={description ?? "Drag and drop files here, or click to browse and upload."}
      {...props}
    />
  );
}

// Offline
function EmptyOffline({ title, description, ...props }: PresetProps) {
  return (
    <EmptyState
      icon={<WifiOff />}
      iconColor="muted"
      title={title ?? "You're offline"}
      description={description ?? "Check your internet connection and try again."}
      {...props}
    />
  );
}

export {
  EmptyState,
  EmptySearch,
  EmptyData,
  EmptyInbox,
  EmptyError,
  EmptyNoResults,
  EmptyPermission,
  EmptyUpload,
  EmptyOffline,
};
