
// Determine API base URL based on environment
// In development, we can use the full URL if not proxying, or relative if proxying.
// For Vercel, we want relative '/api' so it goes through vercel.json rewrites.

export const getApiUrl = () => {
    if (import.meta.env.PROD) {
        return ''; // Relative path for production (Vercel)
    }
    return 'http://localhost:3000'; // Specific backend port for local dev
};

export const API_BASE_URL = getApiUrl();
