import type { Metadata } from "next";
import { requireRole } from "@/lib/guards/require-role";
import { EventForm } from "@/components/dashboard/event-form";
import { createEvent } from "@/lib/actions/event";

export const metadata: Metadata = { title: "Create Event" };

export default async function NewEventPage() {
  await requireRole("ORGANIZER");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create Event</h1>
      <EventForm action={createEvent} />
    </div>
  );
}
