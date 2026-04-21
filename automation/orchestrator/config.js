const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const config = {
  provider: process.env.AI_PROVIDER || "openai",
  model: process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-5.4",
  runMode: process.env.AI_RUN_MODE || "demo",
  profile: process.env.AI_PROFILE || "",
  dryRun: process.env.DRY_RUN !== "false",
  topic: process.env.AI_CONTENT_TOPIC || "",
  pillar: process.env.AI_CONTENT_PILLAR || "",
  maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS || 3500),
  temperature: Number(process.env.AI_TEMPERATURE || 0.3),
  siteUrl: process.env.SITE_URL || "",
  contentBaseUrl: process.env.CONTENT_BASE_URL || "",
  github: {
    owner: process.env.GITHUB_OWNER || "",
    repo: process.env.GITHUB_REPO || "",
    branch: process.env.GITHUB_BRANCH || "main",
    token: process.env.GITHUB_TOKEN || "",
    apiBaseUrl: process.env.GITHUB_API_BASE_URL || "https://api.github.com",
    allowPush: process.env.AI_ALLOW_GITHUB_PUSH === "true",
  },
  netlifyBuildHookUrl: process.env.NETLIFY_BUILD_HOOK_URL || "",
  allowNetlifyBuildHook: process.env.AI_ALLOW_NETLIFY_BUILD_HOOK === "true",
  maxPublishRiskLevel: process.env.MAX_PUBLISH_RISK_LEVEL || "low",
  weekly: {
    enabled: process.env.AI_WEEKLY_SCHEDULE_ENABLED === "true",
    articles: Number(process.env.AI_WEEKLY_ARTICLES || 1),
    news: Number(process.env.AI_WEEKLY_NEWS || 1),
    maxTotal: Number(process.env.AI_WEEKLY_MAX_TOTAL || 3),
  },
};

module.exports = { config };
