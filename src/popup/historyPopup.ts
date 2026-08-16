import {
  clearMarkdownHistory,
  getMarkdownHistory,
  recordMarkdownView,
  type MarkdownHistoryEntry,
} from '../history';
import {
  getUploadedMarkdown,
  storeUploadedMarkdown,
  uploadedMarkdownUrl,
} from '../uploadedMarkdown';
import './popup.css';

function fullLocation(entry: MarkdownHistoryEntry): string {
  if (entry.location) return entry.location;
  try {
    const parsed = new URL(entry.url);
    return parsed.protocol === 'file:' ? decodeURIComponent(parsed.pathname) : decodeURIComponent(parsed.href);
  } catch {
    return entry.url;
  }
}

function relativeTime(timestamp: number): string {
  const minutes = Math.floor(Math.max(0, Date.now() - timestamp) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = element('textarea');
    textarea.value = text;
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

async function copyHistoryEntry(entry: MarkdownHistoryEntry): Promise<void> {
  if (entry.kind === 'uploaded' && entry.uploadId) {
    const uploaded = await getUploadedMarkdown(entry.uploadId);
    if (uploaded) {
      await copyText(uploaded.source);
      return;
    }
  }
  await copyText(fullLocation(entry));
}

function renderHistory(root: HTMLElement, history: MarkdownHistoryEntry[]): void {
  root.replaceChildren();
  const page = element('main', 'history-popup');
  const header = element('header', 'history-header');
  const headingGroup = element('div');
  const eyebrow = element('span', 'eyebrow');
  eyebrow.textContent = 'AgentMore';
  const heading = element('h1');
  heading.textContent = 'Recent Markdown';
  headingGroup.append(eyebrow, heading);

  const headerActions = element('div', 'header-actions');
  const openButton = element('button', 'open-button');
  openButton.type = 'button';
  openButton.textContent = 'Open .md';
  const fileInput = element('input');
  fileInput.type = 'file';
  fileInput.accept = '.md,.markdown,text/markdown,text/plain';
  fileInput.hidden = true;
  openButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    openButton.disabled = true;
    openButton.textContent = 'Opening…';
    try {
      const uploaded = await storeUploadedMarkdown(file.name, await file.text());
      const url = uploadedMarkdownUrl(uploaded.id);
      await recordMarkdownView(url, file.name, {
        kind: 'uploaded',
        location: file.webkitRelativePath || `Uploaded from this device · ${file.name}`,
        uploadId: uploaded.id,
      });
      await chrome.tabs.create({ url });
      window.close();
    } finally {
      openButton.disabled = false;
      openButton.textContent = 'Open .md';
      fileInput.value = '';
    }
  });
  headerActions.append(openButton, fileInput);

  if (history.length > 0) {
    const clear = element('button', 'clear-button');
    clear.type = 'button';
    clear.textContent = 'Clear';
    clear.addEventListener('click', async () => {
      await clearMarkdownHistory();
      renderHistory(root, []);
    });
    headerActions.append(clear);
  }

  header.append(headingGroup, headerActions);
  page.append(header);
  if (history.length === 0) {
    const empty = element('div', 'empty-state');
    const icon = element('span', 'empty-icon');
    icon.ariaHidden = 'true';
    icon.textContent = '◇';
    const title = element('strong');
    title.textContent = 'No Markdown viewed yet';
    const description = element('span');
    description.textContent = 'Open a local or remote Markdown file and it will appear here.';
    empty.append(icon, title, description);
    page.append(empty);
  } else {
    const list = element('ul', 'history-list');
    for (const entry of history) {
      const item = element('li', 'history-row');
      const button = element('button', 'history-item');
      button.type = 'button';
      button.title = fullLocation(entry);

      const fileGlyph = element('span', 'file-glyph');
      fileGlyph.ariaHidden = 'true';
      fileGlyph.textContent = '▤';
      const details = element('span', 'history-details');
      const nameLine = element('span', 'history-name-line');
      const filename = element('strong');
      filename.textContent = entry.filename;
      nameLine.append(filename);
      if (entry.kind === 'uploaded') {
        const badge = element('span', 'uploaded-badge');
        badge.textContent = 'Uploaded';
        nameLine.append(badge);
      }
      const metadata = element('span', 'history-path');
      metadata.textContent = `${fullLocation(entry)} · ${relativeTime(entry.viewedAt)}`;
      details.append(nameLine, metadata);
      const openGlyph = element('span', 'open-glyph');
      openGlyph.ariaHidden = 'true';
      openGlyph.textContent = '↗';
      button.append(fileGlyph, details, openGlyph);
      button.addEventListener('click', async () => {
        await chrome.tabs.create({ url: entry.url });
        window.close();
      });

      const copyButton = element('button', 'entry-copy-button');
      copyButton.type = 'button';
      copyButton.textContent = '⧉';
      copyButton.title = entry.kind === 'uploaded' ? 'Copy Markdown' : 'Copy full path';
      copyButton.setAttribute('aria-label', copyButton.title);
      copyButton.addEventListener('click', async () => {
        await copyHistoryEntry(entry);
        copyButton.textContent = '✓';
        window.setTimeout(() => { copyButton.textContent = '⧉'; }, 1400);
      });
      item.append(button, copyButton);
      list.append(item);
    }
    page.append(list);
  }

  root.append(page);
}

export function mountHistoryPopup(root: HTMLElement): void {
  const loading = element('p', 'empty-state');
  loading.textContent = 'Loading…';
  root.append(loading);
  void getMarkdownHistory()
    .then((history) => renderHistory(root, history))
    .catch(() => renderHistory(root, []));
}
