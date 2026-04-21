# Publishing rules

## Regole di pubblicazione

- `draft`: non viene pubblicato.
- `review`: non viene pubblicato.
- `approved`: pronto per revisione finale o spostamento manuale.
- `published`: viene generato nel sito statico.

## Automazione

Il `PublisherAgent` puo proporre commit o trigger build solo quando:

- `status` e `approved` o `published`;
- `risk_level` e `low`;
- `SafetyAgent` non segnala violazioni;
- esiste una revisione umana per contenuti clinici.

Per `risk_level: medium`, il `PublisherAgent` puo preparare una pull request, ma non deve attivare pubblicazione diretta.

Per `risk_level: high`, il `PublisherAgent` deve fermarsi e richiedere revisione clinica umana.
