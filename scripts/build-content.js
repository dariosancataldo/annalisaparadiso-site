const fs = require("fs");
const path = require("path");
const { CONTENT_TYPES, ensureDir, markdownToHtml, readCollection } = require("./content-utils");
const { escapeHtml, renderLayout } = require("../templates/page");

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function card(item, prefix = "") {
  const featured = item.featured ? '<span class="badge">In evidenza</span>' : "";
  return `<a href="${prefix}${escapeHtml(item.slug)}.html" class="card article-card">
    <div class="article-meta">
      <span class="article-category">${escapeHtml(item.category || "Approfondimento")}</span>
      <span>${escapeHtml(formatDate(item.date))}</span>
      ${featured}
    </div>
    <h2>${escapeHtml(item.title)}</h2>
    <p>${escapeHtml(item.excerpt || "")}</p>
  </a>`;
}

function renderArticle(item, type) {
  const config = CONTENT_TYPES[type];
  const coverStyle = item.cover_image ? ` style="background-image:url('${escapeHtml(item.cover_image)}')"` : "";
  const body = `<section class="article-cover"${coverStyle}>
    <div class="article-cover-inner">
      <div class="article-meta">
        <span class="article-category">${escapeHtml(item.category || config.label)}</span>
        <span>${escapeHtml(formatDate(item.date))}</span>
      </div>
      <h1>${escapeHtml(item.title)}</h1>
    </div>
  </section>
  <article class="article-shell">
    <a href="index.html" class="btn btn-secondary">Torna all'archivio</a>
    <p class="lead">${escapeHtml(item.excerpt || "")}</p>
    <div class="content-body">${markdownToHtml(item.body || "")}</div>
  </article>`;

  return renderLayout({
    title: item.seo_title || item.title,
    description: item.seo_description || item.excerpt,
    canonical: item.canonical,
    body,
    prefix: "../",
  });
}

function renderArchive(type, items) {
  const config = CONTENT_TYPES[type];
  const visible = items.filter((item) => item.status === "published");
  const featured = visible.filter((item) => item.featured);
  const rest = visible.filter((item) => !item.featured);
  const cards = [...featured, ...rest].map((item) => card(item)).join("\n");
  const empty = visible.length ? "" : "<p>Non ci sono ancora contenuti pubblicati in questa sezione.</p>";
  const body = `<main class="page-section">
    <div class="container">
      <div class="section-head">
        <h1>${escapeHtml(config.archiveTitle)}</h1>
        <p>${escapeHtml(config.archiveDescription)}</p>
      </div>
      <div class="grid-2">${cards}${empty}</div>
    </div>
  </main>`;

  return renderLayout({
    title: `${config.archiveTitle} | Annalisa Paradiso`,
    description: config.archiveDescription,
    body,
    prefix: "../",
  });
}

for (const type of Object.keys(CONTENT_TYPES)) {
  const config = CONTENT_TYPES[type];
  ensureDir(config.outputDir);
  const items = readCollection(type);

  for (const item of items.filter((entry) => entry.status === "published")) {
    fs.writeFileSync(path.join(config.outputDir, `${item.slug}.html`), renderArticle(item, type));
  }

  fs.writeFileSync(path.join(config.outputDir, "index.html"), renderArchive(type, items));
}

require("./generate-indexes");
console.log("Build contenuti completata.");
