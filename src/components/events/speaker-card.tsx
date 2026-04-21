import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SpeakerCardProps {
  speaker: {
    name: string;
    title: string | null;
    bio: string | null;
    avatar: string | null;
  };
}

export function SpeakerCard({ speaker }: SpeakerCardProps) {
  const initials = speaker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-3 rounded-lg border p-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={speaker.avatar ?? undefined} alt={speaker.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium">{speaker.name}</p>
        {speaker.title && (
          <p className="text-sm text-muted-foreground">{speaker.title}</p>
        )}
        {speaker.bio && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {speaker.bio}
          </p>
        )}
      </div>
    </div>
  );
}
