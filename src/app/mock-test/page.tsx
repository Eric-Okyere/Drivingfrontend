'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Timer, AlertCircle, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProgressBar from '@/components/ProgressBar';

interface MockQuestion {
  id: string;
  prompt: string;
  choices: string[];
  category: string;
}

interface MockResultItem {
  questionId: string;
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

interface MockSubmitResponse {
  mockResultId: string;
  results: MockResultItem[];
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  passed: boolean;
  passPercent: number;
}

type Phase = 'intro' | 'in-progress' | 'result';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export default function MockTestPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [timeLimit, setTimeLimit] = useState(45 * 60);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MockSubmitResponse | null>(null);
  const [certIssued, setCertIssued] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const submitTest = useCallback(
    async (finalAnswersMap: Record<string, number>) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setSubmitting(true);
      setErrorMsg(null);
      try {
        const answers = Object.entries(finalAnswersMap).map(([questionId, selectedIndex]) => ({
          questionId,
          selectedIndex,
        }));
        const data = await api.post<MockSubmitResponse>('/mock-test/submit', {
          answers,
          durationSeconds: timeLimit - timeLeft,
        });
        setResult(data);
        setPhase('result');
        if (data.passed) confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Could not submit mock test');
      } finally {
        setSubmitting(false);
      }
    },
    [timeLimit, timeLeft]
  );

  useEffect(() => {
    if (phase !== 'in-progress') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          submitTest(answersMap);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startTest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.get<{ questions: MockQuestion[]; timeLimitSeconds: number; passPercent: number }>(
        '/mock-test/start'
      );
      setQuestions(data.questions);
      setTimeLimit(data.timeLimitSeconds);
      setTimeLeft(data.timeLimitSeconds);
      setAnswersMap({});
      setCurrentIndex(0);
      setResult(null);
      setCertIssued(false);
      setPhase('in-progress');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not start the mock test');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: string, index: number) => {
    setAnswersMap((prev) => ({ ...prev, [questionId]: index }));
  };

  const handleGetCertificate = async () => {
    if (!result) return;
    try {
      await api.post('/certificates', { mockResultId: result.mockResultId });
      setCertIssued(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not issue certificate');
    }
  };

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Timer size={30} />
        </div>
        <h1 className="text-3xl font-bold">Mock DVLA Test</h1>
        <p className="mt-2 text-foreground/60">
          Modeled on the real Ghana DVLA computer-based test: 40 multiple-choice questions drawn
          from every lesson, a 45-minute timer, and a 75% (30/40) pass mark.
        </p>

        {!user ? (
          <div className="mt-8 rounded-2xl border border-border bg-surface-muted p-5 text-sm">
            <Link href="/login" className="font-semibold text-brand">
              Log in
            </Link>{' '}
            to take the mock test and track your results.
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}
            <button
              onClick={startTest}
              disabled={loading}
              className="mt-8 rounded-xl bg-brand px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Preparing test...' : 'Start the 40-question mock test'}
            </button>
          </>
        )}
      </div>
    );
  }

  if (phase === 'in-progress') {
    const q = questions[currentIndex];
    const answeredCount = Object.keys(answersMap).length;
    const isLast = currentIndex === questions.length - 1;

    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground/60">
            Question {currentIndex + 1} of {questions.length} &middot; {answeredCount} answered
          </span>
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
              timeLeft < 300 ? 'bg-danger/10 text-danger' : 'bg-brand/10 text-brand'
            }`}
          >
            <Timer size={14} /> {formatTime(timeLeft)}
          </span>
        </div>
        <ProgressBar percent={(answeredCount / questions.length) * 100} />

        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold">{q.prompt}</h2>
          <div className="mt-5 flex flex-col gap-3">
            {q.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(q.id, index)}
                className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                  answersMap[q.id] === index ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/40'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <div className="flex gap-2 overflow-x-auto">
            {questions.map((qq, i) => (
              <button
                key={qq.id}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  answersMap[qq.id] !== undefined ? 'bg-brand' : 'bg-surface-muted'
                } ${i === currentIndex ? 'ring-2 ring-brand ring-offset-2 ring-offset-background' : ''}`}
                aria-label={`Go to question ${i + 1}`}
              />
            ))}
          </div>
          {isLast ? (
            <button
              onClick={() => submitTest(answersMap)}
              disabled={submitting}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit test'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  // phase === 'result'
  if (!result) return null;

  const resultByQuestionId = Object.fromEntries(result.results.map((r) => [r.questionId, r]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            result.passed ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}
        >
          {result.passed ? <Award size={30} /> : <XCircle size={30} />}
        </div>
        <h1 className="text-2xl font-bold">{result.passed ? 'You passed! 🎉' : 'Not a pass this time'}</h1>
        <p className="mt-1 text-foreground/60">
          {result.correctCount} / {result.totalQuestions} correct ({result.scorePercent}%) — pass mark is {result.passPercent}%
        </p>
        <div className="mx-auto mt-4 max-w-xs">
          <ProgressBar percent={result.scorePercent} colorClass={result.passed ? 'bg-success' : 'bg-danger'} heightClass="h-3" />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={startTest}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-surface-muted"
          >
            <RotateCcw size={15} /> Retake test
          </button>
          {result.passed && !certIssued && (
            <button
              onClick={handleGetCertificate}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Award size={15} /> Get your certificate
            </button>
          )}
          {certIssued && (
            <Link
              href="/certificates"
              className="flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white"
            >
              View certificate
            </Link>
          )}
        </div>
        {errorMsg && <p className="mt-3 text-sm text-danger">{errorMsg}</p>}
      </div>

      <h2 className="mb-4 mt-10 text-lg font-bold">Review your answers</h2>
      <div className="space-y-4">
        {questions.map((q) => {
          const r = resultByQuestionId[q.id];
          if (!r) return null;
          return (
            <div key={q.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start gap-2">
                {r.correct ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                ) : (
                  <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />
                )}
                <div>
                  <p className="font-medium">{q.prompt}</p>
                  {!r.correct && (
                    <p className="mt-1 text-sm text-foreground/70">
                      Correct answer: <span className="font-semibold text-success">{q.choices[r.correctIndex]}</span>
                      <br />
                      {r.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
