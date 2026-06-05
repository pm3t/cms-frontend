/**
 * Central configuration for API and server URLs.
 * Always use these constants — never hardcode localhost.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

/**
 * Resolves a relative file path (e.g. /uploads/photo.jpg) to a full URL.
 * If the path is already absolute (starts with http), it is returned as-is.
 */
export function resolveFileUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SERVER_BASE_URL}${path}`;
}
