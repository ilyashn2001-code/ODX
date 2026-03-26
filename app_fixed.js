
const { datasetsMeta, weightableFields, baseWeights, objects } = window.APP_DATA;

const state = {
  selectedDatasets: new Set(["odhObjects", "odhWorks", "okbWorks"]),
  datasetsConfirmed: false,
  groups: [],
  weights: [],
  customWeightsEnabled: false,
  map: null,
  layersByObjectId: new Map(),
  highlightedObjectId: null,
  analysisResults: [],
  datasetPickerOpen: false
};

const OPERATORS_BY_TYPE = {
  number: [
    { code: "eq", label: "=" },
    { code: "neq", label: "≠" },
    { code: "gt", label: ">" },
    { code: "gte", label: "≥" },
    { code: "lt", label: "<" },
    { code: "lte", label: "≤" },
    { code: "between", label: "От / До" },
    { code: "isEmpty", label: "Пусто" },
    { code: "notEmpty", label: "Не пусто" }
  ],
  text: [
    { code: "eq", label: "Равно" },
    { code: "neq", label: "Не равно" },
    { code: "contains", label: "Содержит" },
    { code: "notContains", label: "Не содержит" },
    { code: "isEmpty", label: "Пусто" },
    { code: "notEmpty", label: "Не пусто" }
  ],
  boolean: [
    { code: "eq", label: "Да / Нет" },
    { code: "isEmpty", label: "Пусто" },
    { code: "notEmpty", label: "Не пусто" }
  ]
};

function uid() { return Math.random().toString(36).slice(2, 10); }
function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || value === "") return "—";
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}
function formatCurrency(value) { return value === null || value === undefined ? "—" : `${formatNumber(value)} ₽`; }
function getAvailableDatasets() {
  return Object.entries(datasetsMeta).filter(([code]) => state.selectedDatasets.has(code)).map(([code, item]) => ({ code, label: item.label }));
}
function getDatasetMeta(code) { return datasetsMeta[code]; }
function getAttributeOptions(datasetCode) { return getDatasetMeta(datasetCode)?.attributes || []; }
function getAttributeMeta(datasetCode, attrCode) { return getAttributeOptions(datasetCode).find(item => item.code === attrCode); }
function getSourceTypesForDataset(datasetCode) {
  if (datasetCode === "odhObjects") return ["Объекты ОДХ"];
  if (datasetCode === "odhWorks") return ["Работы на ОДХ"];
  if (datasetCode === "okbWorks") return ["Работы на ОКБ"];
  return [];
}
function getAttributeSuggestions(datasetCode, attrCode) {
  const sourceTypes = new Set(getSourceTypesForDataset(datasetCode));
  return [...new Set(objects
    .filter(item => sourceTypes.has(item.sourceType))
    .map(item => item[attrCode])
    .filter(v => v !== null && v !== undefined && v !== ""))]
    .slice(0, 100);
}
function getOperators(type) { return OPERATORS_BY_TYPE[type] || OPERATORS_BY_TYPE.text; }
function createCondition(datasetCode) {
  const attr = getAttributeOptions(datasetCode)[0];
  return { id: uid(), dataset: datasetCode, attribute: attr?.code || "name", operator: getOperators(attr?.type || "text")[0]?.code || "eq", value1: "", value2: "" };
}
function createGroup(defaultDataset) {
  const datasetCode = defaultDataset || getAvailableDatasets()[0]?.code || "odhObjects";
  return { id: uid(), joinToNext: "AND", conditionsJoin: "AND", weight: 10, conditions: [createCondition(datasetCode)] };
}
function createWeight(field = "coveragePercent", value = 25) { return { id: uid(), field, value }; }
function initState() {
  state.groups = [createGroup("odhObjects")];
  state.weights = [createWeight("coveragePercent", 35), createWeight("repairAge", 25), createWeight("estimatedCost", 20), createWeight("recommendedVolume", 20)];
}

function renderDatasetSelection() {
  const container = document.getElementById("datasetSelection");
  const selectedLabels = [...state.selectedDatasets].map(code => datasetsMeta[code].label);
  container.innerHTML = `
    <div class="dataset-picker">
      <button id="datasetPickerBtn" type="button" class="btn btn-secondary dataset-picker-btn">
        <span>${selectedLabels.length ? selectedLabels.join(", ") : "Выбери наборы данных"}</span>
        <span>${state.datasetPickerOpen ? "▲" : "▼"}</span>
      </button>
      <div id="datasetPickerPanel" class="dataset-picker-panel ${state.datasetPickerOpen ? "" : "hidden"}">
        ${Object.entries(datasetsMeta).map(([code, item]) => `
          <label class="dataset-option">
            <input type="checkbox" data-code="${code}" ${state.selectedDatasets.has(code) ? "checked" : ""} />
            <div>
              <div class="dataset-option-title">${item.label}</div>
              <div class="dataset-option-desc">${item.description || ""}</div>
            </div>
          </label>
        `).join("")}
      </div>
    </div>`;

  document.getElementById("datasetPickerBtn").addEventListener("click", () => {
    state.datasetPickerOpen = !state.datasetPickerOpen;
    renderDatasetSelection();
  });
  container.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.addEventListener("change", event => {
      const code = event.target.dataset.code;
      if (event.target.checked) state.selectedDatasets.add(code); else state.selectedDatasets.delete(code);
      normalizeGroupsAgainstDatasets();
      renderDatasetSelection();
    });
  });
}

function renderConfirmedDatasets() {
  const summary = document.getElementById("selectedDatasetsInline");
  summary.innerHTML = [...state.selectedDatasets].map(code => `<span class="chip">${datasetsMeta[code].label}</span>`).join("");
}

function setDatasetsConfirmed(confirmed) {
  state.datasetsConfirmed = confirmed;
  document.getElementById("datasetStepCard").classList.toggle("hidden", confirmed);
  document.getElementById("selectedDatasetsCard").classList.toggle("hidden", !confirmed);
  document.getElementById("builderSection").classList.toggle("hidden", !confirmed);
  if (confirmed) {
    renderConfirmedDatasets();
    normalizeGroupsAgainstDatasets();
    renderGroups();
    renderWeights();
  }
}

function normalizeGroupsAgainstDatasets() {
  const available = getAvailableDatasets().map(item => item.code);
  if (!available.length) return;
  state.groups.forEach(group => {
    group.conditions.forEach(cond => {
      if (!state.selectedDatasets.has(cond.dataset)) {
        cond.dataset = available[0];
        cond.attribute = getAttributeOptions(cond.dataset)[0]?.code || "name";
        cond.operator = getOperators(getAttributeMeta(cond.dataset, cond.attribute)?.type || "text")[0]?.code || "eq";
        cond.value1 = ""; cond.value2 = "";
      }
    });
  });
}

function renderWeights() {
  const container = document.getElementById("weightsEditor");
  container.innerHTML = "";
  container.classList.toggle("disabled-block", !state.customWeightsEnabled);
  state.weights.forEach(weight => {
    const row = document.createElement("div");
    row.className = "weight-row";
    row.innerHTML = `
      <div class="weight-grid">
        <select data-role="field" data-id="${weight.id}">
          ${weightableFields.map(item => `<option value="${item.code}" ${item.code === weight.field ? "selected" : ""}>${item.label}</option>`).join("")}
        </select>
        <input data-role="value" data-id="${weight.id}" type="number" min="0" max="100" value="${weight.value}" />
        <button class="btn btn-small" data-role="remove" data-id="${weight.id}">Удалить</button>
      </div>`;
    container.appendChild(row);
  });
  container.querySelectorAll("[data-role='field']").forEach(el => el.addEventListener("change", onWeightChange));
  container.querySelectorAll("[data-role='value']").forEach(el => el.addEventListener("input", onWeightChange));
  container.querySelectorAll("[data-role='remove']").forEach(el => el.addEventListener("click", event => {
    state.weights = state.weights.filter(item => item.id !== event.target.dataset.id);
    renderWeights(); renderWeightStatus(); rerenderResultsOnly();
  }));
  renderWeightStatus();
}
function onWeightChange(event) {
  const weight = state.weights.find(item => item.id === event.target.dataset.id);
  if (!weight) return;
  if (event.target.dataset.role === "field") weight.field = event.target.value;
  if (event.target.dataset.role === "value") weight.value = Number(event.target.value || 0);
  renderWeightStatus(); rerenderResultsOnly();
}
function renderWeightStatus() {
  const status = document.getElementById("weightsStatus");
  if (!state.customWeightsEnabled) { status.className = "status-pill neutral"; status.textContent = "Используются базовые коэффициенты"; return; }
  const sum = state.weights.reduce((acc, item) => acc + Number(item.value || 0), 0);
  const unique = new Set(state.weights.map(item => item.field));
  if (sum === 100 && unique.size === state.weights.length && state.weights.length > 0) {
    status.className = "status-pill ok"; status.textContent = `Свои коэффициенты · ${sum}%`;
  } else {
    status.className = "status-pill warn"; status.textContent = `Сумма ${sum}%${unique.size !== state.weights.length ? " · есть дубли" : ""}`;
  }
}

function renderGroups() {
  const container = document.getElementById("groupsList");
  container.innerHTML = "";
  const datasetOptions = getAvailableDatasets();
  if (!datasetOptions.length) { container.innerHTML = `<div class="helper-text">Сначала выбери хотя бы один набор данных.</div>`; return; }
  state.groups.forEach((group, groupIndex) => {
    const groupEl = document.createElement("div");
    groupEl.className = "group-card";
    groupEl.innerHTML = `
      <div class="group-head">
        <div>
          <strong>Группа ${groupIndex + 1}</strong>
          <div class="row-note">Внутри группы — <strong>${group.conditionsJoin === "AND" ? "И" : group.conditionsJoin === "OR" ? "ИЛИ" : "НЕ"}</strong>. Между группами — <strong>${group.joinToNext === "AND" ? "И" : group.joinToNext === "OR" ? "ИЛИ" : "НЕ"}</strong>.</div>
        </div>
        <div class="group-controls">
          <div class="group-weight-box">
            <span class="group-weight-label">Вес группы</span>
            <input type="number" min="0" max="100" data-role="group-weight" data-group-id="${group.id}" value="${group.weight ?? 10}" />
          </div>
          <select data-role="group-join" data-group-id="${group.id}">
            <option value="AND" ${group.joinToNext === "AND" ? "selected" : ""}>Связь со следующей: И</option>
            <option value="OR" ${group.joinToNext === "OR" ? "selected" : ""}>Связь со следующей: ИЛИ</option>
            <option value="NOT" ${group.joinToNext === "NOT" ? "selected" : ""}>Связь со следующей: НЕ</option>
          </select>
          <select data-role="conditions-join" data-group-id="${group.id}">
            <option value="AND" ${group.conditionsJoin === "AND" ? "selected" : ""}>Внутри группы: И</option>
            <option value="OR" ${group.conditionsJoin === "OR" ? "selected" : ""}>Внутри группы: ИЛИ</option>
            <option value="NOT" ${group.conditionsJoin === "NOT" ? "selected" : ""}>Внутри группы: НЕ</option>
          </select>
          <button class="btn btn-secondary btn-small" data-role="add-condition" data-group-id="${group.id}">Добавить строку</button>
          <button class="btn btn-secondary btn-small" data-role="remove-group" data-group-id="${group.id}">Удалить группу</button>
        </div>
      </div>
      <div class="group-body" id="group-body-${group.id}"></div>`;
    container.appendChild(groupEl);
    const body = groupEl.querySelector(`#group-body-${group.id}`);
    group.conditions.forEach((condition, conditionIndex) => {
      const attrOptions = getAttributeOptions(condition.dataset);
      const attrMeta = getAttributeMeta(condition.dataset, condition.attribute) || attrOptions[0];
      const operators = getOperators(attrMeta?.type || "text");
      const between = condition.operator === "between";
      const emptyOp = condition.operator === "isEmpty" || condition.operator === "notEmpty";
      const suggestions = getAttributeSuggestions(condition.dataset, condition.attribute);
      const datalistId = `datalist-${group.id}-${condition.id}`;
      const row = document.createElement("div");
      row.className = "criterion-row";
      row.innerHTML = `
        <div class="criterion-grid">
          <div><div class="row-note">Строка</div><div>${conditionIndex + 1}</div></div>
          <select data-role="dataset" data-group-id="${group.id}" data-condition-id="${condition.id}">${datasetOptions.map(item => `<option value="${item.code}" ${item.code === condition.dataset ? "selected" : ""}>${item.label}</option>`).join("")}</select>
          <select data-role="attribute" data-group-id="${group.id}" data-condition-id="${condition.id}">${attrOptions.map(item => `<option value="${item.code}" ${item.code === condition.attribute ? "selected" : ""}>${item.label}</option>`).join("")}</select>
          <select data-role="operator" data-group-id="${group.id}" data-condition-id="${condition.id}">${operators.map(item => `<option value="${item.code}" ${item.code === condition.operator ? "selected" : ""}>${item.label}</option>`).join("")}</select>
          <div class="criterion-value-box">
            <input data-role="value1" data-group-id="${group.id}" data-condition-id="${condition.id}" value="${condition.value1 ?? ""}" list="${datalistId}" placeholder="${emptyOp ? "Не нужно" : "Значение или несколько через запятую"}" ${emptyOp ? "disabled" : ""} />
            <datalist id="${datalistId}">${suggestions.map(v => `<option value="${String(v).replace(/"/g,'&quot;')}"></option>`).join("")}</datalist>
          </div>
          <input data-role="value2" data-group-id="${group.id}" data-condition-id="${condition.id}" value="${condition.value2 ?? ""}" placeholder="${between ? "До" : "Не используется"}" ${between ? "" : "disabled"} />
          <button class="btn btn-small" data-role="remove-condition" data-group-id="${group.id}" data-condition-id="${condition.id}">Удалить</button>
        </div>`;
      body.appendChild(row);
    });
  });
  attachGroupEvents();
}

function attachGroupEvents() {
  document.querySelectorAll("[data-role='group-join']").forEach(el => el.addEventListener("change", e => { const g = state.groups.find(i => i.id === e.target.dataset.groupId); g.joinToNext = e.target.value; renderGroups(); rerunAfterChange(); }));
  document.querySelectorAll("[data-role='conditions-join']").forEach(el => el.addEventListener("change", e => { const g = state.groups.find(i => i.id === e.target.dataset.groupId); g.conditionsJoin = e.target.value; renderGroups(); rerunAfterChange(); }));
  document.querySelectorAll("[data-role='group-weight']").forEach(el => el.addEventListener("input", e => { const g = state.groups.find(i => i.id === e.target.dataset.groupId); g.weight = Number(e.target.value || 0); rerunAfterChange(); }));
  document.querySelectorAll("[data-role='add-condition']").forEach(el => el.addEventListener("click", e => { const g = state.groups.find(i => i.id === e.target.dataset.groupId); g.conditions.push(createCondition(getAvailableDatasets()[0]?.code || "odhObjects")); renderGroups(); }));
  document.querySelectorAll("[data-role='remove-group']").forEach(el => el.addEventListener("click", e => { state.groups = state.groups.filter(i => i.id !== e.target.dataset.groupId); if (!state.groups.length && getAvailableDatasets().length) state.groups = [createGroup(getAvailableDatasets()[0].code)]; renderGroups(); rerunAfterChange(); }));
  document.querySelectorAll("[data-role='remove-condition']").forEach(el => el.addEventListener("click", e => { const g = state.groups.find(i => i.id === e.target.dataset.groupId); g.conditions = g.conditions.filter(i => i.id !== e.target.dataset.conditionId); if (!g.conditions.length) g.conditions = [createCondition(getAvailableDatasets()[0]?.code || "odhObjects")]; renderGroups(); rerunAfterChange(); }));
  document.querySelectorAll("[data-role='dataset'], [data-role='attribute'], [data-role='operator'], [data-role='value1'], [data-role='value2']").forEach(el => {
    const eventName = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(eventName, e => {
      const g = state.groups.find(i => i.id === e.target.dataset.groupId);
      const c = g.conditions.find(i => i.id === e.target.dataset.conditionId);
      const role = e.target.dataset.role;
      if (role === "dataset") {
        c.dataset = e.target.value; c.attribute = getAttributeOptions(c.dataset)[0]?.code || "name"; c.operator = getOperators(getAttributeMeta(c.dataset, c.attribute)?.type || "text")[0]?.code || "eq"; c.value1 = ""; c.value2 = ""; renderGroups();
      } else if (role === "attribute") {
        c.attribute = e.target.value; c.operator = getOperators(getAttributeMeta(c.dataset, c.attribute)?.type || "text")[0]?.code || "eq"; c.value1 = ""; c.value2 = ""; renderGroups();
      } else if (role === "operator") {
        c.operator = e.target.value; c.value1 = ""; c.value2 = ""; renderGroups();
      } else if (role === "value1") c.value1 = e.target.value;
      else if (role === "value2") c.value2 = e.target.value;
      rerunAfterChange();
    });
  });
}

function parseByType(value, type) {
  if (value === null || value === undefined || value === "") return value;
  if (type === "number") return Number(value);
  if (type === "boolean") { if (typeof value === "boolean") return value; const normalized = String(value).trim().toLowerCase(); return normalized === "true" || normalized === "да" || normalized === "1"; }
  return String(value).trim().toLowerCase();
}
function compareValue(recordValue, condition) {
  const type = getAttributeMeta(condition.dataset, condition.attribute)?.type || "text";
  const value = parseByType(recordValue, type), c1 = parseByType(condition.value1, type), c2 = parseByType(condition.value2, type);
  const rawList = String(condition.value1 ?? "").split(',').map(v => v.trim()).filter(Boolean);
  const list = rawList.map(v => parseByType(v, type));
  switch (condition.operator) {
    case "eq": return list.length > 1 ? list.includes(value) : value === c1;
    case "neq": return list.length > 1 ? !list.includes(value) : value !== c1;
    case "gt": return value > c1; case "gte": return value >= c1; case "lt": return value < c1; case "lte": return value <= c1;
    case "contains": return list.length > 1
      ? list.some(v => String(recordValue ?? "").toLowerCase().includes(String(v ?? "").toLowerCase()))
      : String(recordValue ?? "").toLowerCase().includes(String(condition.value1 ?? "").toLowerCase());
    case "notContains": return list.length > 1
      ? list.every(v => !String(recordValue ?? "").toLowerCase().includes(String(v ?? "").toLowerCase()))
      : !String(recordValue ?? "").toLowerCase().includes(String(condition.value1 ?? "").toLowerCase());
    case "between": return value >= c1 && value <= c2;
    case "isEmpty": return recordValue === null || recordValue === undefined || recordValue === "";
    case "notEmpty": return !(recordValue === null || recordValue === undefined || recordValue === "");
    default: return false;
  }
}
function evaluateGroup(record, group) {
  const results = group.conditions.map(condition => compareValue(record[condition.attribute], condition));
  if (group.conditionsJoin === "AND") return results.every(Boolean);
  if (group.conditionsJoin === "OR") return results.some(Boolean);
  if (group.conditionsJoin === "NOT") return results.every(v => !v);
  return true;
}
function getGroupMatchWeight(record) {
  const total = state.groups.reduce((sum, group) => sum + Number(group.weight || 0), 0);
  if (!total) return 0;
  const matched = state.groups.reduce((sum, group) => sum + (evaluateGroup(record, group) ? Number(group.weight || 0) : 0), 0);
  return matched / total;
}
function applyCriteria(records) {
  if (!state.groups.length) return [...records];
  return records.filter(record => {
    const values = state.groups.map(group => evaluateGroup(record, group));
    let result = values[0] ?? true;
    state.groups.forEach((group, index) => {
      if (index === 0) return;
      const current = values[index];
      const prevJoin = state.groups[index - 1].joinToNext;
      if (prevJoin === "AND") result = result && current;
      if (prevJoin === "OR") result = result || current;
      if (prevJoin === "NOT") result = result && !current;
    });
    return Boolean(result);
  });
}
function normalize(values, invert = false) {
  const clean = values.map(v => Number(v || 0)); const min = Math.min(...clean), max = Math.max(...clean), range = max - min || 1;
  return clean.map(value => { let n = (value - min) / range; if (invert) n = 1 - n; return n; });
}
function getEffectiveWeights() {
  if (!state.customWeightsEnabled) return Object.entries(baseWeights).map(([field, value]) => ({ field, value }));
  const sum = state.weights.reduce((acc, item) => acc + Number(item.value || 0), 0);
  if (sum !== 100) return Object.entries(baseWeights).map(([field, value]) => ({ field, value }));
  return state.weights.map(item => ({ field: item.field, value: Number(item.value || 0) }));
}
function scoreRecords(records) {
  const normByField = {
    coveragePercent: normalize(records.map(i => i.coveragePercent), true),
    repairAge: normalize(records.map(i => i.repairAge)),
    estimatedCost: normalize(records.map(i => i.estimatedCost), true),
    recommendedVolume: normalize(records.map(i => i.recommendedVolume))
  };
  const weights = getEffectiveWeights();
  return records.map((item, index) => {
    let score = 0;
    weights.forEach(weight => { score += (normByField[weight.field]?.[index] || 0) * (weight.value / 100); });
    const groupBonus = getGroupMatchWeight(item) * 0.15;
    score += groupBonus;
    return { ...item, criteriaGroupScore: Number(groupBonus.toFixed(4)), priorityScore: Number(score.toFixed(4)), priorityLevel: score >= .75 ? 'high' : score >= .45 ? 'medium' : 'low' };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}
function getFilteredDatasetBase() {
  if (!state.selectedDatasets.size) return [];
  return objects.filter(item => {
    if (state.selectedDatasets.has("odhObjects") && item.sourceType === "Объекты ОДХ") return true;
    if (state.selectedDatasets.has("odhWorks") && item.sourceType === "Работы на ОДХ") return true;
    if (state.selectedDatasets.has("okbWorks") && item.sourceType === "Работы на ОКБ") return true;
    return false;
  });
}
function renderSummary(records) {
  const el = document.getElementById("summaryCards");
  const totalUncovered = records.reduce((s, i) => s + Number(i.uncoveredArea || 0), 0);
  const totalVolume = records.reduce((s, i) => s + Number(i.recommendedVolume || 0), 0);
  const totalCost = records.reduce((s, i) => s + Number(i.estimatedCost || 0), 0);
  const high = records.filter(i => i.priorityLevel === 'high').length;
  el.innerHTML = `
    <div class="summary-card"><div class="summary-label">Объектов в выборке</div><div class="summary-value">${formatNumber(records.length)}</div></div>
    <div class="summary-card"><div class="summary-label">Непокрытая площадь</div><div class="summary-value">${formatNumber(totalUncovered)}</div></div>
    <div class="summary-card"><div class="summary-label">Рекомендуемый объём</div><div class="summary-value">${formatNumber(totalVolume)}</div></div>
    <div class="summary-card"><div class="summary-label">Ориентировочная стоимость</div><div class="summary-value">${formatCurrency(totalCost)}</div></div>
    <div class="summary-card"><div class="summary-label">Высокий приоритет</div><div class="summary-value">${formatNumber(high)}</div></div>`;
}
function getLatLngs(item) {
  const coords = item.geometry?.odh?.coordinates?.[0] || [];
  return coords.map(([lng, lat]) => [lat, lng]);
}
function ensureMap() {
  if (state.map) return;
  state.map = L.map('map').setView([55.75, 37.62], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(state.map);
}
function layerStyle(level, active=false) {
  const base = level === 'high' ? '#16a34a' : level === 'medium' ? '#d97706' : '#64748b';
  return { color: base, weight: active ? 4 : 2, fillColor: base, fillOpacity: active ? .35 : .18 };
}
function renderMap(records) {
  ensureMap();
  state.layersByObjectId.forEach(layer => state.map.removeLayer(layer));
  state.layersByObjectId.clear();
  const bounds = [];
  records.forEach(item => {
    const latlngs = getLatLngs(item); if (!latlngs.length) return;
    const layer = L.polygon(latlngs, layerStyle(item.priorityLevel, item.objectId === state.highlightedObjectId)).addTo(state.map);
    layer.bindPopup(`<div class="popup-title">${item.name}</div><div class="popup-meta">${item.district}, ${item.area}<br>${item.reason || '—'}</div>`);
    state.layersByObjectId.set(item.objectId, layer); bounds.push(...latlngs);
  });
  if (bounds.length) state.map.fitBounds(bounds, { padding: [24, 24] });
}
function focusObjectOnMap(objectId) {
  state.highlightedObjectId = objectId;
  state.layersByObjectId.forEach((layer, id) => layer.setStyle(layerStyle(state.analysisResults.find(i => i.objectId === id)?.priorityLevel || 'low', id === objectId)));
  const layer = state.layersByObjectId.get(objectId);
  if (layer) { state.map.fitBounds(layer.getBounds(), { padding: [30, 30] }); layer.openPopup(); }
  document.querySelectorAll('#resultsBody tr').forEach(tr => tr.classList.toggle('active-row', tr.dataset.objectId === String(objectId)));
}
function renderTable(records) {
  const body = document.getElementById('resultsBody');
  body.innerHTML = records.map((item, index) => `
    <tr data-object-id="${item.objectId}">
      <td>${index + 1}</td>
      <td><div class="object-title">${item.name}</div><div class="object-meta">ID ${item.objectId}</div></td>
      <td>${item.sourceType || '—'}</td>
      <td>${item.reason || '—'}</td>
      <td>${formatNumber(item.coveragePercent, 1)}</td>
      <td>${formatNumber(item.coveredArea)}</td>
      <td>${formatNumber(item.uncoveredArea)}</td>
      <td>${formatNumber(item.recommendedVolume)}</td>
      <td>${formatCurrency(item.estimatedCost)}</td>
      <td>${formatNumber(item.lastWorkYear)}</td>
      <td>${formatNumber(item.repairAge)}</td>
      <td>${item.district || '—'}</td>
      <td>${item.area || '—'}</td>
      <td>${item.department || '—'}</td>
      <td><span class="priority-badge ${item.priorityLevel}">${item.priorityLevel === 'high' ? 'Высокий' : item.priorityLevel === 'medium' ? 'Средний' : 'Низкий'}</span></td>
      <td><button class="btn btn-small" data-map-focus="${item.objectId}">На карте</button></td>
    </tr>`).join('');
  body.querySelectorAll('[data-map-focus]').forEach(btn => btn.addEventListener('click', e => focusObjectOnMap(Number(e.target.dataset.mapFocus))));
}
function renderMirrors(records) {
  document.getElementById('selectedDatasetsView').innerHTML = [...state.selectedDatasets].map(code => `<span class="chip">${datasetsMeta[code].label}</span>`).join('');
  document.getElementById('criteriaMirror').innerHTML = state.groups.map((group, idx) => `<div class="mirror-card"><div class="mirror-title">Группа ${idx + 1} · вес ${group.weight ?? 0}%</div><div class="mirror-text">${group.conditions.map(c => `${datasetsMeta[c.dataset].label} → ${getAttributeMeta(c.dataset, c.attribute)?.label || c.attribute} ${c.operator}${c.value1 ? ' ' + c.value1 : ''}${c.value2 ? ' до ' + c.value2 : ''}`).join(`<br>${group.conditionsJoin} `)}</div></div>`).join('');
  document.getElementById('weightsMirror').innerHTML = getEffectiveWeights().map(w => `<div class="mirror-card"><div class="mirror-title">${weightableFields.find(f => f.code === w.field)?.label || w.field}</div><div class="mirror-text">${w.value}%</div></div>`).join('');
}
function rerunAfterChange() { if (!document.getElementById('resultsSection').classList.contains('hidden')) runAnalysis(false); }
function rerenderResultsOnly() { if (!state.analysisResults.length) return; const rescored = scoreRecords(applyCriteria(getFilteredDatasetBase())); state.analysisResults = rescored; renderSummary(rescored); renderTable(rescored); renderMap(rescored); renderMirrors(rescored); }
function animateLoading(callback) {
  const section = document.getElementById('analysisLoading'); const fill = document.getElementById('loadingBarFill'); const percent = document.getElementById('loadingPercent'); const stage = document.getElementById('loadingStage');
  section.classList.remove('hidden');
  const steps = [{ value: 22, text: 'Проверка выбранных наборов...' }, { value: 47, text: 'Применение сложных критериев...' }, { value: 76, text: 'Расчёт приоритета и весов...' }, { value: 100, text: 'Подготовка карты и реестра...' }];
  let i = 0; fill.style.width = '0%'; percent.textContent = '0%'; stage.textContent = 'Подготовка наборов...';
  function tick() { const step = steps[i]; fill.style.width = `${step.value}%`; percent.textContent = `${step.value}%`; stage.textContent = step.text; i += 1; if (i < steps.length) setTimeout(tick, 140); else setTimeout(() => { section.classList.add('hidden'); callback(); }, 180); }
  setTimeout(tick, 70);
}
function runAnalysis(withAnimation = true) {
  if (!state.datasetsConfirmed) { alert('Сначала выбери наборы и нажми «Далее».'); return; }
  if (!state.selectedDatasets.size) { alert('Выбери хотя бы один набор данных.'); return; }
  const execute = () => { const filtered = applyCriteria(getFilteredDatasetBase()); const scored = scoreRecords(filtered); state.analysisResults = scored; document.getElementById('resultsSection').classList.remove('hidden'); renderSummary(scored); renderTable(scored); renderMap(scored); renderMirrors(scored); };
  if (withAnimation) animateLoading(execute); else execute();
}
function resetAll() {
  state.selectedDatasets = new Set(["odhObjects", "odhWorks", "okbWorks"]); state.datasetsConfirmed = false; state.customWeightsEnabled = false; state.datasetPickerOpen = false; initState();
  document.getElementById('customWeightsToggle').checked = false; document.getElementById('resultsSection').classList.add('hidden'); state.analysisResults = []; state.highlightedObjectId = null;
  renderDatasetSelection(); setDatasetsConfirmed(false); renderWeights(); renderGroups();
}
function exportExcel() { if (!state.analysisResults.length) return; const rows = state.analysisResults.map((item, index) => ({ '#': index + 1, 'ID ОДХ': item.objectId, 'Наименование': item.name, 'Тип набора': item.sourceType, 'Основание включения': item.reason, 'Процент покрытия': item.coveragePercent, 'Покрытая площадь': item.coveredArea, 'Непокрытая площадь': item.uncoveredArea, 'Рекомендуемый объем': item.recommendedVolume, 'Стоимость': item.estimatedCost, 'Последний год': item.lastWorkYear, 'Давность': item.repairAge, 'Округ': item.district, 'Район': item.area, 'ОИВ': item.department, 'Приоритет': item.priorityLevel, 'Баллы': item.priorityScore })); const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Анализ ОДХ'); XLSX.writeFile(wb, 'predictive_analysis_odh.xlsx'); }
function attachTopLevelEvents() {
  document.getElementById('confirmDatasetsBtn').addEventListener('click', () => {
    if (!state.selectedDatasets.size) { alert('Выбери хотя бы один набор.'); return; }
    setDatasetsConfirmed(true);
  });
  document.getElementById('editDatasetsBtn').addEventListener('click', () => setDatasetsConfirmed(false));
  document.getElementById('customWeightsToggle').addEventListener('change', e => { state.customWeightsEnabled = e.target.checked; renderWeights(); rerenderResultsOnly(); });
  document.getElementById('addWeightBtn').addEventListener('click', () => { state.weights.push(createWeight(weightableFields[0]?.code || 'coveragePercent', 0)); renderWeights(); });
  document.getElementById('resetWeightsBtn').addEventListener('click', () => { state.weights = [createWeight('coveragePercent',35), createWeight('repairAge',25), createWeight('estimatedCost',20), createWeight('recommendedVolume',20)]; renderWeights(); rerenderResultsOnly(); });
  document.getElementById('addGroupBtn').addEventListener('click', () => { if (!getAvailableDatasets().length) return; state.groups.push(createGroup(getAvailableDatasets()[0].code)); renderGroups(); });
  document.getElementById('runAnalysisBtn').addEventListener('click', () => runAnalysis(true));
  document.getElementById('resetAnalysisBtn').addEventListener('click', resetAll);
  document.getElementById('exportExcelBtn').addEventListener('click', exportExcel);
}
function bootstrap() {
  initState(); renderDatasetSelection(); renderWeights(); renderGroups(); setDatasetsConfirmed(false); attachTopLevelEvents();
}
bootstrap();
