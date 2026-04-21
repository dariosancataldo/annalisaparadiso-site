# Piano migrazione legacy

## Obiettivo

Portare gli articoli HTML legacy in Markdown standard senza perdere contenuti e mantenendo gli URL storici in `/blog/`.

## Script

```bash
npm run migrate:legacy
```

Lo script legge gli HTML in `blog/`, estrae il corpo principale e genera file Markdown in `content/approfondimenti/` con frontmatter completo.

## Strategia

- Gli HTML legacy restano nel repository e non vengono sovrascritti dalla build.
- Dopo la migrazione, `npm run build` genera le nuove pagine in `/approfondimenti/{slug}.html`.
- Gli slug legacy restano invariati nei sorgenti Markdown, ma i link pubblici storici in `/blog/` continuano a funzionare con gli HTML esistenti.
- I contenuti migrati partono con `status: published` e `risk_level: medium`, quindi vanno revisionati nel tempo.

## Verifiche

- Controllare che ogni articolo abbia titolo, excerpt, SEO title e SEO description.
- Verificare che il testo non contenga claim assoluti o promesse cliniche.
- Valutare una revisione editoriale umana dei testi legacy, in particolare depressione, panico e lutto.
