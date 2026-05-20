import Link from 'next/link';

import { APP_ROUTES } from '@/core/routing/routes';
import LogOutIcon from '@/shared/icons/LogOutIcon';
import TrashIcon from '@/shared/icons/TrashIcon';
import Button from '@/shared/ui/Button';

interface ProfileAccountFooterProps {
  onLogout: () => Promise<void>;
}

export function ProfileAccountFooter({
  onLogout,
}: ProfileAccountFooterProps) {
  return (
    <footer className="mt-auto flex flex-col gap-4 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onLogout}
        className="gap-2 border-slate-300 text-slate-600 hover:bg-white/60"
      >
        <LogOutIcon className="h-5 w-5" /> Sign out
      </Button>
      <Link
        href={APP_ROUTES.deleteAccount}
        className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 transition-colors hover:text-red-500"
      >
        <TrashIcon className="h-4 w-4" /> Delete account permanently
      </Link>
    </footer>
  );
}
