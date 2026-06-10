let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (apiBase && !apiBase.startsWith('http://') && !apiBase.startsWith('https://')) {
  // If it is just a hostname (e.g., provided by Render's fromService), format it as a full URL
  apiBase = `https://${apiBase}/api`;
}

export const API_BASE = apiBase;
