import { test, expect } from '@playwright/test';

const widths = [320, 360, 375, 390, 430, 768, 1024, 1440];

async function scrollToProgress(page: import('@playwright/test').Page, progress: number) {
  await page.evaluate(value => {
    const root = document.querySelector<HTMLElement>('.scroll-experience')!;
    const viewport = root.querySelector<HTMLElement>('.scroll-backdrop')!.offsetHeight;
    window.scrollTo(0, root.getBoundingClientRect().top + scrollY + value * (root.offsetHeight - viewport));
  }, progress);
  await expect.poll(() => page.locator('.scroll-experience').getAttribute('data-progress')).toBe(progress.toFixed(3));
  await expect.poll(() => page.locator('video').evaluate((video: HTMLVideoElement, value) => Math.abs(video.currentTime - value * (video.duration - 1 / 24)), progress)).toBeLessThan(0.08);
  await expect.poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.seeking)).toBe(false);
}

test('scroll video seeks in both directions at five positions and fits all requested widths', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.scroll-experience')).toHaveAttribute('data-video-ready', 'true');
  const media = page.locator('video');
  expect(await media.evaluate((video: HTMLVideoElement) => ({ paused: video.paused, loop: video.loop, autoplay: video.autoplay, muted: video.muted }))).toEqual({ paused: true, loop: false, autoplay: false, muted: true });
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    for (const progress of [0, .25, .5, .75, 1, .75, .5, .25, 0]) {
      await scrollToProgress(page, progress);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if ([0, .5, 1].includes(progress)) await page.screenshot({ path: `private/scroll-tools/qa-${width}-${progress}.png` });
    }
    const time = await media.evaluate((video: HTMLVideoElement) => video.currentTime);
    await page.waitForTimeout(160);
    expect(await media.evaluate((video: HTMLVideoElement) => video.currentTime)).toBe(time);
  }
  await scrollToProgress(page, 1);
  await expect(page.locator('.scroll-experience')).toHaveAttribute('data-finished', 'true');
  await expect.poll(() => page.locator('.scroll-poster-open').evaluate(image => getComputedStyle(image).opacity)).toBe('1');
  await page.getByRole('link', { name: 'Explorar os achados', exact: true }).click();
  await expect(page.locator('#todos')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('wheel input remains reversible with mobile viewport and fourfold CPU throttling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.scroll-experience')).toHaveAttribute('data-video-ready', 'true');
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => {
    const video = document.querySelector('video')!;
    const samples: number[] = [];
    let started = 0;
    video.addEventListener('seeking', () => { started = performance.now(); });
    video.addEventListener('seeked', () => samples.push(performance.now() - started));
    Object.assign(window, { scrollSeekSamples: samples });
  });
  await page.mouse.move(380, 830);
  await page.mouse.wheel(0, 900);
  await expect.poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(2);
  await page.mouse.wheel(0, -900);
  await expect.poll(() => page.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeLessThan(.08);
  const samples = await page.evaluate(() => (window as unknown as { scrollSeekSamples: number[] }).scrollSeekSamples);
  expect(samples.length).toBeGreaterThan(0);
  const { writeFile } = await import('node:fs/promises');
  await writeFile('private/scroll-tools/seek-cpu4.json', JSON.stringify({ viewport: '390x844', cpuThrottle: 4, samplesMs: samples }, null, 2));
  await session.send('Emulation.setCPUThrottlingRate', { rate: 1 });
});

test('reduced motion uses the open image without downloading the video and responds to preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const videoRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('ABRINDOACAIXA')) videoRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('.scroll-experience')).toHaveAttribute('data-finished', 'true');
  await expect(page.locator('video')).not.toHaveAttribute('src');
  expect(videoRequests).toHaveLength(0);
  await expect.poll(() => page.locator('.scroll-poster-open').evaluate(image => getComputedStyle(image).opacity)).toBe('1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.scroll-experience')).toHaveAttribute('data-video-ready', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('video')).not.toHaveAttribute('src');
  await expect(page.locator('#todos-lista > li')).toHaveCount(47);
});

test('video failure keeps real closed/open posters and the catalog usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/background/ABRINDOACAIXA.mp4', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.card-fan')).toHaveAttribute('data-enhanced', 'true');
  await expect(page.locator('.scroll-experience')).not.toHaveAttribute('data-video-ready');
  expect(await page.locator('.scroll-poster-closed').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('.scroll-experience')!;
    const viewport = root.querySelector<HTMLElement>('.scroll-backdrop')!.offsetHeight;
    scrollTo(0, root.getBoundingClientRect().top + scrollY + root.offsetHeight - viewport);
  });
  await expect(page.locator('.scroll-experience')).toHaveAttribute('data-finished', 'true');
  await expect.poll(() => page.locator('.scroll-poster-open').evaluate(image => getComputedStyle(image).opacity)).toBe('1');
  await expect(page.locator('#todos-lista > li')).toHaveCount(47);
});

test('without JavaScript the closed poster, hero and normal catalog links remain usable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('video')).not.toHaveAttribute('src');
  await page.getByRole('link', { name: 'Explorar os achados', exact: true }).click();
  await expect(page.locator('#todos')).toBeInViewport();
  await expect(page.locator('#todos-lista > li')).toHaveCount(47);
  await context.close();
});
