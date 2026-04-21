const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { deterministicSafetyCheck } = require("./deterministic-safety");
const {
  validateContentItem,
  validateSafetyResult,
  validateEditorialPlan,
  validateEditorResult,
} = require("./runtime-validation");
const openai = require("../providers/openai");
const demo = require("../providers/demo");

const root = path.resolve(__dirname, "..", "..");
const promptsDir = path.join(root, "agents", "prompts");
const policiesDir = path.join(root, "agents", "policies");

function readPrompt(name) {
  return fs.readFileSync(path.join(promptsDir, `${name}.md`), "utf8");
}

function readPolicies() {
  return fs.readdirSync(policiesDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => `# ${name}\n${fs.readFileSync(path.join(policiesDir, name), "utf8")}`)
    .join("\n\n");
}

async function scout({ topic, pillar, logger }) {
  logger.write({ phase: "ScoutAgent", status: "started", topic, pillar });
  if (config.runMode === "demo") {
    const output = demo.demoScout({ topic, pillar });
    logger.write({ phase: "ScoutAgent", status: "completed", output });
    return output;
  }
  const output = await openai.generateJson({
    schemaName: "topic proposal",
    system: readPrompt("ScoutAgent"),
    user: JSON.stringify({ topic, pillar, language: "it" }),
  });
  logger.write({ phase: "ScoutAgent", status: "completed", output });
  return output;
}

async function plan({ topic, pillar, scoutOutput, logger }) {
  logger.write({ phase: "PlannerAgent", status: "started" });
  if (config.runMode === "demo") {
    const output = validateEditorialPlan(demo.demoPlan({ topic, pillar, scoutOutput }));
    logger.write({ phase: "PlannerAgent", status: "completed", output });
    return output;
  }
  const output = await openai.generateJson({
    schemaName: "editorial plan",
    system: readPrompt("PlannerAgent"),
    user: JSON.stringify({ topic, pillar, scoutOutput, language: "it" }),
  });
  validateEditorialPlan(output);
  logger.write({ phase: "PlannerAgent", status: "completed", output });
  return output;
}

async function writeDraft({ plan, logger }) {
  logger.write({ phase: "WriterAgent", status: "started" });
  if (config.runMode === "demo") {
    const output = validateContentItem(demo.demoDraft({ plan }));
    logger.write({ phase: "WriterAgent", status: "completed", output: { ...output, body: "[omitted]" } });
    return output;
  }
  const output = await openai.generateJson({
    schemaName: "content item",
    system: readPrompt("WriterAgent"),
    user: JSON.stringify({ plan, status_rule: "Use draft or review only. Never published.", language: "it" }),
  });
  validateContentItem(output);
  logger.write({ phase: "WriterAgent", status: "completed", output: { ...output, body: "[omitted]" } });
  return output;
}

async function safetyReview({ content, logger }) {
  logger.write({ phase: "SafetyAgent", status: "started" });
  const deterministicResult = deterministicSafetyCheck(content);
  logger.write({ phase: "SafetyAgent", status: "deterministic_completed", deterministicResult });

  if (deterministicResult.outcome === "blocked") {
    const blocked = validateSafetyResult({
      outcome: "blocked",
      risk_level: deterministicResult.risk_level,
      publication_allowed: false,
      violations: deterministicResult.violations,
      required_changes: deterministicResult.required_changes,
      notes: ["Blocked by deterministic local safety checks before AI review."],
    });
    logger.write({ phase: "SafetyAgent", status: "blocked", output: blocked });
    return blocked;
  }

  if (config.runMode === "demo") {
    const output = validateSafetyResult(demo.demoSafety({ content, deterministicResult }));
    logger.write({ phase: "SafetyAgent", status: "completed", output });
    return output;
  }

  const aiResult = await openai.generateJson({
    schemaName: "safety review result",
    system: `${readPrompt("SafetyAgent")}\n\n${readPolicies()}`,
    user: JSON.stringify({ content, deterministicResult, language: "it" }),
  });
  const merged = validateSafetyResult({
    ...aiResult,
    publication_allowed: false,
    violations: [...deterministicResult.violations, ...(aiResult.violations || [])],
    required_changes: [...deterministicResult.required_changes, ...(aiResult.required_changes || [])],
  });
  logger.write({ phase: "SafetyAgent", status: "completed", output: merged });
  return merged;
}

async function editorReview({ content, safetyResult, logger }) {
  logger.write({ phase: "EditorAgent", status: "started" });
  if (safetyResult.outcome === "blocked") {
    throw new Error("EditorAgent skipped because SafetyAgent blocked the content");
  }
  if (config.runMode === "demo") {
    const output = validateEditorResult(demo.demoEditor({ content, safetyResult }));
    logger.write({ phase: "EditorAgent", status: "completed", output: { ...output, content: { ...output.content, body: "[omitted]" } } });
    return output;
  }
  const output = await openai.generateJson({
    schemaName: "editor review result",
    system: readPrompt("EditorAgent"),
    user: JSON.stringify({ content, safetyResult, language: "it" }),
  });
  validateEditorResult(output);
  logger.write({ phase: "EditorAgent", status: "completed", output: { ...output, content: { ...output.content, body: "[omitted]" } } });
  return output;
}

module.exports = { scout, plan, writeDraft, safetyReview, editorReview };
