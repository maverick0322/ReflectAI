"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import Button from "@/components/ui/Button";
import CustomLink from "@/components/ui/CustomLink";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import SocialButton from "@/components/ui/SocialButton";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const onSubmit = async (_data: RegisterFormValues) => {
    void _data;
    // TODO: Integracion con Supabase para registrar usuario.
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
      <GlassCard className="p-8 gap-6 w-full max-w-md mx-auto">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-reflect-dark">Crear cuenta</h1>
          <p className="text-sm font-medium text-reflect-dark/70">Comienza tu viaje</p>
        </header>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              {...register("firstName")}
              placeholder="Nombre(s)"
              maxLength={120}
              error={errors.firstName?.message}
            />
            <Input
              {...register("lastName")}
              placeholder="Apellido(s) (Opcional)"
              maxLength={120}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            {...register("email")}
            type="email"
            placeholder="Correo electrónico"
            maxLength={254}
            error={errors.email?.message}
          />
          <Input
            {...register("confirmEmail")}
            type="email"
            placeholder="Confirmar correo electrónico"
            maxLength={254}
            error={errors.confirmEmail?.message}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PasswordInput
              {...register("password")}
              placeholder="Contraseña"
              maxLength={64}
              error={errors.password?.message}
            />
            <PasswordInput
              {...register("confirmPassword")}
              placeholder="Confirmar contraseña"
              maxLength={64}
              error={errors.confirmPassword?.message}
            />
          </div>

          <Input
            {...register("birthDate")}
            type="date"
            placeholder="Fecha de nacimiento"
            className="text-reflect-dark/70"
            error={errors.birthDate?.message}
          />

          <div className="mt-2">
            <Button type="submit">Registrarse</Button>
          </div>
        </form>

        <div className="relative flex items-center py-2 text-sm font-medium text-reflect-dark/50">
          <div className="flex-grow border-t border-reflect-dark/10"></div>
          <span className="mx-4">o registrate con</span>
          <div className="flex-grow border-t border-reflect-dark/10"></div>
        </div>

        <div className="flex flex-col gap-3">
          <SocialButton provider="Google" icon={<GoogleIcon />} />
          <SocialButton provider="Facebook" icon={<FacebookIcon />} />
        </div>

        <footer className="text-center text-sm text-reflect-dark/70">
          Ya tienes cuenta? <CustomLink href="/login">Inicia sesión aqui</CustomLink>
        </footer>
      </GlassCard>
    </main>
  );
}
