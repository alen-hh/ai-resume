import "~globals.css"

import { AlertCircle, FileText, Loader2, Settings, Sparkles } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { JobInfo } from "~components/job-info"
import { ResumeResult } from "~components/resume-result"
import { ResumeUpload } from "~components/resume-upload"
import { Badge } from "~components/ui/badge"
import { Button } from "~components/ui/button"
import { Separator } from "~components/ui/separator"
import { streamChatCompletion } from "~lib/openrouter"
import { type JobPlatform, JOB_PLATFORMS, matchPlatform } from "~lib/platforms"
import { getApiKey } from "~lib/storage"
import { buildUserMessage, SYSTEM_PROMPT } from "~lib/resume-prompt"

interface TabInfo {
  title: string
  favIconUrl: string
  url: string
}

interface JobData {
  tabInfo: TabInfo
  jobDesc: string
  platform: JobPlatform
}

function useActiveTabJob() {
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchJobFromTab = useCallback(async (tab: chrome.tabs.Tab) => {
    const platform = tab.url ? matchPlatform(tab.url) : null
    if (!platform) {
      setJobData(null)
      return
    }

    const tabInfo: TabInfo = {
      title: tab.title ?? "Unknown",
      favIconUrl: tab.favIconUrl ?? "",
      url: tab.url!
    }

    setLoading(true)
    try {
      const selectors = platform.selectors
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: (sels: string[]) => {
          return sels
            .map((s) => (document.querySelector(s) as HTMLElement)?.innerText ?? "")
            .filter(Boolean)
            .join("\n\n")
        },
        args: [selectors]
      })
      const text = results?.[0]?.result ?? ""
      setJobData({ tabInfo, jobDesc: text, platform })
    } catch {
      setJobData({ tabInfo, jobDesc: "", platform })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]) fetchJobFromTab(tabs[0])
    })

    const onActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      chrome.tabs.get(activeInfo.tabId).then(fetchJobFromTab)
    }

    const onUpdated = (
      _tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
    ) => {
      if (changeInfo.status === "complete") {
        chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
          if (tabs[0]?.id === tab.id) fetchJobFromTab(tab)
        })
      }
    }

    chrome.tabs.onActivated.addListener(onActivated)
    chrome.tabs.onUpdated.addListener(onUpdated)

    return () => {
      chrome.tabs.onActivated.removeListener(onActivated)
      chrome.tabs.onUpdated.removeListener(onUpdated)
    }
  }, [fetchJobFromTab])

  return { jobData, loading }
}

const SidePanel = () => {
  const { jobData, loading: jobLoading } = useActiveTabJob()
  const [curResume, setCurResume] = useState("")
  const [generatedResume, setGeneratedResume] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    getApiKey().then((k) => setHasApiKey(!!k))
    const onChange = () => getApiKey().then((k) => setHasApiKey(!!k))
    chrome.storage.onChanged.addListener(onChange)
    return () => chrome.storage.onChanged.removeListener(onChange)
  }, [])

  const canGenerate =
    !!jobData?.jobDesc && !!curResume && !isStreaming && !jobLoading && hasApiKey

  const handleGenerate = async () => {
    if (!canGenerate || !jobData) return

    setError(null)
    setGeneratedResume("")
    setIsStreaming(true)

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      await streamChatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(jobData.jobDesc, curResume) }
        ],
        (delta) => {
          setGeneratedResume((prev) => prev + delta)
        },
        { signal: abortController.signal }
      )
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Generation failed, please try again")
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 px-4 py-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="flex-1 text-base font-semibold">AI Resume Generator</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => chrome.runtime.openOptionsPage()}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        {/* Info Banner */}
        <div className="rounded-md border p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Visit a job posting, upload your resume, and get a{" "}
            <span className="font-medium text-foreground">tailored version</span>{" "}
            optimized for that role.
          </p>
        </div>

        {!hasApiKey && (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            <p className="flex-1 text-xs text-amber-700">
              Set your OpenRouter API Key to enable AI generation.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 shrink-0 text-xs"
              onClick={() => chrome.runtime.openOptionsPage()}>
              <Settings className="mr-1.5 h-3 w-3" />
              Settings
            </Button>
          </div>
        )}
        {/* Job Description Section */}
        {jobLoading ? (
          <div className="flex items-center gap-2 rounded-md border p-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Fetching page content...
            </span>
          </div>
        ) : jobData ? (
          <JobInfo
            title={jobData.tabInfo.title}
            favIconUrl={jobData.tabInfo.favIconUrl}
            url={jobData.tabInfo.url}
            jobDesc={jobData.jobDesc}
          />
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please visit a job posting on a supported platform
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {JOB_PLATFORMS.map((p) => (
                <Badge key={p.name} variant="outline">
                  {p.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Resume Upload Section */}
        <ResumeUpload onParsed={setCurResume} disabled={isStreaming} />

        <Separator />

        {/* Generate Button */}
        <div className="flex gap-2">
          {isStreaming ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleStop}>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Stop
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={!canGenerate}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Resume
            </Button>
          )}
        </div>

        {!canGenerate && !isStreaming && (jobData || curResume) && (
          <p className="text-center text-xs text-muted-foreground">
            {!jobData?.jobDesc
              ? "Please visit a job detail page first"
              : !curResume
                ? "Please upload your resume first"
                : ""}
          </p>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Result Section */}
        <ResumeResult
          content={generatedResume}
          isStreaming={isStreaming}
          jobUrl={jobData?.tabInfo.url}
          jobTitle={jobData?.tabInfo.title}
        />
      </main>
    </div>
  )
}

export default SidePanel
