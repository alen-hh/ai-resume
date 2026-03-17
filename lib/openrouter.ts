import { getApiKey } from "~lib/storage"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_MODEL = "stepfun/step-3.5-flash:free"

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  options?: { model?: string; signal?: AbortSignal }
): Promise<string> {
  const apiKey = await getApiKey()
  if (!apiKey) {
    throw new Error("API Key not configured — please set it in Settings")
  }

  const model = options?.model ?? DEFAULT_MODEL

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "chrome-extension://ai-resume",
      "X-Title": "AI Resume Generator"
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true
    }),
    signal: options?.signal
  })

  if (!response.ok) {
    const errorBody = await response.text()
    if (response.status === 401) {
      throw new Error("Invalid API Key — please check Settings")
    }
    if (response.status === 402) {
      throw new Error("Insufficient OpenRouter credits — please top up")
    }
    if (response.status === 429) {
      throw new Error("Too many requests — please try again later")
    }
    throw new Error(`API request failed (${response.status}): ${errorBody}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error("Response body is not readable")
  }

  const decoder = new TextDecoder()
  let fullText = ""
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith("data: ")) continue

      const data = trimmed.slice(6)
      if (data === "[DONE]") continue

      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content
        if (delta) {
          fullText += delta
          onDelta(delta)
        }
      } catch {
        // skip malformed SSE chunks
      }
    }
  }

  return fullText
}
