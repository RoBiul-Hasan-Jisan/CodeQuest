import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================================
   Avatar — design system
   With presence ring, status indicator, XP ring (Duolingo), stacked group
   ============================================================================ */

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full select-none",
  {
    variants: {
      size: {
        "2xs": "h-5 w-5 text-[8px]",
        xs:    "h-7 w-7 text-[10px]",
        sm:    "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg:    "h-12 w-12 text-base",
        xl:    "h-16 w-16 text-xl",
        "2xl": "h-20 w-20 text-2xl",
      },
    },
    defaultVariants: { size: "default" },
  }
);

// Status indicator color map
const statusColorMap = {
  online:  "bg-ds-green shadow-[0_0_0_2px_hsl(var(--background))]",
  away:    "bg-ds-amber shadow-[0_0_0_2px_hsl(var(--background))]",
  busy:    "bg-destructive shadow-[0_0_0_2px_hsl(var(--background))]",
  offline: "bg-muted-foreground/40 shadow-[0_0_0_2px_hsl(var(--background))]",
};

// Status indicator size relative to avatar
const statusSizeMap = {
  "2xs": "h-1.5 w-1.5 right-0 bottom-0",
  xs:    "h-2 w-2 right-0 bottom-0",
  sm:    "h-2.5 w-2.5 right-0 bottom-0",
  default: "h-2.5 w-2.5 right-0 bottom-0",
  lg:    "h-3 w-3 right-0.5 bottom-0.5",
  xl:    "h-3.5 w-3.5 right-0.5 bottom-0.5",
  "2xl": "h-4 w-4 right-1 bottom-1",
};

// Ring style map (for XP / level rings — Duolingo style)
const ringColorMap = {
  none:   "",
  violet: "ring-2 ring-ds-violet ring-offset-2 ring-offset-background",
  green:  "ring-2 ring-ds-green ring-offset-2 ring-offset-background",
  amber:  "ring-2 ring-ds-amber ring-offset-2 ring-offset-background",
  teal:   "ring-2 ring-ds-teal ring-offset-2 ring-offset-background",
  gradient: [
    "before:absolute before:inset-[-2px] before:rounded-full before:z-[-1]",
    "before:bg-gradient-violet",
    "ring-2 ring-transparent ring-offset-2 ring-offset-background",
  ],
};

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: "online" | "away" | "busy" | "offline";
  ring?: "none" | "violet" | "green" | "amber" | "teal" | "gradient";
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = "default", src, alt, fallback, status, ring = "none", ...props }, ref) => {
  const ringClasses = Array.isArray(ringColorMap[ring])
    ? (ringColorMap[ring] as string[]).join(" ")
    : ringColorMap[ring];

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size }), ringClasses, className)}
        {...props}
      >
        <AvatarImage src={src} alt={alt ?? fallback ?? "avatar"} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </AvatarPrimitive.Root>

      {status && (
        <span
          className={cn(
            "absolute rounded-full",
            statusSizeMap[size ?? "default"],
            statusColorMap[status]
          )}
        />
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center",
      "rounded-full bg-gradient-violet font-semibold text-white",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// ── AvatarGroup — stacked avatars ─────────────────────────────────────────────

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: { src?: string; alt?: string; fallback?: string }[];
  max?: number;
  size?: VariantProps<typeof avatarVariants>["size"];
}

function AvatarGroup({ avatars, max = 4, size = "default", className, ...props }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  // Size-based overlap
  const overlapMap = {
    "2xs": "-space-x-1",
    xs:    "-space-x-1.5",
    sm:    "-space-x-2",
    default: "-space-x-2.5",
    lg:    "-space-x-3",
    xl:    "-space-x-4",
    "2xl": "-space-x-5",
  };

  return (
    <div
      className={cn("flex items-center", overlapMap[size ?? "default"], className)}
      {...props}
    >
      {visible.map((av, i) => (
        <Avatar
          key={i}
          src={av.src}
          alt={av.alt}
          fallback={av.fallback}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            avatarVariants({ size }),
            "ring-2 ring-background",
            "flex items-center justify-center",
            "bg-muted text-muted-foreground font-semibold text-xs"
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
