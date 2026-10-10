'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { Lesson, Category, LessonSection } from '@/lib/types';

interface AdminQuestion {
  _id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  tags: string[];
  inMockTestPool: boolean;
}

const emptyQuestionForm = {
  prompt: '',
  choices: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  difficulty: 'medium',
  tags: '',
  inMockTestPool: true,
};

export default function AdminLessonEditClient({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable field state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('beginner');
  const [order, setOrder] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [summary, setSummary] = useState('');
  const [objective, setObjective] = useState('');
  const [videoScript, setVideoScript] = useState('');
  const [dvlaRelevance, setDvlaRelevance] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [commonMistakes, setCommonMistakes] = useState('');
  const [sections, setSections] = useState<LessonSection[]>([]);

  const [qForm, setQForm] = useState(emptyQuestionForm);
  const [qSaving, setQSaving] = useState(false);
  const [qError, setQError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<{ lessons: Lesson[] }>('/admin/lessons'),
      api.get<{ questions: AdminQuestion[] }>(`/admin/lessons/${lessonId}/questions`),
    ]).then(([lessonsData, questionsData]) => {
      const found = lessonsData.lessons.find((l) => l._id === lessonId) || null;
      setLesson(found);
      if (found) {
        setTitle(found.title);
        setCategory(found.category);
        setOrder(found.order);
        setDurationMinutes(found.durationMinutes);
        setSummary(found.summary);
        setObjective(found.objective);
        setVideoScript(found.videoScript);
        setDvlaRelevance(found.dvlaRelevance);
        setKeyPoints((found.keyPoints || []).join('\n'));
        setCommonMistakes((found.commonMistakes || []).join('\n'));
        setSections(found.sections || []);
      }
      setQuestions(questionsData.questions);
      setLoading(false);
    });
  };

  // Initial data load on mount / when navigating to a different lesson id.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [lessonId]);

  const handleSaveLesson = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    setErrorMsg(null);
    try {
      await api.put(`/admin/lessons/${lessonId}`, {
        title,
        category,
        order,
        durationMinutes,
        summary,
        objective,
        videoScript,
        dvlaRelevance,
        keyPoints: keyPoints.split('\n').map((s) => s.trim()).filter(Boolean),
        commonMistakes: commonMistakes.split('\n').map((s) => s.trim()).filter(Boolean),
        sections: sections.filter((s) => s.heading.trim() && s.body.trim()),
      });
      setSavedMsg('Lesson saved.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => setSections((s) => [...s, { heading: '', body: '' }]);
  const updateSection = (i: number, field: 'heading' | 'body', value: string) =>
    setSections((s) => s.map((sec, idx) => (idx === i ? { ...sec, [field]: value } : sec)));
  const removeSection = (i: number) => setSections((s) => s.filter((_, idx) => idx !== i));

  const handleAddQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setQSaving(true);
    setQError(null);
    try {
      await api.post('/admin/questions', {
        lesson: lessonId,
        category,
        prompt: qForm.prompt,
        choices: qForm.choices.filter((c) => c.trim()),
        correctIndex: qForm.correctIndex,
        explanation: qForm.explanation,
        difficulty: qForm.difficulty,
        tags: qForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        inMockTestPool: qForm.inMockTestPool,
      });
      setQForm(emptyQuestionForm);
      load();
    } catch (err) {
      setQError(err instanceof Error ? err.message : 'Failed to add question');
    } finally {
      setQSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await api.del(`/admin/questions/${id}`);
    load();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-danger">Lesson not found.</p>
        <Link href="/admin/lessons" className="mt-4 inline-block text-brand">
          Back to lessons
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/admin/lessons" className="mb-4 flex items-center gap-1 text-sm text-foreground/60 hover:text-brand">
        <ArrowLeft size={15} /> Back to all lessons
      </Link>
      <h1 className="text-2xl font-bold">Edit lesson</h1>

      <form onSubmit={handleSaveLesson} className="mt-6 space-y-5 rounded-2xl border border-border bg-surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Duration (minutes)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Summary</label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Objective</label>
          <textarea
            rows={2}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Video / narrated walkthrough script</label>
          <textarea
            rows={5}
            value={videoScript}
            onChange={(e) => setVideoScript(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Sections</label>
            <button type="button" onClick={addSection} className="flex items-center gap-1 text-xs font-semibold text-brand">
              <Plus size={13} /> Add section
            </button>
          </div>
          <div className="space-y-3">
            {sections.map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    placeholder="Heading"
                    value={s.heading}
                    onChange={(e) => updateSection(i, 'heading', e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                  />
                  <button type="button" onClick={() => removeSection(i)} className="text-danger">
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  placeholder="Body"
                  rows={2}
                  value={s.body}
                  onChange={(e) => updateSection(i, 'body', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Key points (one per line)</label>
          <textarea
            rows={4}
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Common mistakes (one per line)</label>
          <textarea
            rows={4}
            value={commonMistakes}
            onChange={(e) => setCommonMistakes(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">DVLA relevance</label>
          <textarea
            rows={2}
            value={dvlaRelevance}
            onChange={(e) => setDvlaRelevance(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}
        {savedMsg && <p className="text-sm text-success">{savedMsg}</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          <Save size={15} /> {saving ? 'Saving...' : 'Save lesson'}
        </button>
      </form>

      <h2 className="mb-4 mt-10 text-lg font-bold">Quiz questions ({questions.length})</h2>
      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q._id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{q.prompt}</p>
                <p className="mt-1 text-xs text-foreground/50">
                  Correct: {q.choices[q.correctIndex]} &middot; {q.difficulty}
                </p>
              </div>
              <button onClick={() => handleDeleteQuestion(q._id)} className="shrink-0 text-danger">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddQuestion} className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-6">
        <h3 className="font-semibold">Add a question</h3>
        <div>
          <label className="mb-1 block text-sm font-medium">Prompt</label>
          <textarea
            required
            rows={2}
            value={qForm.prompt}
            onChange={(e) => setQForm({ ...qForm, prompt: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-2">
          {qForm.choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctIndex"
                checked={qForm.correctIndex === i}
                onChange={() => setQForm({ ...qForm, correctIndex: i })}
              />
              <input
                required
                placeholder={`Choice ${i + 1}`}
                value={c}
                onChange={(e) => {
                  const choices = [...qForm.choices];
                  choices[i] = e.target.value;
                  setQForm({ ...qForm, choices });
                }}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          ))}
          <p className="text-xs text-foreground/50">Select the radio button next to the correct choice.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Explanation (shown when the answer is wrong)</label>
          <textarea
            required
            rows={2}
            value={qForm.explanation}
            onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Difficulty</label>
            <select
              value={qForm.difficulty}
              onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tags (comma-separated)</label>
            <input
              value={qForm.tags}
              onChange={(e) => setQForm({ ...qForm, tags: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={qForm.inMockTestPool}
            onChange={(e) => setQForm({ ...qForm, inMockTestPool: e.target.checked })}
          />
          Include in the 40-question mock DVLA test pool
        </label>
        {qError && <p className="text-sm text-danger">{qError}</p>}
        <button
          type="submit"
          disabled={qSaving}
          className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          <Plus size={15} /> {qSaving ? 'Adding...' : 'Add question'}
        </button>
      </form>
    </div>
  );
}
