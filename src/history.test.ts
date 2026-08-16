import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearMarkdownHistory,
  getMarkdownHistory,
  MARKDOWN_HISTORY_KEY,
  MAX_HISTORY_ITEMS,
  normalizeHistory,
  recordMarkdownView,
} from './history';

describe('Markdown history', () => {
  let storage: Record<string, unknown>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({ [key]: storage[key] })),
          set: vi.fn(async (items: Record<string, unknown>) => Object.assign(storage, items)),
        },
      },
    });
  });

  it('stores the newest unique Markdown URL first', async () => {
    await recordMarkdownView('https://example.com/one.md', 'one.md');
    await recordMarkdownView('https://example.com/two.md', 'two.md');
    await recordMarkdownView('https://example.com/one.md', 'one.md');

    const history = await getMarkdownHistory();
    expect(history.map((entry) => entry.filename)).toEqual(['one.md', 'two.md']);
  });

  it('bounds and validates stored history', () => {
    const input = Array.from({ length: MAX_HISTORY_ITEMS + 5 }, (_, index) => ({
      url: `https://example.com/${index}.md`,
      filename: `${index}.md`,
      viewedAt: index,
    }));
    input.push({ url: '', filename: '', viewedAt: Number.NaN });
    expect(normalizeHistory(input)).toHaveLength(MAX_HISTORY_ITEMS);
    expect(normalizeHistory('invalid')).toEqual([]);
  });

  it('clears stored history', async () => {
    storage[MARKDOWN_HISTORY_KEY] = [{ url: 'file:///one.md', filename: 'one.md', viewedAt: 1 }];
    await clearMarkdownHistory();
    expect(await getMarkdownHistory()).toEqual([]);
  });
});
