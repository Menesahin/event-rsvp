import { requireRole } from "@/lib/guards/require-role";
import { Navbar } from "@/components/layout/navbar";
import { AdminNav } from "@/components/layout/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");

  return (
    <>
      <Navbar />
      <AdminNav>{children}</AdminNav>
    </>
  );
}
