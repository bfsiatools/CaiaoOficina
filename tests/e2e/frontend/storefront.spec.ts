import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('light storefront fits mobile, tablet and desktop and meets accessible contrast', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Caion da Oficina, início' })).toBeVisible();
  await expect(page.locator('main img[src*="caio-avatar"]')).toHaveCount(0);
  for (const width of [320, 360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('light');
  }
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(audit.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.target) }))).toEqual([]);
  await page.screenshot({ path: 'private/integration-20261007/storefront-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'private/integration-20261007/storefront-mobile.png' });
  await page.evaluate(() => document.getElementById('todos')?.scrollIntoView({ block: 'start' }));
  const firstImage = page.locator('#todos-lista img[data-product-img]').first();
  await expect.poll(() => firstImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#todos-lista a[data-cta-id]').first()).toBeInViewport();
  const priceLabel = page.locator('#todos-lista > li').first().getByText('Conferir preço', { exact: true });
  expect((await priceLabel.boundingBox())!.height).toBeLessThan(21);
  await page.screenshot({ path: 'private/integration-20261007/storefront-catalog-mobile.png' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => document.getElementById('todos')?.scrollIntoView({ block: 'start' }));
  await expect(page.locator('#todos-lista a[data-cta-id]').first()).toBeInViewport();
  await page.screenshot({ path: 'private/integration-20261007/storefront-catalog-desktop.png' });
});

test('carousel uses real product links and remains manually navigable with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const rail = page.getByRole('region', { name: 'Produtos em destaque' });
  await expect(rail.locator('article')).toHaveCount(8);
  await expect(page.getByRole('button', { name: 'Rotação desativada: movimento reduzido' })).toBeDisabled();
  const catalogIds = await page.locator('#todos-lista a[data-product-id]').evaluateAll(links => links.map(link => link.getAttribute('data-product-id')));
  const featuredIds = await rail.locator('a[data-product-id]').evaluateAll(links => links.map(link => link.getAttribute('data-product-id')));
  expect(new Set(featuredIds).size).toBe(8);
  expect(featuredIds.every(id => catalogIds.includes(id))).toBe(true);
  await page.getByRole('button', { name: 'Próximos destaques' }).click();
  await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Destaques anteriores' }).click();
  await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBe(0);
  await page.getByRole('link', { name: 'Explorar os achados', exact: true }).click();
  await expect(page).toHaveURL(/#todos$/);
  await expect(page.getByRole('heading', { name: 'Encontre o seu próximo achado' })).toBeInViewport();
});

test('carousel rotates and the pause control stops it after focus leaves', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const rail = page.getByRole('region', { name: 'Produtos em destaque' });
  await expect(page.getByRole('button', { name: 'Pausar rotação dos destaques' })).toBeVisible();
  await page.mouse.move(0, 0);
  await page.clock.runFor(7000);
  const nextPosition = await rail.evaluate(element => {
    const cards = element.children;
    return (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft;
  });
  // Native compositor scrolling is independent of the JS clock; wait until settled.
  await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBe(nextPosition);
  await page.getByRole('button', { name: 'Pausar rotação dos destaques' }).click();
  await page.getByRole('heading', { level: 1 }).click();
  await page.clock.runFor(1000);
  const stoppedAt = await rail.evaluate(element => element.scrollLeft);
  await page.clock.runFor(7000);
  expect(await rail.evaluate(element => element.scrollLeft)).toBe(stoppedAt);
});
