import { redirect } from "next/navigation";

export function requireOwnership(
  resourceOwnerId: string,
  currentUserId: string,
  userRole: string,
) {
  if (resourceOwnerId !== currentUserId && userRole !== "ADMIN") {
    redirect("/dashboard");
  }
}
