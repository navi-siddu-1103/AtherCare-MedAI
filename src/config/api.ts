const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

if (!configuredApiUrl && !import.meta.env.DEV) {
  console.warn(
    "VITE_API_URL is not configured. Set it to the deployed Flask API URL."
  );
}

export const API_BASE_URL = configuredApiUrl || "http://127.0.0.1:8000";
