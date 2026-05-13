"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CustomLink from "@/components/ui/CustomLink";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import LogOutIcon from "@/components/icons/LogOutIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import BellIcon from "@/components/icons/BellIcon";
import MoonIcon from "@/components/icons/MoonIcon";
import LockIcon from "@/components/icons/LockIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import SaveIcon from "@/components/icons/SaveIcon";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import ProfileAvatar from "@/components/perfil/ProfileAvatar";
import { ApiError } from "@/lib/api/http";
import { logoutUser } from "@/lib/api/auth";
import { fetchProfile, updateProfile, uploadProfileAvatar } from "@/lib/api/profile";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  avatarUrl: string | null;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
  };
};

const DEFAULT_PREFERENCES = {
  notifications: true,
  darkMode: false,
};

function formatFullName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ") || "Tu perfil";
}

function formatearFechaDisplay(fechaISO: string) {
  if (!fechaISO) return "No especificada";

  return new Date(`${fechaISO}T12:00:00`).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
// =========================================================================
// 🧱 COMPONENTES ATÓMICOS (Dumb Components para mantener el código limpio)
// =========================================================================
const Switch = ({ enabled, onChange, ariaLabel }: { enabled: boolean; onChange: () => void; ariaLabel: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-label={ariaLabel}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${enabled ? "bg-indigo-500" : "bg-slate-300/50"}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

const SectionTitle = ({ children }: { children: string }) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{children}</h3>
);
const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col px-1">
    <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
    <span className="text-slate-700 font-medium mt-1">{value}</span>
  </div>
);
const PreferenceRow = ({ icon, label, enabled, onChange }: { icon: ReactNode; label: string; enabled: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
    {/* Pasamos el label al switch para que el lector de pantalla diga: "Notificaciones, switch, encendido" */}
    <Switch enabled={enabled} onChange={onChange} ariaLabel={label} />
  </div>
);
// =========================================================================
// 📱 PÁGINA PRINCIPAL DE PERFIL
// =========================================================================
export default function PerfilPage() {
  const router = useRouter(); 
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editSessionKey, setEditSessionKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthDate: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setFormError(null);

      try {
        const response = await fetchProfile();
        if (!isMounted) {
          return;
        }

        setProfile({
          firstName: response.data.first_name,
          lastName: response.data.last_name ?? "",
          email: response.data.email ?? "",
          birthDate: response.data.birth_date ?? "",
          avatarUrl: response.data.avatar_url ?? null,
          preferences: DEFAULT_PREFERENCES,
        });

        reset({
          firstName: response.data.first_name,
          lastName: response.data.last_name ?? "",
          birthDate: response.data.birth_date ?? "",
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof ApiError && error.payload?.message
            ? error.payload.message
            : "No se pudo cargar el perfil";
        setFormError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [reset]);

  const startEditing = () => {
    if (!profile) {
      return;
    }

    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthDate: profile.birthDate,
    });
    clearErrors();
    setEditSessionKey((current) => current + 1);
    setIsEditing(true);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) {
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      const response = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName ?? "",
        birthDate: data.birthDate,
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              firstName: response.data.first_name,
              lastName: response.data.last_name ?? "",
              birthDate: response.data.birth_date ?? "",
              avatarUrl: response.data.avatar_url ?? null,
              email: response.data.email ?? current.email,
            }
          : current,
      );

      reset({
        firstName: response.data.first_name,
        lastName: response.data.last_name ?? "",
        birthDate: response.data.birth_date ?? "",
      });
      clearErrors();
      setEditSessionKey((current) => current + 1);
      setIsEditing(false);
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : "No se pudo actualizar el perfil";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthDate: profile.birthDate,
    });
    clearErrors();
    setEditSessionKey((current) => current + 1);
    setIsEditing(false);
  };

  const handleAvatarSelected = async (file: File) => {
    setFormError(null);
    setIsUploadingAvatar(true);

    try {
      const response = await uploadProfileAvatar(file);
      setProfile((current) =>
        current
          ? {
              ...current,
              avatarUrl: response.data.avatar_url ?? null,
            }
          : current,
      );
    } catch (error) {
      const message =
        error instanceof ApiError && error.payload?.message
          ? error.payload.message
          : "No se pudo subir la foto de perfil";
      setFormError(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore logout errors and redirect to login
    } finally {
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
        <GlassCard className="max-w-md w-full p-6 text-center">
          <p className="text-sm text-slate-500">Cargando perfil...</p>
        </GlassCard>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 py-12">
        <GlassCard className="max-w-md w-full p-6 text-center">
          <p className="text-sm text-red-500">No se pudo cargar el perfil.</p>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-6 py-8 bg-slate-50/50">
      {/* NAVEGACIÓN */}
      <div className="w-full max-w-md flex items-center gap-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/dashboard" className="p-2 bg-white/40 rounded-full text-slate-700 shadow-sm hover:bg-white/60 transition-colors">
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Mi Perfil</h1>
      </div>
      <GlassCard className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {/* HERO SECTION (Avatar dinámico y Nombre) */}
        <header className="flex flex-col items-center gap-4">
          <ProfileAvatar 
            firstName={profile.firstName} 
            lastName={profile.lastName} 
            avatarUrl={profile.avatarUrl}
            onPhotoSelected={handleAvatarSelected}
          />
          {isUploadingAvatar && (
            <p className="text-xs font-semibold text-slate-500">Subiendo foto...</p>
          )}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-slate-500 font-medium">Miembro de ReflectAI</p>
          </div>
        </header>
        {/* FORMULARIO DE INFORMACIÓN */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <SectionTitle>Información Personal</SectionTitle>
            {isEditing ? (
              <div className="flex gap-3">
                <button type="button" onClick={handleCancel} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Cancelar
                </button>
                <button
                  form="profile-form"
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <SaveIcon className="w-4 h-4" /> {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            ) : (
              <button type="button" onClick={startEditing} className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
                <PencilIcon className="w-4 h-4" /> Editar
              </button>
            )}
          </div>
          <form id="profile-form" noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-white/30 p-4 rounded-2xl border border-white/50">
            <div key={editSessionKey} className={isEditing ? "flex flex-col gap-3 animate-in fade-in duration-300" : "hidden"}>
              <Input {...register("firstName")} placeholder="Nombre(s)" maxLength={120} error={errors.firstName?.message} />
              <Input {...register("lastName")} placeholder="Apellido(s)" maxLength={120} error={errors.lastName?.message} />
              <Input {...register("birthDate")} type="date" className="text-slate-700" error={errors.birthDate?.message} />
            </div>
            <div className={isEditing ? "hidden" : "flex flex-col gap-4 animate-in fade-in duration-300"}>
              <DataRow label="Nombre Completo" value={formatFullName(profile.firstName, profile.lastName)} />
              <hr className="border-slate-200/50" />
              <DataRow label="Fecha de Nacimiento" value={formatearFechaDisplay(profile.birthDate)} />
            </div>
            <hr className="border-slate-200/50" />
            <div className="flex flex-col px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</span>
              <div className="flex justify-between items-center mt-1">
                <span className="text-slate-500 font-medium">{profile.email}</span>
                <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Verificado</span>
              </div>
            </div>
            <hr className="border-slate-200/50" />
            <CustomLink href="/cambiar-contrasena" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-bold text-sm px-1 pt-1 transition-colors w-fit">
              <LockIcon className="w-4 h-4" /> Cambiar contraseña
            </CustomLink>

            {formError && (
              <p className="text-sm text-red-500 font-semibold" role="alert">
                {formError}
              </p>
            )}
          </form>
        </section>
        {/* PREFERENCIAS */}
        <section className="flex flex-col gap-4">
          <SectionTitle>Preferencias</SectionTitle>
          <div className="flex flex-col gap-4 bg-white/30 p-4 rounded-2xl border border-white/50">
            <PreferenceRow
              icon={<BellIcon className="w-5 h-5 text-slate-600" />}
              label="Notificaciones diarias"
              enabled={profile.preferences.notifications}
              onChange={() =>
                setProfile((current) =>
                  current
                    ? {
                        ...current,
                        preferences: {
                          ...current.preferences,
                          notifications: !current.preferences.notifications,
                        },
                      }
                    : current,
                )
              }
            />
            <hr className="border-slate-200/50" />
            <PreferenceRow
              icon={<MoonIcon className="w-5 h-5 text-slate-600" />}
              label="Modo Oscuro"
              enabled={profile.preferences.darkMode}
              onChange={() =>
                setProfile((current) =>
                  current
                    ? {
                        ...current,
                        preferences: {
                          ...current.preferences,
                          darkMode: !current.preferences.darkMode,
                        },
                      }
                    : current,
                )
              }
            />
          </div>
        </section>
        {/* ACCIONES DE CUENTA */}
        <footer className="flex flex-col gap-4 pt-4 mt-auto">
          <Button type="button" variant="outline" onClick={handleLogout} className="gap-2 border-slate-300 text-slate-600 hover:bg-white/60">
            <LogOutIcon className="w-5 h-5" /> Cerrar Sesión
          </Button>
          <Link href="/eliminar-cuenta" className="text-xs font-bold text-red-400 hover:text-red-500 flex items-center justify-center gap-2 py-2 transition-colors">
            <TrashIcon className="w-4 h-4" /> Eliminar cuenta permanentemente
          </Link>
        </footer>
      </GlassCard>
    </main>
  );
}
