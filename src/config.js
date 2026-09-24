// src/config.js
// Reads from .env (VITE_API_BASE_URL) with a hardcoded fallback.
// To change the backend URL, update VITE_API_BASE_URL in your .env file
// and add it to Vercel's Environment Variables in the project dashboard.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "";

export default API_BASE_URL;
