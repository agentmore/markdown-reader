export const MARKDOWN_HISTORY_KEY = 'markview-history';
export const MAX_HISTORY_ITEMS = 30;

export type MarkdownHistoryEntry = {
  url: string;
  filename: string;
  viewedAt: number;
};

export function normalizeHistory(value: unknown): MarkdownHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is MarkdownHistoryEntry => {
    if (typeof item !== 'object' || item === null) return false;
    const candidate = item as Partial<MarkdownHistoryEntry>;
    return typeof candidate.url === 'string'
      && typeof candidate.filename === 'string'
      && typeof candidate.viewedAt === 'number'
      && Number.isFinite(candidate.viewedAt);
  }).slice(0, MAX_HISTORY_ITEMS);
}

export async function getMarkdownHistory(): Promise<MarkdownHistoryEntry[]> {
  const stored = await chrome.storage.local.get(MARKDOWN_HISTORY_KEY);
  return normalizeHistory(stored[MARKDOWN_HISTORY_KEY]);
}

export async function recordMarkdownView(url: string, filename: string): Promise<void> {
  const history = await getMarkdownHistory();
  const next = [
    { url, filename, viewedAt: Date.now() },
    ...history.filter((entry) => entry.url !== url),
  ].slice(0, MAX_HISTORY_ITEMS);
  await chrome.storage.local.set({ [MARKDOWN_HISTORY_KEY]: next });
}

export async function clearMarkdownHistory(): Promise<void> {
  await chrome.storage.local.set({ [MARKDOWN_HISTORY_KEY]: [] });
}
