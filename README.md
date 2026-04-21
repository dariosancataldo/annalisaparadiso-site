# Annalisa Paradiso Site

Sito statico per psicologa clinica e psicoterapeuta psicoanalitica, con Decap CMS, contenuti Markdown e base per pipeline multi-agente AI.

## Comandi

```bash
npm run migrate:legacy
npm run validate:content
npm run build
npm run orchestrator
npm run ai:scout
npm run ai:plan
npm run ai:generate
npm run ai:review
npm run ai:publish-pr
npm run ai:preflight
npm run ai:run
npm run ai:test-live
```

## Struttura

- `index.html`: homepage statica esistente.
- `blog/`: approfondimenti HTML legacy preservati.
- `approfondimenti/`: approfondimenti generati dal nuovo content model.
- `news/`: news HTML generate.
- `content/news/`: sorgenti Markdown news.
- `content/approfondimenti/`: sorgenti Markdown approfondimenti.
- `content/drafts/`: bozze e contenuti AI in revisione.
- `content/indexes/`: indici JSON generati.
- `admin/`: Decap CMS.
- `scripts/`: migrazione, validazione, build e indici.
- `templates/`: template statici condivisi.
- `agents/`: prompt, schemi e policy.
- `automation/orchestrator/`: base orchestratore Railway-ready.
- `docs/`: documentazione operativa.

## Pubblicazione

Solo i contenuti con `status: published` vengono generati nel sito. I contenuti clinicamente sensibili devono passare da revisione umana prima della pubblicazione.

## Workflow AI safe

La pipeline AI e production-safe:

- genera bozze in `content/drafts/`;
- esegue safety review AI e controlli deterministici locali;
- salva log JSONL in `logs/editorial/`;
- apre solo draft PR su branch dedicati;
- non fa merge automatico;
- non pubblica direttamente su `main`;
- non triggera deploy Netlify automaticamente.

Run demo locale:

```bash
npm run ai:run
```

La demo usa `AI_RUN_MODE=demo` e `DRY_RUN=true` di default.

Run con provider e draft PR reale:

```bash
npm run ai:test-live
```

Questa modalita usa `AI_RUN_MODE=draft-pr`, `DRY_RUN=false`, `AI_ALLOW_GITHUB_PUSH=true` e `AI_ALLOW_NETLIFY_BUILD_HOOK=false`: crea branch, commit e draft PR, poi si ferma. Non fa merge e non triggera Netlify. Richiede env vars OpenAI e GitHub configurate.

Preflight live controllato:

```bash
AI_RUN_MODE=draft-pr DRY_RUN=false AI_ALLOW_GITHUB_PUSH=true AI_PREFLIGHT_NETWORK=true npm run ai:preflight
```

Il preflight verifica env vars, accesso OpenAI, accesso GitHub e configurazione di sicurezza. `NETLIFY_BUILD_HOOK_URL` resta un secret server-side e non viene mai stampato.

## Deploy

Netlify usa:

- build command: `npm run build`
- publish directory: `.`

La configurazione e in `netlify.toml`.

Checklist manuale: `docs/manual-deploy-checklist.md`.

## Documentazione

- `docs/ai-provider-setup.md`
- `docs/github-pr-workflow.md`
- `docs/netlify-safe-deploy.md`
- `docs/agent-schemas.md`
- `docs/production-rollout.md`
- `docs/go-live-checklist.md`
