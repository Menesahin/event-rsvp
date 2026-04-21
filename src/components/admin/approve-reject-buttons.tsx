"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { approveEvent, rejectEvent } from "@/lib/actions/admin";

interface ApproveRejectButtonsProps {
  eventId: string;
}

export function ApproveRejectButtons({ eventId }: ApproveRejectButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveEvent(eventId);
      if (result.success) {
        toast.success("Event approved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectEvent(eventId);
      if (result.success) {
        toast.success("Event rejected — returned to draft");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        {isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={handleReject} disabled={isPending}>
        {isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <X className="mr-1 h-4 w-4" />}
        Reject
      </Button>
    </div>
  );
}
