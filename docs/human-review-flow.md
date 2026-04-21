# Human review flow

La modalita settimanale automatizza scouting, planning, scrittura, safety, editing, branch, commit e draft PR. Si ferma sempre prima di merge e deploy.

## Cosa succede ogni settimana

Esempio lunedi alle 07:00:

1. Railway esegue `npm run ai:weekly`.
2. ScoutAgent e PlannerAgent scelgono i temi, alternando i pillar.
3. WriterAgent genera le bozze.
4. SafetyAgent esegue controlli AI e deterministici locali.
5. EditorAgent rifinisce tono, chiarezza, excerpt, meta e cue di link interni.
6. PublisherAgent crea branch, commit e draft PR.
7. Viene scritto `logs/editorial/weekly-YYYY-MM-DD-summary.json`.

## Cosa fai tu il lunedi mattina

Alle 09:00 apri il summary settimanale:

```bash
cat logs/editorial/weekly-YYYY-MM-DD-summary.json
```

Per ogni contenuto guarda:

- `title`
- `type`
- `pillar`
- `risk_level`
- `safety_outcome`
- `editor_outcome`
- `pr_url`
- `branch_name`

Poi apri ogni PR:

- se il contenuto e corretto, sobrio e clinicamente sicuro, fai merge manuale su GitHub;
- se servono modifiche, commenta la PR o modifica la bozza;
- se non va bene, chiudi la PR.

## Lettura rapida del summary

Contenuti a rischio basso:

```bash
node -e "const s=require('./logs/editorial/weekly-YYYY-MM-DD-summary.json'); console.log(s.items.filter(i=>i.risk_level==='low'))"
```

Contenuti da rivedere:

```bash
node -e "const s=require('./logs/editorial/weekly-YYYY-MM-DD-summary.json'); console.log(s.items.filter(i=>i.safety_outcome!=='approved'||i.editor_outcome!=='approved'))"
```

Contenuti per pillar:

```bash
node -e "const s=require('./logs/editorial/weekly-YYYY-MM-DD-summary.json'); console.log(s.items.map(i=>({title:i.title,pillar:i.pillar,pr:i.pr_url})))"
```

## Regola finale

AI fa tutto tranne decidere cosa finisce online. Merge, cambio di `status` verso pubblicazione e verifica deploy Netlify restano manuali.
