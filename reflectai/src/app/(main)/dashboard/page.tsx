import Link from "next/link";
import { WeeklyCalendar } from "@/components/dashboard/WeeklyCalendar";
import { PausedSessionAlert } from "@/components/dashboard/PausedSessionAlert";
import { DailyQuote } from "@/components/dashboard/DailyQuote";
import { StreakWidget } from "@/components/dashboard/StreakWidget";
import { RecentSessionCard } from "@/components/dashboard/RecentSessionCard";
import { ProfileIcon } from "@/components/icons/ProfileIcon";
import GlassCard from "@/components/ui/GlassCard";
import { DayRecord } from "@/types/dashboard";

export default function DashboardPage() {
// TODO: [BACKEND] - Obtener perfil del usuario desde Supabase
  const user = { 
    name: "Arturo", 
    racha: 5,
    avatarUrl: null // Reemplazar con URL real de imagen si existe
  };

// TODO: [BACKEND] - Verificar si hay una sesión incompleta en la tabla de borradores
  const pausedSession = {
    hasPaused: true,
    timeAgo: "2 horas"
  };
  // TODO: [BACKEND] - Mensaje predefinido según los días de racha calculados
  const streakMessage = user.racha === 0 
      ? "¡Hoy es el día perfecto para empezar tu hábito!" 
      : "¡Excelente! Estás construyendo un hábito sólido.";
  // TODO: [BACKEND] - Obtener datos de la tabla de sesiones (limit 1)
  const lastSession = {
    title: "Gestión del estrés en mi proyecto actual",
    date: "15 de Abril",
    intensity: "Alta",
    emotion: "Ansiedad"
  };

   // TODO: [BACKEND] - LOGICA DEL CALENDARIO
   /* 1. Calcular el rango de la semana actual (Lunes a Domingo) basado en la zona horaria del usuario.
   * 2. Hacer un query a la tabla de 'sesiones' filtrando por este rango de fechas y por el user_id.
   * 3. Mapear los 7 días construyendo el objeto DayRecord (ver src/types/dashboard.ts).
   * 4. SUSTITUIR: Eliminar la constante 'currentWeekMock' por completo y reemplazarla 
   * con el resultado real de la query a la base de datos.
   */
  // [DATO HARDCODEADO TEMPORAL PARA UI ]
  const currentWeekMock: DayRecord[] = [
    { date: "2026-04-13", label: "L", num: 13, isToday: false, isFuture: false, hasSessions: true },
    { date: "2026-04-14", label: "M", num: 14, isToday: false, isFuture: false, hasSessions: false },
    { date: "2026-04-15", label: "M", num: 15, isToday: false, isFuture: false, hasSessions: true },
    { date: "2026-04-16", label: "J", num: 16, isToday: true,  isFuture: false, hasSessions: false },
    { date: "2026-04-17", label: "V", num: 17, isToday: false, isFuture: true,  hasSessions: false },
    { date: "2026-04-18", label: "S", num: 18, isToday: false, isFuture: true,  hasSessions: false },
    { date: "2026-04-19", label: "D", num: 19, isToday: false, isFuture: true,  hasSessions: false },
  ];


  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
      {/* Contenedor Principal (Tarjeta estilo Login) */}
      <GlassCard className="p-6 pb-32 min-h-[90vh] flex flex-col gap-8">

        {/* 1. Cabecera (Header) */}
        <header className="flex justify-between items-start">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Bienvenido de vuelta
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {user.name}
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
            {/* TODO: [BACKEND] SUSTITUIR: Generar esta fecha dinámicamente con Intl.DateTimeFormat */}
            <p className="text-xl font-semibold text-slate-900 dark:text-white">Jueves 16 de Abril</p>
          </div>
          <WeeklyCalendar weekDays={currentWeekMock}/>
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
          
          {lastSession ? (
            <RecentSessionCard 
              title={lastSession.title} 
              date={lastSession.date}
              intensity={lastSession.intensity}
              emotion={lastSession.emotion}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed border-violet-200 dark:border-violet-900/50 rounded-2xl bg-white/20 dark:bg-black/10">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                Aún no has registrado ninguna reflexión.
              </p>
              <Link 
                href="/nueva-sesion" 
                className="inline-flex items-center justify-center px-4 py-2 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Comenzar mi primer registro
              </Link>
            </div>
          )}
        </section>

      </GlassCard>
    </main>
  );
}