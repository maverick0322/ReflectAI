"use client";

import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import Button from "@/components/ui/Button";
import { useValidationContext } from "@/contexts/ValidationContext";
import { WizardFormValues } from "@/lib/validations/reflection";

interface StepProps {
  onPrev: () => void;
  onSubmit: () => void;
  questionText?: string;
}

const DEFAULT_QUESTION =
  "Sabiendo lo que sabes ahora, ¿cómo podrías interpretar esta situación de una manera más útil o compasiva?";

export const Step4Reestructuracion = ({
  onPrev,
  onSubmit,
  questionText = DEFAULT_QUESTION,
}: StepProps) => {
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext<WizardFormValues>();

  const { shouldShowErrors: contextShouldShowErrors } = useValidationContext();
  const [localShouldShowErrors, setLocalShouldShowErrors] = useState(false);

  const valAlternativa = useWatch({ control, name: "alternativa" }) ?? "";

  const shouldShowError =
    !!errors.alternativa && (contextShouldShowErrors || localShouldShowErrors);

  const handleFinalize = async () => {
    const isValid = await trigger(["alternativa"], { shouldFocus: true });
    if (!isValid) {
      setLocalShouldShowErrors(true);
      return;
    }
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <section className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-800 leading-tight">
          {questionText}
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Ej. En lugar de pensar que todo salio mal, puedo ver que aprendi algo nuevo.
        </p>

        <Controller
          name="alternativa"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              value={field.value ?? ""}
              maxLength={3000}
              placeholder="Una perspectiva alternativa es..."
              className={`w-full min-h-[180px] p-4 mt-4 bg-white/30 backdrop-blur-sm rounded-2xl outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 ${
                shouldShowError
                  ? "border-2 border-red-400"
                  : "border border-white/60 focus:ring-2 focus:ring-indigo-300/50"
              }`}
            />
          )}
        />

        <div className="flex justify-between items-start px-2 mt-1">
          <span className="text-xs font-bold text-red-500 max-w-[80%]">
            {shouldShowError ? (errors.alternativa?.message as string) : ""}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {valAlternativa.length}/3000
          </span>
        </div>
      </section>

      <div className="flex gap-4 mt-8">
        <Button type="button" variant="ghost" onClick={onPrev} className="w-1/3">
          Atrás
        </Button>
        <Button type="button" onClick={handleFinalize} className="w-2/3">
          Finalizar Reflexión
        </Button>
      </div>
    </div>
  );
};
