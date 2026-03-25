const {
  datasetsMeta,
  weightableFields,
  baseWeights,
  objects
} = window.APP_DATA;

const state = {
  criteria: [],
  weights: [],
  customWeightsEnabled: false,
  isCalculated: false,
  map: null,
  mapLayerGroup: null
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
  ],
  date: [
    { code: "eq", label: "Равно" },
    { code: "gt", label: "После" },
    { code: "lt", label: "До" },
    { code: "between", label: "От / До" },
    { code: "isEmpty", label: "Пусто" },
    { code: "notEmpty", label: "Не пусто" }
  ]
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatNumber(value, digits = 0) {
  const options = { maximumFractionDigits: digits, minimumFractionDigits: digits };
  return new Intl.NumberFormat("ru-RU", options).format(value);
}

function formatCurrency(value) {
  return `${formatNumber(value)} ₽`;
}

function getDatasetOptions() {
  return Object.entries(datasetsMeta).map(([code, item]) => ({
    code,
    label: item.label
  }));
}

function getDatasetMeta(code) {
  return datasetsMeta[code];
}

function getAttributeMeta(datasetCode, attrCode) {
  return getDatasetMeta(datasetCode)?.attributes.find(attr => attr.code === attrCode);
}

function getAttributeOptions(datasetCode) {
  return getDatasetMeta(datasetCode)?.attributes || [];
}

function getOperators(type) {
  return OPERATORS_BY_TYPE[type] || OPERATORS_BY_TYPE.text;
}

function createSelect(options, value, extraAttrs = "") {
  const opts = options.map(option => {
    const selected = option.code === value ? "selected" : "";
    return `<option value="${option.code}" ${selected}>${option.label}</option>`;
  }).join("");
  return `<select ${extraAttrs}>${opts}</select>`;
}

function createCriterion(defaults = {}) {
  const firstDataset = defaults.dataset || "odhObjects";
  const firstAttr = defaults.attribute || getAttributeOptions(firstDataset)[0]?.code;
  const attrMeta = getAttributeMeta(firstDataset, firstAttr);
  const firstOperator = defaults.operator || getOperators(attrMeta?.type || "text")[0].code;

  return {
    id: uid(),
    join: defaults.join || "AND",
    dataset: firstDataset,
    attribute: firstAttr,
    operator: firstOperator,
    value1: defaults.value1 ?? "",
    value2: defaults.value2 ?? ""
  };
}

function createWeight(defaults = {}) {
  return {
    id: uid(),
    field: defaults.field || "coveragePercent",
    value: defaults.value ?? 25,
    title: defaults.title || ""
  };
}

function initState() {
  state.criteria = [
    createCriterion({
      dataset: "odhObjects",
      attribute: "district",
      operator: "eq",
      value1: "ЦАО"
    }),
    createCriterion({
      join: "AND",
      dataset: "odhWorks",
      attribute: "lastWorkYear",
      operator: "lt",
      value1: "2024"
    })
  ];

  state.weights = [
    createWeight({ field: "coveragePercent", value: 35 }),
    createWeight({ field: "repairAge", value: 25 }),
    createWeight({ field: "estimatedCost", value: 20 }),
    createWeight({ field: "recommendedVolume", value: 20 })
  ];
}

function renderCriteria(targetId = "criteriaList") {
  const container = document.getElementById(targetId);
  container.innerHTML = "";

  state.criteria.forEach((criterion, index) => {
    const datasetOptions = getDatasetOptions();
    const attrOptions = getAttributeOptions(criterion.dataset);
    const attrMeta = getAttributeMeta(criterion.dataset, criterion.attribute);
    const operatorOptions = getOperators(attrMeta?.type || "text");

    const row = document.createElement("div");
    row.className = "row-card";

    const secondValueVisible = criterion.operator === "between";
    const isEmptyOperator = criterion.operator === "isEmpty" || criterion.operator === "notEmpty";

    row.innerHTML = `
      <div class="row-card-head">
        <span class="row-chip">Критерий ${index + 1}</span>
        <button class="btn btn-small criterion-remove-btn" data-id="${criterion.id}">Удалить</button>
      </div>

      <div class="row-controls">
        ${createSelect(
          datasetOptions,
          criterion.dataset,
          `data-role="dataset" data-id="${criterion.id}"`
        )}
        ${createSelect(
          attrOptions.map(item => ({ code: item.code, label: item.label })),
          criterion.attribute,
          `data-role="attribute" data-id="${criterion.id}"`
        )}
        ${createSelect(
          operatorOptions,
          criterion.operator,
          `data-role="operator" data-id="${criterion.id}"`
        )}
        <input
          data-role="value1"
          data-id="${criterion.id}"
          placeholder="${isEmptyOperator ? "Значение не требуется" : "Значение"}"
          value="${criterion.value1 ?? ""}"
          ${isEmptyOperator ? "disabled" : ""}
        />
        <input
          data-role="value2"
          data-id="${criterion.id}"
          placeholder="${secondValueVisible ? "До" : "Не используется"}"
          value="${criterion.value2 ?? ""}"
          ${secondValueVisible ? "" : "disabled"}
        />
        <select data-role="join" data-id="${criterion.id}">
          <option value="AND" ${criterion.join === "AND" ? "selected" : ""}>И</option>
          <option value="OR" ${criterion.join === "OR" ? "selected" : ""}>ИЛИ</option>
          <option value="NOT" ${criterion.join === "NOT" ? "selected" : ""}>НЕ</option>
        </select>
      </div>

      <div class="row-meta">
        Набор: <strong>${getDatasetMeta(criterion.dataset).label}</strong> ·
        Атрибут: <strong>${attrMeta?.label || "-"}</strong> ·
        Тип данных: <strong>${attrMeta?.type || "-"}</strong>
      </div>
    `;

    container.appendChild(row);
  });

  attachCriterionEvents(targetId);
}

function renderWeights(targetId = "weightsList") {
  const container = document.getElementById(targetId);
  container.innerHTML = "";

  state.weights.forEach((weight, index) => {
    const row = document.createElement("div");
    row.className = "row-card";
    row.innerHTML = `
      <div class="row-card-head">
        <span class="row-chip">Коэффициент ${index + 1}</span>
        <button class="btn btn-small weight-remove-btn" data-id="${weight.id}">Удалить</button>
      </div>
      <div class="row-controls" style="grid-template-columns: 1.4fr minmax(100px,.7fr) 1.2fr auto auto auto;">
        ${createSelect(
          weightableFields.map(item => ({ code: item.code, label: item.label })),
          weight.field,
          `data-role="weight-field" data-id="${weight.id}"`
        )}
        <input data-role="weight-value" data-id="${weight.id}" type="number" min="0" max="100" value="${weight.value}" />
        <input data-role="weight-title" data-id="${weight.id}" placeholder="Пояснение, если нужно" value="${weight.title || ""}" />
        <div class="row-chip">${weight.value}%</div>
        <div></div>
        <div></div>
      </div>
      <div class="row-meta">Вес применяется к приоритизации, а не к составу выборки.</div>
    `;
    container.appendChild(row);
  });

  attachWeightEvents(targetId);
  renderWeightStatus();
}

function renderWeightStatus() {
  const status = document.getElementById("weightsStatus");
  if (!state.customWeightsEnabled) {
    status.textContent = "Пользовательские коэффициенты выключены.";
    return;
  }
  const sum = state.weights.reduce((acc, item) => acc + Number(item.value || 0), 0);
  if (sum === 100) {
    status.innerHTML = `Сумма коэффициентов: <strong>100%</strong>. Пользовательская приоритизация активна.`;
  } else {
    status.innerHTML = `Сумма коэффициентов: <strong>${sum}%</strong>. Пока не 100%, поэтому приоритет берется из базовой модели.`;
  }
}

function renderMirrors(filtered) {
  const criteriaMirror = document.getElementById("criteriaMirror");
  const weightsMirror = document.getElementById("weightsMirror");
  criteriaMirror.innerHTML = "";
  weightsMirror.innerHTML = "";

  state.criteria.forEach((criterion, idx) => {
    const attrMeta = getAttributeMeta(criterion.dataset, criterion.attribute);
    const block = document.createElement("div");
    block.className = "mirror-row";
    block.innerHTML = `
      <div class="mirror-title">Критерий ${idx + 1}</div>
      <div class="mirror-text">
        ${getDatasetMeta(criterion.dataset).label} → ${attrMeta?.label || "-"} → ${criterion.operator}
        ${criterion.value1 ? `→ ${criterion.value1}` : ""} ${criterion.value2 ? `до ${criterion.value2}` : ""}
        <br>Логика связи: ${criterion.join}
      </div>
    `;
    criteriaMirror.appendChild(block);
  });

  const activeWeights = getEffectiveWeights();
  activeWeights.forEach((weight, idx) => {
    const label = weightableFields.find(item => item.code === weight.field)?.label || weight.field;
    const block = document.createElement("div");
    block.className = "mirror-row";
    block.innerHTML = `
      <div class="mirror-title">Коэффициент ${idx + 1}</div>
      <div class="mirror-text">${label} → ${weight.value}%</div>
    `;
    weightsMirror.appendChild(block);
  });
}

function attachCriterionEvents(targetId = "criteriaList") {
  const container = document.getElementById(targetId);

  container.querySelectorAll('[data-role="dataset"]').forEach(el => {
    el.addEventListener("change", event => {
      const criterion = state.criteria.find(item => item.id === event.target.dataset.id);
      criterion.dataset = event.target.value;
      criterion.attribute = getAttributeOptions(criterion.dataset)[0]?.code || "";
      const attrMeta = getAttributeMeta(criterion.dataset, criterion.attribute);
      criterion.operator = getOperators(attrMeta?.type || "text")[0].code;
      criterion.value1 = "";
      criterion.value2 = "";
      rerenderCriteriaEverywhere();
      if (state.isCalculated) rerunAfterChange();
    });
  });

  container.querySelectorAll('[data-role="attribute"]').forEach(el => {
    el.addEventListener("change", event => {
      const criterion = state.criteria.find(item => item.id === event.target.dataset.id);
      criterion.attribute = event.target.value;
      const attrMeta = getAttributeMeta(criterion.dataset, criterion.attribute);
      criterion.operator = getOperators(attrMeta?.type || "text")[0].code;
      criterion.value1 = "";
      criterion.value2 = "";
      rerenderCriteriaEverywhere();
      if (state.isCalculated) rerunAfterChange();
    });
  });

  container.querySelectorAll('[data-role="operator"]').forEach(el => {
    el.addEventListener("change", event => {
      const criterion = state.criteria.find(item => item.id === event.target.dataset.id);
      criterion.operator = event.target.value;
      criterion.value1 = "";
      criterion.value2 = "";
      rerenderCriteriaEverywhere();
      if (state.isCalculated) rerunAfterChange();
    });
  });

  container.querySelectorAll('[data-role="value1"]').forEach(el => {
    el.addEventListener("input", event => {
      const criterion = state.criteria.find(item => item.id === event.target.dataset.id);
      criterion.value1 = event.target.value;
      if (state.isCalculated) rerunAfterChange();
    });
  });

  container.querySelectorAll('[data-role="value2"]').forEach(el => {
    el.addEventListener("input", event => {
      const criterion = state.criteria.find(item => item.id === event.target.dataset.id);
      criterion.value2 = event.target.value;
      if (state.isCalculated) rerunAfterChange();
    });
  });

  container.querySelectorAll('[data-role="join"]').forEach(el => {
    el.addEventListener("change", event => {
      const criterion = state.criteria.find(item => item.id === event.target.dataset.id);
      criterion.join = event.target.value;
      if (state.isCalculated) rerunAfterChange();
    });
  });

  container.querySelectorAll(".criterion-remove-btn").forEach(el => {
    el.addEventListener("click", event => {
      const id = event.currentTarget.dataset.id;
      state.criteria = state.criteria.filter(item => item.id !== id);
      rerenderCriteriaEverywhere();
      if (state.isCalculated) rerunAfterChange();
    });
  });
}

function attachWeightEvents(targetId = "weightsList") {
  const container = document.getElementById(targetId);

  container.querySelectorAll('[data-role="weight-field"]').forEach(el => {
    el.addEventListener("change", event => {
      const weight = state.weights.find(item => item.id === event.target.dataset.id);
      weight.field = event.target.value;
      rerenderWeightsEverywhere();
      if (state.isCalculated) rerenderResultsOnly();
    });
  });

  container.querySelectorAll('[data-role="weight-value"]').forEach(el => {
    el.addEventListener("input", event => {
      const weight = state.weights.find(item => item.id === event.target.dataset.id);
      weight.value = Number(event.target.value || 0);
      rerenderWeightsEverywhere();
      if (state.isCalculated) rerenderResultsOnly();
    });
  });

  container.querySelectorAll('[data-role="weight-title"]').forEach(el => {
    el.addEventListener("input", event => {
      const weight = state.weights.find(item => item.id === event.target.dataset.id);
      weight.title = event.target.value;
    });
  });

  container.querySelectorAll(".weight-remove-btn").forEach(el => {
    el.addEventListener("click", event => {
      const id = event.currentTarget.dataset.id;
      state.weights = state.weights.filter(item => item.id !== id);
      rerenderWeightsEverywhere();
      if (state.isCalculated) rerenderResultsOnly();
    });
  });
}

function rerenderCriteriaEverywhere() {
  renderCriteria("criteriaList");
  if (state.isCalculated) {
    renderCriteria("criteriaMirror");
  }
}

function rerenderWeightsEverywhere() {
  renderWeights("weightsList");
  if (state.isCalculated) {
    renderWeights("weightsMirror");
  }
}

function parseByType(value, type) {
  if (value === null || value === undefined) return value;
  if (type === "number") return Number(value);
  if (type === "boolean") {
    if (typeof value === "boolean") return value;
    return String(value).toLowerCase() === "true" || String(value).toLowerCase() === "да";
  }
  return String(value).toLowerCase();
}

function compareValue(recordValue, criterion) {
  const attrMeta = getAttributeMeta(criterion.dataset, criterion.attribute);
  const type = attrMeta?.type || "text";
  const value = parseByType(recordValue, type);
  const c1 = parseByType(criterion.value1, type);
  const c2 = parseByType(criterion.value2, type);

  switch (criterion.operator) {
    case "eq":
      return value === c1;
    case "neq":
      return value !== c1;
    case "gt":
      return value > c1;
    case "gte":
      return value >= c1;
    case "lt":
      return value < c1;
    case "lte":
      return value <= c1;
    case "contains":
      return String(recordValue ?? "").toLowerCase().includes(String(criterion.value1 || "").toLowerCase());
    case "notContains":
      return !String(recordValue ?? "").toLowerCase().includes(String(criterion.value1 || "").toLowerCase());
    case "between":
      return value >= c1 && value <= c2;
    case "isEmpty":
      return recordValue === null || recordValue === undefined || recordValue === "";
    case "notEmpty":
      return !(recordValue === null || recordValue === undefined || recordValue === "");
    default:
      return false;
  }
}

function applyCriteria(records) {
  if (!state.criteria.length) return [...records];

  return records.filter(record => {
    let result = null;

    state.criteria.forEach((criterion, index) => {
      const recordValue = record[criterion.attribute];
      const current = compareValue(recordValue, criterion);

      if (index === 0) {
        result = current;
        return;
      }

      if (criterion.join === "AND") result = result && current;
      if (criterion.join === "OR") result = result || current;
      if (criterion.join === "NOT") result = result && !current;
    });

    return Boolean(result);
  });
}

function normalize(values, invert = false) {
  const clean = values.map(v => Number(v || 0));
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
  if (sum !== 100) {
    return Object.entries(baseWeights).map(([field, value]) => ({ field, value }));
  }
  return state.weights.map(item => ({ field: item.field, value: Number(item.value || 0) }));
}

function scoreRecords(records) {
  const coverageNorm = normalize(records.map(item => item.coveragePercent), true);
  const repairAgeNorm = normalize(records.map(item => item.repairAge));
  const costNorm = normalize(records.map(item => item.estimatedCost), true);
  const volumeNorm = normalize(records.map(item => item.recommendedVolume));

  const normByField = {
    coveragePercent: coverageNorm,
    repairAge: repairAgeNorm,
    estimatedCost: costNorm,
    recommendedVolume: volumeNorm
  };

  const effectiveWeights = getEffectiveWeights();

  return records.map((item, index) => {
    let score = 0;
    effectiveWeights.forEach(weight => {
      const value = normByField[weight.field]?.[index] || 0;
      score += value * (weight.value / 100);
    });
    return {
      ...item,
      priorityScore: Number(score.toFixed(4))
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

function priorityClass(score) {
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

function renderSummary(records) {
  const container = document.getElementById("summaryCards");
  const totalObjects = records.length;
  const totalCoverageArea = records.reduce((sum, item) => sum + Number(item.coveredArea || 0), 0);
  const totalUncovered = records.reduce((sum, item) => sum + Number(item.uncoveredArea || 0), 0);
  const totalVolume = records.reduce((sum, item) => sum + Number(item.recommendedVolume || 0), 0);
  const totalCost = records.reduce((sum, item) => sum + Number(item.estimatedCost || 0), 0);

  const cards = [
    { label: "Объектов в выборке", value: formatNumber(totalObjects), sub: "по текущим критериям" },
    { label: "Суммарная площадь покрытия", value: `${formatNumber(totalCoverageArea)} м²`, sub: "по выбранным объектам" },
    { label: "Суммарная непокрытая площадь", value: `${formatNumber(totalUncovered)} м²`, sub: "требует внимания" },
    { label: "Рекомендуемый объем работ", value: `${formatNumber(totalVolume)} м²`, sub: "к планированию" },
    { label: "Ориентировочная стоимость", value: formatCurrency(totalCost), sub: "расчетно по выборке" }
  ];

  container.innerHTML = cards.map(card => `
    <div class="summary-card">
      <div class="summary-label">${card.label}</div>
      <div class="summary-value">${card.value}</div>
      <div class="summary-sub">${card.sub}</div>
    </div>
  `).join("");
}

function renderTable(records) {
  const tbody = document.getElementById("resultsBody");
  tbody.innerHTML = "";

  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="16">По заданным критериям объекты не найдены.</td></tr>`;
    return;
  }

  records.forEach(item => {
    const level = priorityClass(item.priorityScore);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="priority-pill ${level}">${item.priorityScore.toFixed(2)}</span></td>
      <td>${item.objectId ?? "-"}</td>
      <td>${item.name ?? "-"}</td>
      <td>${item.sourceType ?? "-"}</td>
      <td>${item.reason ?? "-"}</td>
      <td>${formatNumber(item.coveragePercent, 1)}%</td>
      <td>${formatNumber(item.coveredArea, 1)} м²</td>
      <td>${formatNumber(item.uncoveredArea, 1)} м²</td>
      <td>${formatNumber(item.recommendedVolume, 1)} м²</td>
      <td>${formatCurrency(item.estimatedCost)}</td>
      <td>${item.lastWorkYear ?? "—"}</td>
      <td>${item.lastWorkYear ? `${item.repairAge} лет` : "—"}</td>
      <td>${item.district ?? "-"}</td>
      <td>${item.area ?? "-"}</td>
      <td>${item.department ?? "-"}</td>
      <td><span class="link-blue">Открыть карточку</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function ensureMap() {
  if (state.map) return;
  state.map = L.map("map", { zoomControl: true }).setView([55.7558, 37.6176], 10);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
  }).addTo(state.map);

  state.mapLayerGroup = L.layerGroup().addTo(state.map);
}

function renderMap(records) {
  ensureMap();
  state.mapLayerGroup.clearLayers();
  if (!records.length) return;

  const bounds = [];

  records.forEach(item => {
    const level = priorityClass(item.priorityScore);
    const style = level === "high"
      ? { color: "#dc2626", fillColor: "#fca5a5", fillOpacity: 0.58, weight: 2 }
      : level === "medium"
        ? { color: "#d97706", fillColor: "#fcd34d", fillOpacity: 0.54, weight: 2 }
        : { color: "#64748b", fillColor: "#cbd5e1", fillOpacity: 0.5, weight: 2 };

    const polygon = L.polygon(item.geometry, style)
      .bindPopup(`
        <strong>${item.name}</strong><br>
        ${item.sourceType}<br>
        Покрытие: ${formatNumber(item.coveragePercent, 1)}%<br>
        Непокрытая площадь: ${formatNumber(item.uncoveredArea, 1)} м²<br>
        Приоритет: ${item.priorityScore.toFixed(2)}
      `);

    polygon.addTo(state.mapLayerGroup);
    bounds.push(...item.geometry);
  });

  state.map.fitBounds(L.latLngBounds(bounds).pad(0.15));
}

function validateRun() {
  const selectedDatasets = new Set(state.criteria.map(item => item.dataset));
  if (state.criteria.length === 0 && selectedDatasets.size < 2) {
    return {
      ok: false,
      message: "Если критерии не заданы, в анализе должно участвовать минимум два набора."
    };
  }
  return { ok: true };
}

async function showLoadingAndRun() {
  const validation = validateRun();
  if (!validation.ok) {
    alert(validation.message);
    return;
  }

  document.getElementById("analysisLoading").classList.remove("hidden");
  const loadingStages = [
    "Подготовка наборов",
    "Проверка критериев",
    "Поиск пересечений",
    "Расчет показателей",
    "Формирование приоритета",
    "Подготовка результата"
  ];

  const stageEl = document.getElementById("loadingStage");
  const percentEl = document.getElementById("loadingPercent");
  const fillEl = document.getElementById("loadingBarFill");

  for (let i = 0; i < loadingStages.length; i++) {
    stageEl.textContent = `${loadingStages[i]}...`;
    const percent = Math.round(((i + 1) / loadingStages.length) * 100);
    percentEl.textContent = `${percent}%`;
    fillEl.style.width = `${percent}%`;
    await new Promise(resolve => setTimeout(resolve, 350));
  }

  document.getElementById("analysisLoading").classList.add("hidden");
  state.isCalculated = true;
  document.getElementById("resultsSection").classList.remove("hidden");
  document.getElementById("runAnalysisBtn").classList.add("hidden");
  document.getElementById("resetAnalysisBtn").classList.remove("hidden");

  rerenderResultsOnly();
}

function rerenderResultsOnly() {
  const filtered = applyCriteria(objects);
  const scored = scoreRecords(filtered);
  renderSummary(scored);
  renderMirrors(scored);
  renderMap(scored);
  renderTable(scored);
}

function rerunAfterChange() {
  if (!state.isCalculated) return;
  rerenderResultsOnly();
}

function exportToExcel() {
  const filtered = applyCriteria(objects);
  const scored = scoreRecords(filtered);

  const exportRows = scored.map(item => ({
    "Приоритет": item.priorityScore.toFixed(2),
    "ID объекта": item.objectId ?? "",
    "Наименование": item.name ?? "",
    "Тип набора": item.sourceType ?? "",
    "Основание включения": item.reason ?? "",
    "Процент покрытия": item.coveragePercent ?? "",
    "Покрытая площадь": item.coveredArea ?? "",
    "Непокрытая площадь": item.uncoveredArea ?? "",
    "Рекомендуемый объем": item.recommendedVolume ?? "",
    "Ориентировочная стоимость": item.estimatedCost ?? "",
    "Последний год работ": item.lastWorkYear ?? "",
    "Давность ремонта": item.repairAge ?? "",
    "Округ": item.district ?? "",
    "Район": item.area ?? "",
    "ОИВ": item.department ?? "",
    "Открыть карточку": "Открыть карточку"
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Реестр");
  XLSX.writeFile(workbook, "predictive_analysis_registry.xlsx");
}

function bindGlobalEvents() {
  document.getElementById("addCriterionBtn").addEventListener("click", () => {
    state.criteria.push(createCriterion());
    rerenderCriteriaEverywhere();
  });

  document.getElementById("customWeightsToggle").addEventListener("change", event => {
    state.customWeightsEnabled = event.target.checked;
    document.getElementById("weightsEditor").classList.toggle("disabled-block", !state.customWeightsEnabled);
    renderWeightStatus();
    if (state.isCalculated) rerenderResultsOnly();
  });

  document.getElementById("addWeightBtn").addEventListener("click", () => {
    state.weights.push(createWeight());
    rerenderWeightsEverywhere();
  });

  document.getElementById("runAnalysisBtn").addEventListener("click", showLoadingAndRun);

  document.getElementById("resetAnalysisBtn").addEventListener("click", () => {
    state.isCalculated = false;
    document.getElementById("resultsSection").classList.add("hidden");
    document.getElementById("runAnalysisBtn").classList.remove("hidden");
    document.getElementById("resetAnalysisBtn").classList.add("hidden");
    document.getElementById("loadingBarFill").style.width = "0%";
    document.getElementById("loadingPercent").textContent = "0%";
  });

  document.getElementById("exportExcelBtn").addEventListener("click", exportToExcel);
}

function boot() {
  initState();
  renderCriteria("criteriaList");
  renderWeights("weightsList");
  bindGlobalEvents();
}

boot();
