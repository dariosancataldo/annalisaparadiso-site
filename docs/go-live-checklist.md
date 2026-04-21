# Go-live checklist

Questa checklist serve per passare da dry-run a produzione controllata senza attivare autopubblicazione, merge automatici o deploy automatici da contenuti AI.

## 1. Deploy repo

- [ ] Repository aggiornato su GitHub.
- [ ] `netlify.toml` presente.
- [ ] Build command Netlify: `npm run build`.
- [ ] Publish directory Netlify: `.`.
- [ ] Node version: `20`.
- [ ] Nessun secret scritto in file statici, HTML, JSON pubblici o `admin/config.yml`.

## 2. Test locale

- [ ] Eseguire `npm run build`.
- [ ] Aprire la homepage e verificare che design, sezioni e immagini siano invariati.
- [ ] Aprire `/blog/index.html` per verificare il legacy blog.
- [ ] Aprire `/approfondimenti/index.html` e `/news/index.html` per verificare le pagine generate.
- [ ] Verificare `content/indexes/news.json` e `content/indexes/approfondimenti.json`.

## 3. Test provider reale

- [ ] Configurare `OPENAI_API_KEY`.
- [ ] Configurare `OPENAI_MODEL`.
- [ ] Eseguire `AI_RUN_MODE=draft-pr DRY_RUN=false AI_ALLOW_GITHUB_PUSH=true AI_PREFLIGHT_NETWORK=true npm run ai:preflight`.
- [ ] Correggere ogni errore prima di procedere.

## 4. Test draft PR reale

- [ ] Configurare `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`.
- [ ] Token GitHub fine-grained con permessi minimi:
  - Contents: read/write
  - Pull requests: read/write
  - Metadata: read
- [ ] Eseguire `npm run ai:test-live`.
- [ ] Verificare branch `ai-content/...`.
- [ ] Verificare draft PR aperta.
- [ ] Verificare che non sia avvenuto nessun merge.
- [ ] Verificare che non sia partito nessun deploy Netlify automatico dalla pipeline AI.

## 5. Controllo qualita contenuto

- [ ] Frontmatter completo.
- [ ] Slug pulito e coerente.
- [ ] Excerpt utile, non generico.
- [ ] `status` solo `draft` o `review` per contenuti AI.
- [ ] `risk_level` coerente.
- [ ] Corpo non vuoto e non troppo breve.
- [ ] Nessuna diagnosi, prescrizione, promessa di guarigione o claim assoluto.
- [ ] Tono empatico, sobrio, professionale.

## 6. Approvazione umana

- [ ] Revisione editoriale.
- [ ] Revisione clinica.
- [ ] Eventuale passaggio in Decap CMS.
- [ ] Cambio `status` solo dopo approvazione.

## 7. Merge

- [ ] Merge manuale della PR solo dopo review.
- [ ] Nessun auto-merge abilitato.
- [ ] Verificare che i file contenuto siano nella posizione prevista.

## 8. Verifica deploy Netlify

- [ ] Build Netlify completata.
- [ ] Homepage invariata.
- [ ] Archivi e pagine contenuto raggiungibili.
- [ ] Meta title, description e canonical corretti.
- [ ] Nessun secret visibile nel frontend.

## 9. Scheduler Railway ai:weekly

- [ ] Creare job Railway con comando `npm run ai:weekly`.
- [ ] Impostare `AI_PROFILE=weekly-draft-pr`.
- [ ] Impostare `AI_WEEKLY_SCHEDULE_ENABLED=true`.
- [ ] Impostare `AI_WEEKLY_ARTICLES=1`.
- [ ] Impostare `AI_WEEKLY_NEWS=1`.
- [ ] Impostare `AI_WEEKLY_MAX_TOTAL=3`.
- [ ] Impostare `AI_RUN_MODE=draft-pr`.
- [ ] Impostare `DRY_RUN=false`.
- [ ] Impostare `AI_ALLOW_GITHUB_PUSH=true`.
- [ ] Impostare `AI_ALLOW_NETLIFY_BUILD_HOOK=false`.
- [ ] Impostare OpenAI e GitHub env vars.
- [ ] Impostare `SITE_URL` e `CONTENT_BASE_URL`.
- [ ] Impostare `AI_PREFLIGHT_NETWORK=true`.
- [ ] Schedulare idealmente alle 07:00 Europe/Rome.
- [ ] Cron expression consigliata: `0 7 * * 1`.
- [ ] Verificare il lunedi mattina `logs/editorial/weekly-YYYY-MM-DD-summary.json`.
- [ ] Verificare che siano state create solo draft PR.
- [ ] Confermare che merge e deploy restino manuali.
