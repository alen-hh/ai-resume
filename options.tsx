import "~globals.css"

import { Check, ExternalLink, Eye, EyeOff, KeyRound } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "~components/ui/button"
import { Input } from "~components/ui/input"
import { Label } from "~components/ui/label"
import { Separator } from "~components/ui/separator"
import { getApiKey, setApiKey } from "~lib/storage"

const Options = () => {
  const [key, setKey] = useState("")
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    getApiKey().then((k) => {
      if (k) setKey(k)
    })
  }, [])

  const handleSave = async () => {
    await setApiKey(key.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background px-6 py-10">
      <div className="flex items-center gap-2">
        <KeyRound className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">OpenRouter API Key</Label>
          <p className="text-sm text-muted-foreground">
            Used to call LLM for resume generation.{" "}
            <a
              href="https://openrouter.ai/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
              Get your key
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <Button onClick={handleSave} disabled={!key.trim()}>
            {saved ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Saved
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Options
