import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { recordMarkdownView } from './history';
import { MarkdownViewer } from './MarkdownViewer';
import viewerStyles from './styles.css?inline';
import { getSavedViewMode } from './viewModePreference';

export async function mountMarkdownViewer(source: string, url: string): Promise<void> {
  const initialMode = await getSavedViewMode();
  const mount = document.createElement('div');
  mount.id = 'markview-root';

  const filename = decodeURIComponent(window.location.pathname.split('/').pop() || 'Markdown');
  document.title = url;
  void recordMarkdownView(url, filename).catch(() => undefined);
  const style = document.createElement('style');
  style.dataset.markview = 'styles';
  style.textContent = viewerStyles;
  document.head.append(style);
  document.body.replaceChildren(mount);
  const root = createRoot(mount);
  flushSync(() => {
    root.render(<MarkdownViewer source={source} url={url} initialMode={initialMode} />);
  });
  document.documentElement.style.removeProperty('visibility');
  document.documentElement.style.removeProperty('background-color');
}
