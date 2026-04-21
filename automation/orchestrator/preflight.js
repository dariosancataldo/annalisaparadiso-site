const { config } = require("./config");

function missingEnv(name) {
  return !process.env[name] || String(process.env[name]).trim() === "";
}

async function githubRequest(pathname, token) {
  const response = await fetch(`${config.github.apiBaseUrl}${pathname}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const text = await response.text();
  return { response, text };
}

async function openAiRequest() {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });
  const text = await response.text();
  return { response, text };
}

async function runPreflight(options = {}) {
  const mode = options.mode || config.runMode;
  const liveMode = mode !== "demo" || config.dryRun === false || config.github.allowPush;
  const network = options.network ?? process.env.AI_PREFLIGHT_NETWORK === "true";
  const errors = [];
  const warnings = [];
  const checks = [];

  function pass(name, detail) {
    checks.push({ name, status: "pass", detail });
  }
  function warn(name, detail) {
    warnings.push(`${name}: ${detail}`);
    checks.push({ name, status: "warn", detail });
  }
  function fail(name, detail) {
    errors.push(`${name}: ${detail}`);
    checks.push({ name, status: "fail", detail });
  }

  if (liveMode) {
    for (const name of ["OPENAI_API_KEY", "OPENAI_MODEL", "GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO", "GITHUB_BRANCH"]) {
      if (missingEnv(name)) fail(name, "variabile richiesta per test live controllato.");
      else pass(name, "configurata.");
    }

    if (config.dryRun) fail("DRY_RUN", "per un test draft PR reale deve essere DRY_RUN=false.");
    else pass("DRY_RUN", "false: la run puo creare branch/commit/draft PR.");

    if (!config.github.allowPush) fail("AI_ALLOW_GITHUB_PUSH", "deve essere true per creare branch, commit e draft PR.");
    else pass("AI_ALLOW_GITHUB_PUSH", "true.");
  } else {
    pass("AI_RUN_MODE", "demo/dry-run: nessun requisito live obbligatorio.");
  }

  if (config.allowNetlifyBuildHook) {
    fail("AI_ALLOW_NETLIFY_BUILD_HOOK", "deve restare false durante i test contenuto AI.");
  } else {
    pass("AI_ALLOW_NETLIFY_BUILD_HOOK", "false: nessun deploy Netlify automatico.");
  }

  if (!config.netlifyBuildHookUrl) {
    warn("NETLIFY_BUILD_HOOK_URL", "non configurato. Va bene per test AI; servira solo per trigger manuali server-side.");
  } else {
    pass("NETLIFY_BUILD_HOOK_URL", "configurato come secret server-side. Non viene stampato.");
  }

  if (network && !missingEnv("OPENAI_API_KEY")) {
    const { response, text } = await openAiRequest();
    if (response.ok) pass("OpenAI API", "token raggiungibile.");
    else fail("OpenAI API", `richiesta fallita (${response.status}): ${text.slice(0, 300)}`);
  } else if (liveMode) {
    warn("OpenAI API", "controllo rete non eseguito. Usa AI_PREFLIGHT_NETWORK=true per verificare il token.");
  }

  if (network && !missingEnv("GITHUB_TOKEN") && !missingEnv("GITHUB_OWNER") && !missingEnv("GITHUB_REPO")) {
    const repoPath = `/repos/${config.github.owner}/${config.github.repo}`;
    const repoCheck = await githubRequest(repoPath, config.github.token);
    if (repoCheck.response.ok) pass("GitHub metadata", "repository accessibile.");
    else fail("GitHub metadata", `richiesta fallita (${repoCheck.response.status}): ${repoCheck.text.slice(0, 300)}`);

    const branchPath = `${repoPath}/branches/${encodeURIComponent(config.github.branch)}`;
    const branchCheck = await githubRequest(branchPath, config.github.token);
    if (branchCheck.response.ok) pass("GitHub branch", "branch base accessibile.");
    else fail("GitHub branch", `branch non accessibile (${branchCheck.response.status}): ${branchCheck.text.slice(0, 300)}`);

    warn("GitHub write permission", "GitHub non offre un dry-run write: Contents/Pull requests read-write saranno verificati definitivamente al commit/PR.");
  } else if (liveMode) {
    warn("GitHub API", "controllo rete non eseguito. Usa AI_PREFLIGHT_NETWORK=true per verificare repository e branch.");
  }

  return {
    passed: errors.length === 0,
    mode,
    dryRun: config.dryRun,
    githubPushEnabled: config.github.allowPush,
    netlifyHookEnabled: config.allowNetlifyBuildHook,
    checks,
    errors,
    warnings,
  };
}

module.exports = { runPreflight };
