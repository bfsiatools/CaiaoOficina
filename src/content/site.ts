export const SITE = {
  name: 'Caio da Oficina',
  title: 'Caio da Oficina — achados em ferramentas, carro e casa',
  description: 'Os achados que o Caio mostra nos vídeos, num lugar só. Ferramentas, carro e casa, com link direto para o Mercado Livre.',
  handle: '@caiodaoficina',
  /** Redes derivadas do handle informado por Bernardo. TikTok e YouTube ficam null até ele informar (não inventar). */
  socials: { instagram: 'https://www.instagram.com/caiodaoficina/', tiktok: null as string | null, youtube: null as string | null },
  /** Quem responde pelo site. null bloqueia o lançamento (docs/launch-checklist.md), não o desenvolvimento. */
  responsible: null as { name: string; document?: string; email: string } | null,
  /** Mesma aba por padrão (NÃO VALIDADO no navegador interno do Instagram). */
  openInNewTab: false,
} as const;
