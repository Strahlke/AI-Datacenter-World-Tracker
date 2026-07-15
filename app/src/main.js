import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { feature } from "topojson-client";
import world from "@d3-maps/atlas/world/countries/countries-110m";
import "./style.css";

const countries = feature(world, world.objects.features).features;
const svgNamespace = "http://www.w3.org/2000/svg";

const copy = {
  de: {
    eyebrow: "Global infrastructure monitor",
    dataLink: "Daten",
    language: "Sprache",
    tabMap: "Weltkarte",
    tabMethod: "Quellen & Methodik",
    tabSupply: "Lieferkette",
    tabBarometer: "Hardware-Barometer",
    projects: "Projekte",
    operational: "In Betrieb",
    inProgress: "Im Bau / teilweise live",
    atRisk: "Terminrisiko / gestoppt",
    search: "Suche",
    projectSearch: "Projekt, Land, Betreiber",
    status: "Status",
    region: "Region",
    selectionOpens: "Auswahl öffnet Details",
    reset: "Reset",
    mapHint: "Mausrad oder Pinch zum Zoomen · Ziehen zum Verschieben",
    researchRegistry: "Research registry",
    methodTitle: "Quellenabdeckung und Recherchemethodik",
    openJson: "JSON öffnen",
    sources: "Quellen",
    dynamicRegisters: "Dynamische Register",
    signalTypes: "Signaltypen",
    queueCoverage: "Abdeckung nach Recherchequeue",
    sourceCountUnit: "Anzahl Quellen",
    cadenceCoverage: "Prüfrhythmus",
    evidenceLadder: "Evidenzleiter",
    statusRule: "Statusregel",
    sourceSearch: "Quelle, Signal, Region",
    cadence: "Rhythmus",
    priority: "Priorität",
    filterHint: "Filter wirken nur auf die Tabelle",
    source: "Quelle",
    role: "Rolle",
    useLimits: "Nutzen und Grenzen",
    supplyEyebrow: "AI supply-chain monitor",
    supplyTitle: "Produzenten und mögliche Consumer-Preiskanäle",
    supplyIntro: "Kuratiert nach Lieferkettenstufe. Rollen sind belegt; Marktanteile und Preiseffekte werden erst mit separaten Mengen- und Preisdaten bewertet.",
    trackedProducers: "Produzenten",
    chainStages: "Lieferkettenstufen",
    highExposure: "Direkter Consumer-Kanal",
    primaryEvidence: "Primärquellen",
    stage: "Stufe",
    supplyCaveat: "Mehrfachnennungen sind beabsichtigt, wenn ein Unternehmen in mehreren Stufen aktiv ist.",
    barometerEyebrow: "Consumer impact model",
    openMethod: "Methodik-JSON",
    scoreRange: "von 100",
    dataCoverage: "Datenabdeckung",
    modelWeights: "Modellgewichte & Abdeckung",
    weightPercent: "Gewicht in Prozent",
    consumerReading: "Lesart für Endkunden",
    retailBaskets: "Geplante Retail-Warenkörbe",
    basketIntro: "Stabile SKU-Körbe statt einzelner Tagesangebote.",
    guardrails: "Qualitätsregeln",
    guardrailIntro: "Damit AI-Ausbau nicht fälschlich jeden Preissprung erklärt.",
    modelSources: "Startquellen des Modells",
    modelSourcesIntro: "Primärquellen für Kapazität, Sekundärquellen für Preise, offizielle Statistik als Kontrollreihe.",
    all: "Alle",
    planned: "Geplant",
    underConstruction: "Im Bau / Deployment",
    partlyLive: "Teilweise live",
    paused: "Pausiert / neu geplant",
    cancelled: "Abgesagt",
    hardReference: "Harte Referenz",
    earlySignal: "Frühsignal",
    crossCheck: "Validierung",
    daily: "Täglich",
    weekly: "Wöchentlich",
    monthly: "Monatlich",
    quarterly: "Quartalsweise",
    supporting: "Ergänzend",
    watchlist: "Watchlist",
    noSources: "Keine Quellen für diese Filter.",
    noProjects: "Keine Projekte für diese Filter.",
    project: "Projekt",
    selectedProject: "Projekt auswählen …",
    noSelection: "Keine Auswahl.",
    confidence: "Konfidenz",
    plannedScope: "Geplanter Umfang",
    investment: "Investition",
    target: "Ziel",
    realized: "Realisiert",
    schedule: "Terminlage",
    lastCheck: "Letzte Prüfung",
    history: "Plan- und Statushistorie",
    markerPrecision: "Markerpräzision",
    boundary: "Grenze",
    signals: "Signale",
    localSearch: "Projektlokale Suche",
    sourceGrade: "Quelle",
    inBuild: "In Aufbau",
    dataUnavailable: "Datendatei nicht erreichbar",
    loadingError: "Daten konnten nicht geladen werden.",
    registryMeta: (date, count) => `Stand ${date || "unbekannt"} · ${count} Quellen · feste Suchqueues für jeden Refresh`,
    snapshotMeta: (date, count) => `Datenstand ${date || "unbekannt"} · ${count} Projekte`,
    sourceCount: (count) => `${count} ${count === 1 ? "Quelle" : "Quellen"}`,
    projectCount: (count) => `${count} ${count === 1 ? "Projekt" : "Projekte"}`,
    producerCount: (count) => `${count} ${count === 1 ? "Produzent" : "Produzenten"}`,
    sourceNotesLanguage: "Quellenhinweise werden derzeit redaktionell auf Deutsch gepflegt.",
    projectNotesLanguage: "Projekttexte werden derzeit redaktionell auf Deutsch gepflegt.",
    publicationGate: "Veröffentlichungsschwelle",
    basketTarget: "Ziel-SKUs",
    seriesPending: "Zeitreihe ausstehend",
    producerSignals: "Zu beobachten",
    consumerExposure: "Consumer-Bezug",
    exposureHigh: "direkt",
    exposureMedium: "indirekt",
    exposureLow: "gering",
    weight: "Gewicht",
    coverage: "Abdeckung",
    tracked: "vorhanden",
    sourceGap: "Datenquelle fehlt",
    sourceDesign: "Quelle definiert",
    methodologyA: "Direkter Primärbeleg; kann Status und harte Fakten tragen.",
    methodologyB: "Belastbare Sekundärquelle; braucht bei kritischen Änderungen Gegenprüfung.",
    methodologyC: "Discovery-Signal; darf Status oder Zahlen nie allein ändern.",
    mapTitle: "Weltkarte grosser KI-Rechenzentrumsprojekte",
    mapDescription: "Punkte zeigen verifizierte Standorte und Programme. Farbe kennzeichnet den Lebenszyklusstatus.",
  },
  en: {
    eyebrow: "Global infrastructure monitor",
    dataLink: "Data",
    language: "Language",
    tabMap: "World map",
    tabMethod: "Sources & method",
    tabSupply: "Supply chain",
    tabBarometer: "Hardware barometer",
    projects: "Projects",
    operational: "Operational",
    inProgress: "Building / partly live",
    atRisk: "Schedule risk / stopped",
    search: "Search",
    projectSearch: "Project, country, operator",
    status: "Status",
    region: "Region",
    selectionOpens: "Select to open details",
    reset: "Reset",
    mapHint: "Mouse wheel or pinch to zoom · drag to pan",
    researchRegistry: "Research registry",
    methodTitle: "Source coverage and research method",
    openJson: "Open JSON",
    sources: "Sources",
    dynamicRegisters: "Dynamic registers",
    signalTypes: "Signal types",
    queueCoverage: "Coverage by research queue",
    sourceCountUnit: "Number of sources",
    cadenceCoverage: "Review cadence",
    evidenceLadder: "Evidence ladder",
    statusRule: "Status rule",
    sourceSearch: "Source, signal, region",
    cadence: "Cadence",
    priority: "Priority",
    filterHint: "Filters apply to the table only",
    source: "Source",
    role: "Role",
    useLimits: "Use and limitations",
    supplyEyebrow: "AI supply-chain monitor",
    supplyTitle: "Producers and possible consumer price channels",
    supplyIntro: "Curated by supply-chain stage. Roles are sourced; market shares and price effects require separate volume and price evidence.",
    trackedProducers: "Producers",
    chainStages: "Supply-chain stages",
    highExposure: "Direct consumer channel",
    primaryEvidence: "Primary sources",
    stage: "Stage",
    supplyCaveat: "Companies intentionally appear more than once when active in multiple stages.",
    barometerEyebrow: "Consumer impact model",
    openMethod: "Method JSON",
    scoreRange: "out of 100",
    dataCoverage: "Data coverage",
    modelWeights: "Model weights & coverage",
    weightPercent: "Weight in percent",
    consumerReading: "Consumer interpretation",
    retailBaskets: "Planned retail baskets",
    basketIntro: "Stable SKU baskets instead of single-day deals.",
    guardrails: "Quality guardrails",
    guardrailIntro: "So AI buildout is not made to explain every price spike.",
    modelSources: "Initial model sources",
    modelSourcesIntro: "Primary evidence for capacity, secondary evidence for prices and official statistics as controls.",
    all: "All",
    planned: "Planned",
    underConstruction: "Under construction / deployment",
    partlyLive: "Partly live",
    paused: "Paused / replanned",
    cancelled: "Cancelled",
    hardReference: "Hard reference",
    earlySignal: "Early signal",
    crossCheck: "Validation",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    supporting: "Supporting",
    watchlist: "Watchlist",
    noSources: "No sources match these filters.",
    noProjects: "No projects match these filters.",
    project: "Project",
    selectedProject: "Select a project …",
    noSelection: "No selection.",
    confidence: "Confidence",
    plannedScope: "Planned scope",
    investment: "Investment",
    target: "Target",
    realized: "Realized",
    schedule: "Schedule",
    lastCheck: "Last checked",
    history: "Plan and status history",
    markerPrecision: "Marker precision",
    boundary: "Limit",
    signals: "Signals",
    localSearch: "Project-local search",
    sourceGrade: "Source",
    inBuild: "Building",
    dataUnavailable: "Data files unavailable",
    loadingError: "Data could not be loaded.",
    registryMeta: (date, count) => `As of ${date || "unknown"} · ${count} sources · fixed search queues for every refresh`,
    snapshotMeta: (date, count) => `Data as of ${date || "unknown"} · ${count} projects`,
    sourceCount: (count) => `${count} ${count === 1 ? "source" : "sources"}`,
    projectCount: (count) => `${count} ${count === 1 ? "project" : "projects"}`,
    producerCount: (count) => `${count} ${count === 1 ? "producer" : "producers"}`,
    sourceNotesLanguage: "Curated source notes are currently maintained in German.",
    projectNotesLanguage: "Curated project narratives are currently maintained in German.",
    publicationGate: "Publication threshold",
    basketTarget: "Target SKUs",
    seriesPending: "Time series pending",
    producerSignals: "Signals to track",
    consumerExposure: "Consumer exposure",
    exposureHigh: "direct",
    exposureMedium: "indirect",
    exposureLow: "low",
    weight: "Weight",
    coverage: "Coverage",
    tracked: "tracked",
    sourceGap: "source missing",
    sourceDesign: "source defined",
    methodologyA: "Direct primary evidence; can support status and hard facts.",
    methodologyB: "Reliable secondary evidence; critical changes need a cross-check.",
    methodologyC: "Discovery signal; must never change status or figures on its own.",
    mapTitle: "World map of major AI data-center projects",
    mapDescription: "Points show verified locations and programs. Color indicates the lifecycle status.",
  },
};

const statusMeta = {
  planned: { de: "Geplant", en: "Planned", color: "var(--status-planned)" },
  under_construction: { de: "Im Bau / Deployment", en: "Under construction / deployment", color: "var(--status-construction)" },
  partly_live: { de: "Teilweise live", en: "Partly live", color: "var(--status-partial)" },
  operational: { de: "In Betrieb", en: "Operational", color: "var(--status-operational)" },
  paused: { de: "Pausiert / neu geplant", en: "Paused / replanned", color: "var(--status-paused)" },
  cancelled: { de: "Abgesagt", en: "Cancelled", color: "var(--status-cancelled)" },
};

const scheduleLabels = {
  delivered: { de: "Realisierter Ausbauschritt", en: "Delivered milestone" },
  on_track: { de: "On track nach öffentlicher Baseline", en: "On track against public baseline" },
  late_but_delivered: { de: "Verspätet, inzwischen realisiert", en: "Late, now delivered" },
  late_unverified: { de: "Zieldatum verstrichen; Go-live nicht verifiziert", en: "Target passed; go-live unverified" },
  not_assessable: { de: "Nicht beurteilbar – Baseline oder Meilenstein fehlt", en: "Not assessable — baseline or milestone missing" },
  cancelled_or_superseded: { de: "Ursprünglicher Plan beendet oder ersetzt", en: "Original plan ended or superseded" },
  cancelled: { de: "Abgesagt", en: "Cancelled" },
};

const queueCopy = {
  hard_reference: { de: "Harte Referenz", en: "Hard reference" },
  early_signal: { de: "Frühsignal", en: "Early signal" },
  cross_check: { de: "Validierung", en: "Validation" },
};

const cadenceCopy = {
  daily: { de: "Täglich", en: "Daily" },
  weekly: { de: "Wöchentlich", en: "Weekly" },
  monthly: { de: "Monatlich", en: "Monthly" },
  quarterly: { de: "Quartalsweise", en: "Quarterly" },
};

const state = {
  projects: [],
  snapshotDate: null,
  status: "all",
  region: "all",
  search: "",
  selectedId: window.location.hash.slice(1) || null,
  sources: [],
  sourceMethod: null,
  sourceSnapshotDate: null,
  sourceSearch: "",
  sourceQueue: "all",
  sourceCadence: "all",
  sourcePriority: "all",
  supplyChain: null,
  supplyStage: "all",
  barometer: null,
  view: "map",
  lang: getStoredLanguage(),
};

const elements = {
  map: document.getElementById("world-map"),
  mapPanel: document.querySelector(".map-panel"),
  tooltip: document.getElementById("map-tooltip"),
  legend: document.getElementById("legend"),
  detail: document.getElementById("detail-panel"),
  list: document.getElementById("project-list"),
  count: document.getElementById("catalog-count"),
  search: document.getElementById("search-input"),
  status: document.getElementById("status-filter"),
  region: document.getElementById("region-filter"),
  snapshot: document.getElementById("snapshot-label"),
  total: document.getElementById("metric-total"),
  live: document.getElementById("metric-live"),
  progress: document.getElementById("metric-progress"),
  risk: document.getElementById("metric-risk"),
  language: document.getElementById("language-select"),
  sourceRegistryMeta: document.getElementById("source-registry-meta"),
  sourceSearch: document.getElementById("source-search"),
  sourceQueue: document.getElementById("source-queue"),
  sourceCadence: document.getElementById("source-cadence"),
  sourcePriority: document.getElementById("source-priority"),
  sourceList: document.getElementById("source-list"),
  sourceCount: document.getElementById("source-count"),
  sourceTotal: document.getElementById("source-total"),
  sourceCore: document.getElementById("source-core"),
  sourceGradeA: document.getElementById("source-grade-a"),
  sourceDynamic: document.getElementById("source-dynamic"),
  sourceCategories: document.getElementById("source-categories"),
  sourceTabCount: document.getElementById("source-tab-count"),
  sourceQueueChart: document.getElementById("source-queue-chart"),
  sourceCadenceChart: document.getElementById("source-cadence-chart"),
  evidenceLadder: document.getElementById("evidence-ladder"),
  supplyFlow: document.getElementById("supply-flow"),
  supplyStage: document.getElementById("supply-stage-filter"),
  stageGrid: document.getElementById("stage-grid"),
  producerTotal: document.getElementById("producer-total"),
  stageTotal: document.getElementById("stage-total"),
  highExposureTotal: document.getElementById("high-exposure-total"),
  producerGradeA: document.getElementById("producer-grade-a"),
  barometerName: document.getElementById("barometer-name"),
  barometerPurpose: document.getElementById("barometer-purpose"),
  barometerStatus: document.getElementById("barometer-status"),
  barometerScore: document.getElementById("barometer-score"),
  coverageValue: document.getElementById("coverage-value"),
  coverageBar: document.getElementById("coverage-bar"),
  barometerSummary: document.getElementById("barometer-summary"),
  publicationRule: document.getElementById("publication-rule"),
  componentChart: document.getElementById("component-chart"),
  scoreScale: document.getElementById("score-scale"),
  basketGrid: document.getElementById("basket-grid"),
  guardrailGrid: document.getElementById("guardrail-grid"),
  modelSourceList: document.getElementById("model-source-list"),
  zoomIn: document.getElementById("zoom-in"),
  zoomOut: document.getElementById("zoom-out"),
  zoomReset: document.getElementById("zoom-reset"),
};

let zoomBehavior = null;
let currentTransform = zoomIdentity;
let mapViewport = null;

function getStoredLanguage() {
  try {
    const stored = window.localStorage.getItem("tracker-language");
    if (stored === "de" || stored === "en") return stored;
  } catch {
    // Storage is optional.
  }
  return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
}

function t(key, ...args) {
  const value = copy[state.lang][key] ?? copy.de[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function localized(record, field) {
  return record?.[`${field}_${state.lang}`] ?? record?.[`${field}_de`] ?? record?.[field] ?? "";
}

function statusLabel(status) {
  return statusMeta[status]?.[state.lang] ?? status;
}

function scheduleLabel(schedule) {
  return scheduleLabels[schedule]?.[state.lang] ?? schedule;
}

function queueLabel(queue) {
  return queueCopy[queue]?.[state.lang] ?? queue;
}

function cadenceLabel(cadence) {
  return cadenceCopy[cadence]?.[state.lang] ?? cadence;
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(svgNamespace, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "#";
  } catch {
    return "#";
  }
}

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase(state.lang === "de" ? "de-DE" : "en-US");
}

function percent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

function filteredProjects() {
  const needle = normalize(state.search).trim();
  return state.projects.filter((project) => {
    if (state.status !== "all" && project.current_status !== state.status) return false;
    if (state.region !== "all" && project.region !== state.region) return false;
    if (!needle) return true;
    return [project.name, project.operator, project.country, project.location, project.partners]
      .some((value) => normalize(value).includes(needle));
  });
}

function filteredSources() {
  const needle = normalize(state.sourceSearch).trim();
  return state.sources.filter((source) => {
    if (state.sourceQueue !== "all" && source.queue !== state.sourceQueue) return false;
    if (state.sourceCadence !== "all" && source.recommended_cadence !== state.sourceCadence) return false;
    if (state.sourcePriority !== "all" && source.priority !== state.sourcePriority) return false;
    if (!needle) return true;
    return [source.name, source.publisher, source.category, source.geography, source.use_for, source.caveat, ...(source.signals || [])]
      .some((value) => normalize(value).includes(needle));
  });
}

function selectedProject() {
  return state.projects.find((project) => project.id === state.selectedId) || null;
}

function ensureSelection(projects) {
  if (!projects.length) {
    state.selectedId = null;
    return;
  }
  if (!projects.some((project) => project.id === state.selectedId)) state.selectedId = projects[0].id;
}

function selectProject(projectId, updateHash = true) {
  state.selectedId = projectId;
  if (updateHash) history.replaceState(null, "", `#${projectId}`);
  renderProjectList();
  renderDetail();
  renderMap();
}

function applyStaticTranslations() {
  document.documentElement.lang = state.lang;
  elements.language.value = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  elements.zoomIn.setAttribute("aria-label", state.lang === "de" ? "Hineinzoomen" : "Zoom in");
  elements.zoomOut.setAttribute("aria-label", state.lang === "de" ? "Herauszoomen" : "Zoom out");
  elements.zoomReset.setAttribute("aria-label", state.lang === "de" ? "Karte zurücksetzen" : "Reset map");
  updateSelectCopy();
}

function updateSelectCopy() {
  const statusOptions = elements.status.options;
  const labels = [t("all"), t("planned"), t("underConstruction"), t("partlyLive"), t("operational"), t("paused"), t("cancelled")];
  [...statusOptions].forEach((option, index) => { option.textContent = labels[index]; });
  elements.region.options[0].textContent = t("all");
  elements.sourceQueue.options[0].textContent = t("all");
  elements.sourceQueue.options[1].textContent = t("hardReference");
  elements.sourceQueue.options[2].textContent = t("earlySignal");
  elements.sourceQueue.options[3].textContent = t("crossCheck");
  elements.sourceCadence.options[0].textContent = t("all");
  elements.sourceCadence.options[1].textContent = t("daily");
  elements.sourceCadence.options[2].textContent = t("weekly");
  elements.sourceCadence.options[3].textContent = t("monthly");
  elements.sourceCadence.options[4].textContent = t("quarterly");
  elements.sourcePriority.options[0].textContent = t("all");
  elements.sourcePriority.options[2].textContent = t("supporting");
  elements.sourcePriority.options[3].textContent = t("watchlist");
  if (elements.supplyStage.options.length) elements.supplyStage.options[0].textContent = t("all");
}

function renderMetrics() {
  const projects = filteredProjects();
  elements.total.textContent = projects.length;
  elements.live.textContent = projects.filter((project) => project.current_status === "operational").length;
  elements.progress.textContent = projects.filter((project) => ["under_construction", "partly_live"].includes(project.current_status)).length;
  elements.risk.textContent = projects.filter((project) => ["late_unverified", "cancelled", "cancelled_or_superseded"].includes(project.schedule)).length;
  elements.count.textContent = t("projectCount", projects.length);
}

function renderLegend() {
  elements.legend.replaceChildren();
  for (const [status, meta] of Object.entries(statusMeta)) {
    const item = document.createElement("span");
    item.className = "legend-item";
    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.background = meta.color;
    const count = state.projects.filter((project) => project.current_status === status).length;
    item.append(dot, document.createTextNode(`${statusLabel(status)} ${count}`));
    elements.legend.appendChild(item);
  }
}

function renderBarChart(container, rows) {
  container.replaceChildren();
  const max = Math.max(1, ...rows.map((row) => row.value));
  for (const row of rows) {
    const wrapper = document.createElement("div");
    wrapper.className = "bar-row";
    wrapper.innerHTML = `<div class="bar-label"><span>${escapeHtml(row.label)}</span><strong>${row.value}</strong></div><div class="bar-track"><span style="width:${Math.max(4, (row.value / max) * 100)}%"></span></div>`;
    container.appendChild(wrapper);
  }
}

function renderSourceAnalytics() {
  elements.sourceTotal.textContent = state.sources.length;
  elements.sourceCore.textContent = state.sources.filter((source) => source.priority === "core").length;
  elements.sourceGradeA.textContent = state.sources.filter((source) => source.max_grade === "A").length;
  elements.sourceDynamic.textContent = state.sources.filter((source) => source.access === "dynamic_search").length;
  elements.sourceCategories.textContent = new Set(state.sources.map((source) => source.category)).size;
  elements.sourceTabCount.textContent = state.sources.length ? `(${state.sources.length})` : "";
  elements.sourceRegistryMeta.textContent = t("registryMeta", state.sourceSnapshotDate, state.sources.length);

  renderBarChart(elements.sourceQueueChart, Object.keys(queueCopy).map((id) => ({
    label: queueLabel(id),
    value: state.sources.filter((source) => source.queue === id).length,
  })));
  renderBarChart(elements.sourceCadenceChart, Object.keys(cadenceCopy).map((id) => ({
    label: cadenceLabel(id),
    value: state.sources.filter((source) => source.recommended_cadence === id).length,
  })));

  elements.evidenceLadder.replaceChildren();
  for (const grade of ["A", "B", "C"]) {
    const item = document.createElement("div");
    item.className = `evidence-step grade-${grade.toLowerCase()}`;
    item.innerHTML = `<strong>${grade}</strong><div><span>${escapeHtml(grade === "A" ? (state.lang === "de" ? "Primärbeleg" : "Primary evidence") : grade === "B" ? (state.lang === "de" ? "Sekundärquelle" : "Secondary evidence") : (state.lang === "de" ? "Discovery-Signal" : "Discovery signal"))}</span><p>${escapeHtml(t(`methodology${grade}`))}</p></div>`;
    elements.evidenceLadder.appendChild(item);
  }
}

function renderSourceRegistry() {
  const sources = filteredSources();
  elements.sourceList.replaceChildren();
  elements.sourceCount.textContent = t("sourceCount", sources.length);

  if (!sources.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "source-empty";
    cell.textContent = t("noSources");
    row.appendChild(cell);
    elements.sourceList.appendChild(row);
    return;
  }

  for (const source of sources) {
    const row = document.createElement("tr");
    const sourceCell = document.createElement("td");
    sourceCell.dataset.label = t("source");
    const sourceName = source.url
      ? `<a href="${safeUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>`
      : `<strong>${escapeHtml(source.name)}</strong>`;
    sourceCell.innerHTML = `${sourceName}<span>${escapeHtml(source.publisher)} · ${escapeHtml(source.geography)}</span>`;

    const roleCell = document.createElement("td");
    roleCell.dataset.label = t("role");
    const priority = source.priority === "supporting" ? t("supporting") : source.priority === "watchlist" ? t("watchlist") : "Core";
    roleCell.innerHTML = `<div class="source-badges"><span class="source-grade grade-${escapeHtml(source.max_grade.toLowerCase())}">${escapeHtml(source.max_grade)}</span><span>${escapeHtml(queueLabel(source.queue))}</span><span>${escapeHtml(priority)}</span></div><small>${escapeHtml(source.category.replaceAll("_", " "))}</small>`;

    const cadenceCell = document.createElement("td");
    cadenceCell.dataset.label = t("cadence");
    cadenceCell.innerHTML = `<strong>${escapeHtml(cadenceLabel(source.recommended_cadence))}</strong><span>${source.access === "dynamic_search" ? t("localSearch") : escapeHtml(source.access.toUpperCase())}</span>`;

    const useCell = document.createElement("td");
    useCell.dataset.label = t("useLimits");
    useCell.innerHTML = `<p>${escapeHtml(source.use_for)}</p><span><strong>${escapeHtml(t("boundary"))}:</strong> ${escapeHtml(source.caveat)}</span><small>${escapeHtml(t("signals"))}: ${escapeHtml(source.signals.join(", "))}</small>${state.lang === "en" ? `<small class="language-note">${escapeHtml(t("sourceNotesLanguage"))}</small>` : ""}`;

    row.append(sourceCell, roleCell, cadenceCell, useCell);
    elements.sourceList.appendChild(row);
  }
}

function renderProjectList() {
  const projects = filteredProjects();
  elements.list.replaceChildren();
  if (!projects.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = t("noProjects");
    elements.list.appendChild(empty);
    return;
  }

  for (const project of projects) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `project-row${project.id === state.selectedId ? " selected" : ""}`;
    button.setAttribute("aria-pressed", project.id === state.selectedId ? "true" : "false");
    button.addEventListener("click", () => selectProject(project.id));

    const marker = document.createElement("span");
    marker.className = "project-status-dot";
    marker.style.background = statusMeta[project.current_status].color;
    const content = document.createElement("span");
    content.className = "project-row-copy";
    const name = document.createElement("strong");
    name.textContent = project.name;
    const meta = document.createElement("span");
    meta.textContent = `${project.country} · ${statusLabel(project.current_status)}`;
    content.append(name, meta);
    button.append(marker, content);
    elements.list.appendChild(button);
  }
}

function renderDetail() {
  const project = selectedProject();
  if (!project) {
    elements.detail.innerHTML = `<div class="loading-state">${escapeHtml(t("noSelection"))}</div>`;
    return;
  }

  const historyItems = project.history.map((event) => `
    <li><time>${escapeHtml(event.date)}</time><span>${escapeHtml(event.text)}</span></li>`).join("");
  const sourceItems = project.sources.map((source) => `
    <li><a href="${safeUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.publisher)} — ${escapeHtml(source.title)}</a><span>${escapeHtml(t("sourceGrade"))} ${escapeHtml(source.grade)} · ${escapeHtml(source.date)}</span></li>`).join("");

  elements.detail.innerHTML = `
    <div class="detail-heading">
      <div class="status-badge"><span style="background:${statusMeta[project.current_status].color}"></span>${escapeHtml(statusLabel(project.current_status))}</div>
      <span class="confidence">${escapeHtml(t("confidence"))}: ${escapeHtml(project.confidence)}</span>
      <h2>${escapeHtml(project.name)}</h2>
      <p>${escapeHtml(project.location)} · ${escapeHtml(project.operator)}</p>
    </div>
    ${state.lang === "en" ? `<p class="language-note">${escapeHtml(t("projectNotesLanguage"))}</p>` : ""}
    <p class="latest-update">${escapeHtml(project.latest_update)}</p>
    <dl class="facts">
      <div><dt>${escapeHtml(t("plannedScope"))}</dt><dd>${escapeHtml(project.planned_capacity)}</dd></div>
      <div><dt>${escapeHtml(t("investment"))}</dt><dd>${escapeHtml(project.investment)}</dd></div>
      <div><dt>${escapeHtml(t("target"))}</dt><dd>${escapeHtml(project.target_live)}</dd></div>
      <div><dt>${escapeHtml(t("realized"))}</dt><dd>${escapeHtml(project.actual_live)}</dd></div>
      <div><dt>${escapeHtml(t("schedule"))}</dt><dd>${escapeHtml(scheduleLabel(project.schedule))}</dd></div>
      <div><dt>${escapeHtml(t("lastCheck"))}</dt><dd>${escapeHtml(project.last_checked)}</dd></div>
    </dl>
    <section class="detail-section">
      <h3>${escapeHtml(t("history"))}</h3>
      <ol class="timeline">${historyItems}</ol>
    </section>
    <section class="detail-section sources-section">
      <h3>${escapeHtml(t("sources"))}</h3>
      <ul>${sourceItems}</ul>
    </section>
    <p class="coordinate-note">${escapeHtml(t("markerPrecision"))}: ${escapeHtml(project.location_precision)}</p>`;
}

function showTooltip(project, point) {
  const transformed = currentTransform.apply(point);
  elements.tooltip.innerHTML = `<strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.country)} · ${escapeHtml(statusLabel(project.current_status))}</span>`;
  elements.tooltip.classList.add("visible");
  const rect = elements.mapPanel.getBoundingClientRect();
  const tip = elements.tooltip.getBoundingClientRect();
  const left = Math.min(Math.max(12, transformed[0] + 14), rect.width - tip.width - 12);
  const top = Math.min(Math.max(12, transformed[1] - tip.height - 14), rect.height - tip.height - 12);
  elements.tooltip.style.left = `${left}px`;
  elements.tooltip.style.top = `${top}px`;
}

function updateMarkerScale(scale) {
  if (!mapViewport) return;
  mapViewport.querySelectorAll(".project-point").forEach((point) => {
    const base = Number(point.dataset.baseRadius || 7);
    point.setAttribute("r", String(base / scale));
  });
  mapViewport.querySelectorAll(".point-halo").forEach((point) => point.setAttribute("r", String(13 / scale)));
}

function renderMap() {
  if (state.view !== "map" || elements.mapPanel.clientWidth === 0) return;
  const projects = filteredProjects();
  const width = Math.max(520, elements.mapPanel.clientWidth);
  const height = Math.max(420, elements.mapPanel.clientHeight);
  elements.map.setAttribute("viewBox", `0 0 ${width} ${height}`);
  elements.map.replaceChildren();

  const title = svgElement("title", { id: "map-title" });
  title.textContent = t("mapTitle");
  const description = svgElement("desc", { id: "map-description" });
  description.textContent = t("mapDescription");
  elements.map.append(title, description);

  const projection = geoNaturalEarth1().fitExtent([[18, 22], [width - 18, height - 22]], { type: "Sphere" });
  const path = geoPath(projection);
  mapViewport = svgElement("g", { class: "map-viewport" });
  mapViewport.append(
    svgElement("path", { class: "sphere", d: path({ type: "Sphere" }) }),
    svgElement("path", { class: "graticule", d: path(geoGraticule10()) }),
  );

  const countriesLayer = svgElement("g", { "aria-hidden": "true" });
  for (const country of countries) countriesLayer.appendChild(svgElement("path", { class: "country", d: path(country) }));
  mapViewport.appendChild(countriesLayer);

  const pointsLayer = svgElement("g", { "aria-label": state.lang === "de" ? "Projektstandorte" : "Project locations" });
  for (const project of projects) {
    const point = projection([project.lon, project.lat]);
    if (!point) continue;
    const selected = project.id === state.selectedId;
    if (selected) {
      const halo = svgElement("circle", { class: "point-halo", cx: point[0], cy: point[1], r: 13 / currentTransform.k });
      pointsLayer.appendChild(halo);
    }
    const baseRadius = selected ? 8.5 : 7;
    const circle = svgElement("circle", {
      class: `project-point${selected ? " selected" : ""}`,
      cx: point[0],
      cy: point[1],
      r: baseRadius / currentTransform.k,
      fill: statusMeta[project.current_status].color,
      role: "button",
      tabindex: "0",
      "aria-label": `${project.name}, ${project.country}, ${statusLabel(project.current_status)}`,
      "vector-effect": "non-scaling-stroke",
    });
    circle.dataset.baseRadius = String(baseRadius);
    circle.addEventListener("click", () => selectProject(project.id));
    circle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectProject(project.id);
      }
    });
    circle.addEventListener("mouseenter", () => showTooltip(project, point));
    circle.addEventListener("mouseleave", () => elements.tooltip.classList.remove("visible"));
    pointsLayer.appendChild(circle);
  }
  mapViewport.appendChild(pointsLayer);
  elements.map.appendChild(mapViewport);

  zoomBehavior = zoom()
    .scaleExtent([1, 8])
    .extent([[0, 0], [width, height]])
    .translateExtent([[-width * 0.35, -height * 0.35], [width * 1.35, height * 1.35]])
    .on("zoom", (event) => {
      currentTransform = event.transform;
      mapViewport?.setAttribute("transform", currentTransform.toString());
      updateMarkerScale(currentTransform.k);
      elements.tooltip.classList.remove("visible");
    });
  select(elements.map).call(zoomBehavior).on("dblclick.zoom", null);
  select(elements.map).call(zoomBehavior.transform, currentTransform);
}

function renderSupplyChain() {
  if (!state.supplyChain) return;
  const { stages, producers } = state.supplyChain;
  elements.producerTotal.textContent = producers.length;
  elements.stageTotal.textContent = stages.length;
  elements.highExposureTotal.textContent = stages.filter((stage) => stage.consumer_exposure === "high").length;
  elements.producerGradeA.textContent = producers.filter((producer) => producer.evidence_grade === "A").length;

  elements.supplyFlow.replaceChildren();
  for (const [index, stage] of stages.entries()) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `flow-step exposure-${stage.consumer_exposure}${state.supplyStage === stage.id ? " selected" : ""}`;
    item.setAttribute("aria-pressed", state.supplyStage === stage.id ? "true" : "false");
    item.innerHTML = `<span>${index + 1}</span><strong>${escapeHtml(localized(stage, "label"))}</strong><small>${producers.filter((producer) => producer.stage === stage.id).length}</small>`;
    item.addEventListener("click", () => {
      state.supplyStage = state.supplyStage === stage.id ? "all" : stage.id;
      elements.supplyStage.value = state.supplyStage;
      renderSupplyChain();
    });
    elements.supplyFlow.appendChild(item);
  }

  elements.stageGrid.replaceChildren();
  const visibleStages = stages.filter((stage) => state.supplyStage === "all" || stage.id === state.supplyStage);
  for (const stage of visibleStages) {
    const stageProducers = producers.filter((producer) => producer.stage === stage.id);
    const section = document.createElement("section");
    section.className = "stage-card";
    const producerRows = stageProducers.map((producer) => `
      <article class="producer-row">
        <div class="producer-heading"><strong>${escapeHtml(producer.name)}</strong><span>${escapeHtml(producer.hq_country)}</span></div>
        <p>${escapeHtml(localized(producer, "role"))}</p>
        <div class="producer-meta"><span><strong>${escapeHtml(t("producerSignals"))}:</strong> ${escapeHtml(producer.signals_to_track.join(", "))}</span><a href="${safeUrl(producer.primary_source_url)}" target="_blank" rel="noopener noreferrer">Grade ${escapeHtml(producer.evidence_grade)} ↗</a></div>
      </article>`).join("");
    section.innerHTML = `
      <header><div><span class="exposure-badge exposure-${escapeHtml(stage.consumer_exposure)}">${escapeHtml(t(`exposure${stage.consumer_exposure[0].toUpperCase()}${stage.consumer_exposure.slice(1)}`))}</span><h3>${escapeHtml(localized(stage, "label"))}</h3></div><strong>${escapeHtml(t("producerCount", stageProducers.length))}</strong></header>
      <p class="stage-explainer">${escapeHtml(localized(stage, "why_it_matters"))}</p>
      <div class="producer-list">${producerRows}</div>`;
    elements.stageGrid.appendChild(section);
  }
}

function renderBarometer() {
  const model = state.barometer;
  if (!model) return;
  elements.barometerName.textContent = localized(model, "name");
  elements.barometerPurpose.textContent = localized(model, "purpose");
  elements.barometerStatus.textContent = model.status === "building" ? t("inBuild") : model.status;
  elements.barometerScore.textContent = model.score ?? "—";
  elements.coverageValue.textContent = percent(model.weighted_coverage);
  elements.coverageBar.style.width = percent(model.weighted_coverage);
  elements.barometerSummary.textContent = localized(model, "summary");
  elements.publicationRule.innerHTML = `<strong>${escapeHtml(t("publicationGate"))}:</strong> ${escapeHtml(localized(model.publication_gate, "rule"))}`;

  elements.componentChart.replaceChildren();
  for (const component of model.components) {
    const row = document.createElement("div");
    row.className = "component-row";
    const status = component.status === "tracked" ? t("tracked") : component.status === "source_gap" ? t("sourceGap") : t("sourceDesign");
    row.innerHTML = `
      <div class="component-heading"><strong>${escapeHtml(localized(component, "label"))}</strong><span>${Math.round(component.weight * 100)}%</span></div>
      <p>${escapeHtml(localized(component, "definition"))}</p>
      <div class="component-bars"><div class="weight-track"><span style="width:${component.weight * 100}%"></span></div><div class="coverage-track mini"><span style="width:${component.coverage * 100}%"></span></div><small>${escapeHtml(status)} · ${escapeHtml(t("coverage"))} ${percent(component.coverage)}</small></div>`;
    elements.componentChart.appendChild(row);
  }

  elements.scoreScale.replaceChildren();
  for (const band of model.scale.bands) {
    const item = document.createElement("div");
    item.className = `scale-band band-${band.min}`;
    item.innerHTML = `<strong>${band.min}–${band.max}</strong><span>${escapeHtml(localized(band, "label"))}</span>`;
    elements.scoreScale.appendChild(item);
  }

  elements.basketGrid.replaceChildren();
  for (const basket of model.retail_baskets) {
    const item = document.createElement("article");
    item.className = "basket-card";
    item.innerHTML = `<div><span>${escapeHtml(t("seriesPending"))}</span><h4>${escapeHtml(basket.label)}</h4></div><p>${escapeHtml(basket.normalization)}</p><strong>${escapeHtml(t("basketTarget"))}: ${basket.target_skus}</strong>`;
    elements.basketGrid.appendChild(item);
  }

  elements.guardrailGrid.replaceChildren();
  for (const guardrail of model.quality_guardrails) {
    const item = document.createElement("article");
    item.className = "guardrail-card";
    item.innerHTML = `<span>✓</span><div><h4>${escapeHtml(localized(guardrail, "label"))}</h4><p>${escapeHtml(localized(guardrail, "rule"))}</p></div>`;
    elements.guardrailGrid.appendChild(item);
  }

  elements.modelSourceList.replaceChildren();
  for (const source of model.sources) {
    const item = document.createElement("article");
    item.className = "model-source-row";
    item.innerHTML = `<span class="source-grade grade-${escapeHtml(source.grade.toLowerCase())}">${escapeHtml(source.grade)}</span><div><a href="${safeUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.publisher)} — ${escapeHtml(source.title)}</a><p>${escapeHtml(source.use_for)}</p></div>`;
    elements.modelSourceList.appendChild(item);
  }
}

function renderAll() {
  const projects = filteredProjects();
  ensureSelection(projects);
  renderMetrics();
  renderProjectList();
  renderDetail();
  renderLegend();
  renderSourceAnalytics();
  renderSourceRegistry();
  renderSupplyChain();
  renderBarometer();
  renderMap();
}

function populateRegions() {
  const current = state.region;
  elements.region.replaceChildren();
  const all = document.createElement("option");
  all.value = "all";
  all.textContent = t("all");
  elements.region.appendChild(all);
  const regions = [...new Set(state.projects.map((project) => project.region))].sort((a, b) => a.localeCompare(b, state.lang));
  for (const region of regions) {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    elements.region.appendChild(option);
  }
  elements.region.value = current;
}

function populateSupplyStages() {
  elements.supplyStage.replaceChildren();
  const all = document.createElement("option");
  all.value = "all";
  all.textContent = t("all");
  elements.supplyStage.appendChild(all);
  for (const stage of state.supplyChain?.stages || []) {
    const option = document.createElement("option");
    option.value = stage.id;
    option.textContent = localized(stage, "label");
    elements.supplyStage.appendChild(option);
  }
  elements.supplyStage.value = state.supplyStage;
}

function setView(view) {
  state.view = view;
  document.querySelectorAll("[data-dashboard-view]").forEach((panel) => {
    const active = panel.dataset.dashboardView === view;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  document.querySelectorAll(".dashboard-tab").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (view === "map") requestAnimationFrame(renderMap);
}

function changeLanguage(language) {
  state.lang = language;
  try { window.localStorage.setItem("tracker-language", language); } catch { /* optional */ }
  applyStaticTranslations();
  populateRegions();
  populateSupplyStages();
  elements.snapshot.textContent = t("snapshotMeta", state.snapshotDate, state.projects.length);
  renderAll();
}

document.querySelectorAll(".dashboard-tab").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});
elements.language.addEventListener("change", () => changeLanguage(elements.language.value));
elements.search.addEventListener("input", () => { state.search = elements.search.value; renderAll(); });
elements.status.addEventListener("change", () => { state.status = elements.status.value; renderAll(); });
elements.region.addEventListener("change", () => { state.region = elements.region.value; renderAll(); });
elements.sourceSearch.addEventListener("input", () => { state.sourceSearch = elements.sourceSearch.value; renderSourceRegistry(); });
elements.sourceQueue.addEventListener("change", () => { state.sourceQueue = elements.sourceQueue.value; renderSourceRegistry(); });
elements.sourceCadence.addEventListener("change", () => { state.sourceCadence = elements.sourceCadence.value; renderSourceRegistry(); });
elements.sourcePriority.addEventListener("change", () => { state.sourcePriority = elements.sourcePriority.value; renderSourceRegistry(); });
elements.supplyStage.addEventListener("change", () => { state.supplyStage = elements.supplyStage.value; renderSupplyChain(); });

elements.zoomIn.addEventListener("click", () => {
  if (zoomBehavior) select(elements.map).call(zoomBehavior.scaleBy, 1.5);
});
elements.zoomOut.addEventListener("click", () => {
  if (zoomBehavior) select(elements.map).call(zoomBehavior.scaleBy, 1 / 1.5);
});
elements.zoomReset.addEventListener("click", () => {
  currentTransform = zoomIdentity;
  if (zoomBehavior) select(elements.map).call(zoomBehavior.transform, zoomIdentity);
});

let resizeQueued = false;
new ResizeObserver(() => {
  if (resizeQueued || state.view !== "map") return;
  resizeQueued = true;
  requestAnimationFrame(() => {
    resizeQueued = false;
    renderMap();
  });
}).observe(elements.mapPanel);

async function bootstrap() {
  applyStaticTranslations();
  try {
    const responses = await Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/projects.json`, { cache: "no-cache" }),
      fetch(`${import.meta.env.BASE_URL}data/source-registry.json`, { cache: "no-cache" }),
      fetch(`${import.meta.env.BASE_URL}data/supply-chain.json`, { cache: "no-cache" }),
      fetch(`${import.meta.env.BASE_URL}data/hardware-barometer.json`, { cache: "no-cache" }),
    ]);
    const labels = ["projects", "source-registry", "supply-chain", "hardware-barometer"];
    responses.forEach((response, index) => {
      if (!response.ok) throw new Error(`${labels[index]} ${response.status}`);
    });
    const [payload, sourcePayload, supplyPayload, barometerPayload] = await Promise.all(responses.map((response) => response.json()));
    state.projects = payload.projects;
    state.snapshotDate = payload.snapshot_date;
    state.sources = sourcePayload.sources;
    state.sourceMethod = sourcePayload.method;
    state.sourceSnapshotDate = sourcePayload.snapshot_date;
    state.supplyChain = supplyPayload;
    state.barometer = barometerPayload;
    elements.snapshot.textContent = t("snapshotMeta", payload.snapshot_date, state.projects.length);
    populateRegions();
    populateSupplyStages();
    renderAll();
  } catch (error) {
    elements.snapshot.textContent = t("dataUnavailable");
    elements.detail.innerHTML = `<div class="error-state"><strong>${escapeHtml(t("loadingError"))}</strong><span>${escapeHtml(error.message)}</span></div>`;
  }
}

bootstrap();
