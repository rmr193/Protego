/**
 * Resolves media URLs (e.g., user avatars, evidence files) dynamically.
 * Works seamlessly in local development and production environments.
 */
export const getMediaUrl = (path?: string | null): string | null => {
  if (!path) return null;

  // Already a full external URL, blob, or base64 data URI
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Check configured backend / API base URL
  const apiUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    try {
      const parsed = new URL(apiUrl);
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${parsed.origin}${cleanPath}`;
    } catch {
      // Fallback below
    }
  }

  // Relative path (proxied in local dev by Vite, routed by Vercel in production)
  return path.startsWith('/') ? path : `/${path}`;
};
