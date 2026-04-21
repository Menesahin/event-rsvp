import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-xl text-muted-foreground">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
      <Footer />
    </>
  );
}
