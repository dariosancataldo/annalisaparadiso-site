const { slugify } = require("../../scripts/content-utils");

const allowedStatus = new Set(["draft", "review", "approved", "published"]);
const allowedRisk = new Set(["low", "medium", "high"]);
const draftOnlyStatus = new Set(["draft", "review"]);

function lengthOf(value) {
  return String(value || "").trim().length;
}

function assertContentQuality(content, options = {}) {
  const errors = [];
  const warnings = [];
  const requireDraftStatus = options.requireDraftStatus !== false;

  const required = [
    "title",
    "date",
    "slug",
    "excerpt",
    "category",
    "tags",
    "seo_title",
    "seo_description",
    "featured",
    "status",
    "risk_level",
    "body",
  ];

  for (const field of required) {
    if (content[field] === undefined || content[field] === null || content[field] === "") {
      errors.push(`Campo obbligatorio mancante: ${field}`);
    }
  }

  if (!Array.isArray(content.tags)) errors.push("tags deve essere un array.");
  if (!allowedStatus.has(content.status)) errors.push(`status non valido: ${content.status}`);
  if (!allowedRisk.has(content.risk_level)) errors.push(`risk_level non valido: ${content.risk_level}`);
  if (requireDraftStatus && !draftOnlyStatus.has(content.status)) {
    errors.push("I contenuti generati dall'AI devono restare in status draft o review.");
  }

  const expectedSlug = slugify(content.slug || content.title || "");
  if (!content.slug || content.slug !== expectedSlug) {
    errors.push(`slug non normalizzato: usare "${expectedSlug}".`);
  }

  if (lengthOf(content.title) < 12) errors.push("title troppo breve.");
  if (lengthOf(content.excerpt) < 80) errors.push("excerpt troppo breve: minimo 80 caratteri.");
  if (lengthOf(content.excerpt) > 260) warnings.push("excerpt lungo: valutare una sintesi piu asciutta.");
  if (lengthOf(content.seo_title) < 20) errors.push("seo_title troppo breve.");
  if (lengthOf(content.seo_title) > 70) errors.push("seo_title oltre 70 caratteri.");
  if (lengthOf(content.seo_description) < 80) errors.push("seo_description troppo breve.");
  if (lengthOf(content.seo_description) > 170) errors.push("seo_description oltre 170 caratteri.");
  if (lengthOf(content.body) < 900) errors.push("body troppo breve: minimo 900 caratteri per evitare thin content.");

  const paragraphCount = String(content.body || "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean).length;
  if (paragraphCount < 4) errors.push("body troppo vuoto o poco strutturato: servono almeno 4 blocchi/paragrafi.");

  const result = {
    passed: errors.length === 0,
    errors,
    warnings,
  };

  if (!result.passed) {
    const error = new Error(`Content quality gate failed: ${errors.join(" | ")}`);
    error.qualityResult = result;
    throw error;
  }

  return result;
}

module.exports = { assertContentQuality };
