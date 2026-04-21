import "server-only";
import prisma from "@/lib/db";
import type { EventStatus, Prisma } from "@/generated/prisma/client";

export const eventRepository = {
  async getBySlug(slug: string) {
    return prisma.event.findUnique({
      where: { slug },
      include: {
        speakers: true,
        organizer: { select: { id: true, name: true, image: true } },
        _count: { select: { rsvps: { where: { status: "GOING" } } } },
      },
    });
  },

  async getUpcoming(limit = 10) {
    return prisma.event.findMany({
      where: { status: "APPROVED", date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: limit,
      include: {
        _count: { select: { rsvps: { where: { status: "GOING" } } } },
      },
    });
  },

  async getPast(limit = 10) {
    return prisma.event.findMany({
      where: { status: "APPROVED", date: { lt: new Date() } },
      orderBy: { date: "desc" },
      take: limit,
      include: {
        _count: { select: { rsvps: { where: { status: "GOING" } } } },
      },
    });
  },

  async getByOrganizer(userId: string) {
    return prisma.event.findMany({
      where: { organizerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { rsvps: { where: { status: "GOING" } } } },
      },
    });
  },

  async getPending() {
    return prisma.event.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        speakers: true,
      },
    });
  },

  async getById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: { speakers: true },
    });
  },

  async create(
    data: Omit<Prisma.EventCreateInput, "organizer"> & { organizerId: string },
  ) {
    const { organizerId, ...rest } = data;
    return prisma.event.create({
      data: {
        ...rest,
        organizer: { connect: { id: organizerId } },
      },
    });
  },

  async update(id: string, data: Prisma.EventUpdateInput) {
    return prisma.event.update({ where: { id }, data });
  },

  async updateStatus(id: string, status: EventStatus) {
    return prisma.event.update({ where: { id }, data: { status } });
  },
};
