import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { ImportManifest } from '../../../scripts/lib/import-plan';

const campaign = 'integration-main-20261007';
async function realManifest() {
  return JSON.parse(await readFile('private/imports/v1/manifest.json', 'utf8')) as ImportManifest;
}

test('Claude Home uses the real DAL, loads images and keeps search/category filters working', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Seu próximo achado começa aqui.');
  await expect(page.getByRole('link', { name: 'Explorar os achados', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Personagem criado com IA', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Instagram @caiondaoficina', exact: true })).toHaveAttribute('href', 'https://www.instagram.com/caiondaoficina/');
  await expect(page.locator('#todos-lista > li')).toHaveCount(47);
  const image = page.locator('#todos-lista img[data-product-img]').first();
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  expect(await image.getAttribute('src')).not.toContain('product-placeholder');
  await page.getByRole('searchbox').fill('compressor');
  await expect.poll(() => page.locator('#todos-lista > li:visible').count()).toBeGreaterThan(0);
  expect(await page.locator('#todos-lista > li:visible').count()).toBeLessThan(47);
  await page.getByRole('searchbox').fill('produto-inexistente-integration');
  await expect(page.locator('#todos-lista > li:visible')).toHaveCount(0);
  await page.getByRole('searchbox').fill('');
  await expect(page.locator('#todos-lista > li:visible')).toHaveCount(47);
  const filter = page.getByRole('group', { name: 'Filtrar por categoria' });
  await filter.getByRole('button', { name: /^Carro/ }).click();
  const manifest = await realManifest();
  const automotiveCount = manifest.rows.filter(row => row.category_slugs?.includes('automotivo')).length;
  await expect(page.locator('#todos-lista > li:visible')).toHaveCount(automotiveCount);
  await filter.getByRole('button', { name: 'Todos', exact: true }).click();
  await expect(page.locator('#todos-lista > li:visible')).toHaveCount(47);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'private/integration-20261007/main-mobile.png' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'private/integration-20261007/main-desktop.png' });
  expect(errors).toEqual([]);
});

test('product/category routes reuse the frontend components and preserve missing-product 404', async ({ page, request }) => {
  const manifest = await realManifest();
  const compressor = manifest.rows[0];
  await page.goto(`/produto/${compressor.product.slug}`);
  await expect(page.locator('a[data-placement="product_detail"]')).toHaveAttribute('data-product-id', String(compressor.product.id));
  await expect(page.locator('a[data-placement="product_detail"]')).toHaveAttribute('href', `/go/${compressor.product.slug}`);
  await page.goto('/categoria/automotivo');
  await expect(page.locator('#todos-lista > li')).toHaveCount(manifest.rows.filter(row => row.category_slugs?.includes('automotivo')).length);
  expect((await request.get('/produto/integration-missing-product')).status()).toBe(404);
  expect((await request.get('/categoria/integration-missing-category')).status()).toBe(404);
});

test('delegated frontend direct click uses the backend collector once with the approved campaign fields', async ({ page }) => {
  // Chromium can omit a Blob beacon body from protocol request.postData.
  // Observe the browser payload while preserving the real beacon and endpoint.
  await page.addInitScript(() => {
    const captured = window as unknown as Window & { __integrationBeacons: string[] };
    captured.__integrationBeacons = [];
    const original = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, body) => {
      if (String(url) === '/api/events' && body instanceof Blob) {
        void body.text().then(text => captured.__integrationBeacons.push(text));
      }
      return original(url, body);
    };
  });
  await page.goto(`/?utm_source=integration&utm_medium=qa&utm_campaign=${campaign}&utm_content=direct&video_id=video-main`);
  const anchor = page.locator('#todos-lista a[data-cta-id]').first();
  const productId = await anchor.getAttribute('data-product-id');
  const linkId = await anchor.getAttribute('data-link-id');
  let posts = 0;
  page.on('request', request => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/events') posts++; });
  // Exercise direct mode without changing server flags or leaving the test page.
  await anchor.evaluate(element => {
    element.dataset.ctaMode = 'direct';
    element.addEventListener('click', event => event.preventDefault());
  });
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/events') && response.request().method() === 'POST');
  await anchor.click();
  const response = await responsePromise;
  expect(response.status()).toBe(202);
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __integrationBeacons: string[] }).__integrationBeacons.length)).toBe(1);
  const payload = JSON.parse(await page.evaluate(() => (window as unknown as Window & { __integrationBeacons: string[] }).__integrationBeacons[0]));
  expect(payload).toMatchObject({ productId, affiliateLinkId: linkId, placement: 'catalog_card', utmSource: 'integration', utmMedium: 'qa', utmCampaign: campaign, utmContent: 'direct', contentId: 'video-main' });
  expect(posts).toBe(1);
});

test('redirect CTA records on the server, preserves content_id and sends no client event', async ({ page }) => {
  await page.goto(`/?utm_source=integration&utm_medium=qa&utm_campaign=${campaign}&utm_content=redirect&content_id=content-main&video_id=video-alias`);
  const anchor = page.locator('#todos-lista a[data-cta-mode="redirect"]').first();
  const href = await anchor.getAttribute('href');
  expect(href).toContain('content_id=content-main');
  let posts = 0;
  let destination = '';
  page.on('request', request => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/events') posts++; });
  await page.route('**/go/**', async route => {
    const response = await route.fetch({ maxRedirects: 0 });
    expect(response.status()).toBe(302);
    destination = response.headers()['location'];
    await route.fulfill({ status: 200, contentType: 'text/html', body: 'Destino verificado, navegação externa interrompida.' });
  });
  const slug = new URL(href!, 'http://localhost').pathname.slice('/go/'.length);
  const manifest = await realManifest();
  await anchor.click();
  await expect.poll(() => destination).toBe(manifest.rows.find(row => row.product.slug === slug)?.link?.affiliate_url);
  expect(posts).toBe(0);
});
