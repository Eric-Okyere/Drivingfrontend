'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Award, Printer } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import RequireAuth from '@/components/RequireAuth';
import { Certificate } from '@/lib/types';

function CertificatesContent() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ certificates: Certificate[] }>('/certificates')
      .then((data) => setCertificates(data.certificates))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Award size={26} />
        </div>
        <h1 className="text-3xl font-bold">Your certificates</h1>
        <p className="mt-1 text-foreground/60">
          Earned by scoring at least 75% on the mock DVLA test. Pass the mock test to unlock one.
        </p>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
      ) : certificates.length === 0 ? (
        <p className="text-center text-foreground/60">No certificates yet — take and pass the mock test first.</p>
      ) : (
        <div className="space-y-6 print:space-y-10">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="relative overflow-hidden rounded-2xl border-4 border-double border-brand bg-surface p-8 text-center shadow-sm print:break-after-page"
            >
              <div className="mx-auto h-14 w-36 relative">
                <Image src="/logo-full.png" alt="Rhema Driving School" fill sizes="144px" className="object-contain" />
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand">Rhema Driving School</p>
              <h2 className="mt-4 text-2xl font-bold">Certificate of Mock Test Achievement</h2>
              <p className="mt-4 text-foreground/70">This certifies that</p>
              <p className="mt-1 text-xl font-bold text-brand">{user?.name}</p>
              <p className="mt-3 text-foreground/70">
                scored <span className="font-bold text-success">{cert.scorePercent}%</span> on Rhema Driving
                School&apos;s mock DVLA computer-based test for a Class {cert.licenseClassGoal} license goal.
              </p>
              <p className="mt-6 text-xs text-foreground/50">
                Serial: {cert.serialNumber} &middot; Issued {new Date(cert.issuedAt).toLocaleDateString()}
              </p>
              <p className="mx-auto mt-6 max-w-md text-xs text-foreground/40">
                This certificate reflects readiness demonstrated in Rhema Driving School practice tests. It is
                not an official DVLA document and does not replace the official Ghana driver&apos;s license
                examination.
              </p>
              <button
                onClick={() => window.print()}
                className="mx-auto mt-6 flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-surface-muted print:hidden"
              >
                <Printer size={15} /> Print / save as PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <RequireAuth>
      <CertificatesContent />
    </RequireAuth>
  );
}
