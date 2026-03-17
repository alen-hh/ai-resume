export interface JobPlatform {
  name: string
  pattern: RegExp
  selectors: string[]
}

export const JOB_PLATFORMS: JobPlatform[] = [
  // Global / International
  {
    name: "Indeed",
    pattern: /^https:\/\/[a-z]{2}\.indeed\.com\/jobs\?/,
    selectors: [".jobsearch-JobComponent"]
  },
  {
    name: "Upwork",
    pattern: /^https:\/\/www\.upwork\.com\/freelance-jobs\/apply\/.+/,
    selectors: ["body"]
  },
  {
    name: "ZipRecruiter",
    pattern: /^https:\/\/www\.ziprecruiter\.[a-z.]+\/jobs\/.+/,
    selectors: [
      "#main > div.page-content.u-pt--remove--mobile > div > div > div.col-md-9 > div.panel.panel-default.panel-expand > div.panel-body"
    ]
  },
  // China
  {
    name: "BOSS Zhipin",
    pattern: /^https:\/\/www\.zhipin\.com\/job_detail\/.*\.html/,
    selectors: ["body"]
  },
  {
    name: "Zhaopin",
    pattern: /^https:\/\/www\.zhaopin\.com\/jobdetail\/[^/]+\.htm/,
    selectors: ["body"]
  },
  {
    name: "51job",
    pattern: /^https:\/\/jobs\.51job\.com\/[^/]+\/\d+\.html/,
    selectors: ["body"]
  },
  {
    name: "Liepin",
    pattern: /^https:\/\/www\.liepin\.com\/job\/\d+\.shtml/,
    selectors: ["body"]
  },
  {
    name: "Lagou",
    pattern: /^https:\/\/www\.lagou\.com\/wn\/jobs\/\d+\.html/,
    selectors: ["body"]
  },
  {
    name: "Yupao",
    pattern: /^https:\/\/www\.yupao\.com\/zhaogong\/\d+\.html/,
    selectors: ["body"]
  }
]

export function matchPlatform(url: string): JobPlatform | null {
  return JOB_PLATFORMS.find((p) => p.pattern.test(url)) ?? null
}
