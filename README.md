# AI Datacenter World Tracker

Interaktive Weltkarte grosser, oeffentlich dokumentierter KI-Rechenzentren und AI-Factory-Programme.

## Live

<https://strahlke.github.io/AI-Datacenter-World-Tracker/>

## Was der Tracker zeigt

- aktueller Lebenszyklusstatus: geplant, im Bau, teilweise live, in Betrieb, pausiert oder abgesagt
- geplanter Umfang und publizierte Investition
- urspruengliches Ziel und nachweislich realisierter Stand
- Terminlage, Planhistorie und Quellen je Projekt
- Suche sowie Status- und Regionsfilter

## Daten und Methodik

Der aktuelle Datenstand liegt in `data/projects.json`. Fruehere Staende bleiben ueber die Git-Historie nachvollziehbar.

Statusregeln:

1. Kein Statuswechsel ohne neue Quelle.
2. `operational` nur bei ausdruecklichem Betriebs-, Kunden- oder Workload-Nachweis.
3. `on_track` nur mit oeffentlichem Zieldatum und vergleichbarem aktuellem Meilenstein.
4. Alte Plaene werden nicht ueberschrieben, sondern in `history` fortgeschrieben.
5. Abgesagte, pausierte und ersetzte Vorhaben bleiben erhalten.
6. Ueberlappende Programm-, Campus- und Gebaeudeinvestitionen werden nicht addiert.

Der Startbestand ist eine kuratierte, quellenbasierte Auswahl und keine vollstaendige Marktinventur.

## Deployment

Jeder Push auf `main` baut die Vite-Anwendung mit GitHub Actions und veroeffentlicht sie auf GitHub Pages. Die Anwendung ist vollstaendig statisch; es werden keine API, Datenbank oder Laufzeit-Server benoetigt.

Lokaler Build:

```bash
mkdir -p app/public/data
cp data/projects.json app/public/data/projects.json
cd app
npm ci
npm run dev
```
