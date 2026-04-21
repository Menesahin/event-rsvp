import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Check Your Email",
};

export default function VerifyRequestPage() {
  return (
    <Card className="w-full max-w-sm text-center">
      <CardHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Check your email</CardTitle>
        <CardDescription>
          A sign in link has been sent to your email address. Click the link to
          sign in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/sign-in">
          <Button variant="ghost" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
