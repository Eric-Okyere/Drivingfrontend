import Link from 'next/link';
import {
  Car,
  ShieldCheck,
  Zap,
  Trophy,
  Timer,
  Sparkles,
  CheckCircle2,
  Signpost,
} from 'lucide-react';

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
  { icon: Trophy, title: 'Badges & leaderboard', desc: 'Earn badges for streaks and graduations, and see how you rank against other learners.' },
  { icon: ShieldCheck, title: 'Progressive unlocking', desc: 'Advanced lessons unlock only once you have mastered the Beginner and Intermediate levels.' },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand/10 to-transparent">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles size={14} /> Built for Ghana&apos;s DVLA test
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Practice driving lessons that actually get you road ready.
            </h1>
            <p className="text-lg text-foreground/70">
              Beginner, Intermediate and Advanced practical lessons, quizzes with instant sound
              feedback, and a full 40-question mock test modeled on the real DVLA computer-based
              test — everything you need to walk into your test day prepared.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
              >
                Start practicing free
              </Link>
              <Link
                href="/lessons"
                className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold transition hover:bg-surface-muted"
              >
                Browse lessons
              </Link>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-foreground/60">
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-success" /> 15 practical lessons</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-success" /> 90+ quiz questions</span>
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
