"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Clock, Loader2 } from "lucide-react";
import { createRSVP, cancelRSVP } from "@/lib/actions/rsvp";

interface RSVPButtonProps {
  eventId: string;
  slug: string;
  isAuthenticated: boolean;
  isPast: boolean;
  isCancelled: boolean;
  userRSVPStatus: "GOING" | "WAITLISTED" | "CANCELLED" | null;
}

export function RSVPButton({
  eventId,
  slug,
  isAuthenticated,
  isPast,
  isCancelled,
  userRSVPStatus,
}: RSVPButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`)}
      >
        Sign in to RSVP
      </Button>
    );
  }

  if (isPast) {
    return (
      <Button disabled className="w-full" variant="secondary">
        Event Ended
      </Button>
    );
  }

  if (isCancelled) {
    return (
      <Button disabled className="w-full text-destructive" variant="outline">
        Cancelled
      </Button>
    );
  }

  function handleRSVP() {
    startTransition(async () => {
      const result = await createRSVP(eventId, slug);
      if (result.ok) {
        toast.success(
          result.value.status === "GOING"
            ? "You're going!"
            : "You're on the waitlist",
        );
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelRSVP(eventId, slug);
      if (result.ok) {
        toast.success("RSVP cancelled");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (userRSVPStatus === "GOING") {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
          disabled
        >
          <Check className="mr-2 h-4 w-4" />
          Going
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={handleCancel}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Cancel RSVP
        </Button>
      </div>
    );
  }

  if (userRSVPStatus === "WAITLISTED") {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100"
          disabled
        >
          <Clock className="mr-2 h-4 w-4" />
          On Waitlist
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={handleCancel}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Cancel RSVP
        </Button>
      </div>
    );
  }

  // No RSVP or CANCELLED — show RSVP button
  return (
    <Button className="w-full" onClick={handleRSVP} disabled={isPending}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {userRSVPStatus === "CANCELLED" ? "RSVP Again" : "RSVP"}
    </Button>
  );
}
