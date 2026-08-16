export function isMarkdownPath(pathname: string): boolean {
  return /\.(?:md|markdown)$/i.test(pathname);
}
