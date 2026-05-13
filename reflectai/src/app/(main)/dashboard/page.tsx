"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WeeklyCalendar } from "@/components/dashboard/WeeklyCalendar";
import { PausedSessionAlert } from "@/components/dashboard/PausedSessionAlert";
import { DailyQuote } from "@/components/dashboard/DailyQuote";
import { StreakWidget } from "@/components/dashboard/StreakWidget";
import { RecentSessionCard } from "@/components/dashboard/RecentSessionCard";
import { ProfileIcon } from "@/components/icons/ProfileIcon";
import { HelpIcon } from "@/components/icons/HelpIcon";
import GlassCard from "@/components/ui/GlassCard";
import { fetchDailyQuote } from "@/lib/api/ai";
import { ApiError } from "@/lib/api/http";
import { listReflectionSessions } from "@/lib/api/reflection";
import { fetchProfile } from "@/lib/api/profile";
import {
  buildWeekRecords,
  calculateStreak,
  formatDisplayDate,
  formatTimeAgo,
  type SessionSnapshot,
} from "@/lib/dashboard/metrics";

function isRecoverableDraft(session: SessionSnapshot) {
  if (session.status !== "draft" || !session.payload) {
    return false;
  }

  const answeredIds = new Set(session.payload.responses.map((response) => response.id));
  return answeredIds.size > 0;
}

function getSessionTime(session: SessionSnapshot) {
  return new Date(session.completed_at ?? session.started_at).getTime();
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; avatarUrl: string | null } | null>(null);
  const [dailyQuote, setDailyQuote] = useState({
    text: "La reflexión es el camino hacia la maestría de uno mismo.",
    author: "Marco Aurelio",
  });

  useEffect(() => {
    let isMounted = true;

    const loadSessions = async () => {
      setIsLoading(true);
      setFormError(null);

      try {
        const [sessionResponse, profileResponse, quoteResponse] = await Promise.all([
          listReflectionSessions(),
          fetchProfile(),
          fetchDailyQuote().catch(() => null),
        ]);
        if (!isMounted) {
          return;
        }

        setSessions(sessionResponse.data);
        setUserProfile({
          name: profileResponse.data.full_name,
          avatarUrl: profileResponse.data.avatar_url,
        });
        if (quoteResponse) {
          setDailyQuote({
            text: quoteResponse.data.text,
            author: quoteResponse.data.author,
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof ApiError && error.payload?.message
            ? error.payload.message
            : "No se pudo cargar el dashboard";
        setFormError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  const today = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => buildWeekRecords(sessions, today), [sessions, today]);
  const streak = useMemo(() => calculateStreak(sessions, today), [sessions, today]);
  const streakMessage = streak === 0
    ? "¡Hoy es el día perfecto para empezar tu hábito!"
    : "¡Excelente! Estás construyendo un hábito sólido.";

  const lastCompletedSession = sessions.find(
    (session) => session.status === "completed",
  );
  const lastCompletedTime = lastCompletedSession ? getSessionTime(lastCompletedSession) : 0;
  const pausedSession =
    sessions.find(
      (session) => isRecoverableDraft(session) && getSessionTime(session) > lastCompletedTime,
    ) ?? null;

  const intensityLabel = (value: unknown) => {
    if (typeof value !== "number") {
      return "Media";
    }
    if (value >= 8) return "Alta";
    if (value <= 3) return "Baja";
    return "Media";
  };

  const primaryEmotion = (analysis: Record<string, unknown>) => {
    const emotions = analysis.primary_emotions;
    if (Array.isArray(emotions) && typeof emotions[0] === "string") {
      return emotions[0];
    }
    return "Sin datos";
  };

  const averageIntensity = (analysis: Record<string, unknown>) => {
    return intensityLabel(analysis.average_intensity);
  };

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
              {isLoading ? "..." : userProfile?.name ?? "Usuario"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Botón de Ayuda */}
            <Link href="/ayuda" aria-label="Ayuda" className="focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-full">
              <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-black/40 backdrop-blur-md border border-white/40 flex items-center justify-center overflow-hidden hover:bg-white/80 transition-colors">
                <HelpIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </div>
            </Link>

            {/* Icono de Perfil Clicable hacia ruta de perfil */}
            <Link href="/perfil" aria-label="Perfil" className="focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-full">
              <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-black/40 backdrop-blur-md border border-white/40 flex items-center justify-center overflow-hidden hover:bg-white/80 transition-colors">
                {userProfile?.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <ProfileIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* 2. Sección de Fecha y Calendario */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Hoy</h2>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {formatDisplayDate(today)}
            </p>
          </div>
          <WeeklyCalendar weekDays={weekDays}/>
        </section>

        {/* 3. Sección de Sesión en Pausa (Condicional Backend) */}
        {pausedSession && (
          <PausedSessionAlert
            sessionId={pausedSession.id}
            timeAgo={formatTimeAgo(pausedSession.started_at)}
          />
        )}

        {/* 4. Cita del Día */}
        <DailyQuote 
          text={dailyQuote.text} 
          author={dailyQuote.author}
        />

        {/* 5. Widget de Racha */}
        <StreakWidget 
          days={streak} 
          streakMessage={streakMessage} 
        />

        {/* 6. Última Reflexión */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900/40 dark:text-white/40 uppercase tracking-tighter">
            Tu última reflexión
          </h3>
          
          {lastCompletedSession ? (
            <RecentSessionCard 
              title={lastCompletedSession.title ?? "Sesion completada"} 
              date={formatDisplayDate(new Date(lastCompletedSession.completed_at ?? lastCompletedSession.started_at))}
              intensity={averageIntensity(lastCompletedSession.ai_analysis)}
              emotion={primaryEmotion(lastCompletedSession.ai_analysis)}
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

        {formError && (
          <p className="text-sm text-red-500 font-semibold text-center mt-4" role="alert">
            {formError}
          </p>
        )}
      </GlassCard>
    </main>
  );
}
