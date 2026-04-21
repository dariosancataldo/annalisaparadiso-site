const fs = require("fs");
const path = require("path");

function readBaseCss() {
  return fs.readFileSync(path.join(__dirname, "base.css"), "utf8");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function siteHeader(prefix = "") {
  return `<header class="site-header">
  <div class="container header-inner">
    <a href="${prefix}index.html" class="brand">
      <span class="logo">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="M12 3c3.4 0 6.2 2.8 6.2 6.2 0 5.6-6.2 11.8-6.2 11.8S5.8 14.8 5.8 9.2C5.8 5.8 8.6 3 12 3Z"/>
          <path d="M9.3 10.3c.6 1.4 1.6 2.1 2.7 2.1 1.1 0 2.1-.7 2.7-2.1"/>
        </svg>
      </span>
      <span class="brand-copy">
        <strong>Annalisa Paradiso</strong>
        <span>Psicologa e Psicoterapeuta</span>
      </span>
    </a>
    <nav class="nav-actions" aria-label="Navigazione principale">
      <a href="${prefix}blog/index.html" class="btn btn-secondary">Approfondimenti</a>
      <a href="${prefix}news/index.html" class="btn btn-secondary">News</a>
      <a href="${prefix}index.html#contatti" class="btn btn-primary">Contatti</a>
    </nav>
  </div>
</header>`;
}

function renderLayout({ title, description, canonical, body, prefix = "" }) {
  const canonicalTag = canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : "";
  return `<!DOCTYPE html>
<html lang="it" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description || "")}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description || "")}">
  <meta property="og:type" content="article">
  ${canonicalTag}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${readBaseCss()}</style>
</head>
<body>
  ${siteHeader(prefix)}
  ${body}
  <footer class="footer">
    <div class="container">© 2026 Dott.ssa Annalisa Paradiso · Contenuti informativi, non sostituiscono un colloquio clinico.</div>
  </footer>
</body>
</html>`;
}

module.exports = { escapeHtml, renderLayout };
