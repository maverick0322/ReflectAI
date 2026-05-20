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
          The emotion feels very intense right now.
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Before continuing, take three deep breaths. Inhale for 4 seconds,
          hold for 4 seconds, and exhale for 4 seconds.
        </p>
      </header>

      <div className="rounded-2xl border border-white/60 bg-white/30 p-4 text-sm text-slate-600">
        If you need more time, there is no rush. Continue whenever you feel ready.
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="ghost" onClick={onPrev} className="w-1/3">
          Back
        </Button>
        <Button type="button" onClick={onContinue} className="w-2/3">
          I am ready to continue
        </Button>
      </div>
    </div>
  );
};
