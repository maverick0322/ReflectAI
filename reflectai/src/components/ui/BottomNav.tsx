"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { ChartIcon } from '@/components/icons/ChartIcon';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { ChartIcon } from '@/components/icons/ChartIcon';
import { ClockIcon } from '@/components/icons/ClockIcon';
import { HelpIcon } from '@/components/icons/HelpIcon';

interface NavItem {
  href: string;
  ariaLabel: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isPrimary?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', ariaLabel: 'Inicio', icon: HomeIcon },
  { href: '/historial', ariaLabel: 'Historial', icon: CalendarIcon },
  { href: '/nueva-sesion', ariaLabel: 'Nueva sesion', icon: PlusIcon, isPrimary: true },
  { href: '/estadisticas', ariaLabel: 'Estadisticas', icon: ChartIcon },
  { href: '/perfil', ariaLabel: 'Perfil', icon: ProfileIcon },
];

function isActivePath(currentPath: string, itemPath: string) {
  if (itemPath === '/dashboard') {
    return currentPath === itemPath || currentPath === '/';
  }

  return currentPath === itemPath;
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-auto mx-auto flex w-full max-w-[480px] items-center justify-between rounded-3xl border border-white/40 bg-white/60 px-6 py-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/60">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(pathname, item.href);

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/40 transition-all hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-500/50"
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-7 w-7" strokeWidth={2.5} />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full p-1.5 transition-all focus:outline-none ${
              isActive
                ? 'text-violet-600 dark:text-violet-400'
                : 'text-slate-500 hover:scale-110 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400'
            }`}
            aria-label={item.ariaLabel}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-7 w-7" />
          </Link>
        );
      })}
    </nav>
  );
}
