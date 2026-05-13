import Link from 'next/link';

import LogOutIcon from '@/components/icons/LogOutIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import Button from '@/components/ui/Button';

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
        <LogOutIcon className="h-5 w-5" /> Cerrar Sesión
      </Button>
      <Link
        href="/eliminar-cuenta"
        className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 transition-colors hover:text-red-500"
      >
        <TrashIcon className="h-4 w-4" /> Eliminar cuenta permanentemente
      </Link>
    </footer>
  );
}
