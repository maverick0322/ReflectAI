export interface UserProfile {
  name: string;
  streak: number;
  avatarUrl: string | null;
}

export interface PausedSession {
  id: string;
  timeAgo: string;
}

// Interfaz para el Calendario Semanal
export interface DayRecord {
  date: string;         // Fecha en formato "2026-04-16"
  label: string;        // Inicial del día (Ej: "L", "M", "M", "J", "V", "S", "D")
  num: number;          // Número del día en el mes (Ej: 16)
  isToday: boolean;     // True si la fecha coincide con la fecha local del usuario
  isFuture: boolean;    // True si la fecha es mayor a la fecha de hoy
  hasSessions: boolean; // True si el usuario tiene al menos 1 reflexión guardada en este día
}