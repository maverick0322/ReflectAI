import Link from 'next/link';

import ArrowLeftIcon from '@/shared/icons/ArrowLeftIcon';

const navigationClassName = [
  'animate-in mb-4 flex w-full max-w-md items-center gap-4',
  'fade-in slide-in-from-bottom-4 duration-500',
].join(' ');

const backLinkClassName = [
  'rounded-full bg-white/40 p-2 text-slate-700 shadow-sm',
  'transition-colors hover:bg-white/60',
].join(' ');

export function ProfileNavigation() {
  return (
    <div className={navigationClassName}>
      <Link
        href="/dashboard"
        className={backLinkClassName}
      >
        <ArrowLeftIcon />
      </Link>
      <h1 className="text-xl font-bold text-slate-800">My profile</h1>
    </div>
  );
}
