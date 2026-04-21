import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { UpcomingEvents } from "@/components/landing/upcoming-events";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <Suspense
          fallback={
            <div className="mx-auto max-w-5xl px-4 py-12">
              <div className="mb-6 h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            </div>
          }
        >
          <UpcomingEvents />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
