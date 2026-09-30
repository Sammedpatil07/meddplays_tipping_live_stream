// Backend URL - Render production
const BACKEND_URL = 'https://meddplays-backend.onrender.com'

export const API_URL = import.meta.env.DEV ? '' : BACKEND_URL
export const SOCKET_URL = import.meta.env.DEV ? '/' : BACKEND_URL
