// @vitest-environment jsdom

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MARKDOWN_HISTORY_KEY } from '../history';
import { uploadedMarkdownKey } from '../uploadedMarkdown';
import { mountHistoryPopup } from './historyPopup';

describe('Markdown history popup', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  let storage: Record<string, unknown>;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    storage = {
      [MARKDOWN_HISTORY_KEY]: [
        {
          url: 'file:///Users/rickb/Notes/read%20me.md',
          filename: 'read me.md',
          viewedAt: Date.now(),
        },
        {
          url: 'chrome-extension://test/src/popup/index.html?upload=one',
          filename: 'uploaded.md',
          viewedAt: Date.now(),
          kind: 'uploaded',
          location: 'Uploaded from this device · uploaded.md',
          uploadId: 'one',
        },
      ],
      [uploadedMarkdownKey('one')]: {
        id: 'one',
        filename: 'uploaded.md',
        source: '# Uploaded',
        uploadedAt: Date.now(),
      },
    };
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({ [key]: storage[key] })),
          set: vi.fn(async (items: Record<string, unknown>) => Object.assign(storage, items)),
          remove: vi.fn(async () => undefined),
        },
      },
      tabs: { create: vi.fn().mockResolvedValue(undefined) },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    document.body.replaceChildren();
    writeText.mockClear();
    vi.unstubAllGlobals();
  });

  it('shows full paths, uploaded state, popup opening, and contextual copy actions', async () => {
    mountHistoryPopup(document.getElementById('root')!);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Open .md' })).toBeTruthy());
    expect(screen.getByText('/Users/rickb/Notes/read me.md', { exact: false })).toBeTruthy();
    expect(screen.getByText('Uploaded')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Copy full path' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('/Users/rickb/Notes/read me.md'));

    fireEvent.click(screen.getByRole('button', { name: 'Copy Markdown' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('# Uploaded'));
  });
});
