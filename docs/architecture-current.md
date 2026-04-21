# Architettura corrente

## Mappa del repository

- `index.html`: homepage pubblica statica. Al momento del refactor era presente un conflitto Git; e stato preservato il lato con la homepage reale e rimosso il placeholder.
- `blog/`: contiene gli articoli HTML legacy e la pagina archivio storica.
- `admin/index.html`: entry point Decap CMS, carica Decap via CDN.
- `admin/config.yml`: configurazione Decap CMS con backend `git-gateway` e contenuti markdown.
- `content/news/`: news in Markdown e `index.json` legacy.
- `content/approfondimenti/`: approfondimenti in Markdown.
- `assets/uploads/`: media caricati via CMS.

## Articoli legacy identificati

- `blog/ansia-e-attacchi-di-panico.html`
- `blog/la-depressione.html`
- `blog/dipendenza-affettiva.html`
- `blog/autostima-e-critica-interiore.html`
- `blog/il-lutto-e-la-perdita.html`
- `blog/psicoterapia-psicoanalitica.html`

## Build e deploy prima del refactor

Il sito era pubblicabile come static HTML puro. Non era presente una pipeline Node, un `package.json` o un `netlify.toml`. Decap era gia configurato ma il modello contenuti era minimale: titolo, data e body.

## Punti di integrazione

- Decap CMS: `admin/config.yml`, `admin/index.html`.
- Netlify: static deploy, git-gateway, Decap bridge.
- GitHub: repository sorgente, ora pronto per validazione contenuti via GitHub Actions.
- Railway: non presente prima del refactor; aggiunta ossatura in `automation/` e `agents/`.
