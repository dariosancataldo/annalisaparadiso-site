const { CONTENT_TYPES, REQUIRED_FIELDS, readCollection } = require("./content-utils");

const allowedStatus = new Set(["draft", "review", "approved", "published"]);
const allowedRisk = new Set(["low", "medium", "high"]);
const optionalButDeclared = new Set(["canonical", "cover_image"]);
const clinicalRedFlags = [
  /guarisce|guarigione garantita|risolve definitivamente/i,
  /diagnosi certa|diagnosticare online/i,
  /devi assumere|interrompi il farmaco|prescrivo/i,
  /sempre|mai|tutti|nessuno/i,
];

let errors = 0;

function report(message) {
  errors += 1;
  console.error(`Errore contenuto: ${message}`);
}

for (const type of Object.keys(CONTENT_TYPES)) {
  for (const item of readCollection(type)) {
    for (const field of REQUIRED_FIELDS) {
      if (item[field] === undefined || item[field] === null || (!optionalButDeclared.has(field) && item[field] === "")) {
        report(`${item.sourcePath}: campo mancante "${field}"`);
      }
    }
    if (!allowedStatus.has(item.status)) {
      report(`${item.sourcePath}: status non valido "${item.status}"`);
    }
    if (!allowedRisk.has(item.risk_level)) {
      report(`${item.sourcePath}: risk_level non valido "${item.risk_level}"`);
    }
    if (item.status === "published" && item.risk_level === "high") {
      report(`${item.sourcePath}: contenuto high risk non puo essere pubblicato automaticamente`);
    }
    if ((item.seo_title || "").length > 70) {
      report(`${item.sourcePath}: seo_title oltre 70 caratteri`);
    }
    if ((item.seo_description || "").length > 170) {
      report(`${item.sourcePath}: seo_description oltre 170 caratteri`);
    }
    for (const pattern of clinicalRedFlags) {
      if (pattern.test(`${item.title}\n${item.excerpt}\n${item.body}`)) {
        report(`${item.sourcePath}: possibile claim clinico o tono assoluto da revisionare`);
      }
    }
  }
}

if (errors > 0) {
  process.exit(1);
}

console.log("Validazione contenuti completata.");
