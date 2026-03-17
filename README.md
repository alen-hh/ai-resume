# AI Resume Generator

A Chrome extension built with [Plasmo](https://docs.plasmo.com/) that generates optimized resumes using AI. It reads job descriptions from [BOSS直聘](https://www.zhipin.com) and combines them with your existing resume to produce a tailored version via OpenRouter LLM.

## Features

- **Auto JD extraction**: Detects when you're on a `zhipin.com/job_detail/` page and extracts the job description automatically
- **Resume upload**: Supports `.md`, `.txt`, `.doc`, `.docx` formats
- **AI-powered generation**: Uses OpenRouter API (Gemini 2.0 Flash) to create an optimized resume matching the target JD
- **Streaming output**: Real-time display of the generated resume as it's being written
- **Export options**: Copy to clipboard, download as `.txt` or `.md`

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Setup

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Create a `.env.local` file in the project root with your OpenRouter API key:

```
PLASMO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Get your API key from [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).

3. Start the development server:

```bash
pnpm dev
```

4. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `build/chrome-mv3-dev` directory

### Usage

1. Click the extension icon to open the side panel
2. Navigate to a job posting on `zhipin.com/job_detail/XXX.html`
3. Upload your current resume (MD, TXT, DOC, or DOCX)
4. Click "Generate Resume" to create an optimized version
5. Copy or download the result

## Production Build

```bash
pnpm build
```

The production bundle will be in `build/chrome-mv3-prod`, ready to be zipped and published.

## Project Structure

```
├── sidepanel.tsx              # Main side panel UI
├── background.ts              # Service worker (side panel behavior)
├── components/
│   ├── job-info.tsx           # JD display (favicon, title, content)
│   ├── resume-upload.tsx      # File upload with drag & drop
│   ├── resume-result.tsx      # Generated resume display + actions
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── openrouter.ts          # OpenRouter API client with streaming
│   ├── file-parser.ts         # File parsing (txt, md, docx)
│   ├── resume-prompt.ts       # LLM prompt template
│   └── utils.ts               # Tailwind utilities
└── globals.css                # Tailwind + markdown styles
```

## Tech Stack

- **Framework**: Plasmo (Chrome MV3)
- **UI**: React 18 + Tailwind CSS + shadcn/ui
- **LLM**: OpenRouter API (Gemini 2.0 Flash)
- **File Parsing**: Mammoth (DOCX)
- **Markdown**: Marked (rendering)
