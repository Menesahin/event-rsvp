import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = { title: "Authentication Error" };

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  const errorMessages: Record<string, string> = {
    Verification: "The magic link has expired or has already been used. Please request a new one.",
    Configuration: "There is a problem with the server configuration.",
    Default: "An authentication error occurred. Please try again.",
  };

  const message = errorMessages[error ?? ""] ?? errorMessages.Default;

  return (
    <Card className="w-full max-w-sm text-center">
      <CardHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">Authentication Error</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/sign-in">
          <Button className="w-full">Try Again</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
