import { uploadedMarkdownKey } from './uploadedMarkdown';

export const MARKDOWN_HISTORY_KEY = 'markview-history';
export const MAX_HISTORY_ITEMS = 30;

export type MarkdownHistoryEntry = {
  url: string;
  filename: string;
  viewedAt: number;
  kind?: 'url' | 'uploaded';
  location?: string;
  uploadId?: string;
};

export type MarkdownHistoryDetails = Pick<MarkdownHistoryEntry, 'kind' | 'location' | 'uploadId'>;

export function normalizeHistory(value: unknown): MarkdownHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is MarkdownHistoryEntry => {
    if (typeof item !== 'object' || item === null) return false;
    const candidate = item as Partial<MarkdownHistoryEntry>;
    const validKind = candidate.kind === undefined || candidate.kind === 'url' || candidate.kind === 'uploaded';
    const validLocation = candidate.location === undefined || typeof candidate.location === 'string';
    const validUploadId = candidate.uploadId === undefined || typeof candidate.uploadId === 'string';
    return typeof candidate.url === 'string'
      && typeof candidate.filename === 'string'
      && typeof candidate.viewedAt === 'number'
      && Number.isFinite(candidate.viewedAt)
      && validKind
      && validLocation
      && validUploadId;
  }).slice(0, MAX_HISTORY_ITEMS);
}

export async function getMarkdownHistory(): Promise<MarkdownHistoryEntry[]> {
  const stored = await chrome.storage.local.get(MARKDOWN_HISTORY_KEY);
  return normalizeHistory(stored[MARKDOWN_HISTORY_KEY]);
}

export async function recordMarkdownView(url: string, filename: string, details: MarkdownHistoryDetails = {}): Promise<void> {
  const history = await getMarkdownHistory();
  const next = [
    { url, filename, viewedAt: Date.now(), ...details },
    ...history.filter((entry) => entry.url !== url),
  ].slice(0, MAX_HISTORY_ITEMS);
  await chrome.storage.local.set({ [MARKDOWN_HISTORY_KEY]: next });
  const retainedUploadIds = new Set(next.map((entry) => entry.uploadId).filter(Boolean));
  const prunedUploadKeys = history
    .map((entry) => entry.uploadId)
    .filter((id): id is string => Boolean(id) && !retainedUploadIds.has(id))
    .map(uploadedMarkdownKey);
  if (prunedUploadKeys.length > 0) await chrome.storage.local.remove(prunedUploadKeys);
}

export async function clearMarkdownHistory(): Promise<void> {
  const history = await getMarkdownHistory();
  await chrome.storage.local.set({ [MARKDOWN_HISTORY_KEY]: [] });
  const uploadKeys = history
    .map((entry) => entry.uploadId)
    .filter((id): id is string => Boolean(id))
    .map(uploadedMarkdownKey);
  if (uploadKeys.length > 0) await chrome.storage.local.remove(uploadKeys);
}
