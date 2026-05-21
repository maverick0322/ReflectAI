import Link from 'next/link';

import { APP_ROUTES } from '@/core/routing/routes';

const emptyStateClassName = [
  'flex flex-col items-center justify-center rounded-2xl border-2',
  'border-dashed border-violet-200 bg-white/20 px-4 py-8 text-center',
  'dark:border-violet-900/50 dark:bg-black/10',
].join(' ');

const startLinkClassName = [
  'inline-flex items-center justify-center rounded-xl bg-violet-100',
  'px-4 py-2 text-sm font-semibold text-violet-700 transition-colors',
  'hover:bg-violet-200 focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-violet-500',
  'dark:bg-violet-900/40 dark:text-violet-300',
].join(' ');

export function EmptyReflectionState() {
  return (
    <div className={emptyStateClassName}>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        Aún no has registrado ninguna reflexión
      </p>
      <Link
        href={APP_ROUTES.newSession}
        className={startLinkClassName}
      >
        Comenzar mi primera reflexión
      </Link>
    </div>
  );
}
