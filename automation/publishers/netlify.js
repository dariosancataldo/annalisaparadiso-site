const { config } = require("../orchestrator/config");

async function triggerBuildHook({ logger }) {
  if (!config.allowNetlifyBuildHook) {
    const output = { triggered: false, reason: "AI_ALLOW_NETLIFY_BUILD_HOOK is not true" };
    logger?.write({ phase: "NetlifyPublisher", status: "skipped", output });
    return output;
  }
  if (!config.netlifyBuildHookUrl) {
    throw new Error("NETLIFY_BUILD_HOOK_URL is required to trigger Netlify build hook");
  }
  if (config.dryRun) {
    const output = { triggered: false, dry_run: true };
    logger?.write({ phase: "NetlifyPublisher", status: "dry_run_completed", output });
    return output;
  }

  const response = await fetch(config.netlifyBuildHookUrl, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Netlify build hook failed (${response.status})`);
  }
  const output = { triggered: true };
  logger?.write({ phase: "NetlifyPublisher", status: "completed", output });
  return output;
}

module.exports = { triggerBuildHook };
