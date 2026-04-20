import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SocialButton from "@/components/ui/SocialButton";
import CustomLink from "@/components/ui/CustomLink";
import PasswordInput from "@/components/ui/PasswordInput";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
      
      <div className="w-full max-w-lg bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-8 shadow-2xl shadow-purple-200/50 flex flex-col gap-6">

        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-reflect-dark">
            Crear Cuenta
          </h1>
          <p className="text-reflect-dark/70 font-medium text-sm">
            Comienza tu viaje
          </p>
        </header>

        <form className="flex flex-col gap-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="text" placeholder="Nombre(s)" required />
            <Input type="text" placeholder="Apellido(s)" required />
          </div>

          <Input type="email" placeholder="Correo electrónico" required />
          <Input type="email" placeholder="Confirmar correo electrónico" required />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordInput placeholder="Contraseña" required />
            <PasswordInput placeholder="Confirmar contraseña" required />
          </div>

          <Input 
            type="date" 
            placeholder="Fecha de nacimiento" 
            required 
            className="text-reflect-dark/70"
          />
          
          <div className="mt-2">
            <Button type="submit">Registrarse</Button>
          </div>
        </form>

        <div className="relative flex items-center py-2 text-reflect-dark/50 text-sm font-medium">
          <div className="flex-grow border-t border-reflect-dark/10"></div>
          <span className="mx-4">o regístrate con</span>
          <div className="flex-grow border-t border-reflect-dark/10"></div>
        </div>

        <div className="flex flex-col gap-3">
          <SocialButton provider="Google" icon={<GoogleIcon />} />
          <SocialButton provider="Facebook" icon={<FacebookIcon />} />
        </div>

        <footer className="text-center text-sm text-reflect-dark/70">
          ¿Ya tienes cuenta? <CustomLink href="/login">Inicia sesión aquí</CustomLink>
        </footer>

      </div>
      
    </main>
  );
}