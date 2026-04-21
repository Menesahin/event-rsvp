import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { UserMenu } from "./user-menu";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <CalendarDays className="h-5 w-5" />
            <span className="hidden sm:inline">Event RSVP</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/events"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Events
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Link href="/sign-in">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
