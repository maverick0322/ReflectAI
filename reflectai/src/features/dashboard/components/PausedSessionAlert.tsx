'use client';

import Link from 'next/link';
import { useState } from 'react';

import { buildNewSessionRoute } from '@/core/routing/routes';
import { ClockIcon } from '@/shared/icons/ClockIcon';
import CloseIcon from '@/shared/icons/CloseIcon';
import GlassCard from '@/shared/ui/GlassCard';

interface PausedSessionAlertProps {
  sessionId?: string;
  timeAgo: string;
}

function getResumeHref(sessionId?: string) {
  return buildNewSessionRoute(sessionId);
}

const alertCardClassName = [
  'animate-in relative border-l-4 border-l-violet-500 p-4',
  'fade-in slide-in-from-top-4 duration-500',
].join(' ');

const closeButtonClassName = [
  'absolute right-2 top-2 rounded-full p-1 text-slate-400 transition-colors',
  'hover:text-slate-600 focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-violet-500 dark:hover:text-slate-200',
].join(' ');

const alertIconClassName = [
  'flex-shrink-0 rounded-full bg-violet-100 p-2 text-violet-600',
  'dark:bg-violet-900/30',
].join(' ');

const resumeLinkClassName = [
  'inline-flex h-auto items-center justify-center whitespace-nowrap',
  'rounded-2xl border-none bg-violet-600 px-4 py-2 text-xs font-semibold',
  'text-white transition-transform hover:bg-violet-700 active:scale-95',
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-violet-500 focus-visible:ring-offset-2',
].join(' ');

export function PausedSessionAlert({
  sessionId,
  timeAgo,
}: PausedSessionAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <GlassCard className={alertCardClassName}>
      <button
        type="button"
        aria-label="Cerrar alerta"
        onClick={() => setIsVisible(false)}
        className={closeButtonClassName}
      >
        <CloseIcon className="h-4 w-4" />
      </button>

      <div className="flex w-full flex-row items-center justify-between gap-4 pr-6">
        <div className={alertIconClassName}>
          <ClockIcon className="h-5 w-5" />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
            Tienes una reflexión en pausa
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Guardada hace {timeAgo}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Link
            href={getResumeHref(sessionId)}
            role="button"
            className={resumeLinkClassName}
          >
            Continuar sesión
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
