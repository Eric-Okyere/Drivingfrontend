import Link from 'next/link';
import { Lock, CheckCircle2, Clock, Crown } from 'lucide-react';
import { Lesson } from '@/lib/types';
import ProgressBar from './ProgressBar';

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const completed = !!lesson.progress?.completed;
  const bestScore = lesson.progress?.bestScorePercent || 0;
  const subscriptionLocked = lesson.lockReason === 'subscription';
  const prerequisiteLocked = lesson.lockReason === 'prerequisite';

  const content = (
    <div
      className={`group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm transition ${
        prerequisiteLocked ? 'opacity-60' : 'hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      {prerequisiteLocked && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 text-xs font-medium text-foreground/60">
          <Lock size={12} /> Locked
        </div>
      )}
      {subscriptionLocked && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent">
          <Crown size={12} /> Subscribe
        </div>
      )}
      {lesson.isFree && !subscriptionLocked && !prerequisiteLocked && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          Free
        </div>
      )}
      {completed && !lesson.locked && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          <CheckCircle2 size={12} /> Completed
        </div>
      )}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">
          Lesson {lesson.order}
        </span>
        <h3 className="mt-1 pr-20 text-base font-bold">{lesson.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-foreground/60">{lesson.summary}</p>
      </div>
      <div className="mt-4">
        {subscriptionLocked ? (
          <p className="text-xs font-medium text-accent">Subscribe to unlock this lesson &rarr;</p>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between text-xs text-foreground/50">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {lesson.durationMinutes} min
              </span>
              <span>{bestScore > 0 ? `Best: ${bestScore}%` : 'Not attempted'}</span>
            </div>
            <ProgressBar percent={bestScore} colorClass={completed ? 'bg-success' : 'bg-brand'} />
          </>
        )}
      </div>
    </div>
  );

  if (prerequisiteLocked) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  // Subscription-locked lessons are still clickable — the detail page shows a teaser + upsell.
  return <Link href={`/lessons/${lesson.slug}`}>{content}</Link>;
}
