// Deployment configuration: central API base URL for all frontend HTTP requests.
// Set VITE_API_URL in Vercel (production) or in frontend/.env.local (local development).

// Old (local development)
// const API_URL = "http://localhost:8000";

// Production: read backend URL from Vite environment variable.
// Falls back to localhost when unset so local dev works without extra setup.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
