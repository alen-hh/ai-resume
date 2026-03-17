const MAX_FILE_SIZE = 5 * 1024 * 1024

export type SupportedExtension = ".txt" | ".md" | ".doc" | ".docx"

const SUPPORTED_EXTENSIONS: SupportedExtension[] = [
  ".txt",
  ".md",
  ".doc",
  ".docx"
]

export const ACCEPT_STRING = ".md,.txt,.doc,.docx"

export function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf(".")
  return idx >= 0 ? filename.slice(idx).toLowerCase() : ""
}

export function isSupported(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(
    getFileExtension(filename) as SupportedExtension
  )
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file as text"))
    reader.readAsText(file)
  })
}

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () =>
      reject(new Error("Failed to read file as ArrayBuffer"))
    reader.readAsArrayBuffer(file)
  })
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth")
  const buffer = await readAsArrayBuffer(file)
  const result = await mammoth.default.extractRawText({ arrayBuffer: buffer })
  return result.value
}

export async function parseFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`)
  }

  const ext = getFileExtension(file.name)

  if (!isSupported(file.name)) {
    throw new Error(`Unsupported file type: ${ext}`)
  }

  switch (ext) {
    case ".txt":
    case ".md":
      return readAsText(file)

    case ".docx":
      return parseDocx(file)

    case ".doc":
      try {
        return await parseDocx(file)
      } catch {
        return readAsText(file)
      }

    default:
      throw new Error(`Unsupported file type: ${ext}`)
  }
}
