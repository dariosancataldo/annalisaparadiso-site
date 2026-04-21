# Orchestrator Railway-ready

Questo orchestratore e una base modulare per far lavorare agenti AI sulla pipeline editoriale senza pubblicazione automatica rischiosa.

## Avvio locale

```bash
npm run orchestrator
```

## Deploy su Railway

Usare come start command:

```bash
npm run orchestrator
```

Configurare le env vars indicate in `.env.example` e in `docs/railway-setup.md`.

## Stato attuale

La base carica prompt, policy e configurazione, scrive log JSONL in `logs/orchestrator.jsonl` e restituisce un contesto pronto per collegare provider AI, GitHub API e Netlify build hook.

## Regola centrale

Il sistema AI puo proporre, scrivere e revisionare. La pubblicazione automatica resta limitata a contenuti `low` approvati. I contenuti `medium` e `high` devono passare da revisione umana.
