import Link from 'next/link';
import { Monogram } from '@/components/ui/icons';

export function Wordmark() {
  return (
    <Link href="/" aria-label="Caio da Oficina, início" className="flex min-h-11 shrink-0 items-center gap-2 rounded-card">
      <Monogram className="size-8" />
      <span className="flex flex-col leading-none">
        <span className="label-face text-md font-extrabold tracking-tight">Caio</span>
        <span className="text-caption font-semibold text-ink-2">da Oficina</span>
      </span>
    </Link>
  );
}
