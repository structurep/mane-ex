'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Tiny 1x1 transparent placeholder — prevents layout shift before load */
const PLACEHOLDER_BLUR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8+f9/PQAJpAN3fOGMJAAAAABJRU5ErkJggg==';

type OptimizedImageProps = Omit<ImageProps, 'onLoad'> & {
  /** Dominant color for blur placeholder (hex). Falls back to paper-warm. */
  dominantColor?: string;
};

export function OptimizedImage({
  className,
  dominantColor,
  style,
  alt,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);

  const blurStyle = dominantColor
    ? { backgroundColor: dominantColor }
    : { backgroundColor: 'var(--color-paper-warm)' };

  return (
    <Image
      alt={alt}
      placeholder="blur"
      blurDataURL={PLACEHOLDER_BLUR}
      className={cn(
        'object-cover transition-opacity duration-300',
        loaded ? 'animate-image-reveal' : 'opacity-0',
        className
      )}
      style={{ ...blurStyle, ...style }}
      onLoad={() => setLoaded(true)}
      {...props}
    />
  );
}
