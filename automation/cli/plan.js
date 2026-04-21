const { runWorkflow } = require("../orchestrator/run-once");

runWorkflow({ stopAfter: "plan" })
  .then((result) => console.log(JSON.stringify({ runId: result.runId, plan: result.plan, logPath: result.logPath }, null, 2)))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
