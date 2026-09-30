// Backend URL - uses env var in production, falls back to Render URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://meddplays-backend.onrender.com'

export const API_URL = import.meta.env.DEV ? '' : BACKEND_URL
export const SOCKET_URL = import.meta.env.DEV ? '/' : BACKEND_URL
