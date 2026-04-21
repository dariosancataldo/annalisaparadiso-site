const { config } = require("./config");
const { createRunLogger } = require("./editorial-logger");
const agents = require("./agents");
const { writeDraftMarkdown } = require("./draft-writer");
const { assertContentQuality } = require("./content-quality");
const { runPreflight } = require("./preflight");
const { publishDraftPr } = require("../publishers/github");

function makeRunId() {
  return `ai-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

async function runWorkflow(options = {}) {
  const runId = options.runId || makeRunId();
  const logger = createRunLogger(runId);
  const topic = options.topic || config.topic || "Primo colloquio psicologico: cosa aspettarsi";
  const pillar = options.pillar || config.pillar || "primo colloquio";
  const stopAfter = options.stopAfter || process.env.AI_STOP_AFTER || "";

  logger.write({
    phase: "orchestrator",
    status: "started",
    config: {
      provider: config.provider,
      model: config.model,
      runMode: config.runMode,
      dryRun: config.dryRun,
      githubPushEnabled: config.github.allowPush,
      netlifyHookEnabled: config.allowNetlifyBuildHook,
      githubApiBaseUrl: config.github.apiBaseUrl,
      netlifyBuildHookConfigured: Boolean(config.netlifyBuildHookUrl),
    },
    topic,
    pillar,
  });

  try {
    if (config.runMode !== "demo" || config.dryRun === false || config.github.allowPush) {
      const preflight = await runPreflight();
      logger.write({ phase: "preflight", status: preflight.passed ? "completed" : "failed", output: preflight });
      if (!preflight.passed) {
        throw new Error(`Preflight failed: ${preflight.errors.join(" | ")}`);
      }
    }

    const scoutOutput = await agents.scout({ topic, pillar, logger });
    if (stopAfter === "scout") return { runId, scoutOutput, logPath: logger.logPath };

    const plan = await agents.plan({ topic, pillar, scoutOutput, logger });
    if (stopAfter === "plan") return { runId, scoutOutput, plan, logPath: logger.logPath };

    const draft = await agents.writeDraft({ plan, logger });
    if (stopAfter === "generate") {
      const draftWrite = writeDraftMarkdown({ content: draft, safetyResult: { outcome: "not_reviewed", required_changes: [] }, editorNotes: [], runId });
      logger.write({ phase: "draft_writer", status: "completed", output: draftWrite });
      return { runId, scoutOutput, plan, draft, draftWrite, logPath: logger.logPath };
    }

    const safetyResult = await agents.safetyReview({ content: draft, logger });
    if (safetyResult.outcome === "blocked") {
      const draftWrite = writeDraftMarkdown({ content: { ...draft, status: "review" }, safetyResult, editorNotes: ["Blocked by SafetyAgent."], runId });
      logger.write({ phase: "orchestrator", status: "blocked", draftWrite, safetyResult });
      return { runId, scoutOutput, plan, draft, safetyResult, draftWrite, blocked: true, logPath: logger.logPath };
    }
    if (stopAfter === "review") {
      const draftWrite = writeDraftMarkdown({ content: draft, safetyResult, editorNotes: [], runId });
      logger.write({ phase: "draft_writer", status: "completed", output: draftWrite });
      return { runId, scoutOutput, plan, draft, safetyResult, draftWrite, logPath: logger.logPath };
    }

    const editorResult = await agents.editorReview({ content: draft, safetyResult, logger });
    const finalContent = {
      ...editorResult.content,
      status: editorResult.content.status === "published" ? "review" : editorResult.content.status,
      risk_level: safetyResult.risk_level || editorResult.content.risk_level,
    };
    const qualityResult = assertContentQuality(finalContent);
    logger.write({ phase: "content_quality", status: "completed", output: qualityResult });
    const draftWrite = writeDraftMarkdown({
      content: finalContent,
      safetyResult,
      editorNotes: editorResult.notes,
      runId,
    });
    logger.write({ phase: "draft_writer", status: "completed", output: draftWrite });

    if (stopAfter === "draft") {
      return { runId, scoutOutput, plan, draft: finalContent, safetyResult, editorResult, draftWrite, logPath: logger.logPath };
    }

    const publisherResult = await publishDraftPr({
      content: finalContent,
      safetyResult,
      editorResult,
      draftPath: draftWrite.filePath,
      logPath: logger.logPath,
      logger,
    });

    logger.write({ phase: "orchestrator", status: "completed", publisherResult });
    return {
      runId,
      scoutOutput,
      plan,
      draft: finalContent,
      safetyResult,
      editorResult,
      qualityResult,
      draftWrite,
      publisherResult,
      logPath: logger.logPath,
    };
  } catch (error) {
    logger.write({ phase: "orchestrator", status: "failed", error: error.message, stack: error.stack });
    throw error;
  }
}

if (require.main === module) {
  runWorkflow()
    .then((result) => {
      console.log(JSON.stringify({
        runId: result.runId,
        logPath: result.logPath,
        draftPath: result.draftWrite?.filePath,
        publisherResult: result.publisherResult || null,
        blocked: Boolean(result.blocked),
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { runWorkflow };
