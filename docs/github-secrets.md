# GitHub secrets

## Secrets consigliati

- `OPENAI_API_KEY`: provider AI.
- `GITHUB_TOKEN`: token con permessi minimi per branch, commit e pull request, se usato fuori da GitHub Actions.
- `NETLIFY_BUILD_HOOK_URL`: hook Netlify per avviare build.
- `SITE_URL`: URL pubblico.
- `CONTENT_BASE_URL`: base URL per canonical e link contenuti.

## Permessi minimi GitHub fine-grained token

Limitare il token al solo repository e assegnare:

- Contents: read/write
- Pull requests: read/write
- Metadata: read

Non servono permessi amministrativi, secret management o accesso organization-wide.

## GitHub Actions

Il workflow `.github/workflows/content-validation.yml` esegue:

```bash
npm run build
```

Serve a bloccare PR con frontmatter incompleto, status non valido o contenuti che violano guardrail automatici di base.

## Permessi

Usare token con permessi minimi. Per agenti AI, preferire branch dedicati e pull request; evitare push diretto su `main`.
