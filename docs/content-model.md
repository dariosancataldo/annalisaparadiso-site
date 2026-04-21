# Content model

Il sito usa Markdown con frontmatter YAML-like. Le collection pubbliche principali sono:

- `content/news/`
- `content/approfondimenti/`

Le bozze AI o non ancora destinate alla pubblicazione vivono in:

- `content/drafts/`

## Campi standard

- `title`: titolo editoriale.
- `date`: data ISO.
- `slug`: URL slug senza estensione.
- `excerpt`: sintesi breve per card, SEO e anteprime.
- `category`: categoria editoriale.
- `tags`: lista tag.
- `seo_title`: meta title.
- `seo_description`: meta description.
- `featured`: contenuto in evidenza.
- `status`: `draft`, `review`, `approved`, `published`.
- `risk_level`: `low`, `medium`, `high`.
- `canonical`: URL canonico opzionale.
- `cover_image`: immagine di copertina opzionale.
- `body`: contenuto Markdown.

## Regole operative

Solo i contenuti con `status: published` vengono generati come pagine HTML pubbliche e inclusi negli indici JSON.

I contenuti `risk_level: high` non devono essere pubblicati automaticamente. Devono restare in `draft` o `review` fino a revisione clinica umana.

## URL

- Approfondimenti generati dal nuovo modello: `/approfondimenti/{slug}.html`
- News: `/news/{slug}.html`

Il blog legacy in `/blog/` resta preservato per non alterare la landing esistente e i link pubblici gia presenti.
