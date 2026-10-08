import { cn } from './cn';

/**
 * Ficha de bancada: os números do anúncio lidos como num display de instrumento
 * Specs reais do anúncio, com contraste e sem alegações promocionais.
 */
export function SpecReadout({ specs, size = 'sm', className }: { specs: readonly string[]; size?: 'sm' | 'md'; className?: string }) {
  if (specs.length === 0) return null;
  return (
    <ul aria-label="Dados do anúncio" className={cn('flex flex-wrap gap-1.5', className)}>
      {specs.map((spec) => (
        <li
          key={spec}
          className={cn(
            'spec-text inline-flex items-center rounded-plate bg-plate text-readout ring-1 ring-inset ring-plate-edge',
            size === 'md' ? 'h-7 px-2.5 text-sm' : 'h-6 px-2 text-caption',
          )}
        >
          {spec}
        </li>
      ))}
    </ul>
  );
}
