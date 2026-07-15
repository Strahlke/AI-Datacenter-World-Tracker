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
- Zoom und Verschieben der Weltkarte per Maus, Touch oder Kartensteuerung
- impact-gewichtete Marker (dokumentierte Leistung, projektbezogene Investition, Beschleunigerzahl) und dezente Laenderdetails beim Zoomen
- eine Quellen- und Methodikansicht mit Abdeckung nach Queue, Pruefrhythmus und Evidenzstufe
- eine Lieferkettenansicht fuer zentrale Produzenten von Beschleunigern, Foundry, HBM/DRAM/NAND, Packaging, Netzwerk, Servern sowie Strom/Kuehlung
- einen transparenten Consumer Hardwarekosten-Druckindex (CHPI) mit 12-Monats-Backcast, sichtbarer Datenabdeckung, Publikationsschwelle und vier versionierten Geizhals-Retail-Warenkoerben
- deutsche und englische Oberflaeche; redaktionelle Projekt- und Quellennotizen bleiben bis zum automatisierten Uebersetzungs-Build deutsch gekennzeichnet

## Daten und Methodik

Der aktuelle Datenstand liegt in `data/projects.json`. `data/investment-programs.json` trennt Dachprogramme strikt von einzelnen Standorten. Das verbindliche Rechercheverzeichnis liegt in `data/source-registry.json`; `data/supply-chain.json` fuehrt Produzenten und Uebertragungskanaele, `data/hardware-barometer.json` die KPI-Definition, Gewichte, Datenluecken und Publikationsregeln. `data/retail-baskets.json` definiert Warenkoerbe, Reifegrade, Beobachtungsschema und Datenfeeds; `data/retail-observations.json` speichert die append-only Wochen-Snapshots auf SKU-Ebene. `data/hardware-history.json` enthaelt die monatlichen und quartalsweisen Rohreihen, Quellenstatus und den reproduzierbaren 12-Monats-Backcast. `docs/research-runbook.md` beschreibt die Reihenfolge und Mindestnachweise jedes Refreshs. Fruehere Staende bleiben ueber die Git-Historie nachvollziehbar.

Der aktuelle CHPI ist ein vorlaeufiger Backcast von `74,4 / 100` bei `89,5 %` gewichteter Proxy-Datenabdeckung. Er misst breiten Consumer- und Upstream-Preisdruck, Hyperscaler-Capex und EUR/USD-Transmission. Die 60 quellenbelegten Kartenrecords in 31 Laendern bleiben eine Diagnoseebene und sind keine Vollerhebung oder ein Nachfragenenner. Vier oeffentliche Geizhals-Wunschlisten liefern inzwischen den ersten direkten Snapshot mit 40 SKUs und 39 sichtbaren Angeboten. Die Retail-Reife bleibt dennoch bewusst auf `L0`: Eine Beobachtungswoche und ein Aggregator sind noch keine belastbare SKU-Zeitreihe und kein unabhaengiger Zweitfeed.

Die Punktgroesse ist ein logarithmischer, nur aus vorhandenen Werten berechneter Impact-Score: dokumentierte Leistung 45 Prozent, projektbezogene Investition 35 Prozent und Beschleunigerzahl 20 Prozent. Fehlende Inputs werden nicht geschaetzt. Dachprogramme (zum Beispiel Stargate oder InvestAI), Servicevertraege, Unternehmens-CapEx und Standortinvestitionen bleiben getrennte Ebenen und werden nie addiert.

Quellenrollen:

- Grade A: Betreiber, Investor Relations, Behoerden, Regulatoren, Netzbetreiber, Gerichte oder offizielle Register
- Grade B: belastbare Sekundaerquelle oder transparente Fachdatenbank
- Grade C: Discovery-Signal, nie alleiniger Beleg fuer Status oder Zahlen
- `hard_reference`: harte Standort-, Genehmigungs-, Netz-, Bau- oder Betriebsdaten
- `early_signal`: neue Projekte, Erweiterungen und Investitionssignale
- `cross_check`: unabhaengige Plausibilisierung und Konfliktpruefung

Statusregeln:

1. Kein Statuswechsel ohne neue Quelle.
2. `operational` nur bei ausdruecklichem Betriebs-, Kunden- oder Workload-Nachweis.
3. `on_track` nur mit oeffentlichem Zieldatum und vergleichbarem aktuellem Meilenstein.
4. Alte Plaene werden nicht ueberschrieben, sondern in `history` fortgeschrieben.
5. Abgesagte, pausierte und ersetzte Vorhaben bleiben erhalten.
6. Ueberlappende Programm-, Campus- und Gebaeudeinvestitionen werden nicht addiert.
7. Cloud-Regionen und Aggregatoren dienen nur der Discovery, solange kein projektspezifischer AI- und Standortbeleg vorliegt.
8. Grade-C-Quellen duerfen keinen Statuswechsel allein ausloesen.

Barometerregeln:

1. Ein klar als vorlaeufig gekennzeichneter Backcast darf erst ab 70 Prozent gewichteter Datenabdeckung und 12 Monatswerten erscheinen.
2. Retail-Grade erfordert zusaetzlich je Kategorie mindestens sechs vergleichbare SKUs, zwei unabhaengige Haendler und Verfuegbarkeitsdaten.
3. Preise werden nach Leistung oder Kapazitaet normalisiert; Produktwechsel, EUR/USD, Zoelle und Steuern werden separat kontrolliert.
4. AI-Rechenzentrumsausbau ist ein Fruehindikator und darf nie allein einen behaupteten Consumer-Preiseffekt begruenden.
5. Fehlende Komponenten werden nicht stillschweigend umgewichtet; Abdeckung und Konfidenz bleiben sichtbar.

Vor einem Update validiert `node scripts/validate-data.mjs` Projekte, Quellen, Produzenten, Barometergewichte, IDs, Pflichtfelder, URLs, Statuswerte, Publikationsschwelle und die Abdeckung aller Recherchekategorien.

Der Startbestand ist eine kuratierte, quellenbasierte Auswahl und keine vollstaendige Marktinventur.

## Deployment

Jeder Push auf `main` baut die Vite-Anwendung mit GitHub Actions und veroeffentlicht sie auf GitHub Pages. Die Anwendung ist vollstaendig statisch; es werden keine API, Datenbank oder Laufzeit-Server benoetigt.

Lokaler Build:

```bash
mkdir -p app/public/data
cp data/projects.json app/public/data/projects.json
cp data/source-registry.json app/public/data/source-registry.json
cp data/supply-chain.json app/public/data/supply-chain.json
cp data/hardware-barometer.json app/public/data/hardware-barometer.json
cp data/hardware-history.json app/public/data/hardware-history.json
cp data/investment-programs.json app/public/data/investment-programs.json
cp data/retail-baskets.json app/public/data/retail-baskets.json
cp data/retail-observations.json app/public/data/retail-observations.json
node scripts/validate-data.mjs
cd app
npm ci
npm run dev
```
