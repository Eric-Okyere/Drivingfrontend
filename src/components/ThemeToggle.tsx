'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // One-time restore of the viewer's saved theme on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('ds_theme');
    } catch {
      // storage may be unavailable; fall back to system preference
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('ds_theme', next ? 'dark' : 'light');
    } catch {
      // ignore storage failures
    }
  };

  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:opacity-80"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
