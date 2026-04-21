const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { logEvent } = require("./logger");

const root = path.resolve(__dirname, "..", "..");
const promptsDir = path.join(root, "agents", "prompts");
const policiesDir = path.join(root, "agents", "policies");

const agents = [
  "ScoutAgent",
  "PlannerAgent",
  "WriterAgent",
  "SafetyAgent",
  "EditorAgent",
  "PublisherAgent",
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function loadAgent(agent) {
  return {
    name: agent,
    prompt: readText(path.join(promptsDir, `${agent}.md`)),
  };
}

function loadPolicies() {
  return fs.readdirSync(policiesDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => ({
      name,
      body: readText(path.join(policiesDir, name)),
    }));
}

async function run() {
  logEvent({ level: "info", message: "orchestrator_started", config: { ...config, netlifyBuildHookUrl: Boolean(config.netlifyBuildHookUrl) } });

  const context = {
    agents: agents.map(loadAgent),
    policies: loadPolicies(),
    status: "ready",
    note: "Production-safe orchestrator ready. Use npm run ai:run for a safe dry-run workflow or enable GitHub draft PR creation with explicit env flags.",
  };

  logEvent({ level: "info", message: "agents_loaded", agents });
  console.log(JSON.stringify(context, null, 2));
}

run().catch((error) => {
  logEvent({ level: "error", message: "orchestrator_failed", error: error.message });
  process.exit(1);
});
