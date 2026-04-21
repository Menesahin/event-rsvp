import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.rSVP.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.event.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: "admin@eventrsvp.dev",
      name: "Admin User",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: "organizer@eventrsvp.dev",
      name: "Jane Organizer",
      role: "ORGANIZER",
      emailVerified: new Date(),
    },
  });

  const attendee = await prisma.user.create({
    data: {
      email: "attendee@eventrsvp.dev",
      name: "Bob Attendee",
      role: "ATTENDEE",
      emailVerified: new Date(),
    },
  });

  // Extra attendees for waitlist demo
  const extraAttendees = await Promise.all(
    Array.from({ length: 22 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `user${i + 1}@eventrsvp.dev`,
          name: `User ${i + 1}`,
          role: "ATTENDEE",
          emailVerified: new Date(),
        },
      }),
    ),
  );

  // Event 1: Approved, with speakers and RSVPs
  const event1 = await prisma.event.create({
    data: {
      title: "Next.js Conf Istanbul",
      slug: "nextjs-conf-istanbul",
      description:
        "Join us for the biggest Next.js event in Turkey! We'll cover Server Components, App Router patterns, and the latest Next.js 16 features. Networking and refreshments included.",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      location: "Istanbul Tech Hub, Levent",
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      capacity: 50,
      status: "APPROVED",
      organizerId: organizer.id,
      speakers: {
        create: [
          {
            name: "Sarah Chen",
            title: "Senior Engineer at Vercel",
            bio: "Core contributor to Next.js. Passionate about developer experience and performance.",
            avatar: "https://i.pravatar.cc/150?u=sarah",
          },
          {
            name: "Mehmet Yilmaz",
            title: "CTO at TechStartup",
            bio: "Building scalable apps with Next.js since v9. Speaker at multiple JS conferences.",
            avatar: "https://i.pravatar.cc/150?u=mehmet",
          },
        ],
      },
    },
  });

  // RSVPs for event 1
  await prisma.rSVP.createMany({
    data: [
      { userId: attendee.id, eventId: event1.id, status: "GOING" },
      { userId: extraAttendees[0].id, eventId: event1.id, status: "GOING" },
      { userId: extraAttendees[1].id, eventId: event1.id, status: "GOING" },
    ],
  });

  // Event 2: Pending approval
  await prisma.event.create({
    data: {
      title: "React Meetup Istanbul",
      slug: "react-meetup-istanbul",
      description:
        "A casual React meetup for developers in Istanbul. Share your projects, learn new patterns, and connect with fellow React developers.",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      location: "CoWork Kadikoy",
      capacity: 30,
      status: "PENDING",
      organizerId: organizer.id,
    },
  });

  // Event 3: Draft
  await prisma.event.create({
    data: {
      title: "GraphQL Workshop",
      slug: "graphql-workshop",
      description: "Hands-on workshop covering GraphQL fundamentals, schema design, and integration with Next.js.",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: "Online (Zoom)",
      capacity: 25,
      status: "DRAFT",
      organizerId: organizer.id,
    },
  });

  // Event 4: Approved, full capacity + waitlist
  const event4 = await prisma.event.create({
    data: {
      title: "TypeScript Deep Dive",
      slug: "typescript-deep-dive",
      description:
        "Advanced TypeScript patterns: discriminated unions, template literal types, branded types, and more. Limited seats!",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "Ankara Tech Center",
      coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
      capacity: 20,
      status: "APPROVED",
      organizerId: organizer.id,
      speakers: {
        create: [
          {
            name: "Alex Turner",
            title: "TypeScript Team, Microsoft",
            bio: "Working on the TypeScript compiler and language design.",
          },
        ],
      },
    },
  });

  // 20 GOING RSVPs (full capacity)
  await prisma.rSVP.createMany({
    data: extraAttendees.slice(0, 20).map((u) => ({
      userId: u.id,
      eventId: event4.id,
      status: "GOING" as const,
    })),
  });

  // 2 WAITLISTED RSVPs
  await prisma.rSVP.createMany({
    data: [
      { userId: extraAttendees[20].id, eventId: event4.id, status: "WAITLISTED" },
      { userId: extraAttendees[21].id, eventId: event4.id, status: "WAITLISTED" },
    ],
  });

  console.log("Seed completed!");
  console.log("Users:", { admin: admin.email, organizer: organizer.email, attendee: attendee.email });
  console.log("Events: 4 (1 approved + 3 RSVPs, 1 pending, 1 draft, 1 approved + full + waitlist)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
