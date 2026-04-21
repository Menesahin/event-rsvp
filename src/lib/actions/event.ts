"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createEventSchema, approvedEventUpdateSchema } from "@/lib/validations/event";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { requireOwnership } from "@/lib/guards/require-ownership";
import { eventRepository } from "@/lib/repositories/event.repository";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";

const log = logger.child({ module: "EventActions" });

function handleActionError(error: unknown): { success: false; error: string } {
  if (error instanceof UnauthorizedError) return { success: false, error: error.message };
  if (error instanceof ForbiddenError) return { success: false, error: error.message };
  if (error instanceof NotFoundError) return { success: false, error: error.message };
  log.error({ err: error }, "Unexpected error");
  return { success: false, error: "An unexpected error occurred" };
}

export async function createEvent(
  prevState: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) return handleActionError(new UnauthorizedError("Not authenticated"));
  if (session.user.role === "ATTENDEE") return handleActionError(new ForbiddenError("Insufficient role"));

  const raw = Object.fromEntries(formData);
  const parsed = createEventSchema.safeParse({
    ...raw,
    capacity: Number(raw.capacity),
    speakers: JSON.parse((raw.speakers as string) || "[]"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0] ?? "Invalid input";
    return { success: false, error: firstError, fieldErrors };
  }

  try {
    const intent = formData.get("intent") as string | null;
    const slug = await generateUniqueSlug(parsed.data.title);
    const { speakers, ...eventData } = parsed.data;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        slug,
        date: new Date(eventData.date),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        coverImage: eventData.coverImage || null,
        status: intent === "submit" ? "PENDING" : "DRAFT",
        organizer: { connect: { id: session.user.id } },
        speakers: {
          create: speakers.map((s) => ({
            name: s.name,
            title: s.title || null,
            bio: s.bio || null,
            avatar: s.avatar || null,
          })),
        },
      },
    });

    log.info({ eventId: event.id, userId: session.user.id }, "Event created");
    revalidatePath("/dashboard");
    redirect(`/dashboard/events/${event.id}`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return handleActionError(error);
  }
}

export async function updateEvent(
  eventId: string,
  prevState: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) return handleActionError(new UnauthorizedError("Not authenticated"));

  const event = await eventRepository.getById(eventId);
  if (!event) return handleActionError(new NotFoundError("Event not found"));
  requireOwnership(event.organizerId, session.user.id, session.user.role);

  const raw = Object.fromEntries(formData);

  if (event.status === "APPROVED") {
    const parsed = approvedEventUpdateSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    await eventRepository.update(eventId, {
      description: parsed.data.description ?? event.description,
      coverImage: parsed.data.coverImage !== undefined ? (parsed.data.coverImage || null) : event.coverImage,
    });
  } else {
    const parsed = createEventSchema.safeParse({
      ...raw,
      capacity: Number(raw.capacity),
      speakers: JSON.parse((raw.speakers as string) || "[]"),
    });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] ?? "Invalid input";
      return { success: false, error: firstError, fieldErrors };
    }

    const { speakers, ...eventData } = parsed.data;

    await prisma.event.update({
      where: { id: eventId },
      data: {
        ...eventData,
        date: new Date(eventData.date),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        coverImage: eventData.coverImage || null,
        speakers: {
          deleteMany: {},
          create: speakers.map((s) => ({
            name: s.name,
            title: s.title || null,
            bio: s.bio || null,
            avatar: s.avatar || null,
          })),
        },
      },
    });
  }

  log.info({ eventId, userId: session.user.id }, "Event updated");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/events");
  return { success: true };
}

export async function submitForReview(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return handleActionError(new UnauthorizedError("Not authenticated"));

  const event = await eventRepository.getById(eventId);
  if (!event) return handleActionError(new NotFoundError("Event not found"));
  if (event.organizerId !== session.user.id) return handleActionError(new ForbiddenError("Not event owner"));
  if (event.status !== "DRAFT") return { success: false, error: "Only draft events can be submitted" };

  await eventRepository.updateStatus(eventId, "PENDING");

  log.info({ eventId, userId: session.user.id }, "Event submitted for review");
  revalidatePath("/dashboard");
  revalidatePath("/admin/events");
  return { success: true };
}

export async function cancelEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return handleActionError(new UnauthorizedError("Not authenticated"));

  const event = await eventRepository.getById(eventId);
  if (!event) return handleActionError(new NotFoundError("Event not found"));
  if (event.status === "CANCELLED") return { success: false, error: "Event is already cancelled" };
  requireOwnership(event.organizerId, session.user.id, session.user.role);

  await prisma.$transaction([
    prisma.event.update({ where: { id: eventId }, data: { status: "CANCELLED" } }),
    prisma.rSVP.updateMany({
      where: { eventId, status: { in: ["GOING", "WAITLISTED"] } },
      data: { status: "CANCELLED" },
    }),
  ]);

  log.info({ eventId, userId: session.user.id }, "Event cancelled");
  revalidatePath("/dashboard");
  revalidatePath("/events");
  return { success: true };
}
