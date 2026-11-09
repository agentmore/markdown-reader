import { describe, expect, it } from 'vitest';
import { tabTitleFromUrl } from './tabTitle';

describe('tabTitleFromUrl', () => {
  it('removes the origin and leading slash from remote URLs', () => {
    expect(tabTitleFromUrl('https://example.com/agency/SKILL.md'))
      .toBe('agency/SKILL.md');
  });

  it('decodes paths and omits query strings and fragments', () => {
    expect(tabTitleFromUrl('https://example.com/team%20docs/SKILL.md?raw=1#usage'))
      .toBe('team docs/SKILL.md');
  });

  it('keeps the local filesystem path without the file URL prefix', () => {
    expect(tabTitleFromUrl('file:///Users/me/Skills/SKILL.md'))
      .toBe('Users/me/Skills/SKILL.md');
  });
});
