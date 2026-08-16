import { describe, expect, it } from 'vitest';
import { extractFrontmatter } from './frontmatter';

describe('extractFrontmatter', () => {
  it('extracts nested YAML and leaves Markdown as the body', () => {
    const source = `---
name: postiz
metadata:
  requires:
    env:
      - POSTIZ_API_URL
---

## Install`;

    expect(extractFrontmatter(source)).toEqual({
      body: '\n## Install',
      data: {
        name: 'postiz',
        metadata: { requires: { env: ['POSTIZ_API_URL'] } },
      },
      error: null,
    });
  });

  it('does not mistake a later horizontal rule for frontmatter', () => {
    const source = '# Title\n\n---\n\nBody';
    expect(extractFrontmatter(source)).toEqual({ body: source, data: null, error: null });
  });

  it('keeps the full source visible when YAML is invalid', () => {
    const source = '---\nname: [broken\n---\n\nBody';
    const result = extractFrontmatter(source);
    expect(result.body).toBe(source);
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });
});
