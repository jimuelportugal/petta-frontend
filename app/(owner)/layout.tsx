// app/(owner)/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Heart, Calendar, PlusCircle, ArrowLeft, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Pet/s',
      href: '/pets',
      icon: Heart,
      x: 0,
      y: -140,
    },
    {
      label: 'Appointment',
      href: '/appointments',
      icon: Calendar,
      x: 95,
      y: -95,
    },
    {
      label: 'Book slot',
      href: '/appointments/book',
      icon: PlusCircle,
      x: 135,
      y: 0,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Top Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-30">
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

      {/* Main Page Viewport */}
      <main className="flex-1 pb-32">{children}</main>

      {/* Universal Radial Arc Navigation Hub (Visible on all screen sizes) */}
      <div>
        {/* Full-screen Backdrop Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[998] transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Floating Menu Hub Container */}
        <div className="fixed bottom-8 left-6 z-[999] w-14 h-14">
          {/* Fanned Out Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <div
                key={item.href}
                style={{
                  transform: isOpen
                    ? `translate(${item.x}px, ${item.y}px) scale(1)`
                    : 'translate(0px, 0px) scale(0)',
                  opacity: isOpen ? 1 : 0,
                  pointerEvents: isOpen ? 'auto' : 'none',
                }}
                className="absolute top-1 left-1 flex items-center gap-2.5 transition-all duration-300 ease-out origin-center"
              >
                {/* Circular Button */}
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border-2 shrink-0 transition-transform active:scale-90',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  )}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>

                {/* Badge Label */}
                <span className="bg-popover text-popover-foreground border border-border text-xs font-semibold px-2.5 py-1 rounded-md shadow-md whitespace-nowrap select-none">
                  {item.label}
                </span>
              </div>
            );
          })}

          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className={cn(
              'w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-2 transition-transform duration-200 active:scale-95 relative z-10',
              isOpen
                ? 'bg-destructive text-destructive-foreground border-destructive rotate-90'
                : 'bg-primary text-primary-foreground border-primary ring-4 ring-primary/20'
            )}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}