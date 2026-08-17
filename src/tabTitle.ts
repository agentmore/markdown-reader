export function tabTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    return path || parsed.hostname || 'Markdown';
  } catch {
    return url || 'Markdown';
  }
}
