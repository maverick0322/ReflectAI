"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { z } from "zod";

import Button from "@/components/ui/Button";
import CustomLink from "@/components/ui/CustomLink";
import GlassCard from "@/components/ui/GlassCard";
import PasswordInput from "@/components/ui/PasswordInput";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { passwordField } from "@/lib/validations/common";

const step1Schema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
});

const step2Schema = z.object({
  newPassword: passwordField,
  confirmNewPassword: passwordField,
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmNewPassword"],
});

type Step1FormValues = z.infer<typeof step1Schema>;
type Step2FormValues = z.infer<typeof step2Schema>;

export default function CambiarContraseñaPage() {
  const [step, setStep] = useState<1 | 2>(1);

  const form1 = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const form2 = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onStep1Submit = async (data: Step1FormValues) => {
    // TODO: [BACKEND] Validar contraseña actual
    console.log("Verificando:", data);
    form2.reset({ newPassword: "", confirmNewPassword: "" });
    setStep(2);
  };

  const onStep2Submit = async (data: Step2FormValues) => {
    // TODO: [BACKEND] Actualizar a la nueva contraseña
    console.log("Actualizando:", data);
    // Redirect to /perfil on success
    window.location.href = "/perfil";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
      <GlassCard className="max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-reflect-dark">Cambiar Contraseña</h1>
        </div>

        {step === 1 ? (
          <>
            <header className="space-y-2 text-center mb-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <p className="text-sm font-medium text-reflect-dark/70">Paso 1 de 2</p>
              <h2 className="text-xl font-bold text-reflect-dark">Verifica tu identidad</h2>
              <p className="text-xs text-reflect-dark/60">Por tu seguridad, ingresa tu contraseña actual.</p>
            </header>

            <form noValidate onSubmit={form1.handleSubmit(onStep1Submit)} className="flex flex-col gap-4">
              <PasswordInput
                {...form1.register("currentPassword")}
                placeholder="Contraseña actual"
                maxLength={64}
                error={form1.formState.errors.currentPassword?.message}
                autoComplete="current-password"
              />

              <div className="text-right px-1 -mt-2">
                <CustomLink href="/recuperar" className="text-[10px]">¿Olvidaste tu contraseña?</CustomLink>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href="/perfil" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" className="flex-1">
                  Continuar
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <header className="space-y-2 text-center mb-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <p className="text-sm font-medium text-reflect-dark/70">Paso 2 de 2</p>
              <h2 className="text-xl font-bold text-reflect-dark">Nueva contraseña</h2>
              <p className="text-xs text-reflect-dark/60">Ingresa tu nueva contraseña y confírmala.</p>
            </header>

            <form noValidate onSubmit={form2.handleSubmit(onStep2Submit)} className="flex flex-col gap-4">
              <PasswordInput
                {...form2.register("newPassword")}
                placeholder="Nueva contraseña"
                maxLength={64}
                error={form2.formState.errors.newPassword?.message}
                autoComplete="new-password"
              />

              <PasswordInput
                {...form2.register("confirmNewPassword")}
                placeholder="Confirmar nueva contraseña"
                maxLength={64}
                error={form2.formState.errors.confirmNewPassword?.message}
                autoComplete="new-password"
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button type="submit" className="flex-1">
                  Actualizar
                </Button>
              </div>
            </form>
          </>
        )}

      </GlassCard>
    </main>
  );
}
