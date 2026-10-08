import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const files = (dir: string): string[] => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? files(p) : /\.(tsx?|css)$/.test(p) ? [p] : []; });
const sources = files('src').map((p) => [p, readFileSync(p, 'utf8')] as const);

describe('banned patterns in the frontend source', () => {
  it.each([
    ['transition-all / transition: all', /transition-all|transition:\s*all/],
    ['zoom disabled', /user-scalable|maximum-scale|maximumScale/],
    ['unapproved animation libraries', /framer-motion|motion\/react|lottie/],
    ['scale(0) entrance', /scale\(0\)|scale-0\b/],
    ['gradient text', /bg-clip-text/],
    ['raw hex colors in components', /(?:text|bg|border)-\[#[0-9a-fA-F]{3,6}\]/],
    ['prices in the UI', /R\$\s?\d/],
  ])('has no %s', (_label, re) => { for (const [path, text] of sources) expect(text, path).not.toMatch(re); });
});

describe('motion', () => {
  const css = readFileSync('src/app/globals.css', 'utf8');
  it('keeps the requested glass effects in the scroll experience stylesheet', () => {
    for (const [path, text] of sources) {
      if (/backdrop-blur|backdrop-filter/.test(text)) expect(path.replaceAll('\\', '/')).toBe('src/app/globals.css');
    }
    expect(css).toContain('.glass-panel');
  });
  it('scopes the requested GSAP dependency to the fan component', () => {
    for (const [path, text] of sources) {
      if (/from ['"]gsap['"]/.test(text)) expect(path.replaceAll('\\', '/')).toBe('src/components/ui/card-fan-carousel.tsx');
    }
  });
  it('has the global reduced-motion block and one easing token', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('--ease-out: cubic-bezier(0.23, 1, 0.32, 1)');
  });
  it('gates every transform-on-press behind motion-safe', () => {
    for (const [path, text] of sources) {
      for (const m of text.matchAll(/(\S*)active:scale-\[/g)) expect(m[1], path).toContain('motion-safe:');
    }
  });
});
