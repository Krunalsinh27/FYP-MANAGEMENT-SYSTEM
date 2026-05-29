import axios from "axios";


// const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL ||  || "http://localhost:5000";

export const axiosInstance = axios.create({
  // baseURL: import.meta.env.FRONTEND_URL,
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// if (!import.meta.env.VITE_API_URL && !import.meta.env.VITE_BACKEND_URL && !import.meta.env.FRONTEND_URL) {
//   // eslint-disable-next-line no-console
//   console.warn(`axios baseURL fallback in use (${apiBase}). Set VITE_API_URL in your .env to point to the backend.`);
// }