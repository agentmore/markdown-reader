import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { recordMarkdownView } from './history';
import { MarkdownViewer } from './MarkdownViewer';
import viewerStyles from './styles.css?inline';
import { getUploadedMarkdown, uploadedMarkdownUrl } from './uploadedMarkdown';
import { getSavedViewMode } from './viewModePreference';

export async function mountUploadedViewer(mount: HTMLElement, uploadId: string): Promise<void> {
  const uploadedDocument = await getUploadedMarkdown(uploadId);
  if (!uploadedDocument) {
    mount.className = 'uploaded-missing';
    mount.textContent = 'This uploaded Markdown file is no longer available.';
    return;
  }
  const initialMode = await getSavedViewMode();

  const url = uploadedMarkdownUrl(uploadId);
  const location = `Uploaded from this device · ${uploadedDocument.filename}`;
  window.document.title = url;
  await recordMarkdownView(url, uploadedDocument.filename, {
    kind: 'uploaded',
    location,
    uploadId,
  }).catch(() => undefined);

  const style = window.document.createElement('style');
  style.dataset.markview = 'styles';
  style.textContent = viewerStyles;
  window.document.head.append(style);
  window.document.body.replaceChildren(mount);
  const root = createRoot(mount);
  flushSync(() => {
    root.render(
      <MarkdownViewer
        source={uploadedDocument.source}
        url={url}
        initialFilename={uploadedDocument.filename}
        uploaded
        initialLocation={location}
        initialMode={initialMode}
      />,
    );
  });
}
