'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, PartyPopper, RotateCcw, Timer } from 'lucide-react';
import { api } from '@/lib/api';
import { QuizQuestion } from '@/lib/types';
import { playCorrectSound, playWrongSound } from '@/lib/sounds';
import { celebrateCorrectAnswer, showWrongAnswerEmojis } from '@/lib/emojiBurst';
import ProgressBar from './ProgressBar';

const QUESTION_TIME_SECONDS = 20;

interface AnswerRecord {
  questionId: string;
  selectedIndex: number;
}

interface FeedbackState {
  correct: boolean;
  correctIndex: number;
  explanation: string;
  timedOut?: boolean;
}

interface FinalResult {
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  passed: boolean;
  newlyAwardedBadges: string[];
}

const BADGE_LABELS: Record<string, string> = {
  'first-lesson': 'First Step 🚗',
  'beginner-graduate': 'Beginner Graduate 🎓',
  'intermediate-graduate': 'Intermediate Pro 🛣️',
  'advanced-graduate': 'Advanced Ace 🏁',
  'perfect-score': 'Perfect Score 💯',
  'streak-7': '7-Day Streak 🔥',
};

export default function QuizPlayer({
  lessonId,
  questions,
  onComplete,
}: {
  lessonId: string;
  questions: QuizQuestion[];
  onComplete?: (result: FinalResult) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);

  const hasAnsweredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  // Reset the 20-second clock every time a new question comes up.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(QUESTION_TIME_SECONDS);
    hasAnsweredRef.current = false;
  }, [currentIndex]);

  const handleTimeout = useCallback(async () => {
    if (hasAnsweredRef.current) return;
    hasAnsweredRef.current = true;
    setChecking(true);
    setErrorMsg(null);
    try {
      // -1 never matches a real choice index, so the server always grades it as incorrect
      // and still returns the correct answer + explanation to show the student.
      const result = await api.post<{ correct: boolean; correctIndex: number; explanation: string }>(
        '/questions/answer',
        { questionId: current.id, selectedIndex: -1 }
      );
      setFeedback({ ...result, timedOut: true });
      setAnswers((prev) => [...prev, { questionId: current.id, selectedIndex: -1 }]);
      playWrongSound();
      showWrongAnswerEmojis();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not check your answer');
    } finally {
      setChecking(false);
    }
  }, [current]);

  // The countdown itself — paused once the question has been answered or is being checked.
  useEffect(() => {
    if (feedback || checking) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, feedback, checking, handleTimeout]);

  const handleSelect = async (index: number) => {
    if (feedback || checking || hasAnsweredRef.current) return; // already answered this question
    hasAnsweredRef.current = true;
    setSelected(index);
    setChecking(true);
    setErrorMsg(null);
    try {
      const result = await api.post<{ correct: boolean; correctIndex: number; explanation: string }>(
        '/questions/answer',
        { questionId: current.id, selectedIndex: index }
      );
      setFeedback(result);
      setAnswers((prev) => [...prev, { questionId: current.id, selectedIndex: index }]);
      if (result.correct) {
        playCorrectSound();
        celebrateCorrectAnswer();
      } else {
        playWrongSound();
        showWrongAnswerEmojis();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not check your answer');
      hasAnsweredRef.current = false;
    } finally {
      setChecking(false);
    }
  };

  const handleNext = async () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setFeedback(null);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await api.post<FinalResult>('/progress/lesson-quiz', {
        lessonId,
        answers,
      });
      setFinalResult(result);
      if (result.passed) {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
      }
      onComplete?.(result);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not submit your quiz results');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setSelected(null);
    setFeedback(null);
    setFinalResult(null);
  };

  if (finalResult) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            finalResult.passed ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}
        >
          {finalResult.passed ? <PartyPopper size={30} /> : <XCircle size={30} />}
        </div>
        <h3 className="text-2xl font-bold">
          {finalResult.passed ? 'Lesson passed! 🎉' : 'Not quite there yet'}
        </h3>
        <p className="mt-1 text-foreground/60">
          You scored {finalResult.correctCount} / {finalResult.totalQuestions} (
          {finalResult.scorePercent}%). {finalResult.passed ? 'Great work!' : 'You need 70% to pass — review the lesson and try again.'}
        </p>
        <div className="mx-auto mt-4 max-w-xs">
          <ProgressBar percent={finalResult.scorePercent} colorClass={finalResult.passed ? 'bg-success' : 'bg-danger'} heightClass="h-3" />
        </div>

        {finalResult.newlyAwardedBadges.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {finalResult.newlyAwardedBadges.map((key) => (
              <span
                key={key}
                className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent"
              >
                New badge: {BADGE_LABELS[key] || key}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleRetry}
          className="mx-auto mt-6 flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-surface-muted"
        >
          <RotateCcw size={15} /> Retake this quiz
        </button>
      </div>
    );
  }

  const timeRunningLow = timeLeft <= 5;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between text-sm text-foreground/60">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        {!feedback && (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
              timeRunningLow ? 'bg-danger/10 text-danger' : 'bg-brand/10 text-brand'
            }`}
          >
            <Timer size={13} /> {timeLeft}s
          </span>
        )}
        <span>{Math.round(((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100)}%</span>
      </div>
      <ProgressBar percent={((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100} />

      {!feedback && (
        <div className="mt-2">
          <ProgressBar
            percent={(timeLeft / QUESTION_TIME_SECONDS) * 100}
            colorClass={timeRunningLow ? 'bg-danger' : 'bg-brand'}
            heightClass="h-1"
          />
        </div>
      )}

      <h3 className="mt-6 text-lg font-semibold">{current.prompt}</h3>

      <div className="mt-5 flex flex-col gap-3">
        {current.choices.map((choice, index) => {
          const isSelected = selected === index;
          const isCorrectChoice = feedback && index === feedback.correctIndex;
          const isWrongSelected = feedback && isSelected && !feedback.correct;

          let stateClasses = 'border-border hover:border-brand/50';
          if (feedback) {
            if (isCorrectChoice) stateClasses = 'border-success bg-success/10';
            else if (isWrongSelected) stateClasses = 'border-danger bg-danger/10';
            else stateClasses = 'border-border opacity-60';
          } else if (isSelected) {
            stateClasses = 'border-brand bg-brand/5';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={!!feedback || checking}
              className={`relative flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${stateClasses}`}
            >
              <span>{choice}</span>
              {isCorrectChoice && <CheckCircle2 size={18} className="text-success" />}
              {isWrongSelected && <XCircle size={18} className="text-danger" />}
              {feedback && isCorrectChoice && (
                <span
                  key={currentIndex}
                  className="animate-float-emoji absolute -top-6 right-4 text-2xl"
                >
                  👏
                </span>
              )}
              {feedback && isWrongSelected && (
                <span
                  key={currentIndex}
                  className="animate-float-emoji absolute -top-6 right-4 text-2xl"
                >
                  😢
                </span>
              )}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`mt-5 rounded-xl px-4 py-3 text-sm ${
            feedback.correct ? 'bg-success/10 text-success' : 'bg-danger/10 text-foreground'
          }`}
        >
          {feedback.correct ? (
            <p className="font-semibold">Correct! 🎉👏 Well done.</p>
          ) : (
            <>
              <p className="font-semibold text-danger">
                {feedback.timedOut ? "Time's up! 😢 " : 'Not quite — 😢 '}
                the correct answer is: &ldquo;{current.choices[feedback.correctIndex]}&rdquo;
              </p>
              <p className="mt-1 text-foreground/70">{feedback.explanation}</p>
            </>
          )}
        </div>
      )}

      {errorMsg && <p className="mt-3 text-sm text-danger">{errorMsg}</p>}

      {feedback && (
        <button
          onClick={handleNext}
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : isLast ? 'Finish quiz' : 'Next question'}
        </button>
      )}
    </div>
  );
}
