const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CONTENT_TYPES = {
  news: {
    label: "News",
    inputDir: path.join(ROOT, "content", "news"),
    outputDir: path.join(ROOT, "news"),
    indexPath: path.join(ROOT, "content", "indexes", "news.json"),
    archiveTitle: "News",
    archiveDescription: "Aggiornamenti dello studio, comunicazioni pratiche e note editoriali essenziali.",
  },
  approfondimenti: {
    label: "Approfondimenti",
    inputDir: path.join(ROOT, "content", "approfondimenti"),
    outputDir: path.join(ROOT, "approfondimenti"),
    indexPath: path.join(ROOT, "content", "indexes", "approfondimenti.json"),
    archiveTitle: "Approfondimenti",
    archiveDescription: "Riflessioni cliniche e divulgative su psicologia, relazioni e psicoterapia psicoanalitica.",
  },
};

const REQUIRED_FIELDS = [
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
  "canonical",
  "cover_image",
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugify(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "[]") return [];
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return trimmed;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  const lines = match[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    const key = pair[1];
    let value = pair[2];
    if (value === "") {
      const list = [];
      while (lines[i + 1] && /^\s+-\s+/.test(lines[i + 1])) {
        i += 1;
        list.push(lines[i].replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, ""));
      }
      data[key] = list;
    } else {
      data[key] = parseScalar(value);
    }
  }
  return { data, body: match[2].trim() };
}

function toYamlValue(value) {
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `\n${value.map((item) => `  - ${JSON.stringify(String(item))}`).join("\n")}`;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return JSON.stringify(value == null ? "" : String(value));
}

function stringifyFrontmatter(data, body) {
  const keys = Object.keys(data);
  const yaml = keys.map((key) => `${key}: ${toYamlValue(data[key])}`).join("\n");
  return `---\n${yaml}\n---\n\n${body.trim()}\n`;
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(dir, name));
}

function readCollection(type) {
  const config = CONTENT_TYPES[type];
  return listMarkdownFiles(config.inputDir).map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = parseFrontmatter(raw);
    const slug = parsed.data.slug || slugify(parsed.data.title || path.basename(filePath, ".md"));
    return {
      ...parsed.data,
      slug,
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
      featured: Boolean(parsed.data.featured),
      status: parsed.data.status || "draft",
      risk_level: parsed.data.risk_level || "medium",
      body: parsed.body,
      sourcePath: filePath,
      type,
      url: type === "news" ? `/news/${slug}.html` : `/approfondimenti/${slug}.html`,
    };
  }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function markdownToHtml(markdown = "") {
  const escaped = markdown
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const lines = escaped.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let inList = false;

  function flushParagraph() {
    if (paragraph.length) {
      html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }
  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      closeList();
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      closeList();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushParagraph();
      closeList();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(2))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(trimmed.slice(2))}</li>`);
      continue;
    }
    paragraph.push(trimmed);
  }
  flushParagraph();
  closeList();
  return html.join("\n");
}

function inlineMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function publicItem(item) {
  return {
    title: item.title,
    date: item.date,
    slug: item.slug,
    excerpt: item.excerpt,
    category: item.category,
    tags: item.tags || [],
    featured: Boolean(item.featured),
    status: item.status,
    risk_level: item.risk_level,
    canonical: item.canonical || "",
    cover_image: item.cover_image || "",
    url: item.url,
  };
}

module.exports = {
  ROOT,
  CONTENT_TYPES,
  REQUIRED_FIELDS,
  ensureDir,
  slugify,
  parseFrontmatter,
  stringifyFrontmatter,
  readCollection,
  markdownToHtml,
  publicItem,
};
