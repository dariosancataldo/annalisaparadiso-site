# Railway setup

Obiettivo: schedulare `npm run ai:weekly` su Railway in modo che ogni settimana la pipeline AI prepari bozze, log e draft PR, lasciando merge e pubblicazione all'umano.

La pipeline non fa merge, non pusha su `main` e non chiama Netlify build hook.

## 1. Creare il progetto Railway

1. Aprire Railway.
2. Creare un nuovo progetto.
3. Selezionare deploy da GitHub repository.
4. Collegare il repository `annalisaparadiso-site`.
5. Lasciare Railway rilevare Node.js.
6. Verificare che il servizio usi Node 20 o compatibile.

Per questo progetto non serve un server web persistente: il valore importante e il comando schedulato `npm run ai:weekly`.

## 2. Configurare servizio Node/npm

Impostazioni consigliate:

- Install command: lasciare default Railway/npm.
- Build command: vuoto o default.
- Start command per servizio persistente: non necessario per il cron.
- Cron/job command: `npm run ai:weekly`.

Se Railway richiede comunque uno start command per il servizio, usare:

```bash
npm run orchestrator
```

Il lavoro editoriale automatico deve pero essere fatto dal cron job, non da un processo sempre acceso.

## 3. Env vars obbligatorie

Impostare queste variabili nella UI Railway:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.4
GITHUB_TOKEN=...
GITHUB_OWNER=dariosancataldo
GITHUB_REPO=annalisaparadiso-site
GITHUB_BRANCH=main
GITHUB_API_BASE_URL=https://api.github.com
SITE_URL=https://annalisaparadiso.com
CONTENT_BASE_URL=https://annalisaparadiso.com
AI_PROFILE=weekly-draft-pr
AI_WEEKLY_SCHEDULE_ENABLED=true
AI_WEEKLY_ARTICLES=1
AI_WEEKLY_NEWS=1
AI_WEEKLY_MAX_TOTAL=3
AI_RUN_MODE=draft-pr
DRY_RUN=false
AI_ALLOW_GITHUB_PUSH=true
AI_ALLOW_NETLIFY_BUILD_HOOK=false
AI_PREFLIGHT_NETWORK=true
```

Opzionali:

```bash
AI_PROVIDER=openai
AI_MAX_OUTPUT_TOKENS=3500
AI_TEMPERATURE=0.3
MAX_PUBLISH_RISK_LEVEL=low
LOG_LEVEL=info
```

Non impostare `AI_ALLOW_NETLIFY_BUILD_HOOK=true` per la pipeline weekly. `NETLIFY_BUILD_HOOK_URL`, se presente, deve restare secret server-side e non viene usato da `ai:weekly`.

## 4. Token GitHub

Usare un fine-grained personal access token limitato al repository.

Permessi minimi:

- Contents: read/write
- Pull requests: read/write
- Metadata: read

Il token serve a creare branch `ai-content/...`, fare commit e aprire draft PR. Non deve avere permessi per merge automatico.

## 5. Primo test manuale dalla Console Railway

Dalla console/terminal Railway eseguire:

```bash
npm run ai:preflight
```

Risultato atteso:

- `passed: true`
- OpenAI API raggiungibile
- GitHub repository e branch accessibili
- `AI_ALLOW_NETLIFY_BUILD_HOOK=false`
- `AI_PROFILE=weekly-draft-pr`

Poi eseguire un primo test reale controllato:

```bash
npm run ai:weekly
```

Risultato atteso:

- console log con inizio run;
- numero contenuti pianificati;
- creazione di 1 approfondimento e 1 news, salvo limiti configurati;
- SafetyAgent + EditorAgent eseguiti;
- branch `ai-content/...` creati;
- draft PR aperte;
- nessun merge;
- nessun deploy Netlify triggerato.

## 6. Creare il cron job Railway

Nella UI Railway creare un cron/scheduled job con comando:

```bash
npm run ai:weekly
```

Frequenza consigliata:

- ogni lunedi alle 07:00 Europe/Rome;
- cosi alle 09:00 le draft PR dovrebbero essere pronte per revisione.

Cron expression consigliata:

```cron
0 7 * * 1
```

Verificare nella UI Railway quale timezone usa il cron. Se Railway usa UTC, adattare l'orario in base all'ora legale italiana.

## 7. Leggere log e debug

Durante `npm run ai:weekly`, la console Railway mostra righe come:

```text
[ai:weekly] start run=weekly-...
[ai:weekly] planned articles=1 news=1 total=2 max=3
[ai:weekly] summary initialized logs/editorial/weekly-YYYY-MM-DD-summary.json
[ai:weekly] item completed type=approfondimento risk=low safety=approved branch=...
[ai:weekly] completed generated=2 draft_prs=2 blocked_or_failed=0
```

Per capire se la run e andata bene:

- `completed generated=N` deve essere maggiore di 0;
- `draft_prs=N` deve corrispondere alle PR attese;
- `blocked_or_failed=0` e ideale;
- se ci sono errori, cercare `item failed` o `Weekly preflight failed`.

Il file summary viene creato a:

```text
logs/editorial/weekly-YYYY-MM-DD-summary.json
```

In una run reale, il PublisherAgent aggiunge questo file ai branch delle PR, cosi puo essere letto anche da GitHub/Codex dopo l'apertura delle draft PR.

## 8. Revisione umana

Ogni lunedi mattina:

1. Aprire GitHub.
2. Filtrare le draft PR aperte da branch `ai-content/...`.
3. Leggere il contenuto Markdown e il summary.
4. Se il contenuto e corretto, fare merge manuale.
5. Se non e corretto, commentare o chiudere la PR.

Netlify deploya solo dopo merge manuale sul branch configurato. La pipeline AI non decide cosa pubblicare online.
