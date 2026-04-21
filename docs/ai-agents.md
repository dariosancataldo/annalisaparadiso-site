# Sistema multi-agente AI

Il sistema e progettato per proporre, generare e revisionare contenuti senza attivare pubblicazione automatica indiscriminata.

## Agenti

- `ScoutAgent`: raccoglie spunti editoriali e segnali di domanda informativa.
- `PlannerAgent`: trasforma gli spunti in brief editoriali sui pillar del sito.
- `WriterAgent`: produce bozze Markdown people-first.
- `SafetyAgent`: applica policy cliniche, tono e regole di pubblicazione.
- `EditorAgent`: migliora chiarezza, struttura, SEO naturale e coerenza con la voce.
- `PublisherAgent`: prepara commit o trigger build solo per contenuti a rischio consentito.

## Stati

- `draft`: bozza non pronta.
- `review`: richiede revisione.
- `approved`: approvata internamente.
- `published`: pubblicabile nel sito statico.

## Rischio

- `low`: comunicazioni pratiche o contenuti informativi non clinicamente sensibili.
- `medium`: approfondimenti psicologici generali.
- `high`: temi clinici sensibili, trauma, rischio suicidario, diagnosi, terapia, farmaci o indicazioni che potrebbero essere interpretate come prescrittive.

Il `PublisherAgent` non pubblica contenuti `high`.
