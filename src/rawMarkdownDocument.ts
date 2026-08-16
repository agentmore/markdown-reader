const RAW_MARKDOWN_TYPES = new Set([
  'text/markdown',
  'text/plain',
  'text/x-markdown',
  'application/markdown',
  'application/x-markdown',
]);

export function isRawMarkdownDocument(contentType: string): boolean {
  return RAW_MARKDOWN_TYPES.has(contentType.toLowerCase().split(';', 1)[0].trim());
}
