"use client";

import Button from '@/components/ui/Button';

interface StepGroundingProps {
  onContinue: () => void;
  onPrev: () => void;
}

export const StepGrounding = ({ onContinue, onPrev }: StepGroundingProps) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-800 leading-tight">
          La emocion se siente muy intensa ahora mismo.
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Antes de continuar, toma tres respiraciones profundas. Inhala en 4 segundos,
          sosten 4 segundos y exhala en 4 segundos.
        </p>
      </header>

      <div className="p-4 rounded-2xl bg-white/30 border border-white/60 text-sm text-slate-600">
        Si necesitas mas tiempo, no hay prisa. Cuando te sientas listo, continua.
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="ghost" onClick={onPrev} className="w-1/3">
          Atras
        </Button>
        <Button type="button" onClick={onContinue} className="w-2/3">
          Estoy listo para continuar
        </Button>
      </div>
    </div>
  );
};
