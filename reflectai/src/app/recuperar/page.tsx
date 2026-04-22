"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recoverPasswordSchema, RecoverPasswordFormValues } from "@/lib/validations/auth";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CustomLink from "@/components/ui/CustomLink";
import GlassCard from "@/components/ui/GlassCard";

export default function RecoverPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RecoverPasswordFormValues>({
    resolver: zodResolver(recoverPasswordSchema),
    mode: "onTouched",
  });

  const onSubmit = async (_data: RecoverPasswordFormValues) => {
    // TODO: Lógica de recuperación de contraseña para el backend (Supabase)
    // Nota: Los datos ya vienen validados y listos para enviarse.
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GlassCard>
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-reflect-dark">Recupera tu Acceso</h1>
          <p className="text-reflect-dark/70 font-medium text-sm">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <Input 
            {...register("email")} 
            type="email" 
            placeholder="Correo electrónico"
            maxLength={254} 
            error={errors.email?.message} 
          />
          <Button type="submit">Enviar enlace</Button>
        </form>

        <footer className="text-center text-sm text-reflect-dark/70 mt-4">
            ¿Recordaste tu contraseña? <CustomLink href="/login">Volver a Iniciar Sesión</CustomLink>
        </footer>
      </GlassCard>
    </main>
  );
}