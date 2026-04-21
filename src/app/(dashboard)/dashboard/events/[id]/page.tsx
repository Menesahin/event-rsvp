import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/guards/require-auth";
import { eventRepository } from "@/lib/repositories/event.repository";
import { rsvpRepository } from "@/lib/repositories/rsvp.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventDate } from "@/lib/utils/date";
import { Pencil, Users } from "lucide-react";
import { EventActions } from "@/components/dashboard/event-actions";

export const metadata: Metadata = { title: "Event Details" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventManagePage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireAuth();
  const event = await eventRepository.getById(id);

  if (!event || (event.organizerId !== user.id && user.role !== "ADMIN")) {
    notFound();
  }

  const goingCount = await rsvpRepository.getGoingCount(event.id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatEventDate(event.date)} &middot; {event.location}
          </p>
        </div>
        <Badge
          variant={
            event.status === "APPROVED"
              ? "default"
              : event.status === "CANCELLED"
                ? "destructive"
                : "secondary"
          }
        >
          {event.status}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Attending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{goingCount}</span>
              <span className="text-muted-foreground">/ {event.capacity}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Speakers</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{event.speakers.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                event.status === "APPROVED"
                  ? "default"
                  : event.status === "CANCELLED"
                    ? "destructive"
                    : "secondary"
              }
              className="text-sm"
            >
              {event.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        {(event.status === "DRAFT" || event.status === "APPROVED") && (
          <Link href={`/dashboard/events/${event.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        )}
        <EventActions eventId={event.id} status={event.status} />
      </div>

      {event.slug && (
        <p className="text-sm text-muted-foreground">
          Public URL:{" "}
          <Link href={`/events/${event.slug}`} className="underline">
            /events/{event.slug}
          </Link>
        </p>
      )}
    </div>
  );
}
