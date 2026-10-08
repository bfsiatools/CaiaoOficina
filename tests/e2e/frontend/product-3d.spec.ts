import { test, expect } from '@playwright/test';

const widths = [320, 360, 375, 390, 430, 768, 1024, 1440];

test('real 3D product cards fit eight widths and align names, descriptions and CTAs', async ({ page }) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-product-3d]')).toHaveCount(47);
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await page.evaluate(() => document.getElementById('todos')!.scrollIntoView({ block: 'start' }));
    await page.mouse.move(0, 0);
    const firstImage = page.locator('#todos-lista img[data-product-img]').first();
    await expect.poll(() => firstImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const columns = await page.locator('#todos-lista').evaluate(grid => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width < 360 ? 1 : width < 1024 ? 2 : width < 1280 ? 3 : 4);
    const geometry = await page.locator('#todos-lista > li').evaluateAll((items, cols) => items.slice(0, cols).map(item => {
      const card = item.querySelector('[data-product-3d]')!;
      const title = item.querySelector('h3')!;
      const cta = item.querySelector('.product-3d-cta')!;
      const image = item.querySelector('img')!;
      return { height: card.getBoundingClientRect().height, ctaBottom: cta.getBoundingClientRect().bottom, titleHeight: title.getBoundingClientRect().height, imageFit: getComputedStyle(image).objectFit };
    }), columns);
    expect(Math.max(...geometry.map(item => item.height)) - Math.min(...geometry.map(item => item.height))).toBeLessThan(1);
    expect(Math.max(...geometry.map(item => item.ctaBottom)) - Math.min(...geometry.map(item => item.ctaBottom))).toBeLessThan(1);
    expect(geometry.every(item => item.titleHeight <= 41 && item.imageFit === 'contain')).toBe(true);
    await page.screenshot({ path: `private/scroll-tools/cards-${width}.png` });
    await page.getByRole('region', { name: 'Produtos em destaque' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `private/scroll-tools/highlights-${width}.png` });
  }
});

test('one shared spring tilts center and four corners, settles on leave and respects keyboard/reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const card = page.locator('[data-product-3d]').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const shell = page.locator('.product-3d-shell').first();
  const box = (await shell.boundingBox())!;
  for (const [nx, ny] of [[.5, .5], [.1, .1], [.9, .1], [.9, .9], [.1, .9]]) {
    await page.mouse.move(box.x + box.width * nx, box.y + box.height * ny);
    await expect(card).toHaveAttribute('data-tilting', 'true');
    await expect(page.locator('[data-tilting]')).toHaveCount(1);
    await page.waitForTimeout(500);
    const angles = await card.evaluate(element => [...element.style.transform.matchAll(/rotate[XY]\(([-\d.e+]+)deg\)/g)].map(match => Number(match[1])));
    expect(angles).toHaveLength(2);
    expect(angles.every(angle => Math.abs(angle) <= 8)).toBe(true);
    if (nx !== .5) expect(Math.abs(angles[1])).toBeGreaterThan(3);
    if (ny !== .5) expect(Math.abs(angles[0])).toBeGreaterThan(3);
    expect(await card.locator('h3').evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
  }
  await page.mouse.move(0, 0);
  await expect(page.locator('[data-tilting]')).toHaveCount(0);
  expect(await card.evaluate(element => element.style.transform)).toBe('');
  await card.locator('a').focus();
  await expect(page.locator('[data-tilting]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(box.x + box.width * .9, box.y + box.height * .1);
  await expect(page.locator('[data-tilting]')).toHaveCount(0);
  expect(await card.evaluate(element => element.style.transform)).toBe('');
});

test('touch swipe advances/reverses the fan without following a link, and vertical scroll stays native', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  const rail = page.getByRole('region', { name: 'Produtos em destaque' });
  await rail.scrollIntoViewIfNeeded();
  await expect(page.locator('.card-fan')).toHaveAttribute('data-enhanced', 'true');
  const first = await rail.getAttribute('data-center-id');
  const session = await context.newCDPSession(page);
  const box = (await rail.boundingBox())!;
  const swipe = async (fromX: number, toX: number, fromY: number, toY: number) => {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: fromX, y: fromY }] });
    for (let step = 1; step <= 5; step++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: fromX + (toX - fromX) * step / 5, y: fromY + (toY - fromY) * step / 5 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await swipe(box.x + box.width * .7, box.x + box.width * .3, box.y + 160, box.y + 165);
  await expect(rail).not.toHaveAttribute('data-center-id', first!);
  await page.waitForTimeout(700);
  await swipe(box.x + box.width * .3, box.x + box.width * .7, box.y + 160, box.y + 165);
  await expect(rail).toHaveAttribute('data-center-id', first!);
  await expect(page).toHaveURL('http://localhost:3000/');
  const scrollBefore = await page.evaluate(() => scrollY);
  await swipe(box.x + box.width * .5, box.x + box.width * .51, box.y + 260, box.y + 80);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 50);
  await page.locator('[data-product-3d]').first().scrollIntoViewIfNeeded();
  const cardBox = (await page.locator('[data-product-3d]').first().boundingBox())!;
  await page.mouse.move(cardBox.x + 20, cardBox.y + 20);
  await expect(page.locator('[data-tilting]')).toHaveCount(0);
  await context.close();
});

test('long names, absent image/description, one and zero products keep the card contract', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?__state=long');
  const products = page.locator('[data-product-3d]');
  await expect(products).toHaveCount(47);
  await expect(products.nth(3).locator('img')).toHaveAttribute('data-broken', 'true');
  const missingDescription = page.locator('[data-product-3d] p[aria-hidden="true"]').first();
  await expect(missingDescription).toBeAttached();
  expect((await missingDescription.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  const longName = page.locator('#todos-lista li[data-product-slug$="-sem-editorial"] h3');
  expect((await longName.textContent())!.length).toBeGreaterThan(35);
  // Stress the line clamp with a full, real catalog name, without changing source data.
  const { readFile } = await import('node:fs/promises');
  const manifest = JSON.parse(await readFile('private/imports/v1/manifest.json', 'utf8')) as { rows: { product: { name: string } }[] };
  const fullName = manifest.rows.map(row => row.product.name).sort((a, b) => b.length - a.length)[0];
  await longName.evaluate((element, name) => { element.textContent = name; }, fullName);
  await longName.scrollIntoViewIfNeeded();
  expect((await longName.textContent())!.length).toBeGreaterThan(60);
  expect((await longName.boundingBox())!.height).toBeLessThanOrEqual(40);
  await page.goto('/?__state=one');
  await expect(page.locator('[data-product-3d]')).toHaveCount(1);
  await expect(page.locator('.fan-arrow')).toHaveCount(0);
  await page.goto('/?__state=empty');
  await expect(page.locator('[data-product-3d]')).toHaveCount(0);
  await expect(page.locator('.fan-arrow')).toHaveCount(0);
  await page.goto('/');
  const image = page.locator('#todos-lista img[data-product-img]').first();
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(element => element.dispatchEvent(new Event('error')));
  await expect(image).toHaveAttribute('data-broken', 'true');
  await expect(image).toHaveAttribute('src', '/images/product-placeholder.svg');
  await expect(page.locator('#todos-lista a[data-cta-mode="redirect"]').first()).toHaveAttribute('href', /^\/go\//);
});
