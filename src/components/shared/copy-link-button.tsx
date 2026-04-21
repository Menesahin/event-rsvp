"use client";

import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

export function CopyLinkButton() {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="w-full">
      <Link2 className="mr-2 h-4 w-4" />
      Copy Link
    </Button>
  );
}
