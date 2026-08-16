import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSavedViewMode,
  saveViewMode,
  VIEW_MODE_KEY,
} from './viewModePreference';

describe('view mode preference', () => {
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

  afterEach(() => vi.unstubAllGlobals());

  it('defaults to Preview and restores Raw when selected', async () => {
    expect(await getSavedViewMode()).toBe('preview');
    await saveViewMode('raw');
    expect(storage[VIEW_MODE_KEY]).toBe('raw');
    expect(await getSavedViewMode()).toBe('raw');
  });

  it('treats invalid stored values as Preview', async () => {
    storage[VIEW_MODE_KEY] = 'invalid';
    expect(await getSavedViewMode()).toBe('preview');
  });
});
