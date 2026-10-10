'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (adminOnly && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, loading, adminOnly, router]);

  if (loading || !user || (adminOnly && user.role !== 'admin')) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    );
  }

  return <>{children}</>;
}
