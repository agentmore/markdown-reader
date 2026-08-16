// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownViewer } from './MarkdownViewer';

const source = `---
name: postiz
metadata:
  openclaw:
    emoji: "🌎"
    requires:
      env:
        - POSTIZ_API_URL
---

## Read first

| Property | Value |
| --- | --- |
| name | postiz |

- [x] Complete
- [ ] Pending

~~Deprecated~~ and https://example.com

\`\`\`bash
npm install -g postiz
\`\`\`
`;

describe('MarkdownViewer', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    });

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    cleanup();
    writeText.mockClear();
    vi.unstubAllGlobals();
  });

  it('renders frontmatter and the formal GFM extensions', () => {
    render(<MarkdownViewer source={source} url="file:///tmp/postiz.md" />);

    expect(screen.getByText('postiz.md')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Read first' })).toBeTruthy();
    expect(screen.getAllByText('postiz').length).toBeGreaterThan(0);
    expect(screen.getByText('POSTIZ_API_URL', { exact: false })).toBeTruthy();
    expect(screen.getByText('Deprecated').tagName).toBe('DEL');
    expect(screen.getByRole('link', { name: 'https://example.com' }).getAttribute('href')).toBe('https://example.com');
    const tasks = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(tasks).toHaveLength(2);
    expect(tasks[0].checked).toBe(true);
    expect(tasks[1].checked).toBe(false);
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
  });

  it('switches to the untouched raw source', () => {
    const { container } = render(<MarkdownViewer source={source} url="file:///tmp/postiz.md" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Raw' }));

    const raw = container.querySelector('.native-raw');
    expect(raw?.textContent).toBe(source);
    expect(container.querySelector('.toolbar')).toBeTruthy();
    expect(container.querySelector('.document-frame')).toBeNull();
    expect(screen.getByRole('tab', { name: 'Raw' }).getAttribute('aria-selected')).toBe('true');

    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));
    expect(container.querySelector('.document-frame')).toBeTruthy();
  });

  it('copies the original Markdown and toggles the theme', async () => {
    render(<MarkdownViewer source={source} url="file:///tmp/postiz.md" />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy Markdown' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(source));

    fireEvent.click(screen.getByRole('button', { name: 'Use dark theme' }));
    await waitFor(() => expect(document.documentElement.dataset.markviewTheme).toBe('dark'));
  });

  it('opens another Markdown file from the file icon', async () => {
    render(<MarkdownViewer source={source} url="file:///tmp/postiz.md" />);
    const replacement = new File(['# Replacement'], 'replacement.md', { type: 'text/markdown' });
    Object.defineProperty(replacement, 'text', {
      value: vi.fn().mockResolvedValue('# Replacement'),
    });

    fireEvent.change(screen.getByLabelText('Choose Markdown file'), {
      target: { files: [replacement] },
    });

    await waitFor(() => expect(screen.getByText('replacement.md')).toBeTruthy());
    expect(screen.getByRole('heading', { name: 'Replacement' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open Markdown file' })).toBeTruthy();
  });
});
