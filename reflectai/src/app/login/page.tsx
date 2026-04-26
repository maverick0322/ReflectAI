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
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (_data: LoginFormValues) => {
    void _data;
    // TODO: Integracion con Supabase para iniciar sesion.
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <GlassCard>
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-reflect-dark">ReflectAI</h1>
          <p className="text-sm font-medium text-reflect-dark/70">
            Tu espacio seguro para la reflexion
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            {...register("email")}
            type="email"
            placeholder="Correo electronico"
            maxLength={254}
            error={errors.email?.message}
          />
          <PasswordInput
            {...register("password")}
            placeholder="Contrasena"
            maxLength={64}
            error={errors.password?.message}
          />

          <div className="flex justify-end">
            <CustomLink href="/recuperar" className="text-sm font-semibold">
              Olvidaste tu contrasena?
            </CustomLink>
          </div>

          <Button type="submit">Iniciar sesion</Button>
        </form>

        <div className="relative flex items-center py-2 text-sm font-medium text-reflect-dark/50">
          <div className="flex-grow border-t border-reflect-dark/10"></div>
          <span className="mx-4">o continua con</span>
          <div className="flex-grow border-t border-reflect-dark/10"></div>
        </div>

        <div className="flex flex-col gap-3">
          <SocialButton provider="Google" icon={<GoogleIcon />} />
          <SocialButton provider="Facebook" icon={<FacebookIcon />} />
        </div>

        <footer className="text-center text-sm text-reflect-dark/70">
          No tienes cuenta? <CustomLink href="/registro">Registrate aqui</CustomLink>
        </footer>
      </GlassCard>
    </main>
  );
}
