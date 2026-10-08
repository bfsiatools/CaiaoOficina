'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** One paused video, with seeks coalesced while the decoder finishes the previous frame. */
export function ScrollVideoBackground({ intro, discovery, highlights }: {
  intro: ReactNode; discovery: ReactNode; highlights: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = section.current;
    const media = video.current;
    if (!root || !media) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let failed = false;
    const seek = () => {
      frame = 0;
      if (motion.matches || document.hidden) return;
      const rect = root.getBoundingClientRect();
      const viewport = root.querySelector<HTMLElement>('.scroll-backdrop')!.offsetHeight;
      const target = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - viewport)));
      root.dataset.progress = target.toFixed(3);
      root.dataset.finished = target >= 0.999 ? 'true' : 'false';
      if (failed || media.seeking || media.readyState < 2 || !Number.isFinite(media.duration)) return;
      // Avoid seeking beyond the last decoded frame and skip sub-frame updates.
      const time = target * Math.max(0, media.duration - 1 / 24);
      if (Math.abs(media.currentTime - time) > 1 / 48) media.currentTime = time;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(seek); };
    const ready = () => { if (!failed && !motion.matches) root.dataset.videoReady = 'true'; schedule(); };
    const error = () => { failed = true; delete root.dataset.videoReady; };
    const pause = () => media.pause();
    const configure = () => {
      media.pause();
      delete root.dataset.videoReady;
      failed = false;
      if (motion.matches) {
        media.removeAttribute('src');
        media.load();
        root.dataset.progress = '1';
        root.dataset.finished = 'true';
      } else {
        media.src = '/background/ABRINDOACAIXA.mp4';
        media.load();
        schedule();
      }
    };
    media.addEventListener('loadeddata', ready);
    media.addEventListener('seeked', schedule);
    media.addEventListener('error', error);
    media.addEventListener('play', pause);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', configure);
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    configure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
      motion.removeEventListener('change', configure);
      media.removeEventListener('loadeddata', ready);
      media.removeEventListener('seeked', schedule);
      media.removeEventListener('error', error);
      media.removeEventListener('play', pause);
      media.pause();
      media.removeAttribute('src');
      media.load();
    };
  }, []);

  return (
    <section ref={section} className="scroll-experience" aria-label="Descubra os achados da oficina">
      <div className="scroll-backdrop" aria-hidden="true">
        {/* Native images intentionally retain the real posters under the video, including without JS. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="scroll-media scroll-poster-closed" src="/background/CAIXAFECHADA.jpeg" alt="" width="1376" height="768" fetchPriority="high" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="scroll-media scroll-poster-open" src="/background/CAIXAABERTA.jpeg" alt="" width="1376" height="768" />
        <video ref={video} className="scroll-media scroll-video" muted playsInline preload="auto" poster="/background/CAIXAFECHADA.jpeg" tabIndex={-1} />
      </div>
      <div className="scroll-foreground">
        <div className="scroll-stage scroll-intro">{intro}</div>
        <div className="scroll-stage scroll-discovery">{discovery}</div>
        <div className="scroll-stage scroll-highlights">{highlights}</div>
      </div>
    </section>
  );
}
