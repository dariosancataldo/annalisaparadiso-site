# Manual deploy checklist

## Prima del deploy

- [ ] `npm run build` passa in locale.
- [ ] `netlify.toml` contiene `command = "npm run build"` e `publish = "."`.
- [ ] `package.json` contiene lo script `build`.
- [ ] La homepage `index.html` e presente alla root.
- [ ] Le pagine legacy in `blog/` sono presenti.
- [ ] Le pagine generate in `approfondimenti/` e `news/` sono presenti o rigenerabili.
- [ ] Gli indici `content/indexes/*.json` sono aggiornati.
- [ ] Nessun secret e stato incluso in output statici.

## Configurazione Netlify

- Build command: `npm run build`
- Publish directory: `.`
- Node version: `20`

## Deploy manuale

1. Fare push su `main`.
2. Aprire Netlify e verificare la nuova build.
3. Controllare homepage, `/blog/index.html`, `/approfondimenti/index.html`, `/news/index.html`.
4. Controllare almeno una pagina articolo legacy e una pagina generata.
5. Verificare che Decap CMS sia accessibile da `/admin/`.

## Rollback

Se una build rompe il sito pubblico, usare il rollback Netlify all'ultimo deploy stabile e correggere il branch prima di un nuovo merge.
