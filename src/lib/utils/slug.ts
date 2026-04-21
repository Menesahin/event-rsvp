import prisma from "@/lib/db";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  const existing = await prisma.event.findUnique({ where: { slug: base } });

  if (!existing) return base;

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
