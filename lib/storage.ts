const STORAGE_KEYS = {
  OPENROUTER_API_KEY: "openrouter_api_key"
} as const

export async function getApiKey(): Promise<string | null> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.OPENROUTER_API_KEY)
  return result[STORAGE_KEYS.OPENROUTER_API_KEY] ?? null
}

export async function setApiKey(key: string): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEYS.OPENROUTER_API_KEY]: key })
}
