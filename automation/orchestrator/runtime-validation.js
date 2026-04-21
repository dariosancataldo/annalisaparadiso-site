const allowedStatus = new Set(["draft", "review", "approved", "published"]);
const allowedRisk = new Set(["low", "medium", "high"]);
const allowedSafetyOutcome = new Set(["approved", "needs_revision", "blocked"]);

const requiredContentFields = [
  "title",
  "slug",
  "excerpt",
  "category",
  "tags",
  "seo_title",
  "seo_description",
  "status",
  "risk_level",
  "body",
];

function assertObject(name, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
}

function validateContentItem(item) {
  assertObject("content item", item);
  const errors = [];
  for (const field of requiredContentFields) {
    if (item[field] === undefined || item[field] === null || item[field] === "") {
      errors.push(`missing field: ${field}`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug || "")) errors.push("slug must use lowercase letters, numbers and hyphens");
  if (!Array.isArray(item.tags)) errors.push("tags must be an array");
  if (!allowedStatus.has(item.status)) errors.push(`invalid status: ${item.status}`);
  if (!allowedRisk.has(item.risk_level)) errors.push(`invalid risk_level: ${item.risk_level}`);
  if (item.status === "published") errors.push("AI generated content must not start as published");
  if ((item.seo_title || "").length > 70) errors.push("seo_title must be 70 chars or fewer");
  if ((item.seo_description || "").length > 170) errors.push("seo_description must be 170 chars or fewer");
  if (errors.length) throw new Error(`Invalid content item: ${errors.join("; ")}`);
  return item;
}

function validateSafetyResult(result) {
  assertObject("safety result", result);
  if (!allowedSafetyOutcome.has(result.outcome)) {
    throw new Error(`Invalid safety outcome: ${result.outcome}`);
  }
  if (!allowedRisk.has(result.risk_level)) {
    throw new Error(`Invalid safety risk_level: ${result.risk_level}`);
  }
  if (!Array.isArray(result.violations)) {
    throw new Error("Safety violations must be an array");
  }
  if (!Array.isArray(result.required_changes)) {
    throw new Error("Safety required_changes must be an array");
  }
  return result;
}

function validateEditorialPlan(plan) {
  assertObject("editorial plan", plan);
  for (const field of ["pillar", "audience_need", "angle", "risk_level", "brief", "internal_links"]) {
    if (plan[field] === undefined || plan[field] === null || plan[field] === "") {
      throw new Error(`Invalid editorial plan: missing ${field}`);
    }
  }
  if (!allowedRisk.has(plan.risk_level)) throw new Error(`Invalid plan risk_level: ${plan.risk_level}`);
  if (!Array.isArray(plan.internal_links)) throw new Error("Plan internal_links must be an array");
  return plan;
}

function validateEditorResult(result) {
  assertObject("editor result", result);
  if (!result.content) throw new Error("Editor result must include content");
  validateContentItem(result.content);
  if (!Array.isArray(result.notes)) throw new Error("Editor result notes must be an array");
  return result;
}

module.exports = {
  validateContentItem,
  validateSafetyResult,
  validateEditorialPlan,
  validateEditorResult,
};
