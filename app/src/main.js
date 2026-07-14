import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "@d3-maps/atlas/world/countries/countries-110m";
import "./style.css";

const countries = feature(world, world.objects.features).features;
const svgNamespace = "http://www.w3.org/2000/svg";

const statusMeta = {
  planned: { label: "Geplant", color: "var(--status-planned)" },
  under_construction: { label: "Im Bau / Deployment", color: "var(--status-construction)" },
  partly_live: { label: "Teilweise live", color: "var(--status-partial)" },
  operational: { label: "In Betrieb", color: "var(--status-operational)" },
  paused: { label: "Pausiert / neu geplant", color: "var(--status-paused)" },
  cancelled: { label: "Abgesagt", color: "var(--status-cancelled)" },
};

const scheduleLabels = {
  delivered: "Realisierter Ausbauschritt",
  on_track: "On track nach öffentlicher Baseline",
  late_but_delivered: "Verspätet, inzwischen realisiert",
  late_unverified: "Zieldatum verstrichen; Go-live nicht verifiziert",
  not_assessable: "Nicht beurteilbar – Baseline oder Meilenstein fehlt",
  cancelled_or_superseded: "Ursprünglicher Plan beendet oder ersetzt",
  cancelled: "Abgesagt",
};

const state = {
  projects: [],
  snapshotDate: null,
  status: "all",
  region: "all",
  search: "",
  selectedId: window.location.hash.slice(1) || null,
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
};

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
  return String(value ?? "").toLocaleLowerCase("de-DE");
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

function renderMetrics() {
  const projects = filteredProjects();
  elements.total.textContent = projects.length;
  elements.live.textContent = projects.filter((project) => project.current_status === "operational").length;
  elements.progress.textContent = projects.filter((project) => ["under_construction", "partly_live"].includes(project.current_status)).length;
  elements.risk.textContent = projects.filter((project) => ["late_unverified", "cancelled", "cancelled_or_superseded"].includes(project.schedule)).length;
  elements.count.textContent = `${projects.length} ${projects.length === 1 ? "Projekt" : "Projekte"}`;
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
    item.append(dot, document.createTextNode(`${meta.label} ${count}`));
    elements.legend.appendChild(item);
  }
}

function renderProjectList() {
  const projects = filteredProjects();
  elements.list.replaceChildren();
  if (!projects.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "Keine Projekte für diese Filter.";
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
    meta.textContent = `${project.country} · ${statusMeta[project.current_status].label}`;
    content.append(name, meta);
    button.append(marker, content);
    elements.list.appendChild(button);
  }
}

function renderDetail() {
  const project = selectedProject();
  if (!project) {
    elements.detail.innerHTML = '<div class="loading-state">Keine Auswahl.</div>';
    return;
  }

  const historyItems = project.history.map((event) => `
    <li><time>${escapeHtml(event.date)}</time><span>${escapeHtml(event.text)}</span></li>`).join("");
  const sourceItems = project.sources.map((source) => `
    <li><a href="${safeUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.publisher)} — ${escapeHtml(source.title)}</a><span>Quelle ${escapeHtml(source.grade)} · ${escapeHtml(source.date)}</span></li>`).join("");

  elements.detail.innerHTML = `
    <div class="detail-heading">
      <div class="status-badge"><span style="background:${statusMeta[project.current_status].color}"></span>${escapeHtml(statusMeta[project.current_status].label)}</div>
      <span class="confidence">Konfidenz: ${escapeHtml(project.confidence)}</span>
      <h2>${escapeHtml(project.name)}</h2>
      <p>${escapeHtml(project.location)} · ${escapeHtml(project.operator)}</p>
    </div>
    <p class="latest-update">${escapeHtml(project.latest_update)}</p>
    <dl class="facts">
      <div><dt>Geplanter Umfang</dt><dd>${escapeHtml(project.planned_capacity)}</dd></div>
      <div><dt>Investition</dt><dd>${escapeHtml(project.investment)}</dd></div>
      <div><dt>Ziel</dt><dd>${escapeHtml(project.target_live)}</dd></div>
      <div><dt>Realisiert</dt><dd>${escapeHtml(project.actual_live)}</dd></div>
      <div><dt>Terminlage</dt><dd>${escapeHtml(scheduleLabels[project.schedule] || project.schedule)}</dd></div>
      <div><dt>Letzte Prüfung</dt><dd>${escapeHtml(project.last_checked)}</dd></div>
    </dl>
    <section class="detail-section">
      <h3>Plan- und Statushistorie</h3>
      <ol class="timeline">${historyItems}</ol>
    </section>
    <section class="detail-section sources-section">
      <h3>Quellen</h3>
      <ul>${sourceItems}</ul>
    </section>
    <p class="coordinate-note">Markerpräzision: ${escapeHtml(project.location_precision)}</p>`;
}

function showTooltip(project, x, y) {
  elements.tooltip.innerHTML = `<strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.country)} · ${escapeHtml(statusMeta[project.current_status].label)}</span>`;
  elements.tooltip.classList.add("visible");
  const rect = elements.mapPanel.getBoundingClientRect();
  const tip = elements.tooltip.getBoundingClientRect();
  const left = Math.min(Math.max(12, x + 14), rect.width - tip.width - 12);
  const top = Math.min(Math.max(12, y - tip.height - 14), rect.height - tip.height - 12);
  elements.tooltip.style.left = `${left}px`;
  elements.tooltip.style.top = `${top}px`;
}

function renderMap() {
  const projects = filteredProjects();
  const width = Math.max(520, elements.mapPanel.clientWidth);
  const height = Math.max(420, elements.mapPanel.clientHeight);
  elements.map.setAttribute("viewBox", `0 0 ${width} ${height}`);
  elements.map.replaceChildren();

  const title = svgElement("title", { id: "map-title" });
  title.textContent = "Weltkarte grosser KI-Rechenzentrumsprojekte";
  const description = svgElement("desc", { id: "map-description" });
  description.textContent = "Punkte zeigen verifizierte Standorte und Programme. Farbe kennzeichnet den Lebenszyklusstatus.";
  elements.map.append(title, description);

  const projection = geoNaturalEarth1().fitExtent([[18, 22], [width - 18, height - 22]], { type: "Sphere" });
  const path = geoPath(projection);
  elements.map.append(
    svgElement("path", { class: "sphere", d: path({ type: "Sphere" }) }),
    svgElement("path", { class: "graticule", d: path(geoGraticule10()) }),
  );

  const countriesLayer = svgElement("g", { "aria-hidden": "true" });
  for (const country of countries) countriesLayer.appendChild(svgElement("path", { class: "country", d: path(country) }));
  elements.map.appendChild(countriesLayer);

  const pointsLayer = svgElement("g", { "aria-label": "Projektstandorte" });
  for (const project of projects) {
    const point = projection([project.lon, project.lat]);
    if (!point) continue;
    const selected = project.id === state.selectedId;
    if (selected) {
      pointsLayer.appendChild(svgElement("circle", {
        class: "point-halo",
        cx: point[0],
        cy: point[1],
        r: 13,
      }));
    }
    const circle = svgElement("circle", {
      class: `project-point${selected ? " selected" : ""}`,
      cx: point[0],
      cy: point[1],
      r: selected ? 8.5 : 7,
      fill: statusMeta[project.current_status].color,
      role: "button",
      tabindex: "0",
      "aria-label": `${project.name}, ${project.country}, ${statusMeta[project.current_status].label}`,
    });
    circle.addEventListener("click", () => selectProject(project.id));
    circle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectProject(project.id);
      }
    });
    circle.addEventListener("mouseenter", () => showTooltip(project, point[0], point[1]));
    circle.addEventListener("mouseleave", () => elements.tooltip.classList.remove("visible"));
    pointsLayer.appendChild(circle);
  }
  elements.map.appendChild(pointsLayer);
}

function renderAll() {
  const projects = filteredProjects();
  ensureSelection(projects);
  renderMetrics();
  renderProjectList();
  renderDetail();
  renderMap();
}

function populateRegions() {
  const regions = [...new Set(state.projects.map((project) => project.region))].sort((a, b) => a.localeCompare(b, "de"));
  for (const region of regions) {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    elements.region.appendChild(option);
  }
}

elements.search.addEventListener("input", () => {
  state.search = elements.search.value;
  renderAll();
});
elements.status.addEventListener("change", () => {
  state.status = elements.status.value;
  renderAll();
});
elements.region.addEventListener("change", () => {
  state.region = elements.region.value;
  renderAll();
});

let resizeQueued = false;
new ResizeObserver(() => {
  if (resizeQueued) return;
  resizeQueued = true;
  requestAnimationFrame(() => {
    resizeQueued = false;
    renderMap();
  });
}).observe(elements.mapPanel);

async function bootstrap() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/projects.json`, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Daten ${response.status}`);
    const payload = await response.json();
    state.projects = payload.projects;
    state.snapshotDate = payload.snapshot_date;
    elements.snapshot.textContent = `Datenstand ${payload.snapshot_date || "unbekannt"} · ${state.projects.length} Projekte`;
    populateRegions();
    renderLegend();
    renderAll();
  } catch (error) {
    elements.snapshot.textContent = "Datendatei nicht erreichbar";
    elements.detail.innerHTML = `<div class="error-state"><strong>Daten konnten nicht geladen werden.</strong><span>${escapeHtml(error.message)}</span></div>`;
  }
}

bootstrap();
