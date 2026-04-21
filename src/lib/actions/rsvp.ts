"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { ok, err, type Result } from "@/lib/result";
import { revalidatePath } from "next/cache";

const log = logger.child({ module: "RSVPActions" });

type RSVPResult = Result<
  { status: "GOING" | "WAITLISTED" },
  string
>;

type CancelResult = Result<
  { promotedUserId?: string },
  string
>;

export async function createRSVP(eventId: string, slug: string): Promise<RSVPResult> {
  const session = await auth();
  if (!session?.user?.id) return err("Unauthorized");

  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const event = await tx.event.findUnique({ where: { id: eventId } });
        if (!event) return err("Event not found");
        if (event.status !== "APPROVED") return err("Event is not accepting RSVPs");
        if (event.date < new Date()) return err("This event has ended");

        const existing = await tx.rSVP.findUnique({
          where: { userId_eventId: { userId, eventId } },
        });

        if (existing && existing.status !== "CANCELLED") {
          return err("You already have an RSVP");
        }

        const goingCount = await tx.rSVP.count({
          where: { eventId, status: "GOING" },
        });

        const status = goingCount < event.capacity ? "GOING" as const : "WAITLISTED" as const;

        if (existing) {
          await tx.rSVP.update({ where: { id: existing.id }, data: { status } });
        } else {
          await tx.rSVP.create({ data: { userId, eventId, status } });
        }

        return ok({ status });
      },
      { isolationLevel: "Serializable" },
    );

    if (result.ok) {
      log.info({ eventId, userId, status: result.value.status }, "RSVP created");
      revalidatePath("/events");
      revalidatePath(`/events/${slug}`);
    }

    return result;
  } catch (error) {
    log.error({ err: error, eventId, userId }, "RSVP creation failed");
    return err("Failed to create RSVP");
  }
}

export async function cancelRSVP(eventId: string, slug: string): Promise<CancelResult> {
  const session = await auth();
  if (!session?.user?.id) return err("Unauthorized");

  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const rsvp = await tx.rSVP.findUnique({
          where: { userId_eventId: { userId, eventId } },
        });

        if (!rsvp || rsvp.status === "CANCELLED") {
          return err("No active RSVP found");
        }

        const wasGoing = rsvp.status === "GOING";

        await tx.rSVP.update({
          where: { id: rsvp.id },
          data: { status: "CANCELLED" },
        });

        let promotedUserId: string | undefined;
        if (wasGoing) {
          const firstWaitlisted = await tx.rSVP.findFirst({
            where: { eventId, status: "WAITLISTED" },
            orderBy: { createdAt: "asc" },
          });

          if (firstWaitlisted) {
            await tx.rSVP.update({
              where: { id: firstWaitlisted.id },
              data: { status: "GOING" },
            });
            promotedUserId = firstWaitlisted.userId;
          }
        }

        return ok({ promotedUserId });
      },
      { isolationLevel: "Serializable" },
    );

    if (result.ok) {
      log.info({ eventId, userId, promotedUserId: result.value.promotedUserId }, "RSVP cancelled");
      revalidatePath("/events");
      revalidatePath(`/events/${slug}`);
    }

    return result;
  } catch (error) {
    log.error({ err: error, eventId, userId }, "RSVP cancellation failed");
    return err("Failed to cancel RSVP");
  }
}
