export function Footer() {
  return (
    <footer className="border-t bg-background py-6">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Event RSVP. Built for tech communities.
      </div>
    </footer>
  );
}
