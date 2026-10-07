import { describe, it, expect } from 'vitest';
import { validateAffiliateUrl } from '../src/lib/affiliate/urls';
import { parseClickPayload } from '../src/lib/tracking/schema';
import { readServerEnv } from '../src/lib/env/server';
describe('trusted affiliate destination', () => {
  it('preserves every byte of an official link', () => expect(validateAffiliateUrl('https://meli.la/2URVebD')).toBe('https://meli.la/2URVebD'));
  it.each(['http://meli.la/a', 'https://meli.la.evil.test/a', 'https://meli.la@evil.test/a', 'https://meli.la/a\n', 'https://evil.test/a', 'https://meli.la/a%0d%0aX', ' https://meli.la/a', 'https://meli.la:443/a'])('rejects unsafe URL %s', url => expect(() => validateAffiliateUrl(url)).toThrow());
});
describe('click boundary', () => {
  const valid = { eventId: '12345678-1234-4234-8234-123456789012', eventType: 'product_click', productId: '12345678-1234-4234-8234-123456789013', affiliateLinkId: '12345678-1234-4234-8234-123456789014', pagePath: '/', placement: 'catalog_card', ctaId: 'buy' };
  it('accepts a product/version pair', () => expect(parseClickPayload(valid).productId).toBe(valid.productId));
  it('rejects privileged client fields', () => expect(() => parseClickPayload({ ...valid, quality: 'accepted' })).toThrow());
  it('requires both product references', () => expect(() => parseClickPayload({ ...valid, affiliateLinkId: null })).toThrow());
  it('rejects query or external path', () => { expect(() => parseClickPayload({ ...valid, pagePath: '/?email=x' })).toThrow(); expect(() => parseClickPayload({ ...valid, pagePath: '//evil.test' })).toThrow(); });
  it('limits attribution strings', () => expect(() => parseClickPayload({ ...valid, utmSource: 'x'.repeat(65) })).toThrow());
  it('requires a WhatsApp CTA with no product references', () => expect(() => parseClickPayload({ ...valid, eventType: 'whatsapp_click' })).toThrow());
});
describe('server configuration', () => {
  it('requires the exact project without printing secrets', () => expect(() => readServerEnv({ SUPABASE_URL: 'https://wrong.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'pk' })).toThrow(/configuração/i));
  it('accepts public reads without an admin key', () => expect(readServerEnv({ SUPABASE_URL: 'https://lyhybytsfbdiodtsytqc.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'pk', APP_ENV: 'preview' }).appEnv).toBe('preview'));
});
