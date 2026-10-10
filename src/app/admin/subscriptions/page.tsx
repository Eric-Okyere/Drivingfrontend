'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

interface StudentRow {
  _id: string;
  name: string;
  email: string;
  totalPoints: number;
  createdAt: string;
  subscription: { active: boolean; expiresAt: string | null; daysRemaining: number };
}

interface PaymentRow {
  _id: string;
  amountGHS: number;
  method: 'paystack' | 'manual';
  status: 'pending' | 'success' | 'failed';
  note?: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
  activatedBy?: { name: string } | null;
}

function AdminSubscriptionsContent() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get<{ students: StudentRow[] }>('/admin/students'),
      api.get<{ payments: PaymentRow[] }>('/admin/payments'),
    ])
      .then(([s, p]) => {
        setStudents(s.students);
        setPayments(p.payments);
      })
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // One-time data load on mount; `load` is stable (useCallback with no deps) so this never
    // re-fires beyond the initial mount or an explicit manual `load()` call elsewhere.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const activate = async (id: string) => {
    setBusyId(id);
    setErrorMsg(null);
    try {
      await api.post(`/admin/students/${id}/activate-subscription`, {
        months: 1,
        note: 'Paid at school office',
      });
      load();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Could not activate subscription');
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (id: string) => {
    setBusyId(id);
    setErrorMsg(null);
    try {
      await api.post(`/admin/students/${id}/revoke-subscription`, {});
      load();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Could not revoke subscription');
    } finally {
      setBusyId(null);
    }
  };

  const activeCount = students.filter((s) => s.subscription?.active).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="mb-6 flex items-center gap-1 text-sm text-foreground/60 hover:text-brand">
        <ArrowLeft size={15} /> Back to admin dashboard
      </Link>

      <h1 className="text-3xl font-bold">Subscriptions</h1>
      <p className="mt-1 text-foreground/60">
        Activate a student&apos;s month manually for cash / Mobile Money paid directly at the
        school, or review automatic Paystack payments below.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Crown size={18} />
          </div>
          <p className="text-2xl font-bold">{activeCount}</p>
          <p className="text-sm text-foreground/60">Active subscriptions</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-2xl font-bold">{students.length - activeCount}</p>
          <p className="text-sm text-foreground/60">Students without an active subscription</p>
        </div>
      </div>

      {errorMsg && <p className="mt-4 text-sm text-danger">{errorMsg}</p>}

      <h2 className="mb-4 mt-10 text-lg font-bold">Students</h2>
      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-foreground/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {students.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-foreground/60">{s.email}</td>
                  <td className="px-4 py-3">
                    {s.subscription?.active ? (
                      <span className="flex items-center gap-1 font-semibold text-success">
                        <CheckCircle2 size={14} /> Active ({s.subscription.daysRemaining}d left)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-foreground/50">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/60">
                    {s.subscription?.expiresAt ? new Date(s.subscription.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => activate(s._id)}
                        disabled={busyId === s._id}
                        className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                      >
                        Mark paid (+1mo)
                      </button>
                      {s.subscription?.active && (
                        <button
                          onClick={() => revoke(s._id)}
                          disabled={busyId === s._id}
                          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-surface-muted disabled:opacity-60"
                        >
                          <RotateCcw size={12} /> Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-4 mt-10 text-lg font-bold">Payment history</h2>
      {loading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-surface-muted" />
      ) : payments.length === 0 ? (
        <p className="text-sm text-foreground/60">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-foreground/60">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 font-medium">{p.user?.name || '—'}</td>
                  <td className="px-4 py-3">GHS {p.amountGHS}</td>
                  <td className="px-4 py-3 text-foreground/60">
                    {p.method === 'manual' ? `Manual${p.activatedBy ? ` (${p.activatedBy.name})` : ''}` : 'Paystack'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.status === 'success'
                          ? 'font-semibold text-success'
                          : p.status === 'failed'
                            ? 'font-semibold text-danger'
                            : 'text-foreground/50'
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  return (
    <RequireAuth adminOnly>
      <AdminSubscriptionsContent />
    </RequireAuth>
  );
}
