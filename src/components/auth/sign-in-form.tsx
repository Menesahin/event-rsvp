"use client";

import { useActionState } from "react";
import { requestMagicLink } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface SignInFormProps {
  callbackUrl?: string;
}

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(requestMagicLink, null);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Check your email</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A sign in link has been sent to your email address.
          </p>
        </div>

        {state.magicLinkUrl && (
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4">
            <p className="mb-2 text-xs font-medium text-amber-800">
              Dev Mode
            </p>
            <a href={state.magicLinkUrl}>
              <Button variant="outline" className="w-full">
                Open Magic Link
              </Button>
            </a>
          </div>
        )}

        <form action={formAction}>
          <input type="hidden" name="email" value="" />
          <Button variant="ghost" type="button" onClick={() => window.location.reload()}>
            Back to Sign In
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending..." : "Send Magic Link"}
      </Button>
    </form>
  );
}
