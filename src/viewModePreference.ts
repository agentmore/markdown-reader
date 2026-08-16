export type ViewMode = 'preview' | 'raw';

export const VIEW_MODE_KEY = 'markview-mode';

export async function getSavedViewMode(): Promise<ViewMode> {
  try {
    const stored = await chrome.storage.local.get(VIEW_MODE_KEY);
    return stored[VIEW_MODE_KEY] === 'raw' ? 'raw' : 'preview';
  } catch {
    return 'preview';
  }
}

export async function saveViewMode(mode: ViewMode): Promise<void> {
  await chrome.storage.local.set({ [VIEW_MODE_KEY]: mode });
}
