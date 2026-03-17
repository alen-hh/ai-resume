import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface JobInfoProps {
  title: string
  favIconUrl: string
  url: string
  jobDesc: string
}

export function JobInfo({ title, favIconUrl, url }: JobInfoProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="shrink-0 text-xs">
          JD
        </Badge>
        <span className="text-sm font-medium text-muted-foreground">
          Current Page
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-md border bg-card p-2.5">
        {favIconUrl && (
          <img
            src={favIconUrl}
            alt=""
            className="h-5 w-5 shrink-0 rounded"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {title}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-muted-foreground hover:text-foreground">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
