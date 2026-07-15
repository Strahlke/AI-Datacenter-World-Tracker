import { readFile } from "node:fs/promises";

const projectFile = new URL("../data/projects.json", import.meta.url);
const registryFile = new URL("../data/source-registry.json", import.meta.url);
const supplyChainFile = new URL("../data/supply-chain.json", import.meta.url);
const barometerFile = new URL("../data/hardware-barometer.json", import.meta.url);
const historyFile = new URL("../data/hardware-history.json", import.meta.url);

const projectsPayload = JSON.parse(await readFile(projectFile, "utf8"));
const registryPayload = JSON.parse(await readFile(registryFile, "utf8"));
const supplyChainPayload = JSON.parse(await readFile(supplyChainFile, "utf8"));
const barometerPayload = JSON.parse(await readFile(barometerFile, "utf8"));
const historyPayload = JSON.parse(await readFile(historyFile, "utf8"));

const errors = [];
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isoMonth = /^\d{4}-\d{2}$/;
const isoQuarter = /^\d{4}-Q[1-4]$/;
const httpsUrl = /^https:\/\//;
const allowedStatuses = new Set(["planned", "under_construction", "partly_live", "operational", "paused", "cancelled"]);
const allowedRealizations = new Set(["planned", "in_progress", "partly_realized", "realized", "not_realized"]);
const allowedSchedules = new Set(["delivered", "on_track", "late_but_delivered", "late_unverified", "not_assessable", "cancelled_or_superseded", "cancelled"]);
const allowedConfidence = new Set(["high", "medium", "low"]);
const allowedGrades = new Set(["A", "B", "C"]);
const allowedQueues = new Set(["hard_reference", "early_signal", "cross_check"]);
const allowedPriorities = new Set(["core", "supporting", "watchlist"]);
const allowedCadences = new Set(["daily", "weekly", "monthly", "quarterly"]);
const allowedRunSchedules = new Set(["every_week", "first_week_of_month", "first_week_after_quarter"]);
const allowedAccess = new Set(["api", "download", "web", "search", "dynamic_search"]);
const allowedExposure = new Set(["high", "medium", "low"]);
const allowedComponentStatus = new Set(["tracked", "source_gap", "source_design"]);
const allowedSeriesEvidence = new Set(["direct", "direct_proxy", "industry_proxy"]);
const allowedMonthlyObservationStatus = new Set(["direct_observation", "preliminary", "unavailable", "not_released"]);
const allowedQuarterlyObservationStatus = new Set(["reported_actual", "forecast_midpoint", "mixed_actual_forecast"]);

function requireValue(condition, message) {
  if (!condition) errors.push(message);
}

function checkUnique(items, label) {
  const seen = new Set();
  for (const item of items) {
    requireValue(typeof item.id === "string" && item.id.length > 0, `${label}: id fehlt`);
    requireValue(!seen.has(item.id), `${label}: doppelte id ${item.id}`);
    seen.add(item.id);
  }
}

function nextMonth(period) {
  const [year, month] = period.split("-").map(Number);
  const next = new Date(Date.UTC(year, month, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}

function approximatelyEqual(actual, expected, tolerance = 0.000001) {
  return Math.abs(actual - expected) <= tolerance;
}

requireValue(isoDate.test(projectsPayload.snapshot_date || ""), "projects: snapshot_date muss YYYY-MM-DD sein");
requireValue(Array.isArray(projectsPayload.projects) && projectsPayload.projects.length > 0, "projects: projects muss ein nicht-leeres Array sein");
checkUnique(projectsPayload.projects || [], "projects");

for (const project of projectsPayload.projects || []) {
  const prefix = `project ${project.id || "<ohne id>"}`;
  for (const field of ["name", "operator", "country", "region", "location", "latest_update", "last_checked"]) {
    requireValue(typeof project[field] === "string" && project[field].trim().length > 0, `${prefix}: ${field} fehlt`);
  }
  requireValue(allowedStatuses.has(project.current_status), `${prefix}: ungueltiger current_status`);
  requireValue(allowedRealizations.has(project.realization), `${prefix}: ungueltige realization`);
  requireValue(allowedSchedules.has(project.schedule), `${prefix}: ungueltiger schedule`);
  requireValue(allowedConfidence.has(project.confidence), `${prefix}: ungueltige confidence`);
  requireValue(Number.isFinite(project.lat) && project.lat >= -90 && project.lat <= 90, `${prefix}: lat ungueltig`);
  requireValue(Number.isFinite(project.lon) && project.lon >= -180 && project.lon <= 180, `${prefix}: lon ungueltig`);
  requireValue(isoDate.test(project.last_checked || ""), `${prefix}: last_checked muss YYYY-MM-DD sein`);
  requireValue(Array.isArray(project.history) && project.history.length > 0, `${prefix}: history fehlt`);
  requireValue(Array.isArray(project.sources) && project.sources.length > 0, `${prefix}: sources fehlt`);
  for (const source of project.sources || []) {
    requireValue(allowedGrades.has(source.grade), `${prefix}: Quellen-Grade ${source.grade} ungueltig`);
    requireValue(httpsUrl.test(source.url || ""), `${prefix}: Quellen-URL muss HTTPS sein`);
    requireValue(typeof source.publisher === "string" && source.publisher.length > 0, `${prefix}: Quellen-Publisher fehlt`);
    requireValue(typeof source.title === "string" && source.title.length > 0, `${prefix}: Quellen-Titel fehlt`);
  }
}

requireValue(isoDate.test(registryPayload.snapshot_date || ""), "registry: snapshot_date muss YYYY-MM-DD sein");
requireValue(Array.isArray(registryPayload.sources) && registryPayload.sources.length > 0, "registry: sources muss ein nicht-leeres Array sein");
checkUnique(registryPayload.sources || [], "registry");

const coveredCategories = new Set();
for (const source of registryPayload.sources || []) {
  const prefix = `registry ${source.id || "<ohne id>"}`;
  for (const field of ["name", "publisher", "category", "geography", "use_for", "caveat", "last_verified"]) {
    requireValue(typeof source[field] === "string" && source[field].trim().length > 0, `${prefix}: ${field} fehlt`);
  }
  requireValue(allowedQueues.has(source.queue), `${prefix}: ungueltige queue`);
  requireValue(allowedPriorities.has(source.priority), `${prefix}: ungueltige priority`);
  requireValue(allowedCadences.has(source.recommended_cadence), `${prefix}: ungueltige recommended_cadence`);
  requireValue(allowedRunSchedules.has(source.run_schedule), `${prefix}: ungueltiger run_schedule`);
  requireValue(allowedAccess.has(source.access), `${prefix}: ungueltiger access`);
  requireValue(allowedGrades.has(source.max_grade), `${prefix}: ungueltiger max_grade`);
  requireValue(isoDate.test(source.last_verified || ""), `${prefix}: last_verified muss YYYY-MM-DD sein`);
  requireValue(Array.isArray(source.signals) && source.signals.length > 0, `${prefix}: signals fehlt`);
  requireValue(Array.isArray(source.search_hints) && source.search_hints.length > 0, `${prefix}: search_hints fehlt`);
  if (source.access === "dynamic_search") {
    requireValue(source.url === null, `${prefix}: dynamische Quelle muss url null verwenden`);
  } else {
    requireValue(httpsUrl.test(source.url || ""), `${prefix}: URL muss HTTPS sein`);
  }
  coveredCategories.add(source.category);
}

for (const category of registryPayload.method?.required_signal_types || []) {
  requireValue(coveredCategories.has(category), `registry: Pflichtkategorie ${category} ist nicht abgedeckt`);
}

requireValue(isoDate.test(supplyChainPayload.snapshot_date || ""), "supply-chain: snapshot_date muss YYYY-MM-DD sein");
requireValue(Array.isArray(supplyChainPayload.stages) && supplyChainPayload.stages.length > 0, "supply-chain: stages muss ein nicht-leeres Array sein");
requireValue(Array.isArray(supplyChainPayload.producers) && supplyChainPayload.producers.length > 0, "supply-chain: producers muss ein nicht-leeres Array sein");
checkUnique(supplyChainPayload.stages || [], "supply-chain stages");
checkUnique(supplyChainPayload.producers || [], "supply-chain producers");

const stageIds = new Set((supplyChainPayload.stages || []).map((stage) => stage.id));
for (const stage of supplyChainPayload.stages || []) {
  const prefix = `supply-chain stage ${stage.id || "<ohne id>"}`;
  requireValue(typeof stage.label_de === "string" && stage.label_de.length > 0, `${prefix}: label_de fehlt`);
  requireValue(typeof stage.label_en === "string" && stage.label_en.length > 0, `${prefix}: label_en fehlt`);
  requireValue(allowedExposure.has(stage.consumer_exposure), `${prefix}: consumer_exposure ungueltig`);
  requireValue(typeof stage.why_it_matters_de === "string" && stage.why_it_matters_de.length > 0, `${prefix}: why_it_matters_de fehlt`);
  requireValue(typeof stage.why_it_matters_en === "string" && stage.why_it_matters_en.length > 0, `${prefix}: why_it_matters_en fehlt`);
}

for (const producer of supplyChainPayload.producers || []) {
  const prefix = `supply-chain producer ${producer.id || "<ohne id>"}`;
  requireValue(typeof producer.name === "string" && producer.name.length > 0, `${prefix}: name fehlt`);
  requireValue(stageIds.has(producer.stage), `${prefix}: unbekannte stage ${producer.stage}`);
  requireValue(typeof producer.role_de === "string" && producer.role_de.length > 0, `${prefix}: role_de fehlt`);
  requireValue(typeof producer.role_en === "string" && producer.role_en.length > 0, `${prefix}: role_en fehlt`);
  requireValue(Array.isArray(producer.signals_to_track) && producer.signals_to_track.length > 0, `${prefix}: signals_to_track fehlt`);
  requireValue(httpsUrl.test(producer.primary_source_url || ""), `${prefix}: primary_source_url muss HTTPS sein`);
  requireValue(allowedGrades.has(producer.evidence_grade), `${prefix}: evidence_grade ungueltig`);
  requireValue(isoDate.test(producer.last_checked || ""), `${prefix}: last_checked muss YYYY-MM-DD sein`);
}

requireValue(isoDate.test(barometerPayload.snapshot_date || ""), "barometer: snapshot_date muss YYYY-MM-DD sein");
requireValue(Number.isFinite(barometerPayload.weighted_coverage) && barometerPayload.weighted_coverage >= 0 && barometerPayload.weighted_coverage <= 1, "barometer: weighted_coverage muss zwischen 0 und 1 liegen");
requireValue(barometerPayload.score === null || (Number.isFinite(barometerPayload.score) && barometerPayload.score >= 0 && barometerPayload.score <= 100), "barometer: score muss null oder 0 bis 100 sein");
if (barometerPayload.weighted_coverage < (barometerPayload.publication_gate?.minimum_weighted_coverage ?? 1)) {
  requireValue(barometerPayload.score === null, "barometer: unter der Publikationsschwelle muss score null sein");
}
requireValue(Array.isArray(barometerPayload.components) && barometerPayload.components.length > 0, "barometer: components fehlt");
checkUnique(barometerPayload.components || [], "barometer components");
const componentWeight = (barometerPayload.components || []).reduce((sum, component) => sum + Number(component.weight || 0), 0);
requireValue(Math.abs(componentWeight - 1) < 0.000001, `barometer: Komponenten-Gewichte ergeben ${componentWeight} statt 1`);
const calculatedCoverage = (barometerPayload.components || []).reduce((sum, component) => sum + Number(component.weight || 0) * Number(component.coverage || 0), 0);
requireValue(approximatelyEqual(calculatedCoverage, barometerPayload.weighted_coverage), `barometer: gewichtete Abdeckung ${barometerPayload.weighted_coverage} stimmt nicht mit ${calculatedCoverage} ueberein`);
for (const component of barometerPayload.components || []) {
  const prefix = `barometer component ${component.id || "<ohne id>"}`;
  requireValue(Number.isFinite(component.weight) && component.weight > 0, `${prefix}: weight ungueltig`);
  requireValue(Number.isFinite(component.coverage) && component.coverage >= 0 && component.coverage <= 1, `${prefix}: coverage ungueltig`);
  requireValue(component.current_score === null || (Number.isFinite(component.current_score) && component.current_score >= 0 && component.current_score <= 100), `${prefix}: current_score ungueltig`);
  requireValue(allowedComponentStatus.has(component.status), `${prefix}: status ungueltig`);
  requireValue(typeof component.label_de === "string" && typeof component.label_en === "string", `${prefix}: zweisprachige Labels fehlen`);
}
if (barometerPayload.score !== null) {
  const weightedScore = (barometerPayload.components || []).reduce((sum, component) => {
    if (!Number.isFinite(component.current_score)) return sum;
    return sum + component.weight * component.coverage * component.current_score;
  }, 0) / calculatedCoverage;
  requireValue(approximatelyEqual(weightedScore, barometerPayload.score, 0.11), `barometer: Score ${barometerPayload.score} stimmt nicht mit Komponentenwert ${weightedScore} ueberein`);
}
requireValue(Array.isArray(barometerPayload.retail_baskets) && barometerPayload.retail_baskets.length >= 4, "barometer: mindestens vier Retail-Warenkoerbe erforderlich");
checkUnique(barometerPayload.retail_baskets || [], "barometer retail baskets");
requireValue(Array.isArray(barometerPayload.quality_guardrails) && barometerPayload.quality_guardrails.length > 0, "barometer: quality_guardrails fehlt");
checkUnique(barometerPayload.quality_guardrails || [], "barometer guardrails");
requireValue(Array.isArray(barometerPayload.sources) && barometerPayload.sources.length > 0, "barometer: sources fehlt");
checkUnique(barometerPayload.sources || [], "barometer sources");
for (const source of barometerPayload.sources || []) {
  const prefix = `barometer source ${source.id || "<ohne id>"}`;
  requireValue(allowedGrades.has(source.grade), `${prefix}: grade ungueltig`);
  requireValue(httpsUrl.test(source.url || ""), `${prefix}: URL muss HTTPS sein`);
  requireValue(isoDate.test(source.last_checked || ""), `${prefix}: last_checked muss YYYY-MM-DD sein`);
}

requireValue(isoDate.test(historyPayload.snapshot_date || ""), "history: snapshot_date muss YYYY-MM-DD sein");
requireValue(isoMonth.test(historyPayload.period_start || ""), "history: period_start muss YYYY-MM sein");
requireValue(isoMonth.test(historyPayload.period_end || ""), "history: period_end muss YYYY-MM sein");
requireValue(Number.isInteger(historyPayload.history_months) && historyPayload.history_months >= 12, "history: mindestens 12 Monate erforderlich");
requireValue(approximatelyEqual(historyPayload.method?.weighted_coverage, barometerPayload.weighted_coverage), "history: weighted_coverage muss dem Barometer entsprechen");

requireValue(Array.isArray(historyPayload.monthly_series) && historyPayload.monthly_series.length >= 4, "history: mindestens vier Monatsreihen erforderlich");
checkUnique(historyPayload.monthly_series || [], "history monthly series");
for (const series of historyPayload.monthly_series || []) {
  const prefix = `history monthly series ${series.id || "<ohne id>"}`;
  requireValue(allowedSeriesEvidence.has(series.evidence_type), `${prefix}: evidence_type ungueltig`);
  requireValue(series.frequency === "monthly", `${prefix}: frequency muss monthly sein`);
  requireValue(httpsUrl.test(series.source_url || ""), `${prefix}: source_url muss HTTPS sein`);
  requireValue(isoMonth.test(series.latest_period || ""), `${prefix}: latest_period muss YYYY-MM sein`);
  requireValue(Array.isArray(series.observations) && series.observations.length >= 12, `${prefix}: zu wenige Beobachtungen`);
  const seenPeriods = new Set();
  let previousPeriod = null;
  for (const observation of series.observations || []) {
    requireValue(isoMonth.test(observation.period || ""), `${prefix}: ungueltige Periode ${observation.period}`);
    requireValue(!seenPeriods.has(observation.period), `${prefix}: doppelte Periode ${observation.period}`);
    if (previousPeriod) requireValue(observation.period > previousPeriod, `${prefix}: Perioden nicht aufsteigend`);
    seenPeriods.add(observation.period);
    previousPeriod = observation.period;
    requireValue(allowedMonthlyObservationStatus.has(observation.status), `${prefix}: ungueltiger Beobachtungsstatus ${observation.status}`);
    requireValue(observation.value === null || Number.isFinite(observation.value), `${prefix}: value muss Zahl oder null sein`);
    if (["unavailable", "not_released"].includes(observation.status)) requireValue(observation.value === null, `${prefix}: fehlender Status muss value null haben`);
    if (["direct_observation", "preliminary"].includes(observation.status)) requireValue(Number.isFinite(observation.value), `${prefix}: beobachteter Status braucht Zahlenwert`);
  }
}

requireValue(Array.isArray(historyPayload.quarterly_series) && historyPayload.quarterly_series.length >= 2, "history: mindestens zwei Quartalsreihen erforderlich");
checkUnique(historyPayload.quarterly_series || [], "history quarterly series");
for (const series of historyPayload.quarterly_series || []) {
  const prefix = `history quarterly series ${series.id || "<ohne id>"}`;
  requireValue(allowedSeriesEvidence.has(series.evidence_type), `${prefix}: evidence_type ungueltig`);
  requireValue(series.frequency === "quarterly", `${prefix}: frequency muss quarterly sein`);
  requireValue(httpsUrl.test(series.source_url || ""), `${prefix}: source_url muss HTTPS sein`);
  requireValue(Array.isArray(series.observations) && series.observations.length >= 4, `${prefix}: zu wenige Quartalsbeobachtungen`);
  let previousPeriod = null;
  for (const observation of series.observations || []) {
    requireValue(isoQuarter.test(observation.period || ""), `${prefix}: ungueltige Periode ${observation.period}`);
    if (previousPeriod) requireValue(observation.period > previousPeriod, `${prefix}: Perioden nicht aufsteigend`);
    previousPeriod = observation.period;
    requireValue(allowedQuarterlyObservationStatus.has(observation.status), `${prefix}: ungueltiger Beobachtungsstatus ${observation.status}`);
    if (series.id === "hyperscaler_cash_capex") {
      requireValue(Number.isFinite(observation.value) && observation.value > 0, `${prefix}: Capex-Wert ungueltig`);
      requireValue(observation.breakdown && Object.keys(observation.breakdown).length === 4, `${prefix}: vier Unternehmen im Breakdown erforderlich`);
      const breakdownTotal = Object.values(observation.breakdown || {}).reduce((sum, value) => sum + Number(value || 0), 0);
      requireValue(approximatelyEqual(breakdownTotal, observation.value, 0.0011), `${prefix}: Breakdown ${breakdownTotal} stimmt nicht mit ${observation.value} ueberein`);
    }
    if (series.id === "memory_contract_price_signal") {
      requireValue(Number.isFinite(observation.dram_change_pct), `${prefix}: dram_change_pct fehlt`);
      requireValue(Number.isFinite(observation.nand_change_pct), `${prefix}: nand_change_pct fehlt`);
      requireValue(httpsUrl.test(observation.source_url || ""), `${prefix}: Beobachtungsquelle muss HTTPS sein`);
    }
  }
}

requireValue(Array.isArray(historyPayload.monthly_scores) && historyPayload.monthly_scores.length === historyPayload.history_months, "history: monthly_scores muss genau history_months enthalten");
const componentMap = new Map((barometerPayload.components || []).map((component) => [component.id, component]));
let previousScorePeriod = null;
for (const observation of historyPayload.monthly_scores || []) {
  const prefix = `history score ${observation.period || "<ohne Periode>"}`;
  requireValue(isoMonth.test(observation.period || ""), `${prefix}: Periode ungueltig`);
  if (previousScorePeriod) requireValue(observation.period === nextMonth(previousScorePeriod), `${prefix}: Monatsfolge hat eine Luecke nach ${previousScorePeriod}`);
  previousScorePeriod = observation.period;
  requireValue(Number.isFinite(observation.score) && observation.score >= 0 && observation.score <= 100, `${prefix}: score ungueltig`);
  requireValue(approximatelyEqual(observation.weighted_coverage, barometerPayload.weighted_coverage), `${prefix}: Abdeckung weicht vom Barometer ab`);
  requireValue(observation.confidence === barometerPayload.confidence, `${prefix}: Konfidenz weicht vom Barometer ab`);
  let numerator = 0;
  for (const [componentId, componentScore] of Object.entries(observation.components || {})) {
    const component = componentMap.get(componentId);
    requireValue(Boolean(component), `${prefix}: unbekannte Komponente ${componentId}`);
    requireValue(Number.isFinite(componentScore) && componentScore >= 0 && componentScore <= 100, `${prefix}: Komponentenwert ${componentId} ungueltig`);
    if (component) numerator += component.weight * component.coverage * componentScore;
  }
  requireValue(approximatelyEqual(numerator / barometerPayload.weighted_coverage, observation.score, 0.11), `${prefix}: Score stimmt nicht mit Komponenten ueberein`);
}
const firstHistoryScore = historyPayload.monthly_scores?.[0];
const latestHistoryScore = historyPayload.monthly_scores?.at(-1);
requireValue(firstHistoryScore?.period === historyPayload.period_start, "history: erster Score stimmt nicht mit period_start ueberein");
requireValue(latestHistoryScore?.period === historyPayload.period_end, "history: letzter Score stimmt nicht mit period_end ueberein");
requireValue(approximatelyEqual(latestHistoryScore?.score, barometerPayload.score, 0.001), "history: letzter Score muss dem Barometer-Score entsprechen");
requireValue(approximatelyEqual(latestHistoryScore?.weighted_coverage, barometerPayload.weighted_coverage), "history: letzte Abdeckung muss dem Barometer entsprechen");
requireValue(barometerPayload.publication_gate?.provisional_gate_met === (barometerPayload.weighted_coverage >= barometerPayload.publication_gate?.minimum_weighted_coverage && historyPayload.history_months >= barometerPayload.publication_gate?.minimum_history_months), "barometer: provisional_gate_met ist inkonsistent");

requireValue(Array.isArray(historyPayload.current_evidence) && historyPayload.current_evidence.length >= 5, "history: current_evidence unvollstaendig");
checkUnique(historyPayload.current_evidence || [], "history current evidence");
requireValue(Array.isArray(historyPayload.sources) && historyPayload.sources.length >= 5, "history: sources unvollstaendig");
checkUnique(historyPayload.sources || [], "history sources");
const historySourceIds = new Set((historyPayload.sources || []).map((source) => source.id));
for (const source of historyPayload.sources || []) {
  const prefix = `history source ${source.id || "<ohne id>"}`;
  requireValue(allowedGrades.has(source.grade), `${prefix}: grade ungueltig`);
  requireValue(httpsUrl.test(source.url || ""), `${prefix}: URL muss HTTPS sein`);
  requireValue(isoDate.test(source.last_checked || ""), `${prefix}: last_checked muss YYYY-MM-DD sein`);
}
for (const evidence of historyPayload.current_evidence || []) {
  requireValue(historySourceIds.has(evidence.source_id), `history evidence ${evidence.id}: unbekannte source_id ${evidence.source_id}`);
  requireValue(Number.isFinite(evidence.value), `history evidence ${evidence.id}: value fehlt`);
}

if (errors.length) {
  console.error(`Datenvalidierung fehlgeschlagen (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Datenvalidierung bestanden: ${projectsPayload.projects.length} Projekte, ${registryPayload.sources.length} Recherchequellen, ${supplyChainPayload.producers.length} Produzenten, ${historyPayload.history_months} Barometer-Monate, CHPI ${barometerPayload.score}, Abdeckung ${Math.round(barometerPayload.weighted_coverage * 100)}%.`);
}
