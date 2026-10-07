export type ValidatedAffiliateUrl = string & { readonly __affiliateUrl: unique symbol };
export function validateAffiliateUrl(input: string): ValidatedAffiliateUrl {
  if (input.length > 4096 || /[\s\u0000-\u001f\u007f]/.test(input) || /%0[ad]/i.test(input)) throw new Error('URL de afiliado inválida');
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !/^https:\/\/(?:meli\.la|(?:www\.)?mercadolivre\.com\.br)\//.test(input)) throw new Error('Destino de afiliado não permitido');
  if (url.hostname === 'meli.la' && (!/^\/[A-Za-z0-9]+$/.test(url.pathname) || url.search || url.hash)) throw new Error('Link oficial curto inválido');
  if (!['meli.la', 'mercadolivre.com.br', 'www.mercadolivre.com.br'].includes(url.hostname)) throw new Error('Destino de afiliado não permitido');
  return input as ValidatedAffiliateUrl;
}
