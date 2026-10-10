'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, ListChecks, AlertTriangle, ShieldAlert, PlayCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Lesson, QuizQuestion } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import QuizPlayer from '@/components/QuizPlayer';

export default function LessonDetailClient({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<{ lesson: Lesson }>(`/lessons/${slug}`),
      api.get<{ questions: QuizQuestion[] }>(`/questions/lesson/${slug}`),
    ])
      .then(([lessonData, questionData]) => {
        setLesson(lessonData.lesson);
        setQuestions(questionData.questions);
      })
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Failed to load lesson'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-muted" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-surface-muted" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    );
  }

  if (errorMsg || !lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-danger">{errorMsg || 'Lesson not found'}</p>
        <Link href="/lessons" className="mt-4 inline-block text-brand">
          Back to lessons
        </Link>
      </div>
    );
  }

  const categoryColor =
    lesson.category === 'beginner'
      ? 'text-emerald-600 bg-emerald-500/10'
      : lesson.category === 'intermediate'
        ? 'text-amber-600 bg-amber-500/10'
        : 'text-rose-600 bg-rose-500/10';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/lessons" className="mb-6 flex items-center gap-1 text-sm text-foreground/60 hover:text-brand">
        <ArrowLeft size={15} /> Back to lessons
      </Link>

      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${categoryColor}`}>
        {lesson.category}
      </span>
      <h1 className="mt-3 text-3xl font-bold">{lesson.title}</h1>
      <div className="mt-2 flex items-center gap-4 text-sm text-foreground/60">
        <span className="flex items-center gap-1">
          <Clock size={14} /> {lesson.durationMinutes} min
        </span>
        {lesson.progress?.completed && <span className="font-semibold text-success">Completed ✓</span>}
      </div>

      <p className="mt-5 text-foreground/80">{lesson.summary}</p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand">
          <Target size={15} /> Objective
        </div>
        <p className="text-sm text-foreground/70">{lesson.objective}</p>
      </div>

      {lesson.videoScript && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand">
            <PlayCircle size={15} /> Lesson walkthrough
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{lesson.videoScript}</p>
        </div>
      )}

      {lesson.sections.map((s, i) => (
        <div key={i} className="mt-6">
          <h2 className="text-lg font-semibold">{s.heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.body}</p>
        </div>
      ))}

      {lesson.keyPoints.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-success">
            <ListChecks size={15} /> Key points
          </div>
          <ul className="space-y-2 text-sm text-foreground/80">
            {lesson.keyPoints.map((k, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-success">•</span> {k}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lesson.commonMistakes.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-danger">
            <AlertTriangle size={15} /> Common mistakes to avoid
          </div>
          <ul className="space-y-2 text-sm text-foreground/80">
            {lesson.commonMistakes.map((k, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-danger">•</span> {k}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lesson.dvlaRelevance && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-5">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <p className="text-sm font-semibold text-brand">Why this matters for your DVLA test</p>
            <p className="mt-1 text-sm text-foreground/70">{lesson.dvlaRelevance}</p>
          </div>
        </div>
      )}

      <div className="mt-10">
        {!user && !authLoading ? (
          <div className="rounded-2xl border border-border bg-surface-muted p-5 text-center text-sm">
            <Link href="/login" className="font-semibold text-brand">
              Log in
            </Link>{' '}
            to take this lesson&apos;s quiz and save your progress.
          </div>
        ) : !showQuiz ? (
          <button
            onClick={() => setShowQuiz(true)}
            className="w-full rounded-xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
          >
            Start quiz ({questions.length} questions)
          </button>
        ) : (
          <QuizPlayer lessonId={lesson._id} questions={questions} />
        )}
      </div>
    </div>
  );
}
