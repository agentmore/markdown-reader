import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getUploadedMarkdown,
  storeUploadedMarkdown,
  uploadedMarkdownKey,
  uploadedMarkdownUrl,
} from './uploadedMarkdown';

describe('uploaded Markdown storage', () => {
  let storage: Record<string, unknown>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('chrome', {
      runtime: {
        getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
      },
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({ [key]: storage[key] })),
          set: vi.fn(async (items: Record<string, unknown>) => Object.assign(storage, items)),
          remove: vi.fn(async (keys: string[]) => keys.forEach((key) => delete storage[key])),
        },
      },
    });
  });

  it('stores source locally and creates a reopenable extension URL', async () => {
    const uploaded = await storeUploadedMarkdown('notes.md', '# Notes');

    expect(await getUploadedMarkdown(uploaded.id)).toEqual(uploaded);
    expect(storage[uploadedMarkdownKey(uploaded.id)]).toEqual(uploaded);
    expect(uploadedMarkdownUrl(uploaded.id)).toContain('src/popup/index.html?upload=');
  });

  it('rejects invalid stored values', async () => {
    storage[uploadedMarkdownKey('missing')] = { filename: 'missing.md' };
    expect(await getUploadedMarkdown('missing')).toBeNull();
  });
});
