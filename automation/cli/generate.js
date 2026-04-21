const { runWorkflow } = require("../orchestrator/run-once");

runWorkflow({ stopAfter: "generate" })
  .then((result) => console.log(JSON.stringify({ runId: result.runId, draftPath: result.draftWrite.filePath, logPath: result.logPath }, null, 2)))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
