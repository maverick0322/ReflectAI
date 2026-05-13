import Link from 'next/link';

import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';

export function ProfileNavigation() {
  return (
    <div className="mb-4 flex w-full max-w-md items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/dashboard"
        className="rounded-full bg-white/40 p-2 text-slate-700 shadow-sm transition-colors hover:bg-white/60"
      >
        <ArrowLeftIcon />
      </Link>
      <h1 className="text-xl font-bold text-slate-800">Mi Perfil</h1>
    </div>
  );
}
