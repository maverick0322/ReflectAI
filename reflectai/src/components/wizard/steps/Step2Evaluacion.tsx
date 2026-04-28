"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import Button from "@/components/ui/Button";
import { PrimaryEmotion } from "@/types/reflection";
import { WizardFormValues } from "@/lib/validations/reflection";
import { useValidationContext } from "@/contexts/ValidationContext";

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
}

export const Step2Evaluacion = ({ onNext, onPrev }: StepProps) => {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<WizardFormValues>();

  const { shouldShowErrors } = useValidationContext();
  const currentEmotion = useWatch({ control, name: "emocion" });
  const currentIntensity = useWatch({ control, name: "intensidad" }) ?? 5;
  const pensamientoText = useWatch({ control, name: "pensamiento" }) ?? "";

  const handleNext = () => onNext();
  
  const shouldShowPensamientoError = !!errors.pensamiento && shouldShowErrors;
  const shouldShowEmocionError = !!errors.emocion && shouldShowErrors;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <input type="hidden" {...register("emocion")} />

      <section className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-800 leading-tight">
          En ese instante, ¿cuál fue el primer pensamiento que cruzó tu mente?
        </h2>
        <textarea
          {...register("pensamiento")}
          maxLength={3000}
          placeholder="Me dije a mí mismo que..."
          className={`w-full min-h-[100px] p-4 mt-2 bg-white/30 backdrop-blur-sm rounded-2xl outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 ${
            shouldShowPensamientoError ? "border-2 border-red-400" : "border border-white/60 focus:ring-2 focus:ring-indigo-300/50"
          }`}
        />
        <div className="flex justify-between items-start px-2">
          <span className="text-xs font-bold text-red-500 max-w-[80%]">
            {shouldShowPensamientoError ? (errors.pensamiento?.message as string) : ""}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {pensamientoText.length}/3000
          </span>
        </div>
      </section>

      <hr className="border-white/40" />

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-sans font-bold text-slate-800">
          ¿Qué emoción principal experimentaste?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.values(PrimaryEmotion).map((emocion) => (
            <button
              key={emocion}
              type="button"
              onClick={() =>
                setValue("emocion", emocion, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                currentEmotion === emocion
                  ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/30 scale-105"
                  : "bg-white/40 text-slate-600 border-white/60 hover:bg-white/60"
              }`}
            >
              {emocion}
            </button>
          ))}
        </div>
        {shouldShowEmocionError && (
          <span className="text-xs font-bold text-red-500 px-2">
            {errors.emocion?.message as string}
          </span>
        )}
      </section>

      <hr className="border-white/40" />

      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-sans font-bold text-slate-800">
            Intensidad emocional
          </h3>
          <span className="text-5xl font-black text-indigo-600 tracking-tighter drop-shadow-sm">
            {currentIntensity} <span className="text-xl text-slate-400 font-bold">/ 10</span>
          </span>
        </div>
        
        <div className="flex flex-col gap-2 relative">
          <Controller
            name="intensidad"
            control={control}
            render={({ field }) => (
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={field.value ?? 5}
                onChange={(event) => field.onChange(Number(event.target.value))}
                className="w-full h-3 bg-white/50 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            )}
          />
          <div className="flex justify-between text-xs text-slate-500 font-bold px-1">
            <span>Leve (1)</span>
            <span>Abrumadora (10)</span>
          </div>
        </div>
      </section>

      <div className="flex gap-4 mt-4">
        <Button type="button" variant="ghost" onClick={onPrev} className="w-1/3">
          Atrás
        </Button>
        <Button type="button" onClick={handleNext} className="w-2/3">
          Siguiente
        </Button>
      </div>
    </div>
  );
};