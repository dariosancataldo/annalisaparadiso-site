# Railway setup

## Servizio

Creare un servizio Railway collegato al repository GitHub.

Start command:

```bash
npm run orchestrator
```

## Env vars

- `OPENAI_API_KEY`
- `AI_PROVIDER`
- `AI_MODEL`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `NETLIFY_BUILD_HOOK_URL`
- `SITE_URL`
- `CONTENT_BASE_URL`
- `MAX_PUBLISH_RISK_LEVEL`
- `LOG_LEVEL`

## Regole operative

Railway puo eseguire job schedulati o worker persistenti. Per contenuti psicologici, configurare il job in modo che produca bozze o pull request, non pubblicazione diretta.

`MAX_PUBLISH_RISK_LEVEL` dovrebbe restare `low` in produzione.
