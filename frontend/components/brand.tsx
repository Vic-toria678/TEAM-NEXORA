import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="SABI home" className="inline-flex items-center gap-2.5">
      <span className="brand-mark" aria-hidden="true">s</span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[17px] font-semibold tracking-[0.12em]">SABI</span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-muted">by TEAM-NEXORA</span>
        </span>
      )}
    </Link>
  );
}
