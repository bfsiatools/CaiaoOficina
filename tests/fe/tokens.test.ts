import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/app/globals.css', 'utf8');
const readColors = (block: string) => Object.fromEntries([...block.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const light = readColors(css);

const channel = (n: number) => { const v = n / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (hex: string) => 0.2126 * channel(parseInt(hex.slice(1, 3), 16)) + 0.7152 * channel(parseInt(hex.slice(3, 5), 16)) + 0.0722 * channel(parseInt(hex.slice(5, 7), 16));
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const LIGHT_PAIRS: Array<[string, string]> = [['ink', 'ground'], ['ink', 'surface'], ['ink-2', 'ground'], ['ink-2', 'surface'], ['ink-3', 'ground'], ['ink-3', 'surface'], ['ink', 'accent'], ['ink', 'accent-press'], ['accent-ink', 'surface'], ['accent-ink', 'ground'], ['danger', 'surface'], ['ink', 'tile'], ['ink-2', 'tile'], ['readout', 'plate'], ['plate-ink', 'plate'], ['plate-ink-2', 'plate']];

describe('contrast tokens', () => {
  it.each(LIGHT_PAIRS)('light: %s on %s >= 4.5', (fg, bg) => expect(ratio(light[fg], light[bg])).toBeGreaterThanOrEqual(4.5));
  it('muted text on the product panel also meets AA', () => expect(ratio(light['ink-3'], light.tile)).toBeGreaterThanOrEqual(4.5));
  it('keeps the approved light storefront regardless of system theme', () => {
    expect(css).toContain('color-scheme: light;');
    expect(css).not.toContain('prefers-color-scheme: dark');
  });
});
