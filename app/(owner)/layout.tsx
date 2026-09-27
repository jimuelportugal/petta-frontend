// app/(owner)/layout.tsx
import Link from 'next/link';
import { ShieldCheck, Heart, Calendar, ArrowLeft } from 'lucide-react';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <Link href="/" className="font-bold text-lg tracking-tight">
            Petta
          </Link>
        </div>
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Public Site
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-6">{children}</main>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around py-2 px-4 z-40 md:sticky md:bottom-auto md:top-[57px] md:border-t-0 md:border-b">
        <Link
          href="/pets"
          className="flex flex-col md:flex-row items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors py-1 px-3 rounded-md hover:bg-muted"
        >
          <Heart className="h-4 w-4" />
          <span>My Pets</span>
        </Link>
        <Link
          href="/appointments"
          className="flex flex-col md:flex-row items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors py-1 px-3 rounded-md hover:bg-muted"
        >
          <Calendar className="h-4 w-4" />
          <span>Appointments</span>
        </Link>
        <Link
          href="/appointments/book"
          className="flex flex-col md:flex-row items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors py-1 px-3 rounded-md hover:bg-muted"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Book Slot</span>
        </Link>
      </nav>
    </div>
  );
}