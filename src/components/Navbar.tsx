'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/lessons', label: 'Lessons' },
  { href: '/mock-test', label: 'Mock DVLA Test' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/certificates', label: 'Certificates' },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-border">
            <Image src="/logo-icon.png" alt="Rhema Driving School" fill sizes="40px" className="object-contain p-0.5" priority />
          </span>
          <span className="text-lg leading-tight">
            Rhema <span className="hidden sm:inline">Driving School</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition hover:text-brand ${
                pathname?.startsWith(l.href) ? 'text-brand' : 'text-foreground/70'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`flex items-center gap-1 text-sm font-medium transition hover:text-brand ${
                pathname?.startsWith('/admin') ? 'text-brand' : 'text-foreground/70'
              }`}
            >
              <ShieldCheck size={15} /> Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!loading && user ? (
            <>
              {user.role !== 'admin' &&
                (user.subscription?.active ? (
                  <Link
                    href="/subscribe"
                    className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent"
                  >
                    <Crown size={13} /> {user.subscription.daysRemaining}d left
                  </Link>
                ) : (
                  <Link
                    href="/subscribe"
                    className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    <Crown size={13} /> Subscribe
                  </Link>
                ))}
              <Link
                href="/dashboard"
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-surface-muted"
              >
                <LayoutDashboard size={15} /> {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger transition hover:bg-danger/20"
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-brand">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Start practicing
              </Link>
            </>
          ) : null}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium">
                {l.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link href="/admin" onClick={() => setOpen(false)} className="text-sm font-medium">
                Admin
              </Link>
            )}
            {user && user.role !== 'admin' && (
              <Link
                href="/subscribe"
                onClick={() => setOpen(false)}
                className={`flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  user.subscription?.active ? 'bg-accent/15 text-accent' : 'bg-accent text-white'
                }`}
              >
                <Crown size={13} />{' '}
                {user.subscription?.active ? `${user.subscription.daysRemaining}d left` : 'Subscribe'}
              </Link>
            )}
            <div className="flex items-center justify-between pt-2">
              <ThemeToggle />
              {user ? (
                <button onClick={handleLogout} className="text-sm font-medium text-danger">
                  Logout
                </button>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium">
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="text-sm font-semibold text-brand">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
