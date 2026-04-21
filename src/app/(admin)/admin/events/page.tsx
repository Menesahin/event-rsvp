import type { Metadata } from "next";
import Link from "next/link";
import { eventRepository } from "@/lib/repositories/event.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ApproveRejectButtons } from "@/components/admin/approve-reject-buttons";
import { formatEventDateTime } from "@/lib/utils/date";
import { CalendarDays, MapPin, Users } from "lucide-react";

export const metadata: Metadata = { title: "Pending Events" };

export default async function AdminEventsPage() {
  const pendingEvents = await eventRepository.getPending();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pending Events</h1>

      {pendingEvents.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No pending events"
          description="All events have been reviewed."
        />
      ) : (
        <div className="space-y-4">
          {pendingEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  by {event.organizer.name ?? event.organizer.email}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatEventDateTime(event.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Capacity: {event.capacity}
                  </span>
                </div>

                <p className="text-sm line-clamp-3">{event.description}</p>

                {event.speakers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Speakers: {event.speakers.map((s) => s.name).join(", ")}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <ApproveRejectButtons eventId={event.id} />
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    View full details
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
