'use client';

import { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform } from 'motion/react';

const SPRING = { mass: 1, stiffness: 100, damping: 10 };
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

/** A single pair of springs serves the active card; 47 cards stay ordinary SSR HTML. */
export function Product3DInteraction() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, SPRING);
  const rotateY = useSpring(y, SPRING);
  const transform = useTransform(() => `rotateX(${clamp(rotateX.get(), 8)}deg) rotateY(${clamp(rotateY.get(), 8)}deg)`);

  useEffect(() => {
    const grid = document.getElementById('todos-lista');
    if (!grid) return;
    const media = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let active: HTMLElement | null = null;
    let bounds: DOMRect | null = null;
    let returning = false;
    const clear = () => {
      if (!active) return;
      active.style.removeProperty('transform'); active.removeAttribute('data-tilting');
      active = null;
      bounds = null;
      returning = false;
      x.jump(0); y.jump(0); rotateX.jump(0); rotateY.jump(0);
    };
    const unsubscribe = transform.on('change', value => {
      if (!active) return;
      active.style.transform = value;
      if (returning && Math.abs(rotateX.get()) < 0.015 && Math.abs(rotateY.get()) < 0.015) clear();
    });
    const leave = () => { returning = true; x.set(0); y.set(0); };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType !== 'mouse') return;
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-product-3d]');
      if (!target || !grid.contains(target)) { leave(); return; }
      if (target !== active) {
        clear();
        active = target;
        bounds = target.parentElement!.getBoundingClientRect();
        target.style.transform = transform.get();
        target.setAttribute('data-tilting', 'true');
      }
      returning = false;
      x.set(clamp(-((event.clientY - bounds!.top) / bounds!.height - 0.5) * 12, 6));
      y.set(clamp(((event.clientX - bounds!.left) / bounds!.width - 0.5) * 12, 6));
    };
    const pointerDown = (event: PointerEvent) => { if (event.pointerType !== 'mouse') clear(); };
    const filters = new MutationObserver(() => { if (active?.closest('li[hidden]')) clear(); });
    filters.observe(grid, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
    grid.addEventListener('pointermove', move);
    grid.addEventListener('pointerleave', leave);
    grid.addEventListener('pointercancel', clear);
    grid.addEventListener('pointerdown', pointerDown);
    grid.addEventListener('focusin', clear);
    media.addEventListener('change', clear);
    window.addEventListener('resize', clear, { passive: true });
    window.addEventListener('scroll', clear, { passive: true });
    return () => {
      unsubscribe(); filters.disconnect(); clear();
      grid.removeEventListener('pointermove', move);
      grid.removeEventListener('pointerleave', leave);
      grid.removeEventListener('pointercancel', clear);
      grid.removeEventListener('pointerdown', pointerDown);
      grid.removeEventListener('focusin', clear);
      media.removeEventListener('change', clear);
      window.removeEventListener('resize', clear);
      window.removeEventListener('scroll', clear);
    };
  }, [x, y, rotateX, rotateY, transform]);
  return null;
}
