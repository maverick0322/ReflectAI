import Link from "next/link";
import { WeeklyCalendar } from "@/components/dashboard/WeeklyCalendar";
import { PausedSessionAlert } from "@/components/dashboard/PausedSessionAlert";
import { DailyQuote } from "@/components/dashboard/DailyQuote";
import { StreakWidget } from "@/components/dashboard/StreakWidget";
import { RecentSessionCard } from "@/components/dashboard/RecentSessionCard";
import { ProfileIcon } from "@/components/icons/ProfileIcon";
import GlassCard from "@/components/ui/GlassCard";

export default function DashboardPage() {
  // TODO: [BACKEND] - Obtener perfil del usuario desde DB
  const user = { 
    name: "Arturo", 
    racha: 5,
    avatarUrl: null // Reemplazar con URL real de imagen si existe
  };

  // TODO: [BACKEND] - Verificar si hay una sesión guardada como borrador/pausa
  const pausedSession = {
    hasPaused: true,
    timeAgo: "2 horas"
  };

  // TODO: [BACKEND] - Mensaje predefinido según los días de racha calculados
  const streakMessage = "¡Excelente! Estás construyendo un hábito sólido.";

  // TODO: [BACKEND] - Obtener datos de la tabla de sesiones (limit 1)
  const lastSession = {
    title: "Gestión del estrés en mi proyecto actual",
    date: "15 de Abril",
    intensity: "Alta",
    emotion: "Ansiedad"
  };

  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
      {/* Contenedor Principal (Tarjeta estilo Login) */}
      <GlassCard className="p-6 pb-32 min-h-[90vh] flex flex-col gap-8 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
        
        {/* 1. Cabecera (Header) */}
        <header className="flex justify-between items-start">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Bienvenido de vuelta,
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hola, {user.name}
            </h1>
          </div>
          
          {/* Icono de Perfil Clicable hacia ruta de perfil */}
          <Link href="/perfil" className="focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-full flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-black/40 backdrop-blur-md border border-white/40 flex items-center justify-center overflow-hidden hover:bg-white/80 transition-colors">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <ProfileIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              )}
            </div>
          </Link>
        </header>

        {/* 2. Sección de Fecha y Calendario */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Hoy</h2>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">Jueves 16 de Abril</p>
          </div>
          <WeeklyCalendar currentDay={16} />
        </section>

        {/* 3. Sección de Sesión en Pausa (Condicional Backend) */}
        {pausedSession.hasPaused && (
          <PausedSessionAlert timeAgo={pausedSession.timeAgo} />
        )}

        {/* 4. Cita del Día */}
        <DailyQuote 
          text="La reflexión es el camino hacia la maestría de uno mismo." 
          author="Marco Aurelio"
        />

        {/* 5. Widget de Racha */}
        <StreakWidget 
          days={user.racha} 
          streakMessage={streakMessage} 
        />

        {/* 6. Última Reflexión */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900/40 dark:text-white/40 uppercase tracking-tighter">
            Tu última reflexión
          </h3>
          <RecentSessionCard 
            title={lastSession.title} 
            date={lastSession.date}
            intensity={lastSession.intensity}
            emotion={lastSession.emotion}
          />
        </section>

      </GlassCard>
    </main>
  );
}