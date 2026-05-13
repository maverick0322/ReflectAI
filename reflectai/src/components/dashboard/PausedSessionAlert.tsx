'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ClockIcon } from '@/components/icons/ClockIcon';
import CloseIcon from '@/components/icons/CloseIcon';
import GlassCard from '@/components/ui/GlassCard';

interface PausedSessionAlertProps {
  sessionId?: string;
  timeAgo: string;
}

function getResumeHref(sessionId?: string) {
  return sessionId ? `/nueva-sesion?sessionId=${sessionId}` : '/nueva-sesion';
}

export function PausedSessionAlert({
  sessionId,
  timeAgo,
}: PausedSessionAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <GlassCard className="relative border-l-4 border-l-violet-500 p-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <button
        type="button"
        aria-label="Cerrar alerta"
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:text-slate-200"
      >
        <CloseIcon className="h-4 w-4" />
      </button>

      <div className="flex w-full flex-row items-center justify-between gap-4 pr-6">
        <div className="flex-shrink-0 rounded-full bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/30">
          <ClockIcon className="h-5 w-5" />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
            Tienes una reflexión pendiente
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Guardado hace {timeAgo}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Link
            href={getResumeHref(sessionId)}
            role="button"
            className="inline-flex h-auto items-center justify-center whitespace-nowrap rounded-2xl border-none bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-transform hover:bg-violet-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Continuar sesión
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
