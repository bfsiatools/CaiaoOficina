const SLUG = /^[a-z0-9-]{1,100}$/;

/**
 * Produto do link rastreável (`?p=`). Aceita o slug real ou um apelido curto da camada editorial.
 * Qualquer valor inválido ou desconhecido é ignorado em silêncio.
 */
export function resolveContext<T extends { slug: string }>(
  raw: string | string[] | undefined,
  products: readonly T[],
  aliases: Readonly<Record<string, string>> = {},
): T | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !SLUG.test(value)) return null;
  const slug = aliases[value] ?? value;
  return products.find((p) => p.slug === slug) ?? null;
}
