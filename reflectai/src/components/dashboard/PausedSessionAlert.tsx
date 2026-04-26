import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { ClockIcon } from "@/components/icons/ClockIcon";

export function PausedSessionAlert({ timeAgo }: { timeAgo: string }) {
  return (
    <GlassCard className="p-4 border-l-4 border-l-violet-500">
      <div className="flex flex-row items-center justify-between gap-4 w-full">
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
          {/* Añadido whitespace-nowrap y px-4 para darle aire al texto */}
          <Button className="whitespace-nowrap text-xs py-2 px-4 h-auto bg-violet-600 hover:bg-violet-700 text-white border-none">
            Continuar sesión
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}