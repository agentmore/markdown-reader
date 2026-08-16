export const UPLOADED_MARKDOWN_PREFIX = 'markview-upload:';

export type UploadedMarkdownDocument = {
  id: string;
  filename: string;
  source: string;
  uploadedAt: number;
};

function isUploadedMarkdownDocument(value: unknown): value is UploadedMarkdownDocument {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<UploadedMarkdownDocument>;
  return typeof candidate.id === 'string'
    && typeof candidate.filename === 'string'
    && typeof candidate.source === 'string'
    && typeof candidate.uploadedAt === 'number'
    && Number.isFinite(candidate.uploadedAt);
}

function createUploadId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function uploadedMarkdownKey(id: string): string {
  return `${UPLOADED_MARKDOWN_PREFIX}${id}`;
}

export function uploadedMarkdownUrl(id: string): string {
  return chrome.runtime.getURL(`src/popup/index.html?upload=${encodeURIComponent(id)}`);
}

export async function storeUploadedMarkdown(filename: string, source: string): Promise<UploadedMarkdownDocument> {
  const document: UploadedMarkdownDocument = {
    id: createUploadId(),
    filename,
    source,
    uploadedAt: Date.now(),
  };
  await chrome.storage.local.set({ [uploadedMarkdownKey(document.id)]: document });
  return document;
}

export async function getUploadedMarkdown(id: string): Promise<UploadedMarkdownDocument | null> {
  const key = uploadedMarkdownKey(id);
  const stored = await chrome.storage.local.get(key);
  return isUploadedMarkdownDocument(stored[key]) ? stored[key] : null;
}
