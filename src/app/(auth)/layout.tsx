import Link from "next/link";
import { CalendarDays } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <CalendarDays className="h-4 w-4" />
        Event RSVP
      </Link>
      {children}
    </div>
  );
}
