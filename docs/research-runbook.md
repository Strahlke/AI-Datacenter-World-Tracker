# Research runbook

Dieses Runbook ist die verbindliche Reihenfolge fuer jeden Daten-Refresh des AI Datacenter World Trackers. Die maschinenlesbare Quellenliste liegt in `data/source-registry.json`.

## 1. Suchfenster bestimmen

- Normaler Wochenlauf: seit dem letzten `snapshot_date`, mit mindestens acht Tagen Rueckblick.
- Erster Lauf eines Monats: zusaetzlich alle Quellen mit `run_schedule = first_week_of_month`.
- Erster Lauf nach Quartalsende: zusaetzlich alle Quellen mit `run_schedule = first_week_after_quarter`.
- Fuer jedes bestehende Projekt beginnt die Suche beim projektspezifischen `last_checked`.

## 2. Quellenqueues abarbeiten

1. `hard_reference`: Betreiber, Investor Relations, Behoerden, Genehmigungen, Register, Netzbetreiber, Land- und Wasserunterlagen.
2. `early_signal`: neue Regionen, Tracker, Fachmedien und Investitionsmeldungen. Neue Funde kommen zunaechst in eine Recherchequeue.
3. `cross_check`: Epoch AI, Satellitenbefunde, Nachrichtenagenturen und Methodenquellen zur unabhaengigen Plausibilisierung.

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

## 7. Datenqualitaet und Deployment

Vor jedem Push:

```bash
node scripts/validate-data.mjs
```

Danach muessen Projektanzahl und Statussummen im Dashboard mit `projects.json` uebereinstimmen. Der GitHub-Pages-Workflow kopiert `projects.json` und `source-registry.json` in den statischen Build. Nach dem Deploy sind Karte, Filter, Projektdetails und Quellenregister live zu pruefen.

## 8. Ergebnisbericht

Jeder Lauf berichtet knapp:

- neue Projekte;
- Status- und Terminwechsel;
- neue Absagen oder Pausierungen;
- Investitionsaenderungen ohne Doppelzaehlung;
- offene Quellenluecken und Kandidaten mit `probable`/`announced`;
- Zahl der geprueften Quellen sowie Daten-, Commit- und Deploymentstatus.
