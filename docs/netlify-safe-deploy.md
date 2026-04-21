# Netlify safe deploy

## Regola

La pipeline AI non triggera Netlify durante generazione, revisione o apertura draft PR.

`NETLIFY_BUILD_HOOK_URL` e un segreto server-side. Non deve essere scritto in:

- frontend;
- file statici generati;
- output HTML;
- indici JSON pubblici;
- log con valore in chiaro.

Il codice logga solo se il build hook e configurato, mai il valore.

## Env vars

- `NETLIFY_BUILD_HOOK_URL`
- `AI_ALLOW_NETLIFY_BUILD_HOOK`
- `DRY_RUN`

## Default

`AI_ALLOW_NETLIFY_BUILD_HOOK=false`.

Il modulo `automation/publishers/netlify.js` e opzionale e non viene chiamato da `npm run ai:run`.

Il deploy resta affidato a Netlify dopo merge approvato su branch configurato, oppure a trigger esplicito manuale/server-side.
