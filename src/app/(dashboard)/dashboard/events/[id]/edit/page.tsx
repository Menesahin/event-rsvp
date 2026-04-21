import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/guards/require-auth";
import { eventRepository } from "@/lib/repositories/event.repository";
import { EventForm } from "@/components/dashboard/event-form";
import { updateEvent } from "@/lib/actions/event";

export const metadata: Metadata = { title: "Edit Event" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireAuth();
  const event = await eventRepository.getById(id);

  if (!event || (event.organizerId !== user.id && user.role !== "ADMIN")) {
    notFound();
  }

  if (event.status === "PENDING" || event.status === "CANCELLED") {
    notFound();
  }

  const boundAction = updateEvent.bind(null, event.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Edit Event
        {event.status === "APPROVED" && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            (only description and cover image can be changed)
          </span>
        )}
      </h1>
      <EventForm
        action={boundAction}
        isApproved={event.status === "APPROVED"}
        defaultValues={{
          title: event.title,
          description: event.description,
          date: event.date.toISOString(),
          endDate: event.endDate?.toISOString(),
          location: event.location,
          coverImage: event.coverImage ?? "",
          capacity: event.capacity,
          speakers: event.speakers.map((s) => ({
            name: s.name,
            title: s.title ?? "",
            bio: s.bio ?? "",
            avatar: s.avatar ?? "",
          })),
        }}
      />
    </div>
  );
}
