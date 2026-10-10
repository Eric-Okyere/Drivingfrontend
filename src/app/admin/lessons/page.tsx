'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Pencil, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { Lesson, Category } from '@/lib/types';

const emptyForm = {
  title: '',
  category: 'beginner' as Category,
  order: 1,
  summary: '',
  objective: '',
  durationMinutes: 15,
};

function AdminLessonsContent() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<{ lessons: Lesson[] }>('/admin/lessons')
      .then((data) => setLessons(data.lessons))
      .finally(() => setLoading(false));
  };

  // Initial data load on mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      await api.post('/admin/lessons', {
        ...form,
        objective: form.objective || 'TBD',
        sections: [],
        keyPoints: [],
        commonMistakes: [],
        videoScript: '',
        dvlaRelevance: '',
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lesson and all its questions? This cannot be undone.')) return;
    await api.del(`/admin/lessons/${id}`);
    load();
  };

  const grouped: Record<Category, Lesson[]> = {
    beginner: lessons.filter((l) => l.category === 'beginner').sort((a, b) => a.order - b.order),
    intermediate: lessons.filter((l) => l.category === 'intermediate').sort((a, b) => a.order - b.order),
    advanced: lessons.filter((l) => l.category === 'advanced').sort((a, b) => a.order - b.order),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="mb-4 flex items-center gap-1 text-sm text-foreground/60 hover:text-brand">
        <ArrowLeft size={15} /> Back to admin dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage lessons</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <Plus size={16} /> New lesson
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 grid gap-4 rounded-2xl border border-border bg-surface p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Order within category</label>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Summary</label>
            <textarea
              required
              rows={2}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Objective</label>
            <textarea
              rows={2}
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          {errorMsg && <p className="text-sm text-danger sm:col-span-2">{errorMsg}</p>}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? 'Creating...' : 'Create lesson'}
            </button>
            <p className="mt-2 text-xs text-foreground/50">
              You can add the full content (sections, key points, video script) and quiz questions after creating it.
            </p>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-surface-muted" />
      ) : (
        (['beginner', 'intermediate', 'advanced'] as Category[]).map((cat) => (
          <div key={cat} className="mt-10">
            <h2 className="mb-3 text-lg font-bold capitalize">{cat}</h2>
            <div className="space-y-2">
              {grouped[cat].length === 0 && <p className="text-sm text-foreground/50">No lessons yet.</p>}
              {grouped[cat].map((lesson) => (
                <div
                  key={lesson._id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {lesson.order}. {lesson.title}
                    </p>
                    <p className="text-xs text-foreground/50">{lesson.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/lessons/${lesson._id}`}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-surface-muted"
                    >
                      <Pencil size={13} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(lesson._id)}
                      className="flex items-center gap-1 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/20"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function AdminLessonsPage() {
  return (
    <RequireAuth adminOnly>
      <AdminLessonsContent />
    </RequireAuth>
  );
}
