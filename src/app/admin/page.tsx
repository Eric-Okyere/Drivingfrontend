'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, BookOpen, ArrowRight, Crown } from 'lucide-react';
import { api } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

interface StudentRow {
  _id: string;
  name: string;
  email: string;
  streakCount: number;
  totalPoints: number;
  badges: { key: string }[];
  createdAt: string;
}

function AdminContent() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ students: StudentRow[] }>('/admin/students')
      .then((data) => setStudents(data.students))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-foreground/60">Manage lessons, questions, and see how students are progressing.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Users size={18} />
          </div>
          <p className="text-2xl font-bold">{students.length}</p>
          <p className="text-sm text-foreground/60">Registered students</p>
        </div>
        <Link
          href="/admin/lessons"
          className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 transition hover:bg-surface-muted"
        >
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <BookOpen size={18} />
            </div>
            <p className="font-semibold">Manage lessons & questions</p>
            <p className="text-sm text-foreground/60">Create, edit and delete practical lessons and quiz questions</p>
          </div>
          <ArrowRight size={18} className="text-foreground/40" />
        </Link>
        <Link
          href="/admin/subscriptions"
          className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 transition hover:bg-surface-muted"
        >
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Crown size={18} />
            </div>
            <p className="font-semibold">Subscriptions & payments</p>
            <p className="text-sm text-foreground/60">Mark cash/MoMo payments as paid and review Paystack history</p>
          </div>
          <ArrowRight size={18} className="text-foreground/40" />
        </Link>
      </div>

      <h2 className="mb-4 mt-10 text-lg font-bold">Students</h2>
      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
      ) : students.length === 0 ? (
        <p className="text-sm text-foreground/60">No students have registered yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-foreground/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Streak</th>
                <th className="px-4 py-3">Badges</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {students.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-foreground/60">{s.email}</td>
                  <td className="px-4 py-3">{s.totalPoints}</td>
                  <td className="px-4 py-3">{s.streakCount}</td>
                  <td className="px-4 py-3">{s.badges.length}</td>
                  <td className="px-4 py-3 text-foreground/60">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth adminOnly>
      <AdminContent />
    </RequireAuth>
  );
}
