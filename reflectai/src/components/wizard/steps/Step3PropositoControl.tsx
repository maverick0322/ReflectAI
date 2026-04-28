"use client";

import { useFormContext, useWatch } from "react-hook-form";
import Button from "@/components/ui/Button";
import { WizardFormValues } from "@/lib/validations/reflection";
import { useValidationContext } from "@/contexts/ValidationContext";

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
}

export const Step3PropositoControl = ({ onNext, onPrev }: StepProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<WizardFormValues>();

  const { shouldShowErrors } = useValidationContext();
  const valProposito = useWatch({ control, name: "proposito" }) ?? "";
  const valControlMio = useWatch({ control, name: "controlMio" }) ?? "";
  const valControlOtros = useWatch({ control, name: "controlOtros" }) ?? "";

  const handleNext = () => onNext();
  
  const shouldShowPropositoError = !!errors.proposito && shouldShowErrors;
  const shouldShowControlMioError = !!errors.controlMio && shouldShowErrors;
  const shouldShowControlOtrosError = !!errors.controlOtros && shouldShowErrors;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <section className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-800 leading-tight">
          ¿Cuál crees que era el propósito oculto detrás de esa emoción?
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          (Ej. Protegerme, alertarme, buscar justicia, mantener el control...)
        </p>
        <textarea
          {...register("proposito")}
          maxLength={3000}
          placeholder="Siento que mi emoción intentaba..."
          className={`w-full min-h-[100px] p-4 mt-2 bg-white/30 backdrop-blur-sm rounded-2xl outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 ${shouldShowPropositoError ? "border-2 border-red-400" : "border border-white/60 focus:ring-2 focus:ring-indigo-300/50"}`}
        />
        <div className="flex justify-between items-start px-2">
          <span className="text-xs font-bold text-red-500">{shouldShowPropositoError ? (errors.proposito?.message as string) : ""}</span>
          <span className="text-xs font-bold text-slate-400">{valProposito.length}/3000</span>
        </div>
      </section>

      <hr className="border-white/40" />

      <section className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-800 leading-tight">
          De esta situación, ¿qué cosas estaban estrictamente bajo tu control?
        </h2>
        <textarea
          {...register("controlMio")}
          maxLength={3000}
          placeholder="Mis acciones, mis palabras, mis límites..."
          className={`w-full min-h-[100px] p-4 mt-2 bg-white/30 backdrop-blur-sm rounded-2xl outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 ${shouldShowControlMioError ? "border-2 border-red-400" : "border border-white/60 focus:ring-2 focus:ring-indigo-300/50"}`}
        />
        <div className="flex justify-between items-start px-2">
          <span className="text-xs font-bold text-red-500">{shouldShowControlMioError ? (errors.controlMio?.message as string) : ""}</span>
          <span className="text-xs font-bold text-slate-400">{valControlMio.length}/3000</span>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-800 leading-tight">
          ¿Qué cosas dependían de otras personas o circunstancias externas?
        </h2>
        <textarea
          {...register("controlOtros")}
          maxLength={3000}
          placeholder="Sus reacciones, sus decisiones, el clima..."
          className={`w-full min-h-[100px] p-4 mt-2 bg-white/30 backdrop-blur-sm rounded-2xl outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 ${shouldShowControlOtrosError ? "border-2 border-red-400" : "border border-white/60 focus:ring-2 focus:ring-indigo-300/50"}`}
        />
        <div className="flex justify-between items-start px-2">
          <span className="text-xs font-bold text-red-500">{shouldShowControlOtrosError ? (errors.controlOtros?.message as string) : ""}</span>
          <span className="text-xs font-bold text-slate-400">{valControlOtros.length}/3000</span>
        </div>
      </section>

      <div className="flex gap-4 mt-4">
        <Button type="button" variant="ghost" onClick={onPrev} className="w-1/3">Atrás</Button>
        <Button type="button" onClick={handleNext} className="w-2/3">Siguiente</Button>
      </div>
    </div>
  );
};