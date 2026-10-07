import { test,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { ImportManifest } from '../../scripts/lib/import-plan';
test('47 real products and three redirects preserve exact destinations',async({page,request})=>{
 await page.goto('/');await expect(page.locator('[data-product-slug]')).toHaveCount(47);
 const slugs=await page.locator('[data-product-slug]').evaluateAll(nodes=>nodes.slice(0,3).map(n=>n.getAttribute('data-product-slug')!));
 const manifest=JSON.parse(await readFile('private/imports/v1/manifest.json','utf8')) as ImportManifest;
 for(const slug of slugs){const result=await request.get(`/go/${slug}?utm_source=e2e&content_id=preview-test`,{maxRedirects:0});expect(result.status()).toBe(302);expect(result.headers()['cache-control']).toContain('no-store');expect(result.headers()['location']).toBe(manifest.rows.find(r=>r.product.slug===slug)?.link?.affiliate_url);}
 const missing=await request.get('/go/not-a-real-product',{maxRedirects:0});expect(missing.status()).toBe(404);
});
test('normal product anchor works without JavaScript and external requests are intercepted',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();let destination='';
 // Playwright routing intercepts the initial request, not subsequent redirects.
 await page.route('**/go/**',async route=>{const response=await route.fetch({maxRedirects:0});expect(response.status()).toBe(302);destination=response.headers()['location'];await route.fulfill({status:200,contentType:'text/html',body:'Destino de afiliado interceptado no teste'});});
 await page.goto('/');await page.locator('[data-product-slug] a[rel="nofollow sponsored"]').first().click();await expect.poll(()=>destination).not.toBe('');await context.close();
});
