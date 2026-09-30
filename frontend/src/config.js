// In dev: Vite proxy handles /api → localhost:5000
// In production: VITE_API_URL points to your Render backend URL
export const API_URL = import.meta.env.VITE_API_URL || ''
export const SOCKET_URL = import.meta.env.VITE_API_URL || '/'
