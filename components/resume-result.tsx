import { Check, Copy, Download } from "lucide-react"
import { marked } from "marked"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface ResumeResultProps {
  content: string
  isStreaming: boolean
  jobUrl?: string
  jobTitle?: string
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim().slice(0, 100) || "resume"
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function ResumeResult({
  content,
  isStreaming,
  jobUrl,
  jobTitle
}: ResumeResultProps) {
  const [copied, setCopied] = useState(false)

  const renderedHtml = useMemo(() => {
    if (!content) return ""
    return marked.parse(content, { async: false }) as string
  }, [content])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buildDownloadContent = (raw: string): string => {
    if (!jobUrl) return raw
    return `Target JD: ${jobUrl}\n\n${raw}`
  }

  const filename = sanitizeFilename(jobTitle ?? "resume")

  if (!content && !isStreaming) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="shrink-0 text-xs">
            Result
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            {isStreaming ? "Generating..." : "Complete"}
          </span>
        </div>

        {content && !isStreaming && (
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? "Copied" : "Copy"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      downloadFile(
                        buildDownloadContent(content),
                        `${filename}.txt`,
                        "text/plain"
                      )
                    }>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download TXT</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      downloadFile(
                        buildDownloadContent(content),
                        `${filename}.md`,
                        "text/markdown"
                      )
                    }>
                    <Download className="mr-1 h-3.5 w-3.5" />
                    MD
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Markdown</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>

      <Separator />

      <ScrollArea className="h-[400px] rounded-md border bg-card p-4">
        <article
          className="prose prose-sm prose-zinc max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
        {isStreaming && (
          <span className="inline-block h-4 w-1 animate-pulse bg-primary" />
        )}
      </ScrollArea>
    </div>
  )
}
