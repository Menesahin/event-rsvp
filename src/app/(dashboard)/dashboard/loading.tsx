export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
      <div>
        <div className="mb-4 h-7 w-28 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
