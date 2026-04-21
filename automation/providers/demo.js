const { slugify } = require("../../scripts/content-utils");

const today = () => new Date().toISOString().slice(0, 10);

function demoScout({ topic, pillar }) {
  const selectedPillar = pillar || "primo colloquio";
  const selectedTopic = topic || "Cosa aspettarsi dal primo colloquio psicologico";
  return {
    ideas: [
      {
        title: selectedTopic,
        pillar: selectedPillar,
        rationale: "Risponde a un bisogno concreto di orientamento senza promettere risultati clinici.",
        risk_level: "low",
      },
    ],
  };
}

function demoPlan({ topic, pillar }) {
  return {
    pillar: pillar || "primo colloquio",
    audience_need: "La persona vuole capire come avviene un primo contatto e sentirsi meno esposta nel chiedere informazioni.",
    angle: "Spiegare in modo sobrio cosa puo accadere nel primo colloquio, senza trasformarlo in una promessa o in una diagnosi.",
    risk_level: "low",
    brief: `Scrivere un approfondimento su "${topic || "primo colloquio psicologico"}" con tono accogliente, concreto e non prescrittivo.`,
    internal_links: ["/#contatti", "/blog/psicoterapia-psicoanalitica.html"],
  };
}

function demoDraft({ plan }) {
  const title = "Primo colloquio psicologico: cosa aspettarsi";
  return {
    title,
    date: new Date().toISOString(),
    slug: slugify(title),
    excerpt: "Un orientamento semplice e rassicurante per capire cosa puo accadere nel primo colloquio psicologico e come arrivare senza dover avere gia tutto chiaro.",
    category: "Primo colloquio",
    tags: ["primo colloquio", "psicoterapia", "orientamento"],
    seo_title: "Primo colloquio psicologico | Annalisa Paradiso",
    seo_description: "Cosa aspettarsi dal primo colloquio psicologico: uno spazio di ascolto iniziale, senza diagnosi affrettate o pressioni.",
    featured: false,
    status: "draft",
    risk_level: plan?.risk_level || "low",
    canonical: "",
    cover_image: "",
    body: [
      "Il primo colloquio psicologico puo essere vissuto con curiosita, timore o incertezza. Non e necessario arrivare con una spiegazione precisa di tutto cio che si sta vivendo: spesso si inizia proprio da una sensazione confusa, da una fatica che si ripete o dal bisogno di essere ascoltati con calma.",
      "Durante il primo incontro si prova a dare una prima forma alla richiesta. La persona puo raccontare quello che sente possibile condividere, nel proprio tempo, senza obbligo di entrare subito in dettagli che non si desidera affrontare.",
      "Questo spazio non serve a formulare conclusioni affrettate. Serve piuttosto a comprendere se e come un percorso possa essere utile, quale modalita puo essere piu adatta e quali domande meritano attenzione.",
      "Se senti il bisogno di un primo contatto, puoi iniziare anche da poche parole. A volte e sufficiente dire che qualcosa pesa e che vorresti capire da dove partire.",
    ].join("\n\n"),
  };
}

function demoSafety({ content, deterministicResult }) {
  return {
    outcome: deterministicResult.outcome,
    risk_level: deterministicResult.risk_level,
    publication_allowed: false,
    violations: deterministicResult.violations,
    required_changes: deterministicResult.required_changes,
    notes: ["Demo safety: nessuna pubblicazione automatica consentita."],
  };
}

function demoEditor({ content }) {
  return {
    content: {
      ...content,
      status: content.risk_level === "high" ? "review" : "draft",
      review_notes: "Bozza generata in demo mode. Richiede revisione umana prima di qualunque pubblicazione.",
    },
    notes: [
      "Tono mantenuto sobrio e non prescrittivo.",
      "CTA discreta orientata al primo contatto.",
      "Link interni suggeriti: /#contatti, /blog/psicoterapia-psicoanalitica.html.",
    ],
  };
}

module.exports = { demoScout, demoPlan, demoDraft, demoSafety, demoEditor, today };
