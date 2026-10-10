'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Car,
  ShieldCheck,
  Zap,
  Trophy,
  Timer,
  Sparkles,
  CheckCircle2,
  Signpost,
  Crown,
  GraduationCap,
  Ban,
  HandCoins,
  MessageCircleQuestion,
} from 'lucide-react';
import { api } from '@/lib/api';

const categories = [
  {
    name: 'Beginner',
    color: 'from-emerald-500 to-emerald-600',
    desc: 'Cockpit drill, clutch control, right-hand traffic basics, road signs and junctions.',
  },
  {
    name: 'Intermediate',
    color: 'from-amber-500 to-amber-600',
    desc: 'Roundabouts, overtaking, reverse parking, hill starts and the emergency stop.',
  },
  {
    name: 'Advanced',
    color: 'from-rose-500 to-rose-600',
    desc: 'Three-point turns, defensive driving, night/weather driving and DVLA test-day strategy.',
  },
];

const features = [
  { icon: Zap, title: 'Instant feedback', desc: 'Correct answers get a clap and a cheer. Wrong answers get the right answer plus a clear reason.' },
  { icon: Signpost, title: 'Built on the real DVLA test', desc: '40-question mock test, 75% pass mark, 45-minute timer — modeled on the actual Ghana CBT format.' },
  { icon: Trophy, title: 'Badges & leaderboard', desc: 'Earn badges for streaks and graduations, and see how you rank against other Rhema learners.' },
  { icon: ShieldCheck, title: 'Progressive unlocking', desc: 'Advanced lessons unlock only once you have mastered the Beginner and Intermediate levels.' },
];

const whyRhema = [
  {
    icon: GraduationCap,
    title: 'Written by Rhema, not a stranger',
    desc: "Random practice sites recycle the same generic questions for every school in the country. Every lesson here was written specifically for Rhema's own curriculum and kept accurate by Rhema staff.",
  },
  {
    icon: Ban,
    title: 'No ads, no distractions',
    desc: 'Other free sites are cluttered with ads and push you toward unrelated products. This portal has one job: get you ready for test day.',
  },
  {
    icon: HandCoins,
    title: 'Your fee supports your own school',
    desc: "Money spent on a random website leaves Ghana and helps no one you know. Your subscription here goes straight back into Rhema Driving School — the people actually teaching you to drive.",
  },
  {
    icon: MessageCircleQuestion,
    title: 'Backed by real instructors',
    desc: "Stuck on something the app can't explain? You can ask your Rhema instructor directly — they know exactly what's in this portal because they help maintain it.",
  },
];

const faqs = [
  {
    q: 'Why do I have to pay when some other sites are free?',
    a: "Those sites are free because they're generic and ad-supported — the same content for every driving school in Ghana. This portal is written and kept accurate specifically for Rhema's own students, and your subscription keeps it that way and supports the school directly.",
  },
  {
    q: "Can I try it before paying?",
    a: 'Yes. Register for free and the first two Beginner lessons — cockpit drill and starting off — are open to everyone, no payment required. Subscribe once you see the quality for yourself.',
  },
  {
    q: 'How do I pay?',
    a: "Pay instantly in-app with MTN, Vodafone or AirtelTigo Mobile Money (or a card) through Paystack. If you'd rather pay cash or MoMo directly at the school office, ask staff to activate your account — it works exactly the same way.",
  },
  {
    q: 'What does the certificate mean?',
    a: "It's proof you've hit at least 75% on Rhema's mock DVLA test — great to show your instructor you're ready. It isn't an official DVLA document and doesn't replace the real test.",
  },
];

export default function HomePage() {
  const [priceGHS, setPriceGHS] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<{ priceGHS: number }>('/payments/config')
      .then((data) => setPriceGHS(data.priceGHS))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand/10 to-transparent">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center gap-6">
            <div className="flex h-20 w-48 items-center rounded-xl bg-white p-2 shadow-sm">
              <div className="relative h-full w-full">
                <Image src="/logo-full.png" alt="Rhema Driving School" fill sizes="192px" className="object-contain" priority />
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles size={14} /> Rhema Driving School&apos;s own practice portal
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Stop practicing on random websites. This one is actually Rhema&apos;s.
            </h1>
            <p className="text-lg text-foreground/70">
              Beginner, Intermediate and Advanced practical lessons, 300 quiz questions with
              instant sound feedback, and a full 40-question mock test modeled on the real DVLA
              computer-based test — written and maintained by your own instructors, not a
              stranger&apos;s website.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
              >
                Start free — first 2 lessons on us
              </Link>
              <Link
                href="/subscribe"
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold transition hover:bg-surface-muted"
              >
                <Crown size={16} className="text-accent" /> See pricing
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-foreground/60">
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-success" /> 15 practical lessons</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-success" /> 300 quiz questions</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-success" /> GHS {priceGHS ?? '—'}/month</span>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="grid w-full max-w-sm gap-4">
              {categories.map((c) => (
                <div
                  key={c.name}
                  className={`rounded-2xl bg-gradient-to-r ${c.color} p-5 text-white shadow-xl`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide opacity-90">
                    <Car size={16} /> {c.name}
                  </div>
                  <p className="mt-2 text-sm opacity-95">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Why pay for Rhema&apos;s portal instead of a free site?</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-foreground/60">
          A few cedis a month buys something a generic website never can: content built for
          exactly how Rhema teaches, kept accurate by Rhema instructors.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {whyRhema.map((f) => (
            <div key={f.title} className="flex gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <f.icon size={20} />
              </div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-foreground/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Everything you need to pass, in one place</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-foreground/60">
          Grounded in how the real Ghana DVLA test works — right-hand traffic rules, the
          controlled-site manoeuvres, and the exact failure points examiners watch for.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-foreground/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
          <div className="bg-brand px-8 py-8 text-center text-white">
            <p className="text-sm font-medium uppercase tracking-wide opacity-80">One flat price</p>
            <p className="mt-1 text-5xl font-extrabold">
              GHS {priceGHS ?? '70'}
              <span className="text-lg font-medium opacity-80">/month</span>
            </p>
            <p className="mt-2 text-sm opacity-80">Full access. Cancel anytime — nothing auto-renews.</p>
          </div>
          <div className="grid gap-6 p-8 sm:grid-cols-2">
            <ul className="space-y-2.5 text-sm">
              {[
                'All 15 lessons, Beginner → Advanced',
                '300 DVLA-grounded quiz questions',
                'Full 40-question mock DVLA test',
                'Printable pass certificate',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" /> {b}
                </li>
              ))}
            </ul>
            <ul className="space-y-2.5 text-sm">
              {[
                'First 2 Beginner lessons free — try before you pay',
                'Pay by MTN, Vodafone or AirtelTigo Mobile Money',
                'Or pay cash/MoMo at the school office',
                'Points, streaks, badges and the leaderboard',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-3 border-t border-border p-8 text-center">
            <Link
              href="/register"
              className="rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/30 transition hover:opacity-90"
            >
              Create your free account
            </Link>
            <p className="text-xs text-foreground/50">No card needed to register — only when you&apos;re ready to subscribe.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Questions students ask</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-1.5 text-sm text-foreground/60">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-brand px-8 py-10 text-white sm:flex-row">
          <div>
            <h3 className="text-2xl font-bold">Ready to see how you&apos;d score on the real DVLA test?</h3>
            <p className="mt-1 text-white/80">Take the 40-question mock test — 75% to pass, 45 minutes on the clock.</p>
          </div>
          <Link
            href="/mock-test"
            className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 py-3 font-semibold text-brand transition hover:bg-white/90"
          >
            <Timer size={18} /> Take the mock test
          </Link>
        </div>
      </section>
    </div>
  );
}
