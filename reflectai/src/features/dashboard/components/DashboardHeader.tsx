import Image from 'next/image';
import Link from 'next/link';

import { APP_ROUTES } from '@/core/routing/routes';
import { HelpIcon } from '@/shared/icons/HelpIcon';
import { ProfileIcon } from '@/shared/icons/ProfileIcon';

interface DashboardHeaderProps {
  isLoading: boolean;
  userName: string | null;
  avatarUrl: string | null;
}

const headerActionFrameClassName = [
  'flex h-12 w-12 items-center justify-center overflow-hidden rounded-full',
  'border border-white/40 bg-white/50 backdrop-blur-md transition-colors',
  'hover:bg-white/80 dark:bg-black/40',
].join(' ');

export function DashboardHeader({
  isLoading,
  userName,
  avatarUrl,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-start justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Welcome back
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isLoading ? '...' : userName ?? 'User'}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Link
          href={APP_ROUTES.help}
          aria-label="Help"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <div className={headerActionFrameClassName}>
            <HelpIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </div>
        </Link>

        <Link
          href={APP_ROUTES.profile}
          aria-label="Profile"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <div className={headerActionFrameClassName}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                width={48}
                height={48}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <ProfileIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
