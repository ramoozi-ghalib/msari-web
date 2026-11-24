export function getSafeRedirect(url: string | null): string {
  if (!url) return '/';
  if (
    !url.startsWith('/') ||
    url.startsWith('//') ||
    url.startsWith('/\\') ||
    /[\r\n\t\\]/.test(url)
  ) {
    return '/';
  }
  return url;
}
