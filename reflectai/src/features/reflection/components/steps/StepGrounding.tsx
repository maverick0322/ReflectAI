'use client';

import Button from '@/shared/ui/Button';

interface StepGroundingProps {
  onContinue: () => void;
  onPrev: () => void;
}

export const StepGrounding = ({ onContinue, onPrev }: StepGroundingProps) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-800 leading-tight">
          La emoción se siente muy intensa en este momento
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Antes de continuar, toma tres respiraciones profundas e inhala durante 4 segundos,
          sosten durante 4 segundos y exhala durante 4 segundos
        </p>
      </header>

      <div className="rounded-2xl border border-white/60 bg-white/30 p-4 text-sm text-slate-600">
        Si necesitas más tiempo, no hay prisa. Continúa cuando te sientas listo.
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="ghost" onClick={onPrev} className="w-1/3">
          Atrás
        </Button>
        <Button type="button" onClick={onContinue} className="w-2/3">
          Estoy listo para continuar
        </Button>
      </div>
    </div>
  );
};
