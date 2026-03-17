import { FileText, Upload, X } from "lucide-react"
import { useCallback, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ACCEPT_STRING, getFileExtension, isSupported, parseFile } from "@/lib/file-parser"

interface ResumeUploadProps {
  onParsed: (text: string) => void
  disabled?: boolean
}

export function ResumeUpload({ onParsed, disabled }: ResumeUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!isSupported(file.name)) {
        setError(`Unsupported format: ${getFileExtension(file.name)}`)
        return
      }

      setError(null)
      setParsing(true)
      setFileName(file.name)

      try {
        const text = await parseFile(file)
        if (!text.trim()) {
          throw new Error("File content is empty")
        }
        onParsed(text)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file")
        setFileName(null)
        onParsed("")
      } finally {
        setParsing(false)
      }
    },
    [onParsed]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleClear = () => {
    setFileName(null)
    setError(null)
    onParsed("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="shrink-0 text-xs">
          Resume
        </Badge>
        <span className="text-sm font-medium text-muted-foreground">
          Upload your resume
        </span>
      </div>

      {fileName ? (
        <div className="flex items-center gap-2 rounded-md border bg-card p-2.5">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm">{fileName}</span>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {getFileExtension(fileName).slice(1).toUpperCase()}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleClear}
            disabled={disabled}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}>
          <Upload className="h-6 w-6 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {parsing ? "Parsing..." : "Click or drag to upload"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Supports MD, TXT, DOC, DOCX
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  )
}
