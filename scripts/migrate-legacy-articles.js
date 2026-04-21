const fs = require("fs");
const path = require("path");
const { ROOT, ensureDir, slugify, stringifyFrontmatter } = require("./content-utils");

const legacyDir = path.join(ROOT, "blog");
const targetDir = path.join(ROOT, "content", "approfondimenti");

const metadata = {
  "ansia-e-attacchi-di-panico": {
    title: "Ansia e attacchi di panico: riconoscere i segnali",
    excerpt: "Un approfondimento per comprendere come si manifesta l'ansia, cosa accade durante un attacco di panico e quando puo essere utile chiedere aiuto.",
    category: "Ansia",
    tags: ["ansia", "attacchi di panico", "psicoterapia"],
    cover_image: "https://images.unsplash.com/photo-1474418397713-7ede21d46114?w=1600&q=80",
  },
  "la-depressione": {
    title: "Comprendere la depressione: oltre la tristezza profonda",
    excerpt: "Una lettura sobria della depressione come esperienza complessa che coinvolge corpo, pensieri, relazioni e senso di se.",
    category: "Depressione",
    tags: ["depressione", "umore", "psicoterapia"],
    cover_image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1600&q=80",
  },
  "dipendenza-affettiva": {
    title: "Dipendenza affettiva: quando l'amore diventa sofferenza",
    excerpt: "Riconoscere legami affettivi che generano sofferenza puo aprire uno spazio di consapevolezza e cura.",
    category: "Relazioni",
    tags: ["dipendenza affettiva", "relazioni", "autonomia emotiva"],
    cover_image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1600&q=80",
  },
  "autostima-e-critica-interiore": {
    title: "Autostima e critica interiore",
    excerpt: "Una riflessione sul modo in cui il dialogo interno puo sostenere o ferire l'immagine di se.",
    category: "Autostima",
    tags: ["autostima", "critica interiore", "identita"],
    cover_image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1600&q=80",
  },
  "il-lutto-e-la-perdita": {
    title: "Il lutto e la perdita: attraversare il dolore",
    excerpt: "Il lutto richiede tempo, rispetto e ascolto: non esiste un modo unico o corretto di attraversare una perdita.",
    category: "Lutto",
    tags: ["lutto", "perdita", "dolore"],
    cover_image: "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=1600&q=80",
  },
  "psicoterapia-psicoanalitica": {
    title: "Psicoterapia psicoanalitica: come funziona",
    excerpt: "Un'introduzione accessibile al percorso psicoanalitico come spazio di ascolto, parola e comprensione di se.",
    category: "Psicoterapia",
    tags: ["psicoterapia psicoanalitica", "primo colloquio", "percorso terapeutico"],
    cover_image: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee1?w=1600&q=80",
  },
};

function htmlToMarkdown(html) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  const source = articleMatch ? articleMatch[0] : html;
  return source
    .replace(/<a[^>]*class="btn-back"[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

ensureDir(targetDir);

for (const file of fs.readdirSync(legacyDir).filter((name) => name.endsWith(".html") && name !== "index.html")) {
  const slug = path.basename(file, ".html");
  const html = fs.readFileSync(path.join(legacyDir, file), "utf8");
  const titleFromHtml = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  const meta = metadata[slug] || {};
  const title = meta.title || titleFromHtml || slug;
  const data = {
    title,
    date: "2026-04-07T12:00:00.000+02:00",
    slug: slugify(slug),
    excerpt: meta.excerpt || "Approfondimento pubblicato sul sito della dott.ssa Annalisa Paradiso.",
    category: meta.category || "Psicologia",
    tags: meta.tags || ["psicologia"],
    seo_title: `${title} | Annalisa Paradiso`,
    seo_description: meta.excerpt || "Approfondimento psicologico a cura della dott.ssa Annalisa Paradiso.",
    featured: ["ansia-e-attacchi-di-panico", "psicoterapia-psicoanalitica"].includes(slug),
    status: "published",
    risk_level: "medium",
    canonical: "",
    cover_image: meta.cover_image || "",
    legacy_source: `blog/${file}`,
  };
  const target = path.join(targetDir, `${slug}.md`);
  fs.writeFileSync(target, stringifyFrontmatter(data, htmlToMarkdown(html)));
  console.log(`Migrato ${file} -> content/approfondimenti/${slug}.md`);
}
