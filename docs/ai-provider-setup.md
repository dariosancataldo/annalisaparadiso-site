# AI provider setup

## Provider supportati

La pipeline e provider-agnostic nella struttura, ma include un provider reale OpenAI in:

- `automation/providers/openai.js`

La modalita demo usa:

- `automation/providers/demo.js`

## Env vars

- `AI_PROVIDER=openai`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `AI_RUN_MODE`
- `AI_PREFLIGHT_NETWORK`
- `AI_MAX_OUTPUT_TOKENS`
- `AI_TEMPERATURE`

## Modalita

- `AI_RUN_MODE=demo`: non chiama OpenAI e genera una bozza dimostrativa. Utile per test locale e Railway smoke test.
- `AI_RUN_MODE=production`: usa OpenAI e richiede `OPENAI_API_KEY`.
- `AI_RUN_MODE=draft-pr`: modalita consigliata per test reale controllato con provider AI reale, branch GitHub e draft PR.

## Test live controllato

```bash
AI_RUN_MODE=draft-pr DRY_RUN=false AI_ALLOW_GITHUB_PUSH=true AI_PREFLIGHT_NETWORK=true npm run ai:preflight
npm run ai:test-live
```

`npm run ai:test-live` chiama il provider reale, genera una bozza, esegue SafetyAgent ed EditorAgent, crea branch/commit/draft PR e si ferma. Non fa merge e non triggera Netlify.

## Output strutturati

Ogni passaggio richiede JSON valido. Gli output vengono validati localmente prima di proseguire:

- topic proposal;
- editorial brief;
- content item;
- safety review;
- editor review.

Se il provider restituisce JSON incompleto o non valido, la run si ferma e scrive log in `logs/editorial/`.
