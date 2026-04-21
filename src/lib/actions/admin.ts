"use server";

import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { eventRepository } from "@/lib/repositories/event.repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

const log = logger.child({ module: "AdminActions" });

export async function approveEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: new ForbiddenError("Admin access required").message };
  }

  const event = await eventRepository.getById(eventId);
  if (!event) return { success: false, error: new NotFoundError("Event not found").message };
  if (event.status !== "PENDING") return { success: false, error: "Event is not pending" };

  await eventRepository.updateStatus(eventId, "APPROVED");

  log.info({ eventId, adminId: session.user.id }, "Event approved");
  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true };
}

export async function rejectEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: new ForbiddenError("Admin access required").message };
  }

  const event = await eventRepository.getById(eventId);
  if (!event) return { success: false, error: new NotFoundError("Event not found").message };
  if (event.status !== "PENDING") return { success: false, error: "Event is not pending" };

  await eventRepository.updateStatus(eventId, "DRAFT");

  log.info({ eventId, adminId: session.user.id }, "Event rejected");
  revalidatePath("/admin/events");
  revalidatePath("/dashboard");
  return { success: true };
}
