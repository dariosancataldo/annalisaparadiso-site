const allowedStatus = new Set(["draft", "review", "approved"]);
const allowedRisk = new Set(["low", "medium", "high"]);

const forbiddenPatterns = [
  { pattern: /\bdiagnosticare\b|\bdiagnosi certa\b|\bsei depresso\b|\bsei ansioso\b|\bhai un disturbo\b/i, rule: "no_diagnosis" },
  { pattern: /\bdevi assumere\b|\bassumi\b|\bsospendi il farmaco\b|\binterrompi il farmaco\b|\bprescrivo\b/i, rule: "no_prescription" },
  { pattern: /\bguarisce\b|\bguarirai\b|\bguarigione garantita\b|\brisultato garantito\b|\brisolve definitivamente\b/i, rule: "no_cure_promises" },
  { pattern: /\bsempre\b|\bmai\b|\btutti\b|\bnessuno\b/i, rule: "avoid_absolute_claims" },
  { pattern: /\bsuicidio\b|\bsuicidario\b|\bautolesionismo\b|\btrauma grave\b|\bfarmaci\b/i, rule: "high_risk_requires_review" },
];

function deterministicSafetyCheck(content) {
  const violations = [];
  const requiredChanges = [];
  const text = [
    content.title,
    content.excerpt,
    content.seo_title,
    content.seo_description,
    content.body,
  ].filter(Boolean).join("\n");

  if (!allowedStatus.has(content.status)) {
    violations.push({ rule: "invalid_status", severity: "block", detail: `status ${content.status} is not allowed for AI drafts` });
  }
  if (!allowedRisk.has(content.risk_level)) {
    violations.push({ rule: "invalid_risk_level", severity: "block", detail: `risk_level ${content.risk_level} is invalid` });
  }
  if (content.status === "published") {
    violations.push({ rule: "no_ai_published_status", severity: "block", detail: "AI content cannot be created as published" });
  }

  for (const check of forbiddenPatterns) {
    if (check.pattern.test(text)) {
      const severity = check.rule === "high_risk_requires_review" || check.rule === "avoid_absolute_claims" ? "review" : "block";
      violations.push({ rule: check.rule, severity, detail: "Pattern detected by local deterministic safety check" });
      requiredChanges.push(`Rivedere il testo per la regola ${check.rule}.`);
    }
  }

  let outcome = "approved";
  if (violations.some((violation) => violation.severity === "block")) outcome = "blocked";
  else if (violations.length || content.risk_level === "high") outcome = "needs_revision";

  return {
    outcome,
    risk_level: content.risk_level || "medium",
    publication_allowed: false,
    violations,
    required_changes: requiredChanges,
    deterministic: true,
  };
}

module.exports = { deterministicSafetyCheck };
