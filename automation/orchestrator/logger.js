const fs = require("fs");
const path = require("path");

const logsDir = path.resolve(__dirname, "..", "..", "logs");

function logEvent(event) {
  fs.mkdirSync(logsDir, { recursive: true });
  const payload = {
    timestamp: new Date().toISOString(),
    ...event,
  };
  fs.appendFileSync(path.join(logsDir, "orchestrator.jsonl"), `${JSON.stringify(payload)}\n`);
  if (process.env.LOG_LEVEL !== "silent") {
    console.log(JSON.stringify(payload));
  }
}

module.exports = { logEvent };
