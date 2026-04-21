import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const [total, pending, approved, cancelled] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "PENDING" } }),
    prisma.event.count({ where: { status: "APPROVED" } }),
    prisma.event.count({ where: { status: "CANCELLED" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Events" value={total} />
        <StatCard label="Pending" value={pending} highlight={pending > 0} />
        <StatCard label="Approved" value={approved} />
        <StatCard label="Cancelled" value={cancelled} />
      </div>

      {pending > 0 && (
        <Link href="/admin/events">
          <Button>
            Review {pending} Pending Event{pending > 1 ? "s" : ""}
          </Button>
        </Link>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-amber-300 bg-amber-50" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-3xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
}
