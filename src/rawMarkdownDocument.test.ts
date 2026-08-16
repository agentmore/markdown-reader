import { describe, expect, it } from 'vitest';
import { isRawMarkdownDocument } from './rawMarkdownDocument';

describe('isRawMarkdownDocument', () => {
  it.each([
    'text/markdown',
    'text/markdown; charset=utf-8',
    'text/plain',
    'text/x-markdown',
    'application/markdown',
  ])('accepts raw Markdown content type %s', (contentType) => {
    expect(isRawMarkdownDocument(contentType)).toBe(true);
  });

  it.each([
    'text/html',
    'application/xhtml+xml',
    'application/json',
    'image/svg+xml',
  ])('ignores HTML and unrelated content type %s', (contentType) => {
    expect(isRawMarkdownDocument(contentType)).toBe(false);
  });
});
