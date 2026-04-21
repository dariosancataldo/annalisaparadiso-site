# Netlify setup

## Build settings

- Build command: `npm run build`
- Publish directory: `.`
- Node version: `20`

Questi valori sono gia definiti in `netlify.toml`.

## Decap CMS

Decap CMS usa `git-gateway` in `admin/config.yml`. Verificare in Netlify:

1. Identity abilitato, se usato dal setup corrente.
2. Git Gateway abilitato.
3. Utenti CMS autorizzati.
4. Branch di pubblicazione: `main`.

## Env vars

Per il sito statico non servono secret durante la build ordinaria. Per pipeline AI e trigger:

- `NETLIFY_BUILD_HOOK_URL`
- `SITE_URL`
- `CONTENT_BASE_URL`

Non salvare secret in `netlify.toml`.

`NETLIFY_BUILD_HOOK_URL` deve restare server-side: non va mai scritto in HTML, JSON pubblici, frontend, CMS config o log in chiaro.

## Deploy

Ogni push su `main` puo attivare build Netlify. Per preview, usare pull request da GitHub.

Checklist operativa: `docs/manual-deploy-checklist.md`.
