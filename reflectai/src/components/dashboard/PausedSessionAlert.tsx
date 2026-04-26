"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";

export function PausedSessionAlert({ timeAgo }: { timeAgo: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <GlassCard className="p-4 border-l-4 border-l-violet-500 relative animate-in fade-in slide-in-from-top-4 duration-500">
      
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        aria-label="Cerrar alerta"
      >
        <CloseIcon className="w-4 h-4" />
      </button>

      <div className="flex flex-row items-center justify-between gap-4 w-full pr-6">
        <div className="flex-shrink-0 p-2 bg-violet-100 dark:bg-violet-900/30 rounded-full text-violet-600">
          <ClockIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
            Tienes una reflexión pendiente
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Guardado hace {timeAgo}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button className="whitespace-nowrap text-xs py-2 px-4 h-auto bg-violet-600 hover:bg-violet-700 text-white border-none focus-visible:ring-offset-2">
            Continuar sesión
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}