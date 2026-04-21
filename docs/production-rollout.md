# Production rollout

## Fase 1: draft only

Usare:

```bash
AI_RUN_MODE=demo DRY_RUN=true npm run ai:run
```

Obiettivo: verificare generazione file, log, validazione locale e Decap CMS senza GitHub push.

## Fase 2: draft PR

Usare provider reale e GitHub draft PR:

```bash
npm run ai:test-live
```

Obiettivo: creare branch dedicato e draft PR, senza merge e senza deploy automatico.

Preflight:

```bash
AI_RUN_MODE=draft-pr DRY_RUN=false AI_ALLOW_GITHUB_PUSH=true AI_PREFLIGHT_NETWORK=true npm run ai:preflight
```

## Fase 3: semi-automatic review

Integrare revisione umana su PR:

- review clinica;
- controllo SEO people-first;
- controllo tono;
- eventuale spostamento manuale da `content/drafts/` a collection pubblica.

## Fase 4: publish controllato

Solo per contenuti `low` e dopo policy interne mature, valutare trigger controllati.

Anche in questa fase restano vietati:

- merge automatico;
- pubblicazione high-risk;
- deploy con build hook esposto al frontend.

## Schedulare ai:weekly su Railway

Configurare un cron/scheduled job Railway con comando:

```bash
npm run ai:weekly
```

Env richieste per la modalita settimanale:

- `AI_PROFILE=weekly-draft-pr`
- `AI_WEEKLY_SCHEDULE_ENABLED=true`
- `AI_WEEKLY_ARTICLES=1`
- `AI_WEEKLY_NEWS=1`
- `AI_WEEKLY_MAX_TOTAL=3`
- `AI_RUN_MODE=draft-pr`
- `DRY_RUN=false`
- `AI_ALLOW_GITHUB_PUSH=true`
- `AI_ALLOW_NETLIFY_BUILD_HOOK=false`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `GITHUB_API_BASE_URL`
- `SITE_URL`
- `CONTENT_BASE_URL`
- `AI_PREFLIGHT_NETWORK=true`

Consiglio operativo: schedulare alle 07:00 Europe/Rome. Alle 09:00 dovrebbero essere pronte le draft PR e il file `logs/editorial/weekly-YYYY-MM-DD-summary.json`.

Cron expression consigliata:

```cron
0 7 * * 1
```

Se Railway interpreta il cron in UTC, adattare l'orario rispetto a Europe/Rome.

La pipeline settimanale non fa merge, non cambia `main` direttamente e non chiama Netlify build hook. L'umano decide cosa mergiare e pubblicare.

Guida dettagliata: `docs/railway-setup.md`.
