import Link from 'next/link';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { ChartIcon } from '@/components/icons/ChartIcon';
import { ClockIcon } from '@/components/icons/ClockIcon';

export default function BottomNav() {
  return (
    <nav className="pointer-events-auto w-full bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl rounded-3xl py-4 px-8 flex justify-between items-center">
      
      <Link href="/dashboard" className="text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 hover:scale-110 transition-all focus:outline-none focus:text-violet-600" aria-label="Inicio">
        <HomeIcon className="w-7 h-7" />
      </Link>
      
      <Link href="/nueva-sesion" className="bg-gradient-to-r from-violet-500 to-violet-600 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-violet-500/40 hover:scale-105 hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-violet-500/50" aria-label="Nueva sesión">
        <PlusIcon className="w-7 h-7" strokeWidth={2.5} />
      </Link>
      
      <Link href="/estadisticas" className="text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 hover:scale-110 transition-all focus:outline-none focus:text-violet-600" aria-label="Estadísticas">
        <ChartIcon className="w-7 h-7" />
      </Link>
      
      <Link href="/historial" className="text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 hover:scale-110 transition-all focus:outline-none focus:text-violet-600" aria-label="Historial">
        <ClockIcon className="w-7 h-7" />
      </Link>
      
    </nav>
  );
}