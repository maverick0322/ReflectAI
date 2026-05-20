export const APP_ROUTES = {
  dashboard: '/dashboard',
  login: '/login',
  register: '/register',
  recover: '/recover',
  changePassword: '/change-password',
  deleteAccount: '/delete-account',
  newSession: '/new-session',
  profile: '/profile',
  help: '/help',
  history: '/history',
  statistics: '/statistics',
} as const;

export function buildNewSessionRoute(sessionId?: string) {
  return sessionId
    ? `${APP_ROUTES.newSession}?sessionId=${sessionId}`
    : APP_ROUTES.newSession;
}
