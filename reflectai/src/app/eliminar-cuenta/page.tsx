"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WarningIcon from "@/components/icons/WarningIcon";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";


export default function EliminarCuentaPage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmText === "ELIMINAR";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limitar a 8 caracteres y filtrar solo letras
    const onlyLetters = e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 8);
    setConfirmText(onlyLetters.toUpperCase());
  };

  const handleDelete = () => {
    if (!isConfirmed) return;
    setIsDeleting(true);

    // TODO: [BACKEND] Llamar a Supabase para eliminar datos
    console.log("Usuario eliminado. Redirigiendo...");

    setTimeout(() => {
      router.push("/login");
    }, 2500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
      <GlassCard className="max-w-lg w-full">
        {/* Barra de navegación */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-reflect-dark">Eliminar Cuenta</h1>
        </div>
        

        {isDeleting ? (
          // PANTALLA DE ÉXITO CON PALOMITA VERDE
          <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in-95 duration-500">
            {/* Ícono de palomita verde */}
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border-2 border-green-200">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-reflect-dark">Cuenta ELIMINADA</h2>
            <p className="text-sm text-reflect-dark/60 mt-2 text-center">Tu cuenta ha sido borrada con éxito. Redirigiendo...</p>
          </div>
        ) : (
          <>
            <header className="space-y-3 text-center mb-6 animate-in fade-in duration-300">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                  <WarningIcon className="w-7 h-7" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-reflect-dark">Advertencia</h2>
              <p className="text-sm text-reflect-dark/70">
                Esta acción es <strong className="text-red-500">irreversible</strong>, se perderán todos tus datos permanentemente
              </p>
            </header>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-reflect-dark/5">
                <label className="text-xs font-medium text-reflect-dark text-center">
                  Para confirmar, escribe <strong>ELIMINAR</strong> abajo:
                </label>
                <Input
                  value={confirmText}
                  onChange={handleInputChange}
                  placeholder="ELIMINAR"
                  className="text-center font-bold tracking-widest text-reflect-dark uppercase"
                />
              </div>

              <div className="flex gap-3">
                <Link href="/perfil" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={!isConfirmed}
                  className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    isConfirmed
                      ? "!bg-black !text-white border border-black shadow-xl hover:!bg-slate-900 hover:scale-[1.02] active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </>
        )}

      </GlassCard>
    </main>
  );
}
