const { runPreflight } = require("../orchestrator/preflight");

runPreflight()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exit(1);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
