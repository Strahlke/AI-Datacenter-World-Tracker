# Research runbook

Dieses Runbook ist die verbindliche Reihenfolge fuer jeden Daten-Refresh des AI Datacenter World Trackers. Die maschinenlesbare Quellenliste liegt in `data/source-registry.json`. Produzenten und Lieferkettenstufen stehen in `data/supply-chain.json`; KPI-Definition, Gewichte, Datenluecken und Publikationsregeln des Consumer-Barometers in `data/hardware-barometer.json`.

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

## 7. Lieferkette und Hardware-Barometer

1. Quartalsweise die offiziellen Berichte der in `supply-chain.json` gefuehrten Produzenten auf Capex, Produktmix, Kapazitaet, Auslastung, Backlog und Lieferzeiten pruefen.
2. Woechentlich fuer GPU, DDR5, NVMe-SSD und Desktop-CPU denselben versionierten SKU-Korb mit mindestens zwei unabhaengigen Haendlern erfassen. UVP, Strassenpreis, Lagerstatus, Lieferzeit, Waehrung, Steuer und SKU-Merkmale getrennt speichern.
3. Produkt-Launch, End-of-Life, Bundle und offensichtliche Marketplace-Ausreisser markieren. Modelle nie nur ueber Modellnamen, sondern ueber Leistung, Kapazitaet und Ausstattung vergleichen.
4. DRAM-/NAND-Preisberichte als Upstream-Signal erfassen, aber nicht als beobachteten Consumer-Preis ausgeben.
5. EUR/USD, dokumentierte Zoelle und Steueraenderungen als Kontrollvariablen aktualisieren.
6. `weighted_coverage`, Komponentenabdeckung und Quellenalter neu berechnen. Unter 70 Prozent Abdeckung oder vor 12 Wochen Historie bleibt `score = null`.
7. Erst nach Erreichen der Publikationsschwelle Teilindizes robust auf eine rollierende 156-Wochen-Perzentilskala normalisieren und zum CHPI aggregieren.
8. Korrelationen mit AI-Ausbau nur als Hypothese ausgeben, bis Vorlaeufe, Kontrollvariablen und Sensitivitaetsanalysen einen stabilen Zusammenhang zeigen.

## 8. Datenqualitaet und Deployment

Vor jedem Push:

```bash
node scripts/validate-data.mjs
```

Danach muessen Projektanzahl und Statussummen im Dashboard mit `projects.json`, Produzentenzahl und Stufen mit `supply-chain.json` sowie Gewichte und Abdeckung mit `hardware-barometer.json` uebereinstimmen. Der GitHub-Pages-Workflow kopiert alle vier Datendateien in den statischen Build. Nach dem Deploy sind Karte inklusive Zoom, Filter, Projektdetails, Quellenmethodik, Lieferkette, Barometer und Sprachumschaltung live zu pruefen.

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
