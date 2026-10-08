import Link from 'next/link';

export function Wordmark() {
  return (
    <Link href="/" aria-label="Caião da Oficina, início" className="flex min-h-11 shrink-0 items-center rounded-card">
      <span className="flex flex-col leading-none">
        <span className="label-face text-[28px] font-extrabold tracking-[-0.06em]">Caião<span aria-hidden="true" className="text-accent-ink">.</span></span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.19em]">da Oficina</span>
      </span>
    </Link>
  );
}
