# Agent schemas

## Schemi disponibili

- `agents/schemas/editorial-plan.schema.json`
- `agents/schemas/content-item.schema.json`
- `agents/schemas/safety-review.schema.json`
- `agents/schemas/editor-review.schema.json`
- `agents/schemas/agent-run.schema.json`

## Validazione runtime

La pipeline valida gli oggetti principali in:

- `automation/orchestrator/runtime-validation.js`
- `automation/orchestrator/content-quality.js`

Validazioni applicate:

- campi obbligatori;
- status consentiti;
- risk level consentiti;
- slug coerente;
- SEO title e description entro lunghezze ragionevoli;
- blocco di contenuti AI con `status: published`.
- blocco di bozze con excerpt/meta deboli, slug non normalizzato o corpo troppo breve/vuoto.

## Safety deterministica

Oltre alla review AI, il SafetyAgent usa:

- `automation/orchestrator/deterministic-safety.js`

Controlla pattern locali su:

- diagnosi;
- prescrizioni;
- promesse di guarigione;
- claim assoluti;
- temi high-risk.

Se i controlli locali bloccano un contenuto, la pipeline si ferma prima di EditorAgent e PublisherAgent.
