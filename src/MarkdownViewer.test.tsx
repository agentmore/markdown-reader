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
    window.history.replaceState(null, '', '/');
    document.title = '';
    vi.stubGlobal('chrome', {
      runtime: {
        getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
      },
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
          remove: vi.fn().mockResolvedValue(undefined),
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
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'markview-mode': 'raw' });

    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));
    expect(container.querySelector('.document-frame')).toBeTruthy();
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'markview-mode': 'preview' });
  });

  it('can start in the globally remembered raw mode', () => {
    const { container } = render(
      <MarkdownViewer source={source} url="file:///tmp/postiz.md" initialMode="raw" />,
    );

    expect(screen.getByRole('tab', { name: 'Raw' }).getAttribute('aria-selected')).toBe('true');
    expect(container.querySelector('.native-raw')?.textContent).toBe(source);
    expect(container.querySelector('.document-frame')).toBeNull();
  });

  it('copies the original Markdown and toggles the theme', async () => {
    const { container } = render(<MarkdownViewer source={source} url="file:///tmp/postiz.md" />);

    const toolbarActions = Array.from(container.querySelectorAll('.toolbar-actions button'))
      .map((button) => button.getAttribute('aria-label'));
    expect(toolbarActions).toEqual([
      'Copy Markdown',
      'Download Markdown',
      'Open Markdown file',
      'Use dark theme',
      'Table of contents',
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Copy Markdown' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(source));

    fireEvent.click(screen.getByRole('button', { name: 'Use dark theme' }));
    await waitFor(() => expect(document.documentElement.dataset.markviewTheme).toBe('dark'));
  });

  it('opens a heading table of contents from the far-right action', async () => {
    render(<MarkdownViewer source={source} url="file:///tmp/postiz.md" />);

    const toggle = screen.getByRole('button', { name: 'Table of contents' });
    fireEvent.click(toggle);

    await waitFor(() => expect(screen.getByRole('navigation', { name: 'Document headings' })).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Read first' })).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    const filter = screen.getByRole('searchbox', { name: 'Filter table of contents' });
    expect(document.activeElement).not.toBe(filter);
    expect(screen.getByRole('button', { name: 'Read first' }).getAttribute('aria-current')).toBeNull();
    fireEvent.change(filter, { target: { value: 'missing' } });
    await waitFor(() => expect(screen.getByText('No matching headings.')).toBeTruthy());
    fireEvent.change(filter, { target: { value: 'read' } });

    const heading = screen.getByRole('heading', { name: 'Read first' });
    const scrollIntoView = vi.fn();
    Object.defineProperty(heading, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    const headingLink = await screen.findByRole('button', { name: 'Read first' });
    fireEvent.click(headingLink);
    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(document.title).toBe('tmp/postiz.md');
    expect(headingLink.getAttribute('aria-current')).toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Close table of contents' }));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
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
    expect(document.title).toBe('replacement.md');
    expect(screen.getByText('Uploaded')).toBeTruthy();
    expect(screen.getByText('replacement.md').parentElement?.getAttribute('title'))
      .toBe('Uploaded from this device · replacement.md');
    expect(screen.getByRole('heading', { name: 'Replacement' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open Markdown file' })).toBeTruthy();
  });

  it('keeps the current raw mode when opening another file', async () => {
    render(<MarkdownViewer source={source} url="file:///tmp/postiz.md" initialMode="raw" />);
    const replacement = new File(['# Replacement'], 'replacement.md', { type: 'text/markdown' });
    Object.defineProperty(replacement, 'text', {
      value: vi.fn().mockResolvedValue('# Replacement'),
    });

    fireEvent.change(screen.getByLabelText('Choose Markdown file'), {
      target: { files: [replacement] },
    });

    await waitFor(() => expect(screen.getByText('replacement.md')).toBeTruthy());
    expect(screen.getByRole('tab', { name: 'Raw' }).getAttribute('aria-selected')).toBe('true');
    expect(document.querySelector('.native-raw')?.textContent).toBe('# Replacement');
  });
});
