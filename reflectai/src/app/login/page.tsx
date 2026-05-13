"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import Button from "@/components/ui/Button";
import CustomLink from "@/components/ui/CustomLink";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import SocialButton from "@/components/ui/SocialButton";
import { ApiError } from "@/lib/api/http";
import { loginUser } from "@/lib/api/auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      await loginUser(data.email, data.password);
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : "No se pudo iniciar sesion";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GlassCard className="p-8 gap-6 w-full max-w-md mx-auto">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-reflect-dark">ReflectAI</h1>
          <p className="text-sm font-medium text-reflect-dark/70">
            Tu espacio seguro para la reflexión
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            {...register("email")}
            type="email"
            placeholder="Correo electrónico"
            maxLength={254}
            error={errors.email?.message}
          />
          <PasswordInput
            {...register("password")}
            placeholder="Contraseña"
            maxLength={64}
            error={errors.password?.message}
          />

          <div className="flex justify-end">
            <CustomLink href="/recuperar" className="text-sm font-semibold">
              ¿Olvidaste tu contraseña?
            </CustomLink>
          </div>

          {formError && (
            <p className="text-sm text-red-500 font-semibold" role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className={isSubmitting ? "opacity-60" : ""}>
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>

        <div className="relative flex items-center py-2 text-sm font-medium text-reflect-dark/50">
          <div className="flex-grow border-t border-reflect-dark/10"></div>
          <span className="mx-4">o continúa con</span>
          <div className="flex-grow border-t border-reflect-dark/10"></div>
        </div>

        <div className="flex flex-col gap-3">
          <SocialButton provider="Google" icon={<GoogleIcon />} disabled />
          <SocialButton provider="Facebook" icon={<FacebookIcon />} disabled />
        </div>

        <p className="text-xs text-reflect-dark/50 text-center">
          Inicio con Google y Facebook estara disponible pronto.
        </p>

        <footer className="text-center text-sm text-reflect-dark/70">
          ¿No tienes cuenta? <CustomLink href="/registro">Regístrate aquí</CustomLink>
        </footer>
      </GlassCard>
    </main>
  );
}
