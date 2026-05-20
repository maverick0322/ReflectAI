'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';

import CameraIcon from '@/shared/icons/CameraIcon';

type ManualScreenshotProps = Readonly<{
  src: string;
  alt: string;
  calloutText?: string;
  caption?: string;
}>;

export default function ManualScreenshot({
  src,
  alt,
  calloutText = 'Tap here',
  caption,
}: ManualScreenshotProps) {
  const [hasError, setHasError] = useState(false);
  const imageSrc = useMemo(() => (src.startsWith('/') ? src : `/${src}`), [src]);

  return (
    <figure className="w-full">
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/50 bg-white/30 backdrop-blur-md shadow-lg shadow-purple-200/30">
        <div className="relative aspect-[16/9] w-full">
          {!hasError ? (
            <Image
              src={imageSrc}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover"
              onError={() => setHasError(true)}
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-white/40 to-white/10 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/60 shadow">
                <CameraIcon className="h-6 w-6 text-slate-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">Screenshot pending</p>
                <p className="text-xs text-slate-500">
                  This image will be added once the interface is finalized.
                </p>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-600/95 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 ring-1 ring-white/30">
              {calloutText}
            </span>
          </div>
        </div>
      </div>

      {caption ? (
        <figcaption className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
