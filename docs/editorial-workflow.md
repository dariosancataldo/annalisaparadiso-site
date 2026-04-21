# Workflow editoriale

## Flusso consigliato

1. Ideazione in `docs/editorial-backlog.md` o tramite `ScoutAgent`.
2. Pianificazione con `PlannerAgent`.
3. Stesura in `content/drafts/` tramite `WriterAgent`.
4. Controllo policy e rischio con `SafetyAgent`.
5. Revisione tono, SEO e chiarezza con `EditorAgent`.
6. Spostamento manuale in `content/news/` o `content/approfondimenti/`.
7. Pubblicazione impostando `status: published` solo dopo approvazione umana.

## Guardrail

- Evitare diagnosi, prescrizioni o promesse di guarigione.
- Evitare titoli allarmistici o orientati solo al ranking.
- Scrivere per persone che cercano orientamento, non per saturare keyword.
- Usare CTA discrete: invito al colloquio, contatto o approfondimento correlato.

## Comandi

```bash
npm run migrate:legacy
npm run validate:content
npm run build
```

`npm run build` valida i contenuti, genera pagine HTML statiche e aggiorna gli indici.
