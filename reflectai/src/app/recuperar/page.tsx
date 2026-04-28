"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import Button from "@/components/ui/Button";
import CustomLink from "@/components/ui/CustomLink";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";
import { recoverPasswordSchema, type RecoverPasswordFormValues } from "@/lib/validations/auth";

export default function RecoverPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverPasswordFormValues>({
    resolver: zodResolver(recoverPasswordSchema),
    mode: "onTouched",
  });

  const onSubmit = async (_data: RecoverPasswordFormValues) => {
    void _data;
    // TODO: Integracion con Supabase para recuperar contraseña.
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GlassCard className="p-8 gap-6 w-full max-w-md mx-auto">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-reflect-dark">
            Recupera tu acceso
          </h1>
          <p className="text-sm font-medium text-reflect-dark/70">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer
            tu contraseña
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <Input
            {...register("email")}
            type="email"
            placeholder="Correo electrónico"
            maxLength={254}
            error={errors.email?.message}
          />
          <Button type="submit">Enviar enlace</Button>
        </form>

        <footer className="mt-4 text-center text-sm text-reflect-dark/70">
          ¿Recordaste tu contraseña?{" "}
          <CustomLink href="/login">Volver a iniciar sesión</CustomLink>
        </footer>
      </GlassCard>
    </main>
  );
}
