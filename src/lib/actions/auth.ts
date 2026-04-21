"use server";

import { signIn } from "@/auth";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

const log = logger.child({ module: "AuthActions" });

const emailSchema = z.string().email("Please enter a valid email address");

export async function requestMagicLink(
  prevState: { success?: boolean; error?: string; magicLinkUrl?: string } | null,
  formData: FormData,
) {
  const rawEmail = formData.get("email");
  const parsed = emailSchema.safeParse(rawEmail);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const email = parsed.data;

  try {
    const callbackUrl = formData.get("callbackUrl") as string | null;
    await signIn("resend", { email, redirect: false, callbackUrl: callbackUrl ?? "/dashboard" });

    log.info({ email }, "Magic link requested");

    // In dev mode, retrieve the stored callback URL
    if (process.env.DEV_MODE === "true") {
      const record = await prisma.verificationToken.findFirst({
        where: { identifier: `dev_callback:${email}` },
        orderBy: { expires: "desc" },
      });

      return {
        success: true,
        magicLinkUrl: record?.token,
      };
    }

    return { success: true };
  } catch (error) {
    log.error({ err: error, email }, "Failed to send magic link");
    return { success: false, error: "Failed to send magic link. Please try again." };
  }
}
