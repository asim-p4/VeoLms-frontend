/**
 * Helper to resolve media URLs (thumbnails, avatars, trailers)
 * Ensures that private R2 assets mapped to /api routes or legacy pub-*.r2.dev URLs
 * are cleanly routed to the backend streaming endpoints.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  // If URL is an old or direct pub-*.r2.dev URL, rewrite it to our secure backend streaming route
  if (url.includes('.r2.dev/pictures/') || url.includes('.r2.dev/avatars/')) {
    const filename = url.split(/\/(?:pictures|avatars)\//).pop()?.split('?')[0];
    return `/api/courses/picture/${filename}`;
  }

  if (url.includes('.r2.dev/trailers/')) {
    const filename = url.split('/trailers/').pop()?.split('?')[0];
    return `/api/courses/trailer/${filename}`;
  }

  return url;
}
