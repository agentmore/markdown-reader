export function isMarkdownPath(pathname: string): boolean {
  return /\.(?:md|markdown|txt)$/i.test(pathname);
}
