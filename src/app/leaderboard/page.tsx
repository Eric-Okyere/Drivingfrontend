'use client';

import { useEffect, useState } from 'react';
import { Trophy, Flame } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface LeaderboardEntry {
  _id: string;
  name: string;
  totalPoints: number;
  streakCount: number;
  badges: { key: string; label: string }[];
}

const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ leaderboard: LeaderboardEntry[] }>('/leaderboard')
      .then((data) => setEntries(data.leaderboard))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Trophy size={26} />
        </div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-foreground/60">Top learners ranked by total points earned from lessons and mock tests.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-foreground/60">No students have earned points yet — be the first!</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const isMe = user && entry._id === user.id;
            return (
              <div
                key={entry._id}
                className={`flex items-center justify-between rounded-xl border px-5 py-4 ${
                  isMe ? 'border-brand bg-brand/5' : 'border-border bg-surface'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-6 text-center text-lg font-bold ${medalColors[i] || 'text-foreground/40'}`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {entry.name} {isMe && <span className="text-xs text-brand">(you)</span>}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-foreground/50">
                      <Flame size={12} /> {entry.streakCount}-day streak &middot; {entry.badges.length} badges
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-brand">{entry.totalPoints} pts</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
