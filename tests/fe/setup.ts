import { vi } from 'vitest';
import { createElement } from 'react';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, preload, ...rest } = props;
    for (const key of ['fill', 'priority', 'placeholder', 'quality', 'blurDataURL', 'loader', 'unoptimized']) delete rest[key];
    return createElement('img', { ...rest, alt, src: typeof src === 'string' ? src : (src as { src: string }).src, 'data-preload': preload ? 'true' : undefined });
  },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, prefetch: _prefetch, ...rest }: Record<string, unknown> & { children?: unknown }) => createElement('a', { href, ...rest }, children as never),
}));
