
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

// Mobile / top navigation bar variant
export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
