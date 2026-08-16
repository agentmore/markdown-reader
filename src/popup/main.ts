import {
  clearMarkdownHistory,
  getMarkdownHistory,
  type MarkdownHistoryEntry,
} from '../history';
import './popup.css';

function locationLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'file:' ? 'Local file' : parsed.hostname;
  } catch {
    return 'Markdown';
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
  header.append(headingGroup);

  if (history.length > 0) {
    const clear = element('button', 'clear-button');
    clear.type = 'button';
    clear.textContent = 'Clear';
    clear.addEventListener('click', async () => {
      await clearMarkdownHistory();
      renderHistory(root, []);
    });
    header.append(clear);
  }

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
      const item = element('li');
      const button = element('button', 'history-item');
      button.type = 'button';
      button.title = entry.url;

      const fileGlyph = element('span', 'file-glyph');
      fileGlyph.ariaHidden = 'true';
      fileGlyph.textContent = '▤';
      const copy = element('span', 'history-copy');
      const filename = element('strong');
      filename.textContent = entry.filename;
      const metadata = element('span');
      metadata.textContent = `${locationLabel(entry.url)} · ${relativeTime(entry.viewedAt)}`;
      copy.append(filename, metadata);
      const openGlyph = element('span', 'open-glyph');
      openGlyph.ariaHidden = 'true';
      openGlyph.textContent = '↗';
      button.append(fileGlyph, copy, openGlyph);
      button.addEventListener('click', async () => {
        await chrome.tabs.create({ url: entry.url });
        window.close();
      });
      item.append(button);
      list.append(item);
    }
    page.append(list);
  }

  root.append(page);
}

const root = document.getElementById('root')!;
const loading = element('p', 'empty-state');
loading.textContent = 'Loading…';
root.append(loading);
void getMarkdownHistory()
  .then((history) => renderHistory(root, history))
  .catch(() => renderHistory(root, []));
