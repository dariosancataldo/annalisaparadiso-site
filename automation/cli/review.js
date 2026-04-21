const { runWorkflow } = require("../orchestrator/run-once");

runWorkflow({ stopAfter: "review" })
  .then((result) => console.log(JSON.stringify({
    runId: result.runId,
    safetyOutcome: result.safetyResult.outcome,
    draftPath: result.draftWrite.filePath,
    logPath: result.logPath,
  }, null, 2)))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
