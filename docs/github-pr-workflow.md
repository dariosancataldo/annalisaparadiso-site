# GitHub draft PR workflow

## Obiettivo

Il `PublisherAgent` non pubblica su `main`. Crea un branch dedicato e apre una draft PR per revisione umana.

## Permessi minimi token fine-grained

Creare un GitHub fine-grained personal access token limitato al repository con:

- Contents: read/write
- Pull requests: read/write
- Metadata: read

## Env vars

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `GITHUB_API_BASE_URL`
- `AI_RUN_MODE`
- `AI_PREFLIGHT_NETWORK`
- `AI_ALLOW_GITHUB_PUSH`
- `DRY_RUN`

## Comportamento

Con `DRY_RUN=true` o `AI_ALLOW_GITHUB_PUSH=false`:

- simula branch;
- simula commit;
- simula draft PR;
- non esegue push;
- non chiama GitHub.

Con `DRY_RUN=false` e `AI_ALLOW_GITHUB_PUSH=true`:

- crea branch `ai-content/YYYY-MM-DD-slug`;
- aggiunge solo file bozza e log run;
- crea commit;
- pusha il branch;
- apre una draft PR via GitHub REST API.

Anche in questa modalita:

- nessun merge automatico;
- nessun push diretto su `main`;
- nessun deploy Netlify automatico;
- contenuti `high` vengono bloccati dal PublisherAgent.

Comando per test reale controllato:

```bash
npm run ai:test-live
```

Preflight consigliato:

```bash
AI_RUN_MODE=draft-pr DRY_RUN=false AI_ALLOW_GITHUB_PUSH=true AI_PREFLIGHT_NETWORK=true npm run ai:preflight
```
