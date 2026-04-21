const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { createRunLogger } = require("./editorial-logger");
const { runPreflight } = require("./preflight");
const { runContentPipeline } = require("./content-runner");
const { ROOT, ensureDir } = require("../../scripts/content-utils");
const { commitFilesToBranch } = require("../publishers/github");

const pillars = [
  "ansia e attacchi di panico",
  "depressione",
  "dipendenza affettiva",
  "autostima e critica interiore",
  "lutto e perdita",
  "psicoterapia psicoanalitica",
  "primo colloquio",
  "terapia online",
  "relazioni",
];

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

function makeWeeklyRunId() {
  return `weekly-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

function clampVolume() {
  const maxTotal = Math.max(1, config.weekly.maxTotal || 3);
  let articles = Math.max(0, config.weekly.articles || 0);
  let news = Math.max(0, config.weekly.news || 0);

  while (articles + news > maxTotal) {
    if (articles >= news && articles > 0) articles -= 1;
    else if (news > 0) news -= 1;
    else break;
  }

  return { articles, news, maxTotal, total: articles + news };
}

function readRecentPillars(limit = 8) {
  const dir = path.join(ROOT, "logs", "editorial");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => /^weekly-\d{4}-\d{2}-\d{2}-summary\.json$/.test(name))
    .sort()
    .reverse()
    .slice(0, limit)
    .flatMap((name) => {
      try {
        const summary = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
        return (summary.items || []).map((item) => item.pillar || item.category).filter(Boolean);
      } catch (error) {
        return [];
      }
    });
}

function choosePillars(count) {
  const recent = readRecentPillars();
  const scored = pillars.map((pillar) => ({
    pillar,
    score: recent.filter((item) => item === pillar).length,
  }));
  scored.sort((a, b) => a.score - b.score || pillars.indexOf(a.pillar) - pillars.indexOf(b.pillar));
  return scored.slice(0, count).map((item) => item.pillar);
}

function topicFor({ type, pillar }) {
  if (type === "news") {
    return `Nota breve e utile per lo studio sul tema ${pillar}`;
  }
  return `Approfondimento people-first sul tema ${pillar}`;
}

function makeTasks() {
  const volume = clampVolume();
  const chosen = choosePillars(volume.total);
  const tasks = [];
  let index = 0;

  for (let i = 0; i < volume.articles; i += 1) {
    const pillar = chosen[index] || pillars[index % pillars.length];
    tasks.push({
      type: "approfondimento",
      targetType: "approfondimenti",
      pillar,
      topic: topicFor({ type: "approfondimento", pillar }),
    });
    index += 1;
  }

  for (let i = 0; i < volume.news; i += 1) {
    const pillar = chosen[index] || pillars[index % pillars.length];
    tasks.push({
      type: "news",
      targetType: "news",
      pillar,
      topic: topicFor({ type: "news", pillar }),
    });
    index += 1;
  }

  return { volume, tasks };
}

function editorOutcome(editorResult, safetyResult) {
  if (!editorResult) return "not_run";
  if (safetyResult?.outcome === "needs_revision") return "needs_revision";
  if ((editorResult.notes || []).some((note) => /revision|rived/i.test(note))) return "needs_revision";
  return "approved";
}

function summaryItem({ task, result }) {
  return {
    title: result.draft?.title || "",
    slug: result.draft?.slug || result.draftWrite?.slug || "",
    type: task.type,
    category: result.draft?.category || "",
    pillar: task.pillar,
    risk_level: result.safetyResult?.risk_level || result.draft?.risk_level || "",
    safety_outcome: result.safetyResult?.outcome || "not_reviewed",
    editor_outcome: editorOutcome(result.editorResult, result.safetyResult),
    pr_url: result.publisherResult?.pr_url || "",
    branch_name: result.publisherResult?.branch || "",
    draft_path: result.draftWrite?.filePath ? path.relative(ROOT, result.draftWrite.filePath) : "",
    log_path: result.logPath ? path.relative(ROOT, result.logPath) : "",
    blocked: Boolean(result.blocked),
  };
}

function writeSummary(summary) {
  const dir = path.join(ROOT, "logs", "editorial");
  ensureDir(dir);
  const summaryPath = path.join(dir, `weekly-${isoDate()}-summary.json`);
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  return summaryPath;
}

async function runWeeklyWorkflow() {
  if (!config.weekly.enabled && config.profile !== "weekly-draft-pr") {
    throw new Error("Weekly workflow disabled. Set AI_WEEKLY_SCHEDULE_ENABLED=true and AI_PROFILE=weekly-draft-pr.");
  }
  if (config.allowNetlifyBuildHook) {
    throw new Error("Weekly workflow refuses AI_ALLOW_NETLIFY_BUILD_HOOK=true. Netlify deploy must remain manual.");
  }

  const runId = makeWeeklyRunId();
  const logger = createRunLogger(runId);
  const { volume, tasks } = makeTasks();

  console.log(`[ai:weekly] start run=${runId}`);
  console.log(`[ai:weekly] planned articles=${volume.articles} news=${volume.news} total=${volume.total} max=${volume.maxTotal}`);

  logger.write({
    phase: "weekly_orchestrator",
    status: "started",
    profile: config.profile,
    runMode: config.runMode,
    dryRun: config.dryRun,
    githubPushEnabled: config.github.allowPush,
    netlifyHookEnabled: config.allowNetlifyBuildHook,
    volume,
    tasks,
  });

  const preflight = await runPreflight();
  logger.write({ phase: "weekly_preflight", status: preflight.passed ? "completed" : "failed", output: preflight });
  if (!preflight.passed) {
    throw new Error(`Weekly preflight failed: ${preflight.errors.join(" | ")}`);
  }

  const summary = {
    run_id: runId,
    date: isoDate(),
    profile: config.profile,
    dry_run: config.dryRun,
    github_push_enabled: config.github.allowPush,
    netlify_hook_enabled: config.allowNetlifyBuildHook,
    requested: {
      articles: config.weekly.articles,
      news: config.weekly.news,
      max_total: config.weekly.maxTotal,
    },
    planned: volume,
    items: [],
    notes: [
      "AI pipeline stops at draft PR. Human review decides merge and publication.",
      "No automatic merge and no Netlify build hook are allowed in weekly mode.",
    ],
  };

  const summaryPath = writeSummary(summary);
  logger.write({ phase: "weekly_summary", status: "initialized", summaryPath });
  console.log(`[ai:weekly] summary initialized ${path.relative(ROOT, summaryPath)}`);

  for (const [taskIndex, task] of tasks.entries()) {
    try {
      const result = await runContentPipeline({
        runId,
        topic: task.topic,
        pillar: task.pillar,
        targetType: task.targetType,
        logger,
        extraPublishPaths: [summaryPath],
        branchLabel: `${task.type}-${taskIndex + 1}`,
      });
      const item = summaryItem({ task, result: { ...result, logPath: logger.logPath } });
      summary.items.push(item);
      writeSummary(summary);
      logger.write({ phase: "weekly_item", status: "completed", item });
      console.log(`[ai:weekly] item completed type=${item.type} risk=${item.risk_level} safety=${item.safety_outcome} branch=${item.branch_name || "none"} pr=${item.pr_url || "dry-run/none"}`);
    } catch (error) {
      const item = {
        title: task.topic,
        slug: "",
        type: task.type,
        category: "",
        pillar: task.pillar,
        risk_level: "",
        safety_outcome: "failed",
        editor_outcome: "not_run",
        pr_url: "",
        branch_name: "",
        blocked: true,
        error: error.message,
      };
      summary.items.push(item);
      writeSummary(summary);
      logger.write({ phase: "weekly_item", status: "failed", task, error: error.message, stack: error.stack });
      console.error(`[ai:weekly] item failed type=${task.type} pillar=${task.pillar}: ${error.message}`);
    }
  }

  for (const item of summary.items.filter((entry) => entry.branch_name && !entry.blocked)) {
    commitFilesToBranch({
      branch: item.branch_name,
      filePaths: [summaryPath],
      message: `Update weekly summary: ${summary.date}`,
      logger,
    });
  }

  if (!config.dryRun && config.github.allowPush) {
    try {
      const { execFileSync } = require("child_process");
      execFileSync("git", ["checkout", config.github.branch], { cwd: ROOT, encoding: "utf8" });
    } catch (error) {
      logger.write({ phase: "weekly_orchestrator", status: "base_checkout_failed", error: error.message });
    }
  }

  logger.write({ phase: "weekly_orchestrator", status: "completed", summaryPath, items: summary.items.length });
  const createdPrs = summary.items.filter((item) => item.pr_url).length;
  const blocked = summary.items.filter((item) => item.blocked).length;
  console.log(`[ai:weekly] completed generated=${summary.items.length} draft_prs=${createdPrs} blocked_or_failed=${blocked}`);
  console.log(`[ai:weekly] summary ${path.relative(ROOT, summaryPath)}`);
  return { runId, logPath: logger.logPath, summaryPath, summary };
}

if (require.main === module) {
  runWeeklyWorkflow()
    .then((result) => {
      console.log(JSON.stringify({
        runId: result.runId,
        logPath: result.logPath,
        summaryPath: result.summaryPath,
        items: result.summary.items,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { runWeeklyWorkflow, makeTasks, clampVolume };
