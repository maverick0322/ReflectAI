"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/validations/auth";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SocialButton from "@/components/ui/SocialButton";
import CustomLink from "@/components/ui/CustomLink";
import PasswordInput from "@/components/ui/PasswordInput";
import GlassCard from "@/components/ui/GlassCard";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (_data: LoginFormValues) => {
    // TODO: Integración con Supabase para iniciar sesión
    // Nota de seguridad: Se omite intencionalmente el logging de 'data'
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GlassCard>
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-reflect-dark">ReflectAI</h1>
          <p className="text-reflect-dark/70 font-medium text-sm">Tu espacio seguro para la reflexión</p>
        </header>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input {...register("email")} type="email" placeholder="Correo electrónico" error={errors.email?.message} />
          <PasswordInput {...register("password")} placeholder="Contraseña" error={errors.password?.message} />
          
          <div className="flex justify-end">
            <CustomLink href="/recuperar" className="text-sm font-semibold">¿Olvidaste tu contraseña?</CustomLink>
          </div>

          <Button type="submit">Iniciar Sesión</Button>
        </form>

        <div className="relative flex items-center py-2 text-reflect-dark/50 text-sm font-medium">
          <div className="flex-grow border-t border-reflect-dark/10"></div>
          <span className="mx-4">o continúa con</span>
          <div className="flex-grow border-t border-reflect-dark/10"></div>
        </div>

        <div className="flex flex-col gap-3">
          <SocialButton provider="Google" icon={<GoogleIcon />} />
          <SocialButton provider="Facebook" icon={<FacebookIcon />} />
        </div>

        <footer className="text-center text-sm text-reflect-dark/70">
          ¿No tienes cuenta? <CustomLink href="/registro">Regístrate aquí</CustomLink>
        </footer>
      </GlassCard>
    </main>
  );
}