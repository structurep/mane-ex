'use client';

import { useRef, useState, useEffect } from 'react';

export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Fire-once hook — options change doesn't require re-observing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, isInView };
}
