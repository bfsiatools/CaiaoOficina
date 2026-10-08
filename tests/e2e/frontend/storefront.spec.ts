import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('light storefront fits mobile, tablet and desktop and meets accessible contrast', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Caião da Oficina, início' })).toBeVisible();
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
  await page.getByRole('region', { name: 'Produtos em destaque' }).scrollIntoViewIfNeeded();
  const fanImage = page.getByRole('region', { name: 'Produtos em destaque' }).locator('[data-fan-index="0"] img');
  await expect.poll(() => fanImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: 'private/integration-20261007/fan-mobile.png' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('region', { name: 'Produtos em destaque' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'private/integration-20261007/fan-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.getElementById('todos')?.scrollIntoView({ block: 'start' }));
  const firstImage = page.locator('#todos-lista img[data-product-img]').first();
  await expect.poll(() => firstImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#todos-lista a[data-cta-id]').first()).toBeInViewport();
  const priceLabel = page.locator('#todos-lista > li').first().getByText('Conferir preço', { exact: true });
  expect((await priceLabel.boundingBox())!.height).toBeLessThan(21);
  await page.screenshot({ path: 'private/integration-20261007/storefront-catalog-mobile.png' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => document.getElementById('todos')?.scrollIntoView({ block: 'start' }));
  await page.locator('#todos-lista a[data-cta-id]').first().scrollIntoViewIfNeeded();
  await expect(page.locator('#todos-lista a[data-cta-id]').first()).toBeInViewport();
  await page.screenshot({ path: 'private/integration-20261007/storefront-catalog-desktop.png' });
});

test('carousel uses real product links and remains manually navigable with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const rail = page.getByRole('region', { name: 'Produtos em destaque' });
  await expect(rail.locator('article')).toHaveCount(8);
  await expect(page.locator('.fan-rotation-control')).toHaveCount(0);
  await expect(page.getByText('Pausar destaques', { exact: true })).toHaveCount(0);
  const catalogIds = await page.locator('#todos-lista a[data-product-id]').evaluateAll(links => links.map(link => link.getAttribute('data-product-id')));
  const featuredIds = await rail.locator('a[data-product-id]').evaluateAll(links => links.map(link => link.getAttribute('data-product-id')));
  expect(new Set(featuredIds).size).toBe(8);
  expect(featuredIds.every(id => catalogIds.includes(id))).toBe(true);
  const firstId = await rail.getAttribute('data-center-id');
  await page.getByRole('button', { name: 'Próximos destaques' }).click();
  await expect(rail).not.toHaveAttribute('data-center-id', firstId!);
  const selectedId = await rail.getAttribute('data-center-id');
  const selectedCard = rail.locator(`[data-fan-index]:has(a[data-product-id="${selectedId}"])`);
  await expect(selectedCard).not.toHaveAttribute('aria-hidden', 'true');
  await expect(selectedCard.locator('a')).toBeInViewport();
  await page.getByRole('button', { name: 'Destaques anteriores' }).click();
  await expect(rail).toHaveAttribute('data-center-id', firstId!);
  await rail.locator('[data-fan-index="2"] a').focus();
  await expect(rail).toHaveAttribute('data-center-id', featuredIds[2]!);
  await page.getByRole('link', { name: 'Explorar os achados', exact: true }).click();
  await expect(page).toHaveURL(/#todos$/);
  await expect(page.getByRole('heading', { name: 'Encontre o seu próximo achado' })).toBeInViewport();
});

test('carousel loops every 3000ms, pauses temporarily, and manual arrows restart the timer', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto('/');
  const rail = page.getByRole('region', { name: 'Produtos em destaque' });
  await rail.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  // Let IntersectionObserver enter, then reset the rotation timer with a manual step.
  await page.getByRole('button', { name: 'Destaques anteriores' }).click();
  await page.mouse.move(0, 0);
  const ids = await rail.locator('a[data-product-id]').evaluateAll(links => links.map(link => link.getAttribute('data-product-id')));
  const firstId = await rail.getAttribute('data-center-id');
  for (let step = 1; step <= 16; step++) {
    const before = await rail.getAttribute('data-center-id');
    await page.clock.runFor(2999);
    await expect(rail).toHaveAttribute('data-center-id', before!);
    await page.clock.runFor(1);
    await expect(rail).toHaveAttribute('data-center-id', ids[(ids.indexOf(firstId) + step) % ids.length]!);
  }
  await page.clock.runFor(700);
  const box = await rail.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + 120);
  const hoveredId = await rail.getAttribute('data-center-id');
  await page.clock.runFor(7000);
  await expect(rail).toHaveAttribute('data-center-id', hoveredId!);
  await page.mouse.move(0, 0);
  await page.clock.runFor(3000);
  await expect(rail).not.toHaveAttribute('data-center-id', hoveredId!);
  await page.getByRole('button', { name: 'Próximos destaques' }).click();
  await page.mouse.move(0, 0);
  const manualId = await rail.getAttribute('data-center-id');
  await page.clock.runFor(2999);
  await expect(rail).toHaveAttribute('data-center-id', manualId!);
  await page.clock.runFor(1);
  await expect(rail).not.toHaveAttribute('data-center-id', manualId!);
  // Keyboard focus pauses; it is never a permanent pause after blur.
  await page.getByRole('button', { name: 'Próximos destaques' }).press('Tab');
  await page.getByRole('button', { name: 'Destaques anteriores' }).focus();
  const focusedId = await rail.getAttribute('data-center-id');
  await page.clock.runFor(6000);
  await expect(rail).toHaveAttribute('data-center-id', focusedId!);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.clock.runFor(3000);
  await expect(rail).not.toHaveAttribute('data-center-id', focusedId!);
  // An optional keyboard-only rotation control can stop autoplay without a bottom toolbar.
  await page.getByRole('button', { name: 'Parar rotação automática' }).focus();
  await page.getByRole('button', { name: 'Parar rotação automática' }).press('Enter');
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  const stoppedId = await rail.getAttribute('data-center-id');
  await page.clock.runFor(6000);
  await expect(rail).toHaveAttribute('data-center-id', stoppedId!);
});
