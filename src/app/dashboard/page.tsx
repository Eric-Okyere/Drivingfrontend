'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Award, Star, ArrowRight, Timer } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import RequireAuth from '@/components/RequireAuth';
import ProgressBar from '@/components/ProgressBar';
import { Category } from '@/lib/types';

interface ProgressEntry {
  _id: string;
  category: Category;
  completed: boolean;
  bestScorePercent: number;
  lesson: { title: string; slug: string; category: Category };
}

interface MockHistoryEntry {
  _id: string;
  scorePercent: number;
  passed: boolean;
  createdAt: string;
}

const categoryMeta: Record<Category, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-emerald-500' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-500' },
  advanced: { label: 'Advanced', color: 'bg-rose-500' },
};

function DashboardContent() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [mockHistory, setMockHistory] = useState<MockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ progress: ProgressEntry[]; totalLessons: number; completedLessons: number }>('/progress/me'),
      api.get<{ history: MockHistoryEntry[] }>('/mock-test/history'),
    ])
      .then(([progressData, historyData]) => {
        setProgress(progressData.progress);
        setTotalLessons(progressData.totalLessons);
        setCompletedLessons(progressData.completedLessons);
        setMockHistory(historyData.history);
      })
      .finally(() => setLoading(false));
  }, []);

  const byCategory: Record<Category, ProgressEntry[]> = {
    beginner: progress.filter((p) => p.category === 'beginner'),
    intermediate: progress.filter((p) => p.category === 'intermediate'),
    advanced: progress.filter((p) => p.category === 'advanced'),
  };

  const overallPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-foreground/60">Here&apos;s how your road-readiness is coming along.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Star} label="Total points" value={user?.totalPoints ?? 0} color="text-brand" />
        <StatCard icon={Flame} label="Current streak" value={`${user?.streakCount ?? 0} days`} color="text-orange-500" />
        <StatCard icon={Award} label="Badges earned" value={user?.badges.length ?? 0} color="text-accent" />
        <StatCard icon={Timer} label="Lessons completed" value={`${completedLessons}/${totalLessons || '—'}`} color="text-success" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Progress by category</h2>
          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
          ) : (
            <div className="space-y-5">
              {(Object.keys(categoryMeta) as Category[]).map((cat) => {
                const entries = byCategory[cat];
                const completed = entries.filter((e) => e.completed).length;
                const total = entries.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <div key={cat} className="rounded-2xl border border-border bg-surface p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">{categoryMeta[cat].label}</span>
                      <span className="text-sm text-foreground/60">
                        {completed}/{total} lessons
                      </span>
                    </div>
                    <ProgressBar percent={pct} colorClass={categoryMeta[cat].color} />
                  </div>
                );
              })}

              <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-brand">Overall completion</span>
                  <span className="text-sm text-brand">{overallPercent}%</span>
                </div>
                <ProgressBar percent={overallPercent} colorClass="bg-brand" heightClass="h-3" />
              </div>
            </div>
          )}

          <Link
            href="/lessons"
            className="mt-6 flex w-fit items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Continue lessons <ArrowRight size={15} />
          </Link>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">Badges</h2>
          {user?.badges.length ? (
            <div className="flex flex-wrap gap-2">
              {user.badges.map((b) => (
                <span key={b.key} className="rounded-full bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent">
                  {b.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">Complete your first lesson quiz to earn a badge.</p>
          )}

          <h2 className="mb-4 mt-8 text-lg font-bold">Recent mock tests</h2>
          {mockHistory.length === 0 ? (
            <p className="text-sm text-foreground/60">You haven&apos;t taken the mock DVLA test yet.</p>
          ) : (
            <ul className="space-y-2">
              {mockHistory.slice(0, 5).map((h) => (
                <li
                  key={h._id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                >
                  <span className={h.passed ? 'font-semibold text-success' : 'font-semibold text-danger'}>
                    {h.scorePercent}% {h.passed ? 'Passed' : 'Failed'}
                  </span>
                  <span className="text-foreground/50">{new Date(h.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/mock-test" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
            Take mock test <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-foreground/60">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
