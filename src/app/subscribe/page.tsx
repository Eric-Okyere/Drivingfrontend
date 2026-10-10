'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Crown,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Clock,
  AlertCircle,
  History,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import RequireAuth from '@/components/RequireAuth';
import { SubscriptionConfig, PaymentHistoryItem } from '@/lib/types';
import { openPaystackCheckout } from '@/lib/paystack';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

const benefits = [
  'All 15 practical lessons, Beginner through Advanced',
  '300 quiz questions written for the real Ghana DVLA test',
  'Full 40-question mock DVLA test, modeled on the real CBT format',
  'A printable certificate once you pass the mock test',
  'Points, streaks, badges and the class leaderboard',
  "You're supporting Rhema Driving School directly — not a random website",
];

function SubscribeContent() {
  const { user, refreshUser } = useAuth();
  const [config, setConfig] = useState<SubscriptionConfig | null>(null);
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState(false);

  useEffect(() => {
    api.get<SubscriptionConfig>('/payments/config').then(setConfig).catch(() => {});
    api
      .get<{ history: PaymentHistoryItem[] }>('/payments/history')
      .then((data) => setHistory(data.history))
      .catch(() => {});
  }, []);

  const handleVerify = useCallback(
    async (reference: string) => {
      try {
        await api.post('/payments/verify', { reference });
        await refreshUser();
        setJustPaid(true);
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
      } catch (err) {
        setErrorMsg(err instanceof ApiError ? err.message : 'Payment could not be verified. If you were charged, contact the school office.');
      } finally {
        setPaying(false);
      }
    },
    [refreshUser]
  );

  const handleSubscribe = async () => {
    if (!user) return;
    setErrorMsg(null);
    setPaying(true);
    try {
      const init = await api.post<{ reference: string; amountPesewas: number; email: string }>(
        '/payments/initialize'
      );
      await openPaystackCheckout({
        publicKey: PUBLIC_KEY,
        email: init.email,
        amountPesewas: init.amountPesewas,
        reference: init.reference,
        onSuccess: (reference) => handleVerify(reference),
        onClose: () => setPaying(false),
      });
    } catch (err) {
      setPaying(false);
      setErrorMsg(err instanceof Error ? err.message : 'Could not start the payment. Please try again.');
    }
  };

  const active = user?.subscription?.active;
  const price = config?.priceGHS ?? 70;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Crown size={26} />
        </div>
        <h1 className="text-3xl font-bold">Rhema Driving School subscription</h1>
        <p className="mt-2 text-foreground/60">
          One flat monthly price. Full access to every lesson, every quiz, and the mock DVLA
          test — maintained by Rhema&apos;s own instructors, for Rhema students.
        </p>
      </div>

      {active ? (
        <div className="mt-8 rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle2 size={28} className="mx-auto text-success" />
          <p className="mt-2 text-lg font-bold text-success">
            {justPaid ? 'Payment successful — you\'re subscribed!' : "You're subscribed"}
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            Full access until{' '}
            <span className="font-semibold">
              {user?.subscription?.expiresAt && new Date(user.subscription.expiresAt).toLocaleDateString()}
            </span>{' '}
            ({user?.subscription?.daysRemaining} days left)
          </p>
          <Link href="/lessons" className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white">
            Go to lessons
          </Link>
          <p className="mt-6 text-xs text-foreground/50">
            Renewing early? Just pay again below — the new month is added on top of your current one.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={paying || !PUBLIC_KEY}
            className="mt-3 flex items-center gap-2 mx-auto rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-surface-muted disabled:opacity-60"
          >
            <Smartphone size={15} /> {paying ? 'Processing...' : `Renew now — GHS ${price}`}
          </button>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="bg-brand px-6 py-6 text-center text-white">
            <p className="text-sm font-medium uppercase tracking-wide opacity-80">Monthly access</p>
            <p className="mt-1 text-4xl font-extrabold">
              GHS {price}
              <span className="text-base font-medium opacity-80">/month</span>
            </p>
          </div>
          <div className="p-6">
            <ul className="space-y-2.5 text-sm">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" /> {b}
                </li>
              ))}
            </ul>

            {!PUBLIC_KEY ? (
              <div className="mt-6 flex items-start gap-2 rounded-lg bg-accent/10 px-4 py-3 text-sm text-foreground/70">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
                Online payment isn&apos;t set up on this site yet. Please pay at Rhema&apos;s office
                (cash or Mobile Money) and ask staff to activate your account from the admin
                dashboard.
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={paying}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/30 transition hover:opacity-90 disabled:opacity-60"
              >
                <Smartphone size={18} /> {paying ? 'Opening payment...' : `Pay with Mobile Money — GHS ${price}`}
              </button>
            )}
            {errorMsg && (
              <p className="mt-3 flex items-center gap-2 text-sm text-danger">
                <AlertCircle size={15} /> {errorMsg}
              </p>
            )}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-foreground/50">
              <ShieldCheck size={13} /> Payments are processed securely by Paystack. MTN, Vodafone
              and AirtelTigo Mobile Money all work.
            </p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground/70">
            <History size={15} /> Payment history
          </h2>
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h._id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Clock size={13} className="text-foreground/40" />
                  {new Date(h.createdAt).toLocaleDateString()} &middot;{' '}
                  {h.method === 'manual' ? 'Marked paid by school' : 'Mobile Money / Paystack'}
                </span>
                <span
                  className={
                    h.status === 'success'
                      ? 'font-semibold text-success'
                      : h.status === 'failed'
                        ? 'font-semibold text-danger'
                        : 'text-foreground/50'
                  }
                >
                  {h.status === 'success' ? `GHS ${h.amountGHS || price}` : h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscribePage() {
  return (
    <RequireAuth>
      <SubscribeContent />
    </RequireAuth>
  );
}
