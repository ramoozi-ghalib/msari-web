export function getSafeRedirect(url: string | null): string {
  if (!url) return '/';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return '/';
  }
  if (!url.startsWith('/')) {
    return '/';
  }
  return url;
}
