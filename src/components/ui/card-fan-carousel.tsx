'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

export interface CardItem {
  id: string;
  imgUrl: string;
  alt?: string;
  linkUrl?: string;
  /** Server-rendered product card preserves the existing CTA/tracking contract. */
  content?: ReactNode;
}

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1, x: 0, y: 0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
];

function subscribeMotion(notify: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const subscribeHydration = () => () => {};

export default function SocialCards({ cards }: { cards: readonly CardItem[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const entered = useRef(false);
  const previous = useRef(new Set<number>());
  const direction = useRef(1);
  const enhanced = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const reduced = useSyncExternalStore(subscribeMotion, reduceMotion, () => true);
  const [centerIndex, setCenterIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [pointerInside, setPointerInside] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [timerEpoch, setTimerEpoch] = useState(0);
  const gesture = useRef<{ x: number; y: number; horizontal: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const pointerFocus = useRef(false);
  const count = cards.length;
  const visibleCount = Math.min(7, count);
  const half = Math.floor(visibleCount / 2);
  const center = count ? centerIndex % count : 0;
  const visible = useMemo(() => {
    const result = new Map<number, number>();
    for (let slot = 0; slot < visibleCount; slot++) result.set((center + slot - half + count) % count, slot);
    return result;
  }, [center, count, half, visibleCount]);

  const cycle = useCallback((step: number, manual = true) => {
    if (count < 2) return;
    if (manual) setTimerEpoch(value => value + 1);
    direction.current = step;
    setCenterIndex(index => (index + step + count) % count);
  }, [count]);

  useEffect(() => {
    if (!stage.current) return;
    const observer = new IntersectionObserver(entries => setInView(entries[0].isIntersecting), { threshold: 0 });
    observer.observe(stage.current);
    const visibility = () => setPageVisible(!document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  // Capture initial inline styles once; revert them on unmount (including Strict Mode).
  useEffect(() => {
    if (!enhanced || !stage.current) return;
    const elements = [...stage.current.querySelectorAll<HTMLElement>('[data-fan-index]')];
    const context = gsap.context(() => gsap.set(elements, { transformOrigin: '50% 85%' }), stage);
    return () => { gsap.killTweensOf(elements); context.revert(); };
  }, [enhanced]);

  useEffect(() => {
    const element = stage.current;
    if (!enhanced || !element || !count) return;
    const elements = [...element.querySelectorAll<HTMLElement>('[data-fan-index]')];
    const layout = () => {
      const width = element.clientWidth;
      const multiplier = width < 480 ? 0.28 : width < 640 ? 0.38 : width < 768 ? 0.5 : width < 1024 ? 0.75 : 1;
      const heightMultiplier = Math.min(1, element.clientHeight / 520);
      const activeSlot = hovered === null ? undefined : visible.get(hovered);
      elements.forEach((card, index) => {
        const slot = visible.get(index);
        gsap.killTweensOf(card);
        if (slot === undefined) {
          gsap.to(card, { x: -direction.current * 40 * multiplier * 16, opacity: 0, scale: 0.65, rotation: -direction.current * 28, duration: reduced ? 0 : 0.45, overwrite: true });
          return;
        }
        const base = FAN_POSITIONS[3 + slot - half];
        const distance = activeSlot === undefined ? 0 : Math.abs(slot - activeSlot);
        const selected = activeSlot === slot;
        const push = activeSlot !== undefined && !selected ? (slot < activeSlot ? -1 : 1) * 5 / Math.max(1, distance) : 0;
        const target = {
          x: (base.x + push) * multiplier * 16,
          y: (base.y - (selected ? 1.5 : 0)) * heightMultiplier * 16,
          rotation: selected ? base.rot * 0.5 : base.rot,
          scale: base.scale * (selected ? 1.035 : 1),
          opacity: 1,
          zIndex: selected ? 20 : base.zIndex,
        };
        if (!entered.current && !reduced) gsap.set(card, { y: 36, x: 0, scale: 0.9, opacity: 0.5, rotation: 0 });
        else if (!previous.current.has(index) && !reduced) gsap.set(card, { x: direction.current * 40 * multiplier * 16, opacity: 0, scale: 0.65, rotation: direction.current * 28 });
        gsap.to(card, { ...target, duration: reduced ? 0 : entered.current ? 0.65 : 1, ease: entered.current ? 'power3.inOut' : 'elastic.out(1.05,0.78)', overwrite: true });
      });
      entered.current = true;
      previous.current = new Set(visible.keys());
    };
    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(element);
    return () => { observer.disconnect(); gsap.killTweensOf(elements); };
  }, [enhanced, visible, count, half, hovered, reduced]);

  useEffect(() => {
    if (!enhanced || reduced || paused || pointerInside || focused || !inView || !pageVisible || count < 2) return;
    const timer = window.setTimeout(() => cycle(1, false), 3000);
    return () => window.clearTimeout(timer);
  }, [enhanced, reduced, paused, pointerInside, focused, inView, pageVisible, count, cycle, center, timerEpoch]);

  if (!count) return null;
  return (
    <div className="card-fan relative" data-enhanced={enhanced ? 'true' : undefined}
      onPointerEnter={event => { if (event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches) setPointerInside(true); }}
      onPointerLeave={() => { setHovered(null); setPointerInside(false); pointerFocus.current = false; }}
      onPointerDownCapture={() => { pointerFocus.current = true; setFocused(false); }}
      onPointerUpCapture={() => { pointerFocus.current = false; }}
      onKeyDownCapture={() => { pointerFocus.current = false; setFocused(true); }}
      onFocusCapture={event => {
        if (pointerFocus.current) return;
        setFocused(true);
        const card = (event.target as HTMLElement).closest<HTMLElement>('[data-fan-index]');
        if (card) { setTimerEpoch(value => value + 1); setCenterIndex(Number(card.dataset.fanIndex)); }
      }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div ref={stage} role="region" aria-label="Produtos em destaque" aria-roledescription="carrossel"
        data-center-id={cards[center].id} data-autoplay-ms="3000" className="fan-stage"
        onPointerDown={event => {
          if (event.pointerType !== 'mouse') gesture.current = { x: event.clientX, y: event.clientY, horizontal: false };
        }}
        onPointerMove={event => {
          const start = gesture.current;
          if (!start) return;
          const dx = Math.abs(event.clientX - start.x);
          const dy = Math.abs(event.clientY - start.y);
          if (dx > 12 && dx > dy * 1.5) {
            start.horizontal = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        }}
        onPointerUp={event => {
          const start = gesture.current;
          gesture.current = null;
          if (!start) return;
          const dx = event.clientX - start.x;
          if (start.horizontal && Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(event.clientY - start.y) * 1.5) {
            suppressClickUntil.current = performance.now() + 500;
            cycle(dx < 0 ? 1 : -1);
          }
        }}
        onPointerCancel={() => { gesture.current = null; }}
        onClickCapture={event => { if (performance.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
        {cards.map((card, index) => {
          const image = <div className="relative aspect-[3/4] rounded-card bg-surface"><Image src={card.imgUrl} alt={card.alt ?? ''} fill sizes="(min-width: 768px) 280px, 228px" quality={85} className="object-contain p-4" /></div>;
          return <div key={card.id} data-fan-index={index} className="fan-card" aria-hidden={enhanced && !visible.has(index) ? true : undefined}
            inert={enhanced && !visible.has(index)} onPointerEnter={event => { if (event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches) setHovered(index); }}>
            {card.content ?? (card.linkUrl ? <a href={card.linkUrl} rel="sponsored nofollow noopener">{image}</a> : image)}
          </div>;
        })}
      </div>
      {enhanced && count > 1 ? <>
        {!reduced ? <button type="button" onClick={() => setPaused(value => !value)} className="fan-rotation-control sr-only focus:not-sr-only">
          {paused ? 'Retomar rotação automática' : 'Parar rotação automática'}
        </button> : null}
        <button type="button" aria-label="Destaques anteriores" onClick={() => cycle(-1)} className="fan-arrow fan-arrow-prev">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6" /></svg>
        </button>
        <button type="button" aria-label="Próximos destaques" onClick={() => cycle(1)} className="fan-arrow fan-arrow-next">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m10 6 6 6-6 6" /></svg>
        </button>
      </> : null}
    </div>
  );
}
