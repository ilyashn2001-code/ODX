
const { datasetsMeta, weightableFields, baseWeights, objects } = window.APP_DATA;

const state = {
  selectedDatasets: new Set(["odhObjects", "odhWorks", "okbWorks"]),
  groups: [],
  weights: [],
  customWeightsEnabled: false,
  map: null,
  layersByObjectId: new Map(),
  highlightedObjectId: null,
  analysisResults: []
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

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || value === "") return "—";
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

function formatCurrency(value) {
  if (value === null || value === undefined) return "—";
  return `${formatNumber(value)} ₽`;
}

function getAvailableDatasets() {
  return Object.entries(datasetsMeta)
    .filter(([code]) => state.selectedDatasets.has(code))
    .map(([code, item]) => ({ code, label: item.label }));
}

function getDatasetMeta(code) {
  return datasetsMeta[code];
}

function getAttributeOptions(datasetCode) {
  return getDatasetMeta(datasetCode)?.attributes || [];
}

function getAttributeMeta(datasetCode, attrCode) {
  return getAttributeOptions(datasetCode).find(item => item.code === attrCode);
}

function getOperators(type) {
  return OPERATORS_BY_TYPE[type] || OPERATORS_BY_TYPE.text;
}

function createCondition(datasetCode) {
  const attr = getAttributeOptions(datasetCode)[0];
  const operator = getOperators(attr?.type || "text")[0]?.code || "eq";
  return {
    id: uid(),
    dataset: datasetCode,
    attribute: attr?.code || "name",
    operator,
    value1: "",
    value2: "",
    rowJoin: "AND"
  };
}

function createGroup(defaultDataset) {
  const datasetCode = defaultDataset || getAvailableDatasets()[0]?.code || "odhObjects";
  return {
    id: uid(),
    joinToNext: "AND",
    conditionsJoin: "AND",
    conditions: [createCondition(datasetCode)]
  };
}

function createWeight(field = "coveragePercent", value = 25) {
  return { id: uid(), field, value };
}

function initState() {
  state.groups = [createGroup("odhObjects")];
  state.weights = [
    createWeight("coveragePercent", 35),
    createWeight("repairAge", 25),
    createWeight("estimatedCost", 20),
    createWeight("recommendedVolume", 20)
  ];
}

function renderDatasetSelection() {
  const container = document.getElementById("datasetSelection");
  container.innerHTML = "";
  Object.entries(datasetsMeta).forEach(([code, item]) => {
    const active = state.selectedDatasets.has(code);
    const card = document.createElement("label");
    card.className = `dataset-card ${active ? "active" : ""}`;
    card.innerHTML = `
      <div class="dataset-title"><input type="checkbox" data-code="${code}" ${active ? "checked" : ""}/> ${item.label}</div>
      <div class="dataset-desc">${item.description || ""}</div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.addEventListener("change", event => {
      const code = event.target.dataset.code;
      if (event.target.checked) state.selectedDatasets.add(code);
      else state.selectedDatasets.delete(code);
      normalizeGroupsAgainstDatasets();
      renderDatasetSelection();
      renderGroups();
      renderMirrors(state.analysisResults);
    });
  });
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
        cond.value1 = "";
        cond.value2 = "";
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
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll("[data-role='field']").forEach(el => el.addEventListener("change", onWeightChange));
  container.querySelectorAll("[data-role='value']").forEach(el => el.addEventListener("input", onWeightChange));
  container.querySelectorAll("[data-role='remove']").forEach(el => el.addEventListener("click", event => {
    const id = event.target.dataset.id;
    state.weights = state.weights.filter(item => item.id !== id);
    renderWeights();
    renderWeightStatus();
    rerenderResultsOnly();
  }));
  renderWeightStatus();
}

function onWeightChange(event) {
  const id = event.target.dataset.id;
  const weight = state.weights.find(item => item.id === id);
  if (!weight) return;
  if (event.target.dataset.role === "field") weight.field = event.target.value;
  if (event.target.dataset.role === "value") weight.value = Number(event.target.value || 0);
  renderWeightStatus();
  rerenderResultsOnly();
}

function renderWeightStatus() {
  const status = document.getElementById("weightsStatus");
  if (!state.customWeightsEnabled) {
    status.className = "status-pill neutral";
    status.textContent = "Используются базовые коэффициенты";
    return;
  }
  const sum = state.weights.reduce((acc, item) => acc + Number(item.value || 0), 0);
  const unique = new Set(state.weights.map(item => item.field));
  if (sum === 100 && unique.size === state.weights.length && state.weights.length > 0) {
    status.className = "status-pill ok";
    status.textContent = `Пользовательские коэффициенты активны · сумма ${sum}%`;
  } else {
    status.className = "status-pill warn";
    status.textContent = `Сумма ${sum}%${unique.size !== state.weights.length ? " · есть дубли полей" : ""}`;
  }
}

function renderGroups() {
  const container = document.getElementById("groupsList");
  container.innerHTML = "";
  const datasetOptions = getAvailableDatasets();

  if (!datasetOptions.length) {
    container.innerHTML = `<div class="helper-text">Сначала выбери хотя бы один набор данных.</div>`;
    return;
  }

  state.groups.forEach((group, groupIndex) => {
    const groupEl = document.createElement("div");
    groupEl.className = "group-card";
    groupEl.innerHTML = `
      <div class="group-head">
        <div>
          <strong>Группа ${groupIndex + 1}</strong>
          <div class="row-note">Внутри группы используется связь <strong>${group.conditionsJoin === "AND" ? "И" : group.conditionsJoin === "OR" ? "ИЛИ" : "НЕ"}</strong>. Между группами — <strong>${group.joinToNext === "AND" ? "И" : group.joinToNext === "OR" ? "ИЛИ" : "НЕ"}</strong>.</div>
        </div>
        <div class="group-controls">
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
      <div class="group-body" id="group-body-${group.id}"></div>
    `;
    container.appendChild(groupEl);

    const body = groupEl.querySelector(`#group-body-${group.id}`);
    group.conditions.forEach((condition, conditionIndex) => {
      const attrOptions = getAttributeOptions(condition.dataset);
      const attrMeta = getAttributeMeta(condition.dataset, condition.attribute) || attrOptions[0];
      const operators = getOperators(attrMeta?.type || "text");
      const between = condition.operator === "between";
      const emptyOp = condition.operator === "isEmpty" || condition.operator === "notEmpty";
      const row = document.createElement("div");
      row.className = "criterion-row";
      row.innerHTML = `
        <div class="criterion-grid">
          <div>
            <div class="row-note">Строка</div>
            <div>${conditionIndex + 1}</div>
          </div>
          <select data-role="dataset" data-group-id="${group.id}" data-condition-id="${condition.id}">
            ${datasetOptions.map(item => `<option value="${item.code}" ${item.code === condition.dataset ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
          <select data-role="attribute" data-group-id="${group.id}" data-condition-id="${condition.id}">
            ${attrOptions.map(item => `<option value="${item.code}" ${item.code === condition.attribute ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
          <select data-role="operator" data-group-id="${group.id}" data-condition-id="${condition.id}">
            ${operators.map(item => `<option value="${item.code}" ${item.code === condition.operator ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
          <input data-role="value1" data-group-id="${group.id}" data-condition-id="${condition.id}" value="${condition.value1 ?? ""}" placeholder="${emptyOp ? "Не нужно" : "Значение"}" ${emptyOp ? "disabled" : ""} />
          <input data-role="value2" data-group-id="${group.id}" data-condition-id="${condition.id}" value="${condition.value2 ?? ""}" placeholder="${between ? "До" : "Не используется"}" ${between ? "" : "disabled"} />
          <button class="btn btn-small" data-role="remove-condition" data-group-id="${group.id}" data-condition-id="${condition.id}">Удалить</button>
        </div>
      `;
      body.appendChild(row);
    });
  });

  attachGroupEvents();
}

function attachGroupEvents() {
  document.querySelectorAll("[data-role='group-join']").forEach(el => el.addEventListener("change", event => {
    const group = state.groups.find(item => item.id === event.target.dataset.groupId);
    group.joinToNext = event.target.value;
    renderGroups();
    rerunAfterChange();
  }));

  document.querySelectorAll("[data-role='conditions-join']").forEach(el => el.addEventListener("change", event => {
    const group = state.groups.find(item => item.id === event.target.dataset.groupId);
    group.conditionsJoin = event.target.value;
    renderGroups();
    rerunAfterChange();
  }));

  document.querySelectorAll("[data-role='add-condition']").forEach(el => el.addEventListener("click", event => {
    const group = state.groups.find(item => item.id === event.target.dataset.groupId);
    group.conditions.push(createCondition(getAvailableDatasets()[0]?.code || "odhObjects"));
    renderGroups();
  }));

  document.querySelectorAll("[data-role='remove-group']").forEach(el => el.addEventListener("click", event => {
    const id = event.target.dataset.groupId;
    state.groups = state.groups.filter(item => item.id !== id);
    if (!state.groups.length && getAvailableDatasets().length) state.groups = [createGroup(getAvailableDatasets()[0].code)];
    renderGroups();
    rerunAfterChange();
  }));

  document.querySelectorAll("[data-role='remove-condition']").forEach(el => el.addEventListener("click", event => {
    const group = state.groups.find(item => item.id === event.target.dataset.groupId);
    group.conditions = group.conditions.filter(item => item.id !== event.target.dataset.conditionId);
    if (!group.conditions.length) group.conditions = [createCondition(getAvailableDatasets()[0]?.code || "odhObjects")];
    renderGroups();
    rerunAfterChange();
  }));

  document.querySelectorAll("[data-role='dataset'], [data-role='attribute'], [data-role='operator'], [data-role='value1'], [data-role='value2']").forEach(el => {
    const eventName = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(eventName, event => {
      const group = state.groups.find(item => item.id === event.target.dataset.groupId);
      const condition = group.conditions.find(item => item.id === event.target.dataset.conditionId);
      const role = event.target.dataset.role;
      if (role === "dataset") {
        condition.dataset = event.target.value;
        condition.attribute = getAttributeOptions(condition.dataset)[0]?.code || "name";
        condition.operator = getOperators(getAttributeMeta(condition.dataset, condition.attribute)?.type || "text")[0]?.code || "eq";
        condition.value1 = "";
        condition.value2 = "";
        renderGroups();
      } else if (role === "attribute") {
        condition.attribute = event.target.value;
        condition.operator = getOperators(getAttributeMeta(condition.dataset, condition.attribute)?.type || "text")[0]?.code || "eq";
        condition.value1 = "";
        condition.value2 = "";
        renderGroups();
      } else if (role === "operator") {
        condition.operator = event.target.value;
        condition.value1 = "";
        condition.value2 = "";
        renderGroups();
      } else if (role === "value1") {
        condition.value1 = event.target.value;
      } else if (role === "value2") {
        condition.value2 = event.target.value;
      }
      rerunAfterChange();
    });
  });
}

function parseByType(value, type) {
  if (value === null || value === undefined || value === "") return value;
  if (type === "number") return Number(value);
  if (type === "boolean") {
    if (typeof value === "boolean") return value;
    const normalized = String(value).trim().toLowerCase();
    return normalized === "true" || normalized === "да" || normalized === "1";
  }
  return String(value).trim().toLowerCase();
}

function compareValue(recordValue, condition) {
  const attrMeta = getAttributeMeta(condition.dataset, condition.attribute);
  const type = attrMeta?.type || "text";
  const value = parseByType(recordValue, type);
  const c1 = parseByType(condition.value1, type);
  const c2 = parseByType(condition.value2, type);

  switch (condition.operator) {
    case "eq": return value === c1;
    case "neq": return value !== c1;
    case "gt": return value > c1;
    case "gte": return value >= c1;
    case "lt": return value < c1;
    case "lte": return value <= c1;
    case "contains": return String(recordValue ?? "").toLowerCase().includes(String(condition.value1 ?? "").toLowerCase());
    case "notContains": return !String(recordValue ?? "").toLowerCase().includes(String(condition.value1 ?? "").toLowerCase());
    case "between": return value >= c1 && value <= c2;
    case "isEmpty": return recordValue === null || recordValue === undefined || recordValue === "";
    case "notEmpty": return !(recordValue === null || recordValue === undefined || recordValue === "");
    default: return false;
  }
}

function evaluateGroup(record, group) {
  if (!group.conditions.length) return true;
  const results = group.conditions.map(condition => compareValue(record[condition.attribute], condition));
  if (group.conditionsJoin === "AND") return results.every(Boolean);
  if (group.conditionsJoin === "OR") return results.some(Boolean);
  if (group.conditionsJoin === "NOT") return results.every(item => !item);
  return true;
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
  const clean = values.map(v => (v === null || v === undefined || Number.isNaN(Number(v)) ? 0 : Number(v)));
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  return clean.map(value => {
    let normalized = (value - min) / range;
    if (invert) normalized = 1 - normalized;
    return normalized;
  });
}

function getEffectiveWeights() {
  if (!state.customWeightsEnabled) {
    return Object.entries(baseWeights).map(([field, value]) => ({ field, value }));
  }
  const sum = state.weights.reduce((acc, item) => acc + Number(item.value || 0), 0);
  const unique = new Set(state.weights.map(item => item.field));
  if (sum !== 100 || unique.size !== state.weights.length || !state.weights.length) {
    return Object.entries(baseWeights).map(([field, value]) => ({ field, value }));
  }
  return state.weights.map(item => ({ field: item.field, value: Number(item.value || 0) }));
}

function scoreRecords(records) {
  if (!records.length) return [];
  const normByField = {
    coveragePercent: normalize(records.map(item => item.coveragePercent), true),
    repairAge: normalize(records.map(item => item.repairAge)),
    estimatedCost: normalize(records.map(item => item.estimatedCost), true),
    recommendedVolume: normalize(records.map(item => item.recommendedVolume))
  };
  const effectiveWeights = getEffectiveWeights();
  return records.map((item, index) => {
    let score = 0;
    effectiveWeights.forEach(weight => {
      score += (normByField[weight.field]?.[index] || 0) * (weight.value / 100);
    });
    const priorityScore = Number(score.toFixed(4));
    const priorityLevel = priorityScore >= 0.75 ? "high" : priorityScore >= 0.45 ? "medium" : "low";
    return { ...item, priorityScore, priorityLevel };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

function summarize(records) {
  return {
    count: records.length,
    uncovered: records.reduce((sum, item) => sum + Number(item.uncoveredArea || 0), 0),
    volume: records.reduce((sum, item) => sum + Number(item.recommendedVolume || 0), 0),
    cost: records.reduce((sum, item) => sum + Number(item.estimatedCost || 0), 0),
    highPriority: records.filter(item => item.priorityLevel === "high").length
  };
}

function renderSummary(records) {
  const data = summarize(records);
  const container = document.getElementById("summaryCards");
  container.innerHTML = `
    <div class="summary-card"><div class="summary-label">Объектов в выборке</div><div class="summary-value">${formatNumber(data.count)}</div><div class="summary-sub">После применения критериев</div></div>
    <div class="summary-card"><div class="summary-label">Непокрытая площадь</div><div class="summary-value">${formatNumber(data.uncovered)}</div><div class="summary-sub">м²</div></div>
    <div class="summary-card"><div class="summary-label">Рекомендуемый объем</div><div class="summary-value">${formatNumber(data.volume)}</div><div class="summary-sub">м²</div></div>
    <div class="summary-card"><div class="summary-label">Ориентировочная стоимость</div><div class="summary-value">${formatCurrency(data.cost)}</div><div class="summary-sub">По расчетной модели</div></div>
    <div class="summary-card"><div class="summary-label">Высокий приоритет</div><div class="summary-value">${formatNumber(data.highPriority)}</div><div class="summary-sub">Объектов в зоне высокого риска</div></div>
  `;
}

function getPriorityColor(level) {
  if (level === "high") return "#16a34a";
  if (level === "medium") return "#d97706";
  return "#64748b";
}

function geometryToLatLngs(geojsonPolygon) {
  if (!geojsonPolygon || geojsonPolygon.type !== "Polygon") return [];
  return geojsonPolygon.coordinates[0].map(([lng, lat]) => [lat, lng]);
}

function ensureMap() {
  if (state.map) return;
  state.map = L.map("map").setView([55.7558, 37.6176], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors"
  }).addTo(state.map);
}

function renderMap(records) {
  ensureMap();
  state.layersByObjectId.forEach(layer => state.map.removeLayer(layer));
  state.layersByObjectId.clear();
  const bounds = [];

  records.forEach(item => {
    const latlngs = geometryToLatLngs(item.geometry?.odh);
    if (!latlngs.length) return;
    const color = getPriorityColor(item.priorityLevel);
    const layer = L.polygon(latlngs, {
      color,
      weight: state.highlightedObjectId === item.objectId ? 4 : 2,
      fillColor: color,
      fillOpacity: state.highlightedObjectId === item.objectId ? 0.35 : 0.18
    }).addTo(state.map);
    layer.bindPopup(`
      <div class="popup-title">${item.name}</div>
      <div class="popup-meta">${item.district}, ${item.area}</div>
      <div class="popup-meta">Покрытие: ${formatNumber(item.coveragePercent, 2)}%</div>
      <div class="popup-meta">Основание: ${item.reason}</div>
    `);
    layer.on("click", () => focusObject(item.objectId));
    state.layersByObjectId.set(item.objectId, layer);
    bounds.push(...latlngs);
  });

  if (bounds.length) state.map.fitBounds(bounds, { padding: [20, 20] });
}

function focusObject(objectId) {
  state.highlightedObjectId = objectId;
  const layer = state.layersByObjectId.get(objectId);
  if (layer) {
    state.map.fitBounds(layer.getBounds(), { padding: [30, 30], maxZoom: 16 });
    layer.openPopup();
  }
  document.querySelectorAll("#resultsBody tr").forEach(tr => tr.classList.toggle("active-row", Number(tr.dataset.objectId) === Number(objectId)));
  renderMap(state.analysisResults);
}

function renderTable(records) {
  const body = document.getElementById("resultsBody");
  body.innerHTML = "";

  records.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.dataset.objectId = item.objectId;
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div class="object-title">${item.name}</div>
        <div class="object-meta">ID ОДХ: ${item.objectId}</div>
      </td>
      <td>${item.sourceType || "—"}</td>
      <td>${item.reason || "—"}</td>
      <td>${formatNumber(item.coveragePercent, 2)}</td>
      <td>${formatNumber(item.coveredArea, 2)}</td>
      <td>${formatNumber(item.uncoveredArea, 2)}</td>
      <td>${formatNumber(item.recommendedVolume, 2)}</td>
      <td>${formatCurrency(item.estimatedCost)}</td>
      <td>${item.lastWorkYear ?? "—"}</td>
      <td>${item.repairAge ?? "—"}</td>
      <td>${item.district || "—"}</td>
      <td>${item.area || "—"}</td>
      <td>${item.department || "—"}</td>
      <td><span class="priority-badge ${item.priorityLevel}">${item.priorityLevel === "high" ? "Высокий" : item.priorityLevel === "medium" ? "Средний" : "Низкий"}</span></td>
      <td><button class="btn btn-small" data-role="focus" data-object-id="${item.objectId}">На карте</button></td>
    `;
    body.appendChild(tr);
  });

  body.querySelectorAll("[data-role='focus']").forEach(btn => btn.addEventListener("click", event => {
    focusObject(Number(event.target.dataset.objectId));
  }));
}

function renderMirrors(records) {
  const datasetView = document.getElementById("selectedDatasetsView");
  datasetView.innerHTML = [...state.selectedDatasets].map(code => `<span class="chip">${datasetsMeta[code].label}</span>`).join("");

  const criteriaMirror = document.getElementById("criteriaMirror");
  criteriaMirror.innerHTML = state.groups.map((group, i) => {
    const inner = group.conditions.map(condition => {
      const dataset = datasetsMeta[condition.dataset]?.label || condition.dataset;
      const attr = getAttributeMeta(condition.dataset, condition.attribute)?.label || condition.attribute;
      let value = condition.operator === "between" ? `${condition.value1} … ${condition.value2}` : condition.value1 || "—";
      if (condition.operator === "isEmpty" || condition.operator === "notEmpty") value = "без значения";
      return `<div>• ${dataset} → ${attr} → ${condition.operator} → ${value}</div>`;
    }).join("");
    return `<div class="mirror-card"><div class="mirror-title">Группа ${i + 1}</div><div class="mirror-text">Связь внутри группы: ${group.conditionsJoin}<br>${inner}<br>Связь со следующей: ${group.joinToNext}</div></div>`;
  }).join("");

  const weightsMirror = document.getElementById("weightsMirror");
  const effective = getEffectiveWeights();
  weightsMirror.innerHTML = effective.map(weight => {
    const label = weightableFields.find(item => item.code === weight.field)?.label || weight.field;
    return `<div class="mirror-card"><div class="mirror-title">${label}</div><div class="mirror-text">Вес: ${weight.value}%</div></div>`;
  }).join("");
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

function rerunAfterChange() {
  if (!document.getElementById("resultsSection").classList.contains("hidden")) runAnalysis(false);
}

function rerenderResultsOnly() {
  if (!state.analysisResults.length) return;
  const rescored = scoreRecords(applyCriteria(getFilteredDatasetBase()));
  state.analysisResults = rescored;
  renderSummary(rescored);
  renderTable(rescored);
  renderMap(rescored);
  renderMirrors(rescored);
}

function animateLoading(callback) {
  const section = document.getElementById("analysisLoading");
  const fill = document.getElementById("loadingBarFill");
  const percent = document.getElementById("loadingPercent");
  const stage = document.getElementById("loadingStage");
  section.classList.remove("hidden");
  const steps = [
    { value: 22, text: "Проверка выбранных наборов..." },
    { value: 47, text: "Применение сложных критериев..." },
    { value: 76, text: "Расчёт приоритета и весов..." },
    { value: 100, text: "Подготовка карты и реестра..." }
  ];
  let i = 0;
  function tick() {
    const step = steps[i];
    fill.style.width = `${step.value}%`;
    percent.textContent = `${step.value}%`;
    stage.textContent = step.text;
    i += 1;
    if (i < steps.length) setTimeout(tick, 160);
    else setTimeout(() => { section.classList.add("hidden"); callback(); }, 180);
  }
  fill.style.width = "0%";
  percent.textContent = "0%";
  stage.textContent = "Подготовка наборов...";
  setTimeout(tick, 80);
}

function runAnalysis(withAnimation = true) {
  if (!state.selectedDatasets.size) {
    alert("Выбери хотя бы один набор данных.");
    return;
  }
  const execute = () => {
    const filtered = applyCriteria(getFilteredDatasetBase());
    const scored = scoreRecords(filtered);
    state.analysisResults = scored;
    document.getElementById("resultsSection").classList.remove("hidden");
    renderSummary(scored);
    renderTable(scored);
    renderMap(scored);
    renderMirrors(scored);
  };
  if (withAnimation) animateLoading(execute);
  else execute();
}

function resetAll() {
  state.selectedDatasets = new Set(["odhObjects", "odhWorks", "okbWorks"]);
  state.customWeightsEnabled = false;
  initState();
  document.getElementById("customWeightsToggle").checked = false;
  document.getElementById("resultsSection").classList.add("hidden");
  state.analysisResults = [];
  state.highlightedObjectId = null;
  renderDatasetSelection();
  renderWeights();
  renderGroups();
}

function exportExcel() {
  if (!state.analysisResults.length) return;
  const rows = state.analysisResults.map((item, index) => ({
    "#": index + 1,
    "ID ОДХ": item.objectId,
    "Наименование": item.name,
    "Тип набора": item.sourceType,
    "Основание включения": item.reason,
    "Процент покрытия": item.coveragePercent,
    "Покрытая площадь": item.coveredArea,
    "Непокрытая площадь": item.uncoveredArea,
    "Рекомендуемый объем": item.recommendedVolume,
    "Стоимость": item.estimatedCost,
    "Последний год": item.lastWorkYear,
    "Давность": item.repairAge,
    "Округ": item.district,
    "Район": item.area,
    "ОИВ": item.department,
    "Приоритет": item.priorityLevel,
    "Баллы": item.priorityScore
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Анализ ОДХ");
  XLSX.writeFile(workbook, "predictive_analysis_odh.xlsx");
}

function attachTopLevelEvents() {
  document.getElementById("customWeightsToggle").addEventListener("change", event => {
    state.customWeightsEnabled = event.target.checked;
    renderWeights();
    rerenderResultsOnly();
  });
  document.getElementById("addWeightBtn").addEventListener("click", () => {
    state.weights.push(createWeight(weightableFields[0]?.code || "coveragePercent", 0));
    renderWeights();
  });
  document.getElementById("resetWeightsBtn").addEventListener("click", () => {
    state.weights = [
      createWeight("coveragePercent", 35),
      createWeight("repairAge", 25),
      createWeight("estimatedCost", 20),
      createWeight("recommendedVolume", 20)
    ];
    renderWeights();
    rerenderResultsOnly();
  });
  document.getElementById("addGroupBtn").addEventListener("click", () => {
    if (!getAvailableDatasets().length) return;
    state.groups.push(createGroup(getAvailableDatasets()[0].code));
    renderGroups();
  });
  document.getElementById("runAnalysisBtn").addEventListener("click", () => runAnalysis(true));
  document.getElementById("resetAnalysisBtn").addEventListener("click", resetAll);
  document.getElementById("exportExcelBtn").addEventListener("click", exportExcel);
}

function bootstrap() {
  initState();
  renderDatasetSelection();
  renderWeights();
  renderGroups();
  attachTopLevelEvents();
}

bootstrap();
