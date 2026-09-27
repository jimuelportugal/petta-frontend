// app/(owner)/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Heart, Calendar, PlusCircle, ArrowLeft, Menu, X, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Book Slot', href: '/appointments/book', icon: PlusCircle },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Pet/s', href: '/pets', icon: Heart },
    { label: 'Home', href: '/', icon: Home },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/20 clay-badge">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <Link href="/" className="font-extrabold text-lg tracking-tight">
            Petta
          </Link>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-xl clay-btn-outline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Public Site
        </Link>
      </header>

      <main className="flex-1 pb-32">{children}</main>

      {/* Clay Floating Navigation Widget */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start">
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs -z-10 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
        )}

        <div
          className={cn(
            'flex flex-col-reverse items-start gap-4 mb-4 transition-all duration-200 ease-out origin-bottom-left',
            isOpen
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <div key={item.href} className="flex items-center gap-3">
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'w-13 h-13 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90',
                    isActive
                      ? 'clay-btn-primary text-white'
                      : 'bg-card text-foreground clay-card hover:bg-accent/40'
                  )}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>

                <span className="clay-card bg-card/90 text-foreground text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap select-none">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 active:scale-95 z-20 cursor-pointer',
            isOpen
              ? 'bg-rose-500 text-white rounded-full shadow-[5px_5px_12px_rgba(0,0,0,0.35),inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-3px_-3px_6px_rgba(0,0,0,0.4)] rotate-90'
              : 'clay-btn-primary text-white'
          )}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}