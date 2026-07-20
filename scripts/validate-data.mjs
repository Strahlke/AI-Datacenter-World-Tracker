import { readFile } from "node:fs/promises";

const projectFile = new URL("../data/projects.json", import.meta.url);
const registryFile = new URL("../data/source-registry.json", import.meta.url);
const supplyChainFile = new URL("../data/supply-chain.json", import.meta.url);
const barometerFile = new URL("../data/hardware-barometer.json", import.meta.url);
const historyFile = new URL("../data/hardware-history.json", import.meta.url);
const investmentProgramsFile = new URL("../data/investment-programs.json", import.meta.url);
const retailBasketsFile = new URL("../data/retail-baskets.json", import.meta.url);
const retailObservationsFile = new URL("../data/retail-observations.json", import.meta.url);
const retailHistoryFile = new URL("../data/retail-history.json", import.meta.url);
const retailHistoryDailyFile = new URL("../data/retail-history-daily.json", import.meta.url);

const projectsPayload = JSON.parse(await readFile(projectFile, "utf8"));
const registryPayload = JSON.parse(await readFile(registryFile, "utf8"));
const supplyChainPayload = JSON.parse(await readFile(supplyChainFile, "utf8"));
const barometerPayload = JSON.parse(await readFile(barometerFile, "utf8"));
const historyPayload = JSON.parse(await readFile(historyFile, "utf8"));
const investmentProgramsPayload = JSON.parse(await readFile(investmentProgramsFile, "utf8"));
const retailBasketsPayload = JSON.parse(await readFile(retailBasketsFile, "utf8"));
const retailObservationsPayload = JSON.parse(await readFile(retailObservationsFile, "utf8"));
const retailHistoryPayload = JSON.parse(await readFile(retailHistoryFile, "utf8"));
const retailHistoryDailyPayload = JSON.parse(await readFile(retailHistoryDailyFile, "utf8"));

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
const allowedAccess = new Set(["api", "download", "web", "search", "dynamic_search", "public_web_ui_endpoint"]);
const allowedExposure = new Set(["high", "medium", "low"]);
const allowedComponentStatus = new Set(["tracked", "source_gap", "source_design"]);
const allowedSeriesEvidence = new Set(["direct", "direct_proxy", "industry_proxy"]);
const allowedMonthlyObservationStatus = new Set(["direct_observation", "preliminary", "unavailable", "not_released"]);
const allowedQuarterlyObservationStatus = new Set(["reported_actual", "forecast_midpoint", "mixed_actual_forecast"]);
const allowedRecordTypes = new Set(["facility", "multi_site_cluster", "national_program", "ai_factory_compute_deployment"]);
const allowedImpactBands = new Set(["unknown", "local", "regional", "strategic", "mega"]);
const allowedInvestmentValueTypes = new Set([null, "exact", "approximate", "minimum", "ceiling"]);
const allowedRetailLevels = new Set(["L0", "L1", "L2", "L3", "L4"]);

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
requireValue(projectsPayload.method && typeof projectsPayload.method === "object" && !Array.isArray(projectsPayload.method), "projects: method muss ein Objekt sein");
requireValue(typeof projectsPayload.method?.status_method_de === "string" && projectsPayload.method.status_method_de.length > 0, "projects: deutsche Statusmethode fehlt");
requireValue(typeof projectsPayload.method?.status_method_en === "string" && projectsPayload.method.status_method_en.length > 0, "projects: englische Statusmethode fehlt");
requireValue(!Object.keys(projectsPayload.method || {}).some((key) => /^\d+$/.test(key)), "projects: method enthaelt versehentlich Zeichenindex-Schluessel");
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
  requireValue(allowedRecordTypes.has(project.record_type), `${prefix}: ungueltiger record_type`);
  requireValue(Number.isFinite(project.lat) && project.lat >= -90 && project.lat <= 90, `${prefix}: lat ungueltig`);
  requireValue(Number.isFinite(project.lon) && project.lon >= -180 && project.lon <= 180, `${prefix}: lon ungueltig`);
  requireValue(isoDate.test(project.last_checked || ""), `${prefix}: last_checked muss YYYY-MM-DD sein`);
  requireValue(Array.isArray(project.history) && project.history.length > 0, `${prefix}: history fehlt`);
  requireValue(Array.isArray(project.sources) && project.sources.length > 0, `${prefix}: sources fehlt`);
  const impact = project.impact;
  requireValue(impact && typeof impact === "object", `${prefix}: impact fehlt`);
  requireValue([impact?.power_mw, impact?.investment_usd_bn, impact?.accelerator_count].every((value) => value === null || (Number.isFinite(value) && value > 0)), `${prefix}: impact inputs muessen positive Zahlen oder null sein`);
  requireValue(allowedInvestmentValueTypes.has(impact?.investment_value_type ?? null), `${prefix}: investment_value_type ungueltig`);
  requireValue(typeof impact?.investment_countable === "boolean", `${prefix}: investment_countable fehlt`);
  requireValue(impact?.method_version === "1.0", `${prefix}: impact method_version ungueltig`);
  requireValue(allowedImpactBands.has(impact?.band), `${prefix}: impact band ungueltig`);
  requireValue(Number.isFinite(impact?.metric_coverage) && impact.metric_coverage >= 0 && impact.metric_coverage <= 1, `${prefix}: impact metric_coverage ungueltig`);
  const impactMetrics = [
    ["power", impact?.power_mw, 0.45, 5000],
    ["investment", impact?.investment_usd_bn, 0.35, 50],
    ["accelerators", impact?.accelerator_count, 0.20, 1000000],
  ].filter(([, value]) => Number.isFinite(value) && value > 0);
  const impactWeight = impactMetrics.reduce((sum, item) => sum + item[2], 0);
  const impactScore = impactMetrics.length ? Math.round(impactMetrics.reduce((sum, [id, value, weight, cap]) => {
    const componentScore = Math.round(Math.min(100, 100 * Math.log1p(value) / Math.log1p(cap)) * 10) / 10;
    requireValue(approximatelyEqual(impact?.component_scores?.[id], componentScore, 0.01), `${prefix}: impact component ${id} stimmt nicht`);
    return sum + componentScore * weight;
  }, 0) / impactWeight) : null;
  requireValue(approximatelyEqual(impact?.metric_coverage, Math.round(impactWeight * 100) / 100, 0.001), `${prefix}: impact metric_coverage stimmt nicht`);
  requireValue(impactScore === null ? impact?.score === null : impact?.score === impactScore, `${prefix}: impact score stimmt nicht`);
  const expectedBand = impactScore === null ? "unknown" : impactScore >= 75 ? "mega" : impactScore >= 55 ? "strategic" : impactScore >= 35 ? "regional" : "local";
  requireValue(impact?.band === expectedBand, `${prefix}: impact band stimmt nicht`);
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

requireValue(isoDate.test(investmentProgramsPayload.snapshot_date || ""), "investment-programs: snapshot_date muss YYYY-MM-DD sein");
requireValue(Array.isArray(investmentProgramsPayload.programs) && investmentProgramsPayload.programs.length > 0, "investment-programs: programs fehlt");
checkUnique(investmentProgramsPayload.programs || [], "investment-programs");
const projectIds = new Set((projectsPayload.projects || []).map((project) => project.id));
for (const program of investmentProgramsPayload.programs || []) {
  const prefix = `investment-program ${program.id || "<ohne id>"}`;
  requireValue(typeof program.name === "string" && program.name.length > 0, `${prefix}: name fehlt`);
  requireValue(Number.isFinite(program.commitment?.value_bn) && program.commitment.value_bn > 0, `${prefix}: commitment value_bn ungueltig`);
  requireValue(typeof program.commitment?.currency === "string" && program.commitment.currency.length === 3, `${prefix}: commitment currency ungueltig`);
  requireValue(program.countable_with_sites === false, `${prefix}: Programme duerfen nicht mit Standorten addiert werden`);
  requireValue(typeof program.double_count_group === "string" && program.double_count_group.length > 0, `${prefix}: double_count_group fehlt`);
  requireValue(Array.isArray(program.includes_project_ids), `${prefix}: includes_project_ids fehlt`);
  for (const id of program.includes_project_ids || []) requireValue(projectIds.has(id), `${prefix}: unbekanntes Projekt ${id}`);
  requireValue(httpsUrl.test(program.source?.url || ""), `${prefix}: source URL muss HTTPS sein`);
}

requireValue(isoDate.test(retailBasketsPayload.snapshot_date || ""), "retail-baskets: snapshot_date muss YYYY-MM-DD sein");
requireValue(allowedRetailLevels.has(retailBasketsPayload.current_level), "retail-baskets: current_level ungueltig");
requireValue(Number.isFinite(retailBasketsPayload.retail_readiness) && retailBasketsPayload.retail_readiness >= 0 && retailBasketsPayload.retail_readiness <= 1, "retail-baskets: retail_readiness ungueltig");
requireValue(Array.isArray(retailBasketsPayload.maturity_levels) && retailBasketsPayload.maturity_levels.length === 5, "retail-baskets: exakt fuenf Reifegrade erforderlich");
checkUnique(retailBasketsPayload.maturity_levels || [], "retail maturity levels");
requireValue((retailBasketsPayload.maturity_levels || []).some((level) => level.id === retailBasketsPayload.current_level && level.met === true), "retail-baskets: aktueller Reifegrad muss erfuellt sein");
requireValue(Array.isArray(retailBasketsPayload.baskets) && retailBasketsPayload.baskets.length >= 4, "retail-baskets: mindestens vier Warenkoerbe erforderlich");
checkUnique(retailBasketsPayload.baskets || [], "retail baskets");
for (const basket of retailBasketsPayload.baskets || []) {
  const prefix = `retail basket ${basket.id || "<ohne id>"}`;
  requireValue(Number.isInteger(basket.target_slots) && basket.target_slots >= 6, `${prefix}: target_slots ungueltig`);
  requireValue(Number.isInteger(basket.minimum_comparable_skus) && basket.minimum_comparable_skus >= 6, `${prefix}: minimum_comparable_skus ungueltig`);
  requireValue(Array.isArray(basket.cohorts) && basket.cohorts.length > 0, `${prefix}: cohorts fehlt`);
  requireValue(Number.isInteger(basket.observed_skus) && basket.observed_skus >= 0, `${prefix}: observed_skus ungueltig`);
  requireValue(Number.isInteger(basket.active_retailers) && basket.active_retailers >= 0, `${prefix}: active_retailers ungueltig`);
}
requireValue(Array.isArray(retailBasketsPayload.source_options) && retailBasketsPayload.source_options.length >= 2, "retail-baskets: mindestens oeffentliche Hauptquelle und gepruefter Fallback erforderlich");
checkUnique(retailBasketsPayload.source_options || [], "retail source options");
for (const option of retailBasketsPayload.source_options || []) {
  requireValue(option.url === null || httpsUrl.test(option.url || ""), `retail source ${option.id}: URL muss HTTPS oder null sein`);
}
requireValue(Array.isArray(retailBasketsPayload.required_observation_fields) && retailBasketsPayload.required_observation_fields.length >= 10, "retail-baskets: Beobachtungsschema unvollstaendig");
requireValue(barometerPayload.retail_model?.file === "retail-baskets.json", "barometer: retail_model file fehlt");
requireValue(barometerPayload.retail_model?.observations_file === "retail-observations.json", "barometer: retail observations file fehlt");
requireValue(barometerPayload.retail_model?.history_file === "retail-history.json", "barometer: retail history file fehlt");
requireValue(barometerPayload.retail_model?.raw_history_file === "retail-history-daily.json", "barometer: raw retail history file fehlt");
requireValue(barometerPayload.retail_model?.current_level === retailBasketsPayload.current_level, "barometer: retail level stimmt nicht mit retail-baskets ueberein");
requireValue(approximatelyEqual(barometerPayload.retail_model?.retail_readiness, retailBasketsPayload.retail_readiness), "barometer: retail readiness stimmt nicht mit retail-baskets ueberein");

requireValue(isoDate.test(retailObservationsPayload.snapshot_date || ""), "retail-observations: snapshot_date muss YYYY-MM-DD sein");
requireValue(retailObservationsPayload.frequency === "weekly", "retail-observations: frequency muss weekly sein");
requireValue(httpsUrl.test(retailObservationsPayload.source?.url || ""), "retail-observations: source URL muss HTTPS sein");
requireValue(allowedGrades.has(retailObservationsPayload.source?.grade), "retail-observations: source grade ungueltig");
requireValue(Array.isArray(retailObservationsPayload.snapshots) && retailObservationsPayload.snapshots.length >= 1, "retail-observations: mindestens ein Snapshot erforderlich");
requireValue(barometerPayload.retail_model?.weekly_snapshots === retailObservationsPayload.snapshots.length, "barometer: weekly_snapshots stimmt nicht mit retail-observations ueberein");

const retailBasketDefinitions = new Map((retailBasketsPayload.baskets || []).map((basket) => [basket.id, basket]));
let previousRetailTimestamp = null;
for (const snapshot of retailObservationsPayload.snapshots || []) {
  const timestamp = Date.parse(snapshot.observed_at || "");
  requireValue(Number.isFinite(timestamp), `retail-observations: observed_at ungueltig ${snapshot.observed_at}`);
  if (previousRetailTimestamp !== null) requireValue(timestamp > previousRetailTimestamp, "retail-observations: Snapshots muessen zeitlich aufsteigend sein");
  previousRetailTimestamp = timestamp;
  requireValue(snapshot.market === "DE", "retail-observations: market muss DE sein");
  requireValue(snapshot.currency === "EUR", "retail-observations: currency muss EUR sein");
  requireValue(snapshot.price_basis === "gross_ex_shipping", "retail-observations: price_basis muss gross_ex_shipping sein");
  requireValue(Array.isArray(snapshot.baskets) && snapshot.baskets.length === retailBasketDefinitions.size, "retail-observations: Snapshot muss alle Warenkoerbe enthalten");

  const seenBasketIds = new Set();
  for (const basketObservation of snapshot.baskets || []) {
    const prefix = `retail observation ${snapshot.observed_at || "<ohne Zeit>"} ${basketObservation.basket_id || "<ohne basket_id>"}`;
    requireValue(retailBasketDefinitions.has(basketObservation.basket_id), `${prefix}: unbekannter Warenkorb`);
    requireValue(!seenBasketIds.has(basketObservation.basket_id), `${prefix}: doppelter Warenkorb`);
    seenBasketIds.add(basketObservation.basket_id);
    requireValue(httpsUrl.test(basketObservation.wishlist_url || ""), `${prefix}: wishlist_url muss HTTPS sein`);
    requireValue(Array.isArray(basketObservation.products), `${prefix}: products fehlt`);

    const seenMpns = new Set();
    let availableCount = 0;
    let calculatedTotal = 0;
    for (const product of basketObservation.products || []) {
      requireValue(typeof product.name === "string" && product.name.length > 0, `${prefix}: Produktname fehlt`);
      requireValue(typeof product.mpn === "string" && product.mpn.length > 0, `${prefix}: MPN fehlt`);
      requireValue(!seenMpns.has(product.mpn), `${prefix}: doppelte MPN ${product.mpn}`);
      seenMpns.add(product.mpn);
      requireValue(Number.isInteger(product.offer_count) && product.offer_count >= 0, `${prefix} ${product.mpn}: offer_count ungueltig`);
      requireValue(["listed", "no_offer"].includes(product.availability), `${prefix} ${product.mpn}: availability ungueltig`);
      if (product.offer_count > 0) {
        requireValue(product.availability === "listed", `${prefix} ${product.mpn}: Angebote erfordern listed`);
        requireValue(Number.isFinite(product.best_price_eur) && product.best_price_eur > 0, `${prefix} ${product.mpn}: positiver Bestpreis fehlt`);
        availableCount += 1;
        calculatedTotal += Number(product.best_price_eur || 0);
      } else {
        requireValue(product.availability === "no_offer", `${prefix} ${product.mpn}: null Angebote erfordern no_offer`);
        requireValue(product.best_price_eur === null, `${prefix} ${product.mpn}: ohne Angebot muss Preis null sein`);
      }
    }
    requireValue(basketObservation.item_count === basketObservation.products.length, `${prefix}: item_count stimmt nicht mit products ueberein`);
    requireValue(basketObservation.available_count === availableCount, `${prefix}: available_count stimmt nicht`);
    requireValue(approximatelyEqual(basketObservation.total_best_price_eur, Math.round(calculatedTotal * 100) / 100, 0.001), `${prefix}: total_best_price_eur stimmt nicht`);

    const definition = retailBasketDefinitions.get(basketObservation.basket_id);
    if (definition) {
      requireValue(definition.target_slots === basketObservation.item_count, `${prefix}: item_count stimmt nicht mit target_slots ueberein`);
      requireValue(definition.observed_skus === basketObservation.item_count, `${prefix}: observed_skus stimmt nicht`);
      requireValue(definition.available_skus === basketObservation.available_count, `${prefix}: available_skus stimmt nicht`);
      requireValue(definition.wishlist_url === basketObservation.wishlist_url, `${prefix}: wishlist_url stimmt nicht mit Definition ueberein`);
    }
  }
}

const latestRetailSnapshot = retailObservationsPayload.snapshots?.at(-1);
if (latestRetailSnapshot) {
  const latestBaskets = latestRetailSnapshot.baskets || [];
  const totalRetailItems = latestBaskets.reduce((sum, basket) => sum + basket.item_count, 0);
  const totalAvailableItems = latestBaskets.reduce((sum, basket) => sum + basket.available_count, 0);
  const categoriesWithMinimumCoverage = latestBaskets.filter((basket) => basket.item_count >= (retailBasketDefinitions.get(basket.basket_id)?.minimum_comparable_skus || Infinity)).length;
  requireValue(retailBasketsPayload.observation_summary?.weekly_observations === retailObservationsPayload.snapshots.length, "retail-baskets: weekly_observations stimmt nicht mit retail-observations ueberein");
  requireValue(retailBasketsPayload.observation_summary?.categories_with_minimum_coverage === categoriesWithMinimumCoverage, "retail-baskets: categories_with_minimum_coverage stimmt nicht");
  requireValue(approximatelyEqual(retailBasketsPayload.observation_summary?.availability_coverage, totalAvailableItems / totalRetailItems), "retail-baskets: availability_coverage stimmt nicht");
}

requireValue(isoDate.test(retailHistoryPayload.snapshot_date || ""), "retail-history: snapshot_date muss YYYY-MM-DD sein");
requireValue(isoDate.test(retailHistoryPayload.period_start || ""), "retail-history: period_start muss YYYY-MM-DD sein");
requireValue(isoDate.test(retailHistoryPayload.period_end || ""), "retail-history: period_end muss YYYY-MM-DD sein");
requireValue(retailHistoryPayload.market === "DE" && retailHistoryPayload.currency === "EUR", "retail-history: Markt/Waehrung muss DE/EUR sein");
requireValue(retailHistoryPayload.source?.id === "geizhals-public-price-history", "retail-history: unerwartete Quelle");
requireValue(retailHistoryPayload.source?.access === "public_ui_endpoint_no_credentials", "retail-history: Quelle muss ohne Credentials reproduzierbar sein");
requireValue(retailHistoryPayload.quality?.reconstructed_history === true, "retail-history: rekonstruierte Historie muss explizit markiert sein");
requireValue(retailHistoryDailyPayload.requested_days === 365, "retail-history-daily: requested_days muss 365 sein");
requireValue(retailHistoryDailyPayload.snapshot_date === retailHistoryPayload.snapshot_date, "retail-history: Snapshot-Daten stimmen nicht ueberein");
requireValue(Array.isArray(retailHistoryPayload.baskets) && retailHistoryPayload.baskets.length === retailBasketDefinitions.size, "retail-history: alle Warenkoerbe erforderlich");
requireValue(Array.isArray(retailHistoryDailyPayload.baskets) && retailHistoryDailyPayload.baskets.length === retailBasketDefinitions.size, "retail-history-daily: alle Warenkoerbe erforderlich");

const rawHistoryByBasket = new Map((retailHistoryDailyPayload.baskets || []).map((basket) => [basket.basket_id, basket]));
let historicalProductSeries = 0;
let historicalProductPoints = 0;
let historicalBasketPoints = 0;
const globalHistoricalMpns = new Set();

function validateDailySeries(series, prefix, expectedLength = null) {
  requireValue(Array.isArray(series) && series.length > 0, `${prefix}: Zeitreihe fehlt`);
  if (expectedLength !== null) requireValue(series?.length === expectedLength, `${prefix}: ${expectedLength} Punkte erwartet`);
  let previousDate = null;
  for (const point of series || []) {
    requireValue(Array.isArray(point) && point.length >= 3, `${prefix}: Punktformat ungueltig`);
    requireValue(isoDate.test(point?.[0] || ""), `${prefix}: Datum ungueltig`);
    if (previousDate !== null) requireValue(point[0] > previousDate, `${prefix}: Daten muessen strikt aufsteigen`);
    previousDate = point[0];
    requireValue(point[1] === null || (Number.isFinite(point[1]) && point[1] > 0), `${prefix}: Preis/Index ungueltig`);
    requireValue(Number.isInteger(point[2]) && point[2] >= 0, `${prefix}: Abdeckung ungueltig`);
  }
}

for (const basket of retailHistoryPayload.baskets || []) {
  const prefix = `retail-history ${basket.basket_id || "<ohne basket_id>"}`;
  const definition = retailBasketDefinitions.get(basket.basket_id);
  const raw = rawHistoryByBasket.get(basket.basket_id);
  requireValue(Boolean(definition), `${prefix}: unbekannter Warenkorb`);
  requireValue(Boolean(raw), `${prefix}: Rohdaten fehlen`);
  if (!definition || !raw) continue;

  requireValue(basket.wishlist_url === definition.wishlist_url, `${prefix}: wishlist_url stimmt nicht`);
  requireValue(basket.target_product_count === definition.target_slots, `${prefix}: target_product_count stimmt nicht`);
  requireValue(Array.isArray(raw.article_ids) && raw.article_ids.length === definition.target_slots, `${prefix}: article_ids unvollstaendig`);
  requireValue(JSON.stringify(raw.article_ids) === JSON.stringify(definition.geizhals_article_ids), `${prefix}: article_ids stimmen nicht mit Definition ueberein`);
  requireValue(Array.isArray(basket.products) && basket.products.length === definition.target_slots, `${prefix}: Produkt-Summaries unvollstaendig`);
  requireValue(Array.isArray(raw.products) && raw.products.length === definition.target_slots, `${prefix}: Produkt-Rohreihen unvollstaendig`);
  validateDailySeries(raw.basket_series, `${prefix} basket_series`, 365);
  validateDailySeries(raw.comparable_index_series, `${prefix} comparable_index_series`, 365);
  historicalBasketPoints += raw.basket_series.length;

  const rawProducts = new Map(raw.products.map((product) => [product.article_id, product]));
  const summaryProducts = new Map(basket.products.map((product) => [product.article_id, product]));
  for (const articleId of definition.geizhals_article_ids || []) {
    const product = rawProducts.get(articleId);
    const summary = summaryProducts.get(articleId);
    requireValue(Boolean(product) && Boolean(summary), `${prefix}: Produkt ${articleId} fehlt`);
    if (!product || !summary) continue;
    requireValue(product.name === summary.name && product.mpn === summary.mpn, `${prefix} ${articleId}: Produkt-Metadaten stimmen nicht ueberein`);
    requireValue(typeof product.mpn === "string" && product.mpn.length > 0, `${prefix} ${articleId}: MPN fehlt`);
    requireValue(!globalHistoricalMpns.has(product.mpn), `${prefix}: doppelte historische MPN ${product.mpn}`);
    globalHistoricalMpns.add(product.mpn);
    validateDailySeries(product.series, `${prefix} ${articleId} product_series`);
    requireValue(Array.isArray(summary.monthly) && summary.monthly.length >= 12, `${prefix} ${articleId}: mindestens 12 Monatssegmente erforderlich`);
    historicalProductSeries += 1;
    historicalProductPoints += product.series.length;
  }

  const latestIndexMonth = basket.comparable_index?.monthly?.at(-1);
  const latestIndexPoint = raw.comparable_index_series?.at(-1);
  requireValue(Number.isFinite(latestIndexMonth?.last_index), `${prefix}: letzter Monatsindex fehlt`);
  requireValue(approximatelyEqual(latestIndexMonth?.last_index, latestIndexPoint?.[1], 0.011), `${prefix}: letzter Monatsindex stimmt nicht mit Rohreihe ueberein`);
  requireValue(basket.comparable_index?.eligible_product_count >= definition.minimum_comparable_skus, `${prefix}: zu wenige vergleichbare Produkte`);
}

requireValue(historicalBasketPoints === retailHistoryPayload.quality?.raw_basket_daily_points, "retail-history: raw_basket_daily_points stimmt nicht");
requireValue(historicalProductSeries === retailHistoryPayload.quality?.product_series_count, "retail-history: product_series_count stimmt nicht");
requireValue(historicalProductPoints === retailHistoryPayload.quality?.raw_product_daily_points, "retail-history: raw_product_daily_points stimmt nicht");
requireValue(retailBasketsPayload.observation_summary?.historical_days === 365, "retail-baskets: historical_days muss 365 sein");
requireValue(retailBasketsPayload.observation_summary?.historical_product_series === historicalProductSeries, "retail-baskets: historical_product_series stimmt nicht");
requireValue(retailBasketsPayload.observation_summary?.historical_product_points === historicalProductPoints, "retail-baskets: historical_product_points stimmt nicht");
requireValue(barometerPayload.retail_model?.historical_days === 365, "barometer: historical_days muss 365 sein");
requireValue(barometerPayload.retail_model?.historical_product_series === historicalProductSeries, "barometer: historical_product_series stimmt nicht");
requireValue(barometerPayload.retail_model?.historical_product_points === historicalProductPoints, "barometer: historical_product_points stimmt nicht");
for (const removedSourceId of ["ebay-browse-api", "bestbuy-products-api", "keepa-api"]) {
  requireValue(!(registryPayload.sources || []).some((source) => source.id === removedSourceId), `registry: unrealistische Retail-Quelle ${removedSourceId} darf nicht aktiv sein`);
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
