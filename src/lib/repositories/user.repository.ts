import "server-only";
import prisma from "@/lib/db";

export const userRepository = {
  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, image: true, role: true },
    });
  },
};
