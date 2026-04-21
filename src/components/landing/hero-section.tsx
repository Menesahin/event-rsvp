import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background px-4 py-24 text-center sm:py-32">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <CalendarDays className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Where tech communities
          <br />
          <span className="text-primary">come together.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
          Simple event management with smart RSVP. Create events, manage
          attendance, and grow your community.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/events">
            <Button size="lg" className="px-8">
              Browse Events
            </Button>
          </Link>
          <Link href="/dashboard/events/new">
            <Button size="lg" variant="outline" className="px-8">
              Create Event
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
