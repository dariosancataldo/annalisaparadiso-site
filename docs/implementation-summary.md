# Implementation summary

## Cosa ho trovato

Il repository era un sito statico con homepage in `index.html`, articoli legacy in `blog/`, Decap CMS gia presente in `admin/`, contenuti Markdown minimali in `content/news/` e `content/approfondimenti/`, piu un `content/news/index.json`.

La homepage aveva un conflitto Git aperto: un lato conteneva la homepage reale, l'altro un placeholder. Il conflitto e stato risolto preservando la homepage reale.

## Cosa ho modificato

- Introdotta architettura contenuti con `content/drafts/`, `content/indexes/`, `templates/`, `scripts/`, `automation/`, `agents/`, `docs/` e `logs/`.
- Refactor di Decap CMS con modello editoriale completo: SEO, status, risk level, featured, canonical, cover e bozze.
- Creati script Node per migrazione legacy, validazione, generazione indici e build HTML.
- Migrati gli articoli legacy HTML in Markdown standard.
- Preservata la sezione legacy `/blog/`; le nuove pagine generate dal content model vivono in `/approfondimenti/`.
- Creata sezione `/news/`.
- Aggiunte policy cliniche e tono di voce.
- Aggiunta ossatura multi-agente AI con prompt, schemi JSON, orchestrator e logger.
- Completato workflow multi-agente production-safe con provider OpenAI, demo mode, SafetyAgent deterministico+AI, EditorAgent, draft writer, branch/commit/draft PR e dry-run.
- Aggiunti preflight live, quality gate contenuti e comando `npm run ai:test-live` per test reale controllato.
- Aggiunti `package.json`, `netlify.toml`, `.env.example`, workflow GitHub Actions e documentazione operativa.

## Struttura finale

- `content/news/`
- `content/approfondimenti/`
- `content/drafts/`
- `content/indexes/`
- `templates/`
- `scripts/`
- `automation/orchestrator/`
- `agents/prompts/`
- `agents/schemas/`
- `agents/policies/`
- `docs/`
- `logs/`

## Run locale

```bash
npm run migrate:legacy
npm run build
```

Per avviare l'orchestratore:

```bash
npm run orchestrator
```

## Deploy

Netlify:

- build command: `npm run build`
- publish directory: `.`
- Node: `20`

Configurazione in `netlify.toml`.

## Railway

Creare un servizio con start command:

```bash
npm run orchestrator
```

Configurare le env vars indicate in `.env.example` e `docs/railway-setup.md`.

## Decap CMS

Entrare da `/admin/`. Le collection principali sono:

- News
- Approfondimenti
- Bozze AI / Revisione

Usare `status` e `risk_level` come guardrail editoriali. Non pubblicare automaticamente contenuti `medium` o `high` senza revisione.

## Multi-agente

Gli agenti sono definiti in `agents/prompts/`; schemi in `agents/schemas/`; policy in `agents/policies/`.

Comandi disponibili:

```bash
npm run ai:scout
npm run ai:plan
npm run ai:generate
npm run ai:review
npm run ai:publish-pr
npm run ai:preflight
npm run ai:run
npm run ai:test-live
```

`npm run ai:run` esegue il workflow safe:

1. ScoutAgent
2. PlannerAgent
3. WriterAgent
4. SafetyAgent con controlli deterministici locali e, in produzione, review AI
5. EditorAgent
6. scrittura bozza in `content/drafts/`
7. PublisherAgent in dry-run o draft PR

Default:

- `AI_RUN_MODE=demo`
- `DRY_RUN=true`
- nessun push GitHub
- nessun merge
- nessun deploy Netlify

Con `DRY_RUN=false` e `AI_ALLOW_GITHUB_PUSH=true`, il sistema crea solo branch separato, commit mirato e draft PR. Non fa merge automatico e non triggera Netlify.

Per il primo test live sicuro:

```bash
npm run ai:test-live
```

Prerequisiti:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `GITHUB_API_BASE_URL`

Il token GitHub fine-grained deve avere solo:

- Contents: read/write
- Pull requests: read/write
- Metadata: read

`NETLIFY_BUILD_HOOK_URL` e opzionale, deve restare server-side e non viene usato dal workflow AI.

## Production-readiness finale

- Deploy statico pronto con `npm run build`, publish directory `.` e Node 20.
- Test live controllato pronto tramite `npm run ai:test-live`.
- Preflight disponibile con `npm run ai:preflight`.
- Quality gate obbligatorio prima della scrittura/publish PR della bozza AI.
- Checklist go-live in `docs/go-live-checklist.md`.
- Checklist deploy manuale in `docs/manual-deploy-checklist.md`.

## Da rifinire

- Configurare env vars reali OpenAI e GitHub per usare il workflow fuori demo mode.
- Revisionare clinicamente i testi legacy migrati.
- Aggiungere immagini locali ottimizzate invece di URL remoti, se desiderato.
