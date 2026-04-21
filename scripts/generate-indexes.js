const fs = require("fs");
const path = require("path");
const { CONTENT_TYPES, ROOT, ensureDir, publicItem, readCollection } = require("./content-utils");

ensureDir(path.join(ROOT, "content", "indexes"));

for (const type of Object.keys(CONTENT_TYPES)) {
  const config = CONTENT_TYPES[type];
  const items = readCollection(type)
    .filter((item) => item.status === "published")
    .map(publicItem);

  fs.writeFileSync(config.indexPath, `${JSON.stringify(items, null, 2)}\n`);

  if (type === "news") {
    fs.writeFileSync(path.join(ROOT, "content", "news", "index.json"), `${JSON.stringify(items, null, 2)}\n`);
  }
}

console.log("Indici JSON aggiornati.");
