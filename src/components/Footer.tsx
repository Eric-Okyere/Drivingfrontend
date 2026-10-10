import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border py-8 text-center text-sm text-foreground/60">
      <div className="mx-auto mb-2 flex h-16 w-44 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
        <div className="relative h-full w-full">
          <Image src="/logo-full.png" alt="Rhema Driving School" fill sizes="176px" className="object-contain" />
        </div>
      </div>
      <p className="mt-1">
        The official online practice portal for Rhema&apos;s own students &mdash; built for real
        road readiness, not just memorization.
      </p>
      <p className="mt-3 text-xs text-foreground/40">
        &copy; {new Date().getFullYear()} Rhema Driving School. Not an official DVLA product.
      </p>
    </footer>
  );
}
