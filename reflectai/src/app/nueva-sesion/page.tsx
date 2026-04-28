"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { wizardFormSchema } from "@/lib/validations/reflection";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";

import { StepContexto } from "@/components/wizard/steps/StepContexto";
import { Step2Evaluacion } from "@/components/wizard/steps/Step2Evaluacion";
import { Step3PropositoControl } from "@/components/wizard/steps/Step3PropositoControl";
import { Step4Reestructuracion } from "@/components/wizard/steps/Step4Reestructuracion";
import { ValidationContextProvider } from "@/contexts/ValidationContext";

type FormValues = z.infer<typeof wizardFormSchema>;

const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  1: ["situacion"],
  2: ["pensamiento", "emocion", "intensidad"],
  3: ["proposito", "controlMio", "controlOtros"],
  4: ["alternativa"],
};

export default function NuevaSesionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const totalSteps = 4;

  const methods = useForm<FormValues>({
    resolver: zodResolver(wizardFormSchema),
    defaultValues: {
      situacion: "",
      pensamiento: "",
      emocion: "",
      intensidad: 5,
      proposito: "",
      controlMio: "",
      controlOtros: "",
      alternativa: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  const handleSaveDraft = () => {
    const currentValues = methods.getValues();
    console.log("Guardando borrador...", currentValues);
    alert("Progreso guardado localmente.");
  };

  const nextStep = async () => {
    const fieldsToValidate = STEP_FIELDS[step] ?? [];
    const isStepValid = await methods.trigger(fieldsToValidate, { shouldFocus: true });

    if (!isStepValid) {
      setShouldShowErrors(true);
      return;
    }

    setShouldShowErrors(false);
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => {
    setShouldShowErrors(false);
    setStep((s) => Math.max(s - 1, 1));
  };

  const onStep4Submit = async () => {
    const values = methods.getValues();
    onSubmit(values);
  };

  const onSubmit = (data: FormValues) => {
    // TODO: [BACKEND] Mapear al payload de Supabase y enviar
    console.log("¡Sesión Finalizada y validada con éxito!", data);
    setIsSuccess(true);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isSuccess) {
      timeoutId = setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSuccess, router]);

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-in zoom-in duration-500">
          <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/30">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-slate-800">¡Reflexión Guardada!</h2>
            <p className="text-slate-500 font-medium">Redirigiendo al dashboard...</p>
          </GlassCard>
        </div>
      </main>
    );
  }

  return (
    <FormProvider {...methods}>
      <ValidationContextProvider value={{ shouldShowErrors }}>
        <WizardLayout currentStep={step} totalSteps={totalSteps} onSaveDraft={handleSaveDraft}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {step === 1 && <StepContexto onNext={nextStep} />}
            {step === 2 && <Step2Evaluacion onNext={nextStep} onPrev={prevStep} />}
            {step === 3 && <Step3PropositoControl onNext={nextStep} onPrev={prevStep} />}
            {step === 4 && <Step4Reestructuracion onPrev={prevStep} onSubmit={onStep4Submit} />}
          </form>
        </WizardLayout>
      </ValidationContextProvider>
    </FormProvider>
  );
}