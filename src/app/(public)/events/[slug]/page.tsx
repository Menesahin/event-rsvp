import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { auth } from "@/auth";
import { eventRepository } from "@/lib/repositories/event.repository";
import { rsvpRepository } from "@/lib/repositories/rsvp.repository";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SpeakerCard } from "@/components/events/speaker-card";
import { RSVPButton } from "@/components/events/rsvp-button";
import { CopyLinkButton } from "@/components/shared/copy-link-button";
import { formatEventDate, formatEventTime, isPast, isUpcoming } from "@/lib/utils/date";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await eventRepository.getBySlug(slug);
  if (!event) return { title: "Event Not Found" };

  return {
    title: event.title,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.coverImage ? [event.coverImage] : [],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await eventRepository.getBySlug(slug);

  if (!event || (event.status !== "APPROVED" && event.status !== "CANCELLED")) {
    notFound();
  }

  const session = await auth();
  const goingCount = event._count.rsvps;
  const eventIsPast = isPast(event.date);
  const isCancelled = event.status === "CANCELLED";
  const progressPercent = Math.min((goingCount / event.capacity) * 100, 100);

  const userRSVP = session?.user?.id
    ? await rsvpRepository.getUserRSVP(session.user.id, event.id)
    : null;

  return (
    <div className="space-y-8">
      {/* Cover Image */}
      {event.coverImage && (
        <div className="relative aspect-[21/9] overflow-hidden rounded-xl bg-muted">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          <div>
            {isCancelled && (
              <Badge variant="destructive" className="mb-2">
                Cancelled
              </Badge>
            )}
            {eventIsPast && !isCancelled && (
              <Badge variant="secondary" className="mb-2">
                This event has ended
              </Badge>
            )}
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organized by {event.organizer.name ?? "Unknown"}
            </p>
          </div>

          <Separator />

          <div className="max-w-none whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </div>

          {event.speakers.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Speakers</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {event.speakers.map((speaker) => (
                  <SpeakerCard key={speaker.id} speaker={speaker} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — first on mobile, sticky on desktop */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-20">
            <Card>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formatEventDate(event.date)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatEventTime(event.date)}
                      {event.endDate && ` - ${formatEventTime(event.endDate)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <p className="font-medium">{event.location}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {goingCount}/{event.capacity} attending
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                <RSVPButton
                  eventId={event.id}
                  slug={slug}
                  isAuthenticated={!!session?.user}
                  isPast={eventIsPast}
                  isCancelled={isCancelled}
                  userRSVPStatus={userRSVP?.status ?? null}
                />

                <CopyLinkButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
