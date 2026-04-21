import { requireAuth } from "./require-auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  ATTENDEE: 0,
  ORGANIZER: 1,
  ADMIN: 2,
};

export async function requireRole(minimumRole: UserRole) {
  const user = await requireAuth();
  if (ROLE_HIERARCHY[user.role as UserRole] < ROLE_HIERARCHY[minimumRole]) {
    redirect("/dashboard");
  }
  return user;
}
