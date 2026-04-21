const agents = require("./agents");
const { writeDraftMarkdown } = require("./draft-writer");
const { assertContentQuality } = require("./content-quality");
const { publishDraftPr } = require("../publishers/github");

async function runContentPipeline({
  runId,
  topic,
  pillar,
  targetType = "drafts",
  logger,
  stopAfter = "",
  extraPublishPaths = [],
  branchLabel = "",
}) {
  const scoutOutput = await agents.scout({ topic, pillar, logger });
  if (stopAfter === "scout") return { scoutOutput };

  const plan = await agents.plan({ topic, pillar, scoutOutput, logger });
  if (stopAfter === "plan") return { scoutOutput, plan };

  const draft = await agents.writeDraft({ plan: { ...plan, target_type: targetType }, logger });
  if (stopAfter === "generate") {
    const draftWrite = writeDraftMarkdown({
      content: draft,
      safetyResult: { outcome: "not_reviewed", required_changes: [] },
      editorNotes: [],
      runId,
      targetType,
    });
    logger.write({ phase: "draft_writer", status: "completed", output: draftWrite });
    return { scoutOutput, plan, draft, draftWrite };
  }

  const safetyResult = await agents.safetyReview({ content: draft, logger });
  if (safetyResult.outcome === "blocked") {
    const draftWrite = writeDraftMarkdown({
      content: { ...draft, status: "review" },
      safetyResult,
      editorNotes: ["Blocked by SafetyAgent."],
      runId,
      targetType,
    });
    logger.write({ phase: "orchestrator", status: "blocked", draftWrite, safetyResult });
    return { scoutOutput, plan, draft, safetyResult, draftWrite, blocked: true };
  }

  if (stopAfter === "review") {
    const draftWrite = writeDraftMarkdown({ content: draft, safetyResult, editorNotes: [], runId, targetType });
    logger.write({ phase: "draft_writer", status: "completed", output: draftWrite });
    return { scoutOutput, plan, draft, safetyResult, draftWrite };
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
    targetType,
  });
  logger.write({ phase: "draft_writer", status: "completed", output: draftWrite });

  if (stopAfter === "draft") {
    return { scoutOutput, plan, draft: finalContent, safetyResult, editorResult, qualityResult, draftWrite };
  }

  const publisherResult = await publishDraftPr({
    content: finalContent,
    safetyResult,
    editorResult,
    draftPath: draftWrite.filePath,
    logPath: logger.logPath,
    logger,
    extraPaths: extraPublishPaths,
    branchLabel,
  });

  return {
    scoutOutput,
    plan,
    draft: finalContent,
    safetyResult,
    editorResult,
    qualityResult,
    draftWrite,
    publisherResult,
  };
}

module.exports = { runContentPipeline };
