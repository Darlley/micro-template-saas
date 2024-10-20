export const publicRoutes = [
  '/',
  "/error",
  "/reset",
  "/new-password"
]

export const authRoutes = [
  '/login',
  '/register',
  "/verify-email",
  "/api/webhook/stripe"
]

export const apiAuthPrefix = '/api/auth'

export const DEFAULT_LOGIN_REDIRECT = '/dashboard/settings'