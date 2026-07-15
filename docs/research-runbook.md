# Research runbook

Dieses Runbook ist die verbindliche Reihenfolge fuer jeden Daten-Refresh des AI Datacenter World Trackers. Die maschinenlesbare Quellenliste liegt in `data/source-registry.json`. Produzenten und Lieferkettenstufen stehen in `data/supply-chain.json`; KPI-Definition, Gewichte, Datenluecken und Publikationsregeln des Consumer-Barometers in `data/hardware-barometer.json`. Das operative Retail-Schema steht in `data/retail-baskets.json`, getrennte Dachprogramme in `data/investment-programs.json`. Rohreihen, Quellenstatus und der reproduzierbare Backcast stehen in `data/hardware-history.json`.

## 1. Suchfenster bestimmen

- Normaler Wochenlauf: seit dem letzten `snapshot_date`, mit mindestens acht Tagen Rueckblick.
- Erster Lauf eines Monats: zusaetzlich alle Quellen mit `run_schedule = first_week_of_month`.
- Erster Lauf nach Quartalsende: zusaetzlich alle Quellen mit `run_schedule = first_week_after_quarter`.
- Fuer jedes bestehende Projekt beginnt die Suche beim projektspezifischen `last_checked`.

## 2. Quellenqueues abarbeiten

1. `hard_reference`: Betreiber, Investor Relations, Behoerden, Genehmigungen, Register, Netzbetreiber, Land- und Wasserunterlagen.
2. `early_signal`: neue Regionen, Tracker, Fachmedien und Investitionsmeldungen. Neue Funde kommen zunaechst in eine Recherchequeue.
3. `cross_check`: Epoch AI, Satellitenbefunde, Nachrichtenagenturen und Methodenquellen zur unabhaengigen Plausibilisierung.

Fuer den Consumer-Preiskanal werden zusaetzlich Lieferanten-IR, Speicherpreisberichte, der versionierte Retail-Warenkorb, BLS/Eurostat und der EZB-Wechselkurs geprueft. Diese Reihen duerfen nicht mit Projektstatusdaten vermischt werden; jede Kennzahl behaelt Quelle, Einheit, Frequenz und Zeitstempel.

Grade C darf nie allein Status, Kapazitaet, Investition, Standort oder Terminlage bestimmen. Fuer Konflikte gilt: direkter und aktueller Beleg vor indirektem oder aelterem Beleg; Genehmigungs- und Betriebsakten kontrollieren Marketingaussagen zum physischen Stand.

## 3. Bestehende Projekte pruefen

Fuer jedes Projekt:

1. Offizielle Betreiber- und Partnerdomains nach Projektname, Standort, Projektgesellschaft und bekannten Aliasnamen durchsuchen.
2. Lokale Planning-, Permit-, Umwelt-, Netz-, Wasser- und Landregister pruefen.
3. Neue Dokumente mit der bisherigen Baseline in `history` vergleichen.
4. Nur veraenderte Fakten aktualisieren; neue Plaene als neues Ereignis anfuegen und alte Plaene nicht ueberschreiben.
5. `last_checked` auch dann aktualisieren, wenn die Suche keine Statusaenderung ergibt, aber nur nach tatsaechlicher Pruefung der core-Quellen.

## 4. Neue Projekte entdecken

Neue Kandidaten kommen aus PeeringDB-/Epoch-Aenderungen, Hyperscaler-Regionen, Fachmedien, Investitions-Trackern, Permit-Suchen, Netz-/Utility-Filings und Satellitenveraenderungen. Ein Kandidat wird erst in `projects.json` aufgenommen, wenn:

- ein klarer AI-, GPU-, Training-, Inference- oder AI-Factory-Bezug besteht;
- ein Standort mindestens auf Stadt-/Regionsniveau belegt ist;
- Betreiber oder Projektpartner identifizierbar sind;
- mindestens ein geeigneter A-Beleg oder zwei unabhaengige B-Belege vorliegen;
- Ankuendigung, physischer Fortschritt und Betrieb getrennt bewertet werden koennen.

Breite Cloud-Regionen ohne AI-spezifischen Projektbezug bleiben Discovery-Signale und werden nicht automatisch als Projekt aufgenommen.

## 5. Evidenz und Status

- `announced`: oeffentliche Ankuendigung, aber kein physischer Fortschritt belegt.
- `probable`: mehrere konsistente Signale, aber der Mindestbeleg fuer den behaupteten Status fehlt noch.
- `confirmed`: geeigneter A-Beleg oder zwei unabhaengige B-Belege.
- `operational`: nur mit ausdruecklichem Betriebs-, Kunden- oder Workload-Nachweis.
- `on_track`: nur mit oeffentlicher Terminbaseline und einem vergleichbaren aktuellen Meilenstein.
- `cancelled` oder `paused`: Betreiber-/Behoerdenbeleg bevorzugen; belastbare Sekundaerquelle nur, wenn keine Primaerquelle existiert und die Unsicherheit dokumentiert wird.

Satellitenbilder koennen Baufortschritt belegen oder Aussagen widersprechen, aber allein weder AI-Nutzung noch Inbetriebnahme beweisen.

## 6. Investitionen sauber behandeln

- Betrag, Waehrung, Preisbasis, Zeitraum und Bezugsobjekt festhalten.
- Unternehmensweites Capex, Laenderprogramm, Campus und einzelnes Gebaeude getrennt fuehren.
- Ueberlappende Betraege nicht addieren.
- Commitments, Budgets, Finanzierung und realisierte Ausgaben nicht gleichsetzen.
- Nicht offengelegte Einzelinvestitionen als solche kennzeichnen, statt sie aus Unternehmens-Capex abzuleiten.
- Impact-Inputs nur aus dokumentierter Leistung, projektbezogener Investition oder Beschleunigerzahl aktualisieren; fehlende Werte bleiben `null` und werden nicht geschaetzt.

## 7. Lieferkette und Hardware-Barometer

1. Monatlich BLS-Computer-CPI, BLS-Halbleiter-PPI, Eurostat-HVPI fuer Personal Computer und den monatlichen EZB-Referenzkurs EUR/USD bis zum jeweils letzten veroeffentlichten Wert aktualisieren.
2. Quartalsweise die SEC-XBRL-Company-Facts von Amazon, Alphabet, Meta und Microsoft fuer Cash-Ausgaben zum Erwerb von PP&E beziehungsweise productive assets aktualisieren. Die vier Einzelwerte und die Summe muessen erhalten bleiben.
3. Quartalsweise DRAM-/NAND-Vertragspreissignale erfassen. Ist ein Wert Forecast, Klassen-Proxy oder Branchenmittel, muss er explizit so markiert bleiben und darf nicht als beobachteter Consumer-Preis erscheinen.
4. Quartalsweise die offiziellen Berichte der in `supply-chain.json` gefuehrten Produzenten auf Capex, Produktmix, Kapazitaet, Auslastung, Backlog und Lieferzeiten pruefen.
5. Woechentlich die vier oeffentlichen Geizhals-Wunschlisten aus `retail-baskets.json` pruefen und in `retail-observations.json` einen neuen Snapshot anfuegen. Je SKU mindestens MPN, niedrigsten sichtbaren Bruttopreis, Angebotsanzahl, Verfuegbarkeit, Abrufzeit und Listen-URL speichern. Vorwochen nie ueberschreiben. Der Geizhals-Snapshot ist ein Aggregator-Kanal und ersetzt weder einen unabhaengigen Zweitfeed noch die spaetere Normalisierung von Versand, Haendleridentitaet und Lieferzeit.
6. Produkt-Launch, End-of-Life, Bundle und offensichtliche Marketplace-Ausreisser markieren. Modelle nie nur ueber Modellnamen, sondern ueber Leistung, Kapazitaet und Ausstattung vergleichen.
7. Fehlende noch nicht publizierte Monate als `null` mit Status fuehren. Amtlich fehlende Zwischenmonate duerfen fuer die Score-Berechnung nur transparent interpoliert werden; der Rohwert bleibt `null`.
8. `weighted_coverage`, Komponentenabdeckung, Quellenalter und jeden Monatswert neu berechnen. Die Validierung berechnet Abdeckung und Score unabhaengig aus den Komponenten nach.
9. Ein vorlaeufiger Backcast darf ab 70 Prozent gewichteter Abdeckung und 12 Monatswerten erscheinen. Retail-Grade erfordert zusaetzlich je Kategorie mindestens sechs vergleichbare SKUs von zwei unabhaengigen Haendlern sowie Verfuegbarkeitsdaten.
10. Bis mindestens 36 Monate Historie vorliegen, werden feste, dokumentierte Schwellen verwendet: Consumer-/PPI-Sechsmonatstrend +/-10 Prozent, Speicherpreise +/-25 Prozent QoQ, Capex +/-20 Prozent QoQ und USD-Kosten in Euro +/-5 Prozent ueber sechs Monate werden jeweils linear auf 0 bis 100 abgebildet und bei 0/100 gekappt.
11. Die Projektkarte bleibt Diagnose- und Evidenzebene. Projektanzahl oder die 60 quellenbelegten Records duerfen nicht als globaler Nachfragenenner in den CHPI eingehen; die Nachfragekomponente nutzt derzeit SEC-Capex als explizit gekennzeichneten Konzern-Proxy.
12. Korrelationen mit AI-Ausbau nur als Hypothese ausgeben, bis Vorlaeufe, Kontrollvariablen und Sensitivitaetsanalysen einen stabilen Zusammenhang zeigen.

## 8. Datenqualitaet und Deployment

Vor jedem Push:

```bash
node scripts/validate-data.mjs
```

Danach muessen Projektanzahl und Statussummen im Dashboard mit `projects.json`, Produzentenzahl und Stufen mit `supply-chain.json`, Gewichte und Abdeckung mit `hardware-barometer.json` sowie Rohreihen, 12 aufeinanderfolgende Monate und der letzte Score mit `hardware-history.json` uebereinstimmen. Fuer Retail muessen Warenkorbdefinition, Wunschlisten-URL, SKU-Anzahl, MPN-Eindeutigkeit, Angebotsstatus und Summen der Einzel-Bestpreise mit dem neuesten Eintrag in `retail-observations.json` uebereinstimmen. Der Validator berechnet aktuelle und historische Scores aus den Komponenten neu und prueft zusaetzlich Impact-Score, Retail-Reife, Dachprogramm-Doppelzaehlungen, Quellen-IDs, Quartalssummen, Null-/Forecast-Status und die zweistufige Publikationsschwelle. Der GitHub-Pages-Workflow kopiert alle acht Datendateien in den statischen Build. Nach dem Deploy sind Karte inklusive Zoom, Laenderlabels, Impact-Groessen, Filter, Projektdetails, Quellenmethodik, Lieferkette, Retail-Reifegrad, Retail-Snapshot, Backcast-Chart, Evidenzkarten, Barometer und Sprachumschaltung live zu pruefen.

## 9. Ergebnisbericht

Jeder Lauf berichtet knapp:

- neue Projekte;
- Status- und Terminwechsel;
- neue Absagen oder Pausierungen;
- Investitionsaenderungen ohne Doppelzaehlung;
- offene Quellenluecken und Kandidaten mit `probable`/`announced`;
- Veraenderungen bei Produzenten, Kapazitaet und dokumentierten Engpasssignalen;
- Retail-Warenkorb, Komponentenabdeckung, CHPI-Publikationsstatus und Konfidenz;
- Zahl der geprueften Quellen sowie Daten-, Commit- und Deploymentstatus.
