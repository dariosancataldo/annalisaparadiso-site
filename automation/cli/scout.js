const { runWorkflow } = require("../orchestrator/run-once");

runWorkflow({ stopAfter: "scout" })
  .then((result) => console.log(JSON.stringify({ runId: result.runId, scoutOutput: result.scoutOutput, logPath: result.logPath }, null, 2)))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
