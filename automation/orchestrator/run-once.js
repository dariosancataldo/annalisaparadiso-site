const { config } = require("./config");
const { createRunLogger } = require("./editorial-logger");
const { runPreflight } = require("./preflight");
const { runContentPipeline } = require("./content-runner");

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

    const result = await runContentPipeline({
      runId,
      logger,
      topic,
      pillar,
      targetType: options.targetType || "drafts",
      stopAfter,
    });

    logger.write({ phase: "orchestrator", status: "completed", publisherResult: result.publisherResult || null });
    return {
      runId,
      ...result,
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
