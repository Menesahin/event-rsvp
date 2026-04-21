import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";
import { formatRelativeDate, isPast as checkPast } from "@/lib/utils/date";

interface EventCardProps {
  event: {
    slug: string;
    title: string;
    date: Date;
    location: string;
    coverImage: string | null;
    capacity: number;
    status: string;
    _count: { rsvps: number };
  };
}

export function EventCard({ event }: EventCardProps) {
  const goingCount = event._count.rsvps;
  const isFull = goingCount >= event.capacity;
  const isPast = checkPast(event.date);
  const isCancelled = event.status === "CANCELLED";
  const progressPercent = Math.min((goingCount / event.capacity) * 100, 100);

  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-3xl text-gray-300">📅</span>
            </div>
          )}
          {isCancelled ? (
            <Badge variant="destructive" className="absolute right-2 top-2">Cancelled</Badge>
          ) : isPast ? (
            <Badge variant="secondary" className="absolute right-2 top-2">Ended</Badge>
          ) : isFull ? (
            <Badge variant="destructive" className="absolute right-2 top-2">Full</Badge>
          ) : null}
        </div>
        <CardContent className={`space-y-2 p-4 ${isPast ? "opacity-60" : ""}`}>
          <p className="text-xs font-medium text-muted-foreground">
            {formatRelativeDate(event.date)}
          </p>
          <h3 className="line-clamp-2 font-semibold leading-tight">
            {event.title}
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{event.location}</span>
          </p>
          <div className="space-y-1 pt-1">
            <Progress value={progressPercent} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {goingCount}/{event.capacity} attending
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
