import { isMarkdownPath } from './markdownPath';
import { isRawMarkdownDocument } from './rawMarkdownDocument';

function readOriginalSource(): string {
  const nativePre = document.body?.querySelector(':scope > pre');
  if (nativePre?.textContent != null) return nativePre.textContent;
  return document.body?.textContent ?? document.documentElement.textContent ?? '';
}

if (isMarkdownPath(window.location.pathname) && isRawMarkdownDocument(document.contentType)) {
  const root = document.documentElement;
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.style.setProperty('visibility', 'hidden', 'important');
  root.style.setProperty('background-color', dark ? '#0d1117' : '#ffffff', 'important');

  const documentReady = document.readyState === 'loading'
    ? new Promise<void>((resolve) => {
        document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
      })
    : Promise.resolve();

  const viewerReady = import('./viewerEntry');
  void Promise.all([documentReady, viewerReady])
    .then(([, { mountMarkdownViewer }]) => {
      mountMarkdownViewer(readOriginalSource(), window.location.href);
    })
    .catch(() => {
      root.style.removeProperty('visibility');
      root.style.removeProperty('background-color');
    });
}
