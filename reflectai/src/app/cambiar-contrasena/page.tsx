"use client";

import { Suspense, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { z } from "zod";
import Button from "@/components/ui/Button";
import CustomLink from "@/components/ui/CustomLink";
import GlassCard from "@/components/ui/GlassCard";
import PasswordInput from "@/components/ui/PasswordInput";
import { passwordField } from "@/lib/validations/common";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api/http";
import { changePassword, confirmRecovery } from "@/lib/api/auth";

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

function CambiarContrasenaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [isConfirmingRecovery, setIsConfirmingRecovery] = useState(false);

  const recoveryCode = searchParams.get("code");
  const isRecoveryMode = searchParams.get("mode") === "recovery" || Boolean(recoveryCode);

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
    setCurrentPassword(data.currentPassword);
    form2.reset({ newPassword: "", confirmNewPassword: "" });
    setStep(2);
  };

  const onStep2Submit = async (data: Step2FormValues) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword: isRecoveryMode ? undefined : currentPassword ?? undefined,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      router.push("/login");
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : "No se pudo actualizar la contraseña";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runRecovery = async () => {
      if (!recoveryCode) {
        setRecoveryReady(true);
        return;
      }

      setIsConfirmingRecovery(true);

      try {
        await confirmRecovery(recoveryCode);
        if (isMounted) {
          setRecoveryReady(true);
          setStep(2);
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof ApiError && error.payload?.message
              ? error.payload.message
              : "No se pudo validar el enlace";
          setFormError(message);
        }
      } finally {
        if (isMounted) {
          setIsConfirmingRecovery(false);
        }
      }
    };

    runRecovery();

    return () => {
      isMounted = false;
    };
  }, [recoveryCode]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
      <GlassCard className="max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-reflect-dark">Cambiar Contraseña</h1>
        </div>

        {isRecoveryMode && !recoveryReady ? (
          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-300">
            <p className="text-sm text-reflect-dark/70">Validando enlace...</p>
          </div>
        ) : step === 1 && !isRecoveryMode ? (
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
                <Link
                  href="/perfil"
                  className="flex-1 w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 border-2 border-slate-300 text-slate-700 hover:bg-white/50 flex items-center justify-center">
                    Cancelar
                </Link>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Validando..." : "Continuar"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <header className="space-y-2 text-center mb-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <p className="text-sm font-medium text-reflect-dark/70">
                {isRecoveryMode ? "Restablecer contraseña" : "Paso 2 de 2"}
              </p>
              <h2 className="text-xl font-bold text-reflect-dark">Nueva contraseña</h2>
              <p className="text-xs text-reflect-dark/60">
                Ingresa tu nueva contraseña y confírmala.
              </p>
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

              {formError && (
                <p className="text-sm text-red-500 font-semibold" role="alert">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                {!isRecoveryMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={isSubmitting || isConfirmingRecovery}>
                  {isSubmitting ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
            </form>
          </>
        )}

      </GlassCard>
    </main>
  );
}

export default function CambiarContraseñaPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
          <GlassCard className="max-w-lg w-full">
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-reflect-dark/70">Cargando...</p>
            </div>
          </GlassCard>
        </main>
      }
    >
      <CambiarContrasenaContent />
    </Suspense>
  );
}
