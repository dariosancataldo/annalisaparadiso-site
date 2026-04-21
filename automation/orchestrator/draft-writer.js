const fs = require("fs");
const path = require("path");
const { ROOT, ensureDir, slugify, stringifyFrontmatter } = require("../../scripts/content-utils");

function datePrefix(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

function writeDraftMarkdown({ content, safetyResult, editorNotes, runId }) {
  const draftsDir = path.join(ROOT, "content", "drafts");
  ensureDir(draftsDir);
  const slug = slugify(content.slug || content.title);
  const filename = `${datePrefix(content.date)}-${slug}.md`;
  const filePath = path.join(draftsDir, filename);
  const frontmatter = {
    title: content.title,
    date: content.date || new Date().toISOString(),
    slug,
    excerpt: content.excerpt,
    category: content.category,
    tags: content.tags || [],
    seo_title: content.seo_title,
    seo_description: content.seo_description,
    featured: Boolean(content.featured),
    status: content.status === "published" ? "review" : content.status,
    risk_level: content.risk_level,
    canonical: content.canonical || "",
    cover_image: content.cover_image || "",
    ai_generated: true,
    ai_run_id: runId,
    safety_outcome: safetyResult.outcome,
    safety_notes: (safetyResult.required_changes || []).join(" | "),
    editor_notes: (editorNotes || []).join(" | "),
  };
  fs.writeFileSync(filePath, stringifyFrontmatter(frontmatter, content.body));
  return { filePath, filename, slug };
}

module.exports = { writeDraftMarkdown };
