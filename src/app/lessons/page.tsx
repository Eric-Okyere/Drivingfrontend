'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Lesson, Category } from '@/lib/types';
import LessonCard from '@/components/LessonCard';
import { GraduationCap, TrendingUp, Trophy } from 'lucide-react';

const tabs: { key: Category; label: string; color: string }[] = [
  { key: 'beginner', label: 'Beginner', color: 'text-emerald-600' },
  { key: 'intermediate', label: 'Intermediate', color: 'text-amber-600' },
  { key: 'advanced', label: 'Advanced', color: 'text-rose-600' },
];

const tabIcons = { beginner: GraduationCap, intermediate: TrendingUp, advanced: Trophy };

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeTab, setActiveTab] = useState<Category>('beginner');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ lessons: Lesson[] }>('/lessons')
      .then((data) => setLessons(data.lessons))
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Failed to load lessons'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = lessons.filter((l) => l.category === activeTab).sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Practical Lessons</h1>
        <p className="mt-1 text-foreground/60">
          Work through Beginner, Intermediate and then Advanced lessons — each level unlocks once
          you complete the one before it.
        </p>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto rounded-xl border border-border bg-surface p-1.5">
        {tabs.map((t) => {
          const Icon = tabIcons[t.key];
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                active ? 'bg-brand text-white shadow' : 'text-foreground/60 hover:bg-surface-muted'
              }`}
            >
              <Icon size={16} className={active ? 'text-white' : t.color} /> {t.label}
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          {errorMsg} — make sure the backend API is running and reachable.
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-surface-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-foreground/60">No lessons in this category yet.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lesson) => (
            <LessonCard key={lesson._id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
