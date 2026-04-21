const fs = require("fs");
const path = require("path");
const { ROOT, ensureDir } = require("../../scripts/content-utils");

const editorialLogsDir = path.join(ROOT, "logs", "editorial");

function createRunLogger(runId) {
  ensureDir(editorialLogsDir);
  const logPath = path.join(editorialLogsDir, `${runId}.jsonl`);
  const events = [];

  function write(event) {
    const payload = {
      timestamp: new Date().toISOString(),
      run_id: runId,
      ...event,
    };
    events.push(payload);
    fs.appendFileSync(logPath, `${JSON.stringify(payload)}\n`);
    if (process.env.LOG_LEVEL !== "silent") {
      console.log(JSON.stringify(payload));
    }
    return payload;
  }

  function summary() {
    return { runId, logPath, events };
  }

  return { write, summary, logPath };
}

module.exports = { createRunLogger };
