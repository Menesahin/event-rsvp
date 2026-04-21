"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Send, XCircle } from "lucide-react";
import { submitForReview, cancelEvent } from "@/lib/actions/event";

interface EventActionsProps {
  eventId: string;
  status: string;
}

export function EventActions({ eventId, status }: EventActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitForReview(eventId);
      if (result.success) {
        toast.success("Event submitted for review");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelEvent(eventId);
      if (result.success) {
        toast.success("Event cancelled");
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      {status === "DRAFT" && (
        <Button size="sm" onClick={handleSubmit} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Submit for Review
        </Button>
      )}
      {status !== "CANCELLED" && (
        <>
          <Button size="sm" variant="destructive" onClick={() => setDialogOpen(true)}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Event
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Event</DialogTitle>
              <DialogDescription>
                Are you sure? This will cancel all existing RSVPs. This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Keep Event
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Cancel Event
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
