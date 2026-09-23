/**
 * Helper to resolve item image URLs.
 * Handles:
 * - Full remote URLs (http://, https://)
 * - Base64 data URIs (data:image/...)
 * - Local server relative paths (/uploads/item-xxx.png)
 */
export const getImageUrl = (url?: string): string => {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // Return directly if already an absolute URL or inline data
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Prepend backend host for relative upload paths
  const apiBase = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';
  const backendBase = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${backendBase}${cleanPath}`;
};

export default getImageUrl;
