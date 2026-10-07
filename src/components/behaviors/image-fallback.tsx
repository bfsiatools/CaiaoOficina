'use client';
import { useEffect } from 'react';
import { PLACEHOLDER_SRC } from '@/components/product/constants';

export function swapBroken(img: HTMLImageElement): void {
  if (img.dataset.broken === 'true') return;
  img.dataset.broken = 'true';
  img.removeAttribute('srcset');
  img.src = PLACEHOLDER_SRC;
  img.classList.remove('mix-blend-multiply');
}

/** Imagem de produto que falhar vira o painel neutro; nome e CTA continuam. */
export function ImageFallback() {
  useEffect(() => {
    const onError = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement && target.dataset.productImg !== undefined) swapBroken(target);
    };
    document.addEventListener('error', onError, true);
    document.querySelectorAll<HTMLImageElement>('img[data-product-img]').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) swapBroken(img);
    });
    return () => document.removeEventListener('error', onError, true);
  }, []);
  return null;
}
