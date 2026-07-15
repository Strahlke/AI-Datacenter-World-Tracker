import { readFile } from "node:fs/promises";

const projectFile = new URL("../data/projects.json", import.meta.url);
const registryFile = new URL("../data/source-registry.json", import.meta.url);

const projectsPayload = JSON.parse(await readFile(projectFile, "utf8"));
const registryPayload = JSON.parse(await readFile(registryFile, "utf8"));

const errors = [];
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
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

if (errors.length) {
  console.error(`Datenvalidierung fehlgeschlagen (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Datenvalidierung bestanden: ${projectsPayload.projects.length} Projekte, ${registryPayload.sources.length} Recherchequellen.`);
}
