import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import prisma from "@/lib/db";
import { userRepository } from "@/lib/repositories/user.repository";

const isDevMode = process.env.DEV_MODE === "true";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "Event RSVP <noreply@eventrsvp.dev>",
      ...(isDevMode && {
        sendVerificationRequest: async ({ identifier, url }) => {
          // Dev mode: store the URL in VerificationToken for retrieval
          // instead of sending an actual email
          await prisma.verificationToken.upsert({
            where: {
              identifier_token: {
                identifier: `dev_url:${identifier}`,
                token: `dev_url:${identifier}`,
              },
            },
            update: {
              token: `dev_url:${identifier}`,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
              identifier: `dev_url:${identifier}`,
            },
            create: {
              identifier: `dev_url:${identifier}`,
              token: `dev_url:${identifier}`,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          });

          // Store the actual URL in a separate record
          await prisma.verificationToken.upsert({
            where: {
              identifier_token: {
                identifier: `dev_callback:${identifier}`,
                token: url,
              },
            },
            update: {
              token: url,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
            create: {
              identifier: `dev_callback:${identifier}`,
              token: url,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          });
        },
      }),
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;

      const dbUser = await userRepository.getById(user.id);
      session.user.role = dbUser?.role ?? "ATTENDEE";

      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/verify-request",
    error: "/error",
  },
});
