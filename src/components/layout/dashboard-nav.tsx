"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CalendarPlus, Ticket } from "lucide-react";

const links = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard#my-events", icon: CalendarPlus, label: "My Events" },
  { href: "/dashboard#my-rsvps", icon: Ticket, label: "My RSVPs" },
];

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const basePath = href.split("#")[0];
  const isActive = pathname === basePath;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

export function DashboardNav({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile tabs */}
      <nav className="flex gap-1 overflow-x-auto border-b px-4 md:hidden">
        {links.map((link) => (
          <NavLink key={link.href} href={link.href} icon={link.icon}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="mx-auto flex max-w-5xl flex-1 gap-8 px-4 py-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink key={link.href} href={link.href} icon={link.icon}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
