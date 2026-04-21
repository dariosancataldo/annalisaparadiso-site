# Publishing rules

## Regole di pubblicazione

- `draft`: non viene pubblicato.
- `review`: non viene pubblicato.
- `approved`: pronto per revisione finale o spostamento manuale.
- `published`: viene generato nel sito statico.

## Automazione

Il `PublisherAgent` puo proporre solo branch, commit e draft PR. Non puo mai fare merge, push diretto su `main`, pubblicazione diretta o trigger Netlify.

- `status` resta `draft` o `review` per contenuti generati dall'AI;
- `risk_level` e `low` o `medium`;
- `SafetyAgent` non segnala violazioni;
- esiste una revisione umana per contenuti clinici.

Per `risk_level: medium`, il `PublisherAgent` puo preparare una pull request, ma non deve attivare pubblicazione diretta.

Per `risk_level: high`, il `PublisherAgent` deve fermarsi e richiedere revisione clinica umana.

Regola d'oro: AI prepara tutto fino alla draft PR; l'umano decide merge, pubblicazione e deploy.
