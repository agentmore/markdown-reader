import { describe, expect, it } from 'vitest';
import { isMarkdownPath } from './markdownPath';

describe('isMarkdownPath', () => {
  it.each([
    '/skill.md',
    '/nested/README.MD',
    '/guide.markdown',
    '/path%20with%20spaces/notes.md',
    '/notes.txt',
    '/nested/README.TXT',
  ])('accepts supported document path %s', (pathname) => {
    expect(isMarkdownPath(pathname)).toBe(true);
  });

  it.each([
    '/index.html',
    '/markdown',
    '/skill.md.exe',
    '/assets/style.css',
  ])('ignores unsupported document path %s', (pathname) => {
    expect(isMarkdownPath(pathname)).toBe(false);
  });
});
