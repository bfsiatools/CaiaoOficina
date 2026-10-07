import type { SVGProps } from 'react';

const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false } as const;

export const ArrowUpRightIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>;
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const XIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
export const InfoIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>;
export const ChatIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>;

/** Monograma da marca: o mesmo desenho do favicon. */
export function Monogram(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" {...p}>
      <rect width="64" height="64" rx="14" fill="var(--color-plate)" />
      <path d="M45 21.5A16.5 16.5 0 1 0 45 42.5" fill="none" stroke="var(--color-readout)" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}
