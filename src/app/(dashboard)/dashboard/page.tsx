import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/guards/require-auth";
import { eventRepository } from "@/lib/repositories/event.repository";
import { rsvpRepository } from "@/lib/repositories/rsvp.repository";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatEventDate } from "@/lib/utils/date";
import { CalendarPlus, Eye, Pencil } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  PENDING: "secondary",
  APPROVED: "default",
  CANCELLED: "destructive",
};

const STATUS_ORDER = ["DRAFT", "PENDING", "APPROVED", "CANCELLED"] as const;

const RSVP_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  GOING: "default",
  WAITLISTED: "secondary",
  CANCELLED: "destructive",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const [events, rsvps] = await Promise.all([
    eventRepository.getByOrganizer(user.id),
    rsvpRepository.getUserRSVPs(user.id),
  ]);

  const groupedEvents = STATUS_ORDER.map((status) => ({
    status,
    events: events.filter((e) => e.status === status),
  })).filter((g) => g.events.length > 0);

  return (
    <div className="space-y-10">
      {/* My Events */}
      <section id="my-events">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">My Events</h2>
          <Link href="/dashboard/events/new">
            <Button size="sm">
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No events yet"
            description="Create your first event to get started."
            actionLabel="Create Event"
            actionHref="/dashboard/events/new"
          />
        ) : (
          <div className="space-y-6">
            {groupedEvents.map(({ status, events: groupEvents }) => (
              <div key={status}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {status} ({groupEvents.length})
                </h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2 text-left font-medium">Event</th>
                        <th className="hidden px-4 py-2 text-left font-medium sm:table-cell">Date</th>
                        <th className="px-4 py-2 text-right font-medium">RSVPs</th>
                        <th className="px-4 py-2 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupEvents.map((event) => (
                        <tr key={event.id} className="border-b last:border-0">
                          <td className="px-4 py-3">
                            <Link
                              href={`/dashboard/events/${event.id}`}
                              className="block max-w-[200px] truncate font-medium hover:underline sm:max-w-none"
                            >
                              {event.title}
                            </Link>
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                            {formatEventDate(event.date)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {event._count.rsvps}/{event.capacity}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              {event.slug && (status === "APPROVED" || status === "CANCELLED") && (
                                <Link href={`/events/${event.slug}`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="View event">
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>
                              )}
                              {(status === "DRAFT" || status === "APPROVED") && (
                                <Link href={`/dashboard/events/${event.id}/edit`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Edit event">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My RSVPs */}
      <section id="my-rsvps">
        <h2 className="mb-4 text-xl font-bold">My RSVPs</h2>

        {rsvps.length === 0 ? (
          <EmptyState
            icon="🎫"
            title="No RSVPs yet"
            description="Browse events and RSVP to get started."
            actionLabel="Browse Events"
            actionHref="/events"
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Event</th>
                  <th className="hidden px-4 py-2 text-left font-medium sm:table-cell">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/events/${rsvp.event.slug}`}
                        className="font-medium hover:underline"
                      >
                        {rsvp.event.title}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatEventDate(rsvp.event.date)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={RSVP_VARIANT[rsvp.status] ?? "secondary"}>
                        {rsvp.status === "GOING"
                          ? "Going"
                          : rsvp.status === "WAITLISTED"
                            ? "Waitlisted"
                            : "Cancelled"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
