'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';

const licenseClasses = [
  { value: 'B', label: 'Class B — Private car' },
  { value: 'A', label: 'Class A — Motorcycle' },
  { value: 'C', label: 'Class C — Commercial / taxi' },
  { value: 'D', label: 'Class D — Heavy / articulated' },
];

export default function RegisterPage() {
  const { register, loginWithGoogle, error, setError } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseClassGoal, setLicenseClassGoal] = useState('B');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password, licenseClassGoal);
      router.push('/dashboard');
    } catch {
      // error already set in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle(credential);
      router.push('/dashboard');
    } catch {
      // error already set in context
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <UserPlus size={18} />
          </span>
          <h1 className="text-xl font-bold">Create your account</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
        )}

        <div className={googleSubmitting ? 'pointer-events-none opacity-60' : ''}>
          <GoogleSignInButton onCredential={handleGoogleCredential} text="signup_with" />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-foreground/40">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="Ama Mensah"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">License goal</label>
            <select
              value={licenseClassGoal}
              onChange={(e) => setLicenseClassGoal(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            >
              {licenseClasses.map((lc) => (
                <option key={lc.value} value={lc.value}>
                  {lc.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
