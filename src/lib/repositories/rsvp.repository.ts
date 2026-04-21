import "server-only";
import prisma from "@/lib/db";

export const rsvpRepository = {
  async getUserRSVP(userId: string, eventId: string) {
    return prisma.rSVP.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
  },

  async getGoingCount(eventId: string) {
    return prisma.rSVP.count({
      where: { eventId, status: "GOING" },
    });
  },

  async getFirstWaitlisted(eventId: string) {
    return prisma.rSVP.findFirst({
      where: { eventId, status: "WAITLISTED" },
      orderBy: { createdAt: "asc" },
    });
  },

  async getUserRSVPs(userId: string) {
    return prisma.rSVP.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            date: true,
            location: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
