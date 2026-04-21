import { requireAuth } from "@/lib/guards/require-auth";
import { Navbar } from "@/components/layout/navbar";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <>
      <Navbar />
      <DashboardNav>{children}</DashboardNav>
    </>
  );
}
