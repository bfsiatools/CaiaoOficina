export const SITE = {
  name: 'Caion da Oficina',
  title: 'Caion da Oficina — ferramentas e achados para o seu dia',
  description: 'Encontre ferramentas, acessórios para o carro e utilidades para casa. Confira os achados selecionados e compre no Mercado Livre.',
  handle: '@caiondaoficina',
  /** Redes derivadas do handle informado por Bernardo. TikTok e YouTube ficam null até ele informar (não inventar). */
  socials: { instagram: 'https://www.instagram.com/caiondaoficina/', tiktok: null as string | null, youtube: null as string | null },
  /** Quem responde pelo site. null bloqueia o lançamento (docs/launch-checklist.md), não o desenvolvimento. */
  responsible: null as { name: string; document?: string; email: string } | null,
  /** Mesma aba por padrão (NÃO VALIDADO no navegador interno do Instagram). */
  openInNewTab: false,
} as const;
