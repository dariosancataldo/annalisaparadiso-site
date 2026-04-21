const { runWorkflow } = require("../orchestrator/run-once");

runWorkflow()
  .then((result) => console.log(JSON.stringify({
    runId: result.runId,
    draftPath: result.draftWrite?.filePath,
    publisherResult: result.publisherResult,
    logPath: result.logPath,
  }, null, 2)))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
