const { execFileSync } = require("child_process");
const path = require("path");
const { config } = require("../orchestrator/config");
const { ROOT } = require("../../scripts/content-utils");

function runGit(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function relative(filePath) {
  return path.relative(ROOT, filePath);
}

function prBody({ content, safetyResult, editorResult, draftPath, logPath, dryRun }) {
  return [
    "## Bozza contenuto AI",
    "",
    `- Titolo: ${content.title}`,
    `- Slug: ${content.slug}`,
    `- Categoria: ${content.category}`,
    `- Status: ${content.status}`,
    `- Risk level: ${content.risk_level}`,
    `- Safety outcome: ${safetyResult.outcome}`,
    `- File bozza: \`${relative(draftPath)}\``,
    `- Log run: \`${relative(logPath)}\``,
    `- Dry run: ${dryRun ? "si" : "no"}`,
    "",
    "## SafetyAgent",
    "",
    `Violazioni: ${(safetyResult.violations || []).length}`,
    "",
    ...(safetyResult.required_changes || []).map((item) => `- ${item}`),
    "",
    "## EditorAgent",
    "",
    ...(editorResult.notes || []).map((item) => `- ${item}`),
    "",
    "## Checklist revisione umana",
    "",
    "- [ ] Il contenuto non formula diagnosi.",
    "- [ ] Il contenuto non prescrive trattamenti o farmaci.",
    "- [ ] Il contenuto non promette guarigione o risultati certi.",
    "- [ ] Il tono e coerente con il sito.",
    "- [ ] SEO title e description sono naturali e non manipolativi.",
    "- [ ] Il contenuto resta draft/review fino ad approvazione clinica.",
    "- [ ] Nessun deploy Netlify e stato triggerato da questa run.",
  ].join("\n");
}

async function createDraftPullRequest({ title, body, branch }) {
  const { owner, repo, token, apiBaseUrl, branch: baseBranch } = config.github;
  if (!owner || !repo || !token) {
    throw new Error("GITHUB_OWNER, GITHUB_REPO and GITHUB_TOKEN are required to create a draft PR");
  }

  const response = await fetch(`${apiBaseUrl}/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      head: branch,
      base: baseBranch,
      body,
      draft: true,
      maintainer_can_modify: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub draft PR failed (${response.status}): ${text}`);
  }
  return response.json();
}

async function publishDraftPr({ content, safetyResult, editorResult, draftPath, logPath, logger }) {
  const slug = content.slug;
  const date = new Date().toISOString().slice(0, 10);
  const branch = `ai-content/${date}-${slug}`;
  const title = `Bozza AI: ${content.title}`;
  const body = prBody({ content, safetyResult, editorResult, draftPath, logPath, dryRun: config.dryRun });

  if (config.dryRun || !config.github.allowPush) {
    const simulated = {
      dry_run: true,
      branch,
      commit_message: `Add AI draft: ${content.title}`,
      pr_title: title,
      pr_body: body,
      note: "No branch, commit, push or PR was created because DRY_RUN is true or AI_ALLOW_GITHUB_PUSH is not true.",
    };
    logger.write({ phase: "PublisherAgent", status: "dry_run_completed", output: simulated });
    return simulated;
  }

  if (safetyResult.outcome === "blocked") {
    throw new Error("PublisherAgent refused to publish because SafetyAgent blocked the content");
  }
  if (content.risk_level === "high") {
    throw new Error("PublisherAgent refused to create PR for high-risk content without manual intervention");
  }

  logger.write({ phase: "PublisherAgent", status: "branch_start", branch });
  runGit(["checkout", "-B", branch, config.github.branch]);
  runGit(["add", relative(draftPath), relative(logPath)]);
  runGit(["commit", "-m", `Add AI draft: ${content.title}`]);
  runGit(["push", "-u", "origin", branch]);
  const pr = await createDraftPullRequest({ title, body, branch });
  const output = { branch, pr_url: pr.html_url, pr_number: pr.number, draft: true };
  logger.write({ phase: "PublisherAgent", status: "completed", output });
  return output;
}

module.exports = { publishDraftPr, prBody };
