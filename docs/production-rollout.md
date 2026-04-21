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
