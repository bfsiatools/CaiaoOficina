'use client';

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="conteudo" className="mx-auto flex max-w-page flex-col items-start gap-4 px-4 py-14">
      <h1 className="label-face text-xl font-extrabold">Algo deu errado.</h1>
      <p className="text-base text-ink-2">Tente de novo. Se continuar, volte em alguns minutos.</p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-12 items-center rounded-card bg-accent px-5 text-[16px] font-semibold text-plate transition-[background-color,transform] duration-(--duration-press) ease-out hover:bg-accent-press motion-safe:active:scale-[0.97]"
      >
        Tentar de novo
      </button>
    </main>
  );
}
