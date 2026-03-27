
(() => {
  const APP = window.APP_DATA || {};
  const $ = (id) => document.getElementById(id);

  const TOOL_OPTIONS = [
    {
      code: 'predictive',
      title: 'Инструмент предиктивного анализа',
      description: 'Рабочий сценарий для отбора ОГХ, настройки наборов сравнения, фильтрации и формирования итогового реестра неблагоустроенных объектов.'
    },
    {
      code: 'coverage',
      title: 'Инструмент оценки покрытия территорий',
      description: 'Резервный сценарий для будущего расчёта покрытия и анализа благоустройства по территориальным зонам.'
    },
    {
      code: 'compare',
      title: 'Инструмент сценарного сопоставления наборов',
      description: 'Резервный сценарий для будущего сопоставления нескольких тематических наборов данных.'
    }
  ];

  const DATASETS = {
    ogh: { code: 'ogh', title: 'Набор ОГХ', description: 'Основной анализируемый набор дорожных объектов.', short: 'ОГХ' },
    sok: { code: 'sok', title: 'Набор благоустройства (СОК)', description: 'Сравниваемый набор работ и благоустройства из СОК.', short: 'СОК' },
    krr: { code: 'krr', title: 'Набор благоустройства (КРР)', description: 'Сравниваемый набор работ и благоустройства из КРР.', short: 'КРР' }
  };

  const DATASET_ORDER = ['ogh', 'sok', 'krr'];
  const steps = ['Инструмент', 'Наборы', 'Фильтры', 'Приоритизация', 'Результат'];

  const baseWeights = APP.baseWeights || {
    coveragePercent: 35,
    repairAge: 25,
    estimatedCost: 20,
    recommendedVolume: 20
  };

  const weightLabels = {
    coveragePercent: 'Процент покрытия',
    repairAge: 'Давность последнего ремонта',
    estimatedCost: 'Ориентировочная стоимость',
    recommendedVolume: 'Рекомендуемый объём работ'
  };

  const FILTER_FIELDS = {
    ogh: [
      { code: 'kind', label: 'Вид', type: 'enum', options: ['ОДХ'] },
      { code: 'passportEndDate', label: 'Дата окончания паспорта', type: 'date' },
      { code: 'name', label: 'Наименование', type: 'text' },
      { code: 'district', label: 'Округ', type: 'enum', options: uniqueValues('district') },
      { code: 'area', label: 'Район', type: 'enum', options: uniqueValues('area') },
      { code: 'status', label: 'Статус', type: 'enum', options: uniqueValues('status') },
      { code: 'lastWorkYear', label: 'Последний год работ', type: 'number' },
      { code: 'repairAge', label: 'Давность ремонта', type: 'number' },
      { code: 'coveragePercent', label: 'Процент покрытия', type: 'number' }
    ],
    sok: [
      { code: 'compareObjectType', label: 'Тип объекта', type: 'enum', options: ['ОДХ', 'ОКБ'] },
      { code: 'workYear', label: 'Год проведения работ', type: 'number' },
      { code: 'workType', label: 'Вид работ', type: 'enum', options: ['Асфальт 1', 'Асфальт 2', 'Асфальт 3', 'Озеленение', 'Бортовой камень'] },
      { code: 'district', label: 'Округ', type: 'enum', options: uniqueValues('district') },
      { code: 'area', label: 'Район', type: 'enum', options: uniqueValues('area') },
      { code: 'sourceName', label: 'Источник / объект', type: 'text' }
    ],
    krr: [
      { code: 'compareObjectType', label: 'Тип объекта', type: 'enum', options: ['ОДХ', 'ОКБ'] },
      { code: 'workYear', label: 'Год проведения работ', type: 'number' },
      { code: 'workType', label: 'Вид работ', type: 'enum', options: ['Асфальт 1', 'Асфальт 2', 'Асфальт 3', 'Озеленение', 'Бортовой камень'] },
      { code: 'district', label: 'Округ', type: 'enum', options: uniqueValues('district') },
      { code: 'area', label: 'Район', type: 'enum', options: uniqueValues('area') },
      { code: 'sourceName', label: 'Источник / объект', type: 'text' }
    ]
  };

  const state = {
    tool: 'predictive',
    mainDataset: 'ogh',
    compareDatasets: ['sok', 'krr'],
    filters: {},
    useCustomWeights: false,
    weights: { ...baseWeights },
    customPriorityRules: [],
    results: [],
    resultMeta: null,
    currentStep: 1,
    map: null,
    mapLayer: null,
    selectedObjectId: null
  };

  const mainRecords = buildMainRecords(APP.objects || []);
  const compareRecords = {
    sok: buildCompareRecords(mainRecords, 'sok'),
    krr: buildCompareRecords(mainRecords, 'krr')
  };

  function uniqueValues(key) {
    return [...new Set((APP.objects || []).map((item) => item[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'ru'));
  }

  function buildMainRecords(objects) {
    return objects.map((item, index) => {
      const month = String((index % 9) + 1).padStart(2, '0');
      const day = String(((index * 3) % 27) + 1).padStart(2, '0');
      const year = 2024 + (index % 3);
      return {
        ...item,
        kind: 'ОДХ',
        passportEndDate: `${year}-${month}-${day}`,
        searchText: `${item.name} ${item.district} ${item.area}`.toLowerCase()
      };
    });
  }

  function buildCompareRecords(objects, datasetCode) {
    return objects.flatMap((item, index) => {
      const setup = datasetCode === 'sok' ? { base: 2016, span: 10 } : { base: 2019, span: 7 };
      const records = [];
      const types = ['Асфальт 1', 'Асфальт 2', 'Асфальт 3', 'Озеленение', 'Бортовой камень'];
      const firstType = index % 2 === 0 ? 'ОДХ' : 'ОКБ';
      const secondType = firstType === 'ОДХ' ? 'ОКБ' : 'ОДХ';

      records.push({
        compareId: `${datasetCode}-${item.objectId}-a`,
        linkObjectId: item.objectId,
        datasetCode,
        datasetLabel: DATASETS[datasetCode].title,
        district: item.district,
        area: item.area,
        name: `${DATASETS[datasetCode].short} · ${item.name}`,
        compareObjectType: firstType,
        workYear: setup.base + (index % setup.span),
        workType: types[index % types.length],
        geometry: item.geometry,
        sourceName: item.name
      });

      records.push({
        compareId: `${datasetCode}-${item.objectId}-b`,
        linkObjectId: item.objectId,
        datasetCode,
        datasetLabel: DATASETS[datasetCode].title,
        district: item.district,
        area: item.area,
        name: `${DATASETS[datasetCode].short} · ${item.name} · доп`,
        compareObjectType: secondType,
        workYear: setup.base + ((index + 3) % setup.span),
        workType: types[(index + 2) % types.length],
        geometry: item.geometry,
        sourceName: item.name
      });

      return records;
    });
  }

  function cryptoId() {
    return Math.random().toString(36).slice(2, 10);
  }

  function defaultOperator(type) {
    if (type === 'number' || type === 'date') return 'gte';
    if (type === 'enum') return 'eq';
    return 'contains';
  }

  function operatorsFor(type) {
    if (type === 'number' || type === 'date') {
      return [['eq', 'Равно'], ['gte', 'Больше или равно'], ['lte', 'Меньше или равно'], ['between', 'Между']];
    }
    if (type === 'enum') {
      return [['eq', 'Равно'], ['in', 'В списке']];
    }
    return [['contains', 'Содержит'], ['eq', 'Равно']];
  }

  function getFieldMeta(datasetCode, fieldCode) {
    return (FILTER_FIELDS[datasetCode] || []).find((field) => field.code === fieldCode);
  }

  function createRow(datasetCode, join = 'AND') {
    const field = FILTER_FIELDS[datasetCode]?.[0];
    return {
      id: cryptoId(),
      join,
      field: field?.code || 'name',
      operator: defaultOperator(field?.type || 'text'),
      value1: '',
      value2: '',
      clusterId: null
    };
  }

  function createFilterGroup(datasetCode) {
    return {
      id: cryptoId(),
      datasetCode,
      allData: false,
      rows: [createRow(datasetCode)],
      selectedRowIds: [],
      clusterModes: {}
    };
  }

  function createPriorityRule(datasetCode = 'ogh') {
    const field = FILTER_FIELDS[datasetCode][0];
    return {
      id: cryptoId(),
      datasetCode,
      field: field.code,
      operator: defaultOperator(field.type),
      value1: '',
      value2: '',
      coefficient: 10
    };
  }

  function resetFilters() {
    state.filters = {
      ogh: createFilterGroup('ogh'),
      sok: createFilterGroup('sok'),
      krr: createFilterGroup('krr')
    };
  }

  function activeFilterDatasets() {
    return [state.mainDataset, ...state.compareDatasets].filter(Boolean);
  }

  function availableCompareDatasets() {
    return DATASET_ORDER.filter((code) => code !== state.mainDataset);
  }

  function init() {
    resetFilters();
    state.customPriorityRules = [createPriorityRule('ogh')];
    renderStepper();
    renderToolOptions();
    renderDatasetPickers();
    renderBaseWeights();
    renderWeightsPanel();
    renderFilters();
    renderMapLegend();
    bindEvents();
    updateToolHeader();
  }

  function bindEvents() {
    $('toolSelect').addEventListener('change', (e) => {
      state.tool = e.target.value;
      updateToolHeader();
    });

    $('goToDatasetsBtn').addEventListener('click', () => {
      $('toolSection').classList.add('is-collapsed');
      $('datasetsSection').classList.remove('hidden');
      state.currentStep = 2;
      renderStepper();
      scrollToNode($('datasetsSection'));
    });

    $('goToFiltersBtn').addEventListener('click', () => {
      if (!state.mainDataset) {
        alert('Выберите анализируемый набор.');
        return;
      }
      if (!state.compareDatasets.length) {
        alert('Выберите хотя бы один набор для сравнения.');
        return;
      }
      $('datasetsSection').classList.add('is-collapsed');
      $('filtersSection').classList.remove('hidden');
      state.currentStep = 3;
      renderStepper();
      renderFilters();
      renderWeightsPanel();
      scrollToNode($('filtersSection'));
    });

    $('weightsToggle').addEventListener('change', (e) => {
      state.useCustomWeights = e.target.checked;
      $('weightsPanel').classList.toggle('hidden', !state.useCustomWeights);
      renderWeightsPanel();
      if (state.results.length) recomputeResults();
    });

    $('runAnalysisBtn').addEventListener('click', runAnalysis);
    $('resetBtn').addEventListener('click', resetAll);
    $('newAnalysisBtn').addEventListener('click', resetAll);
    $('exportBtn').addEventListener('click', exportExcel);
  }

  function renderStepper() {
    $('stepper').innerHTML = steps.map((title, index) => {
      const stepNumber = index + 1;
      const cls = stepNumber < state.currentStep ? 'is-done' : stepNumber === state.currentStep ? 'is-active' : '';
      return `<div class="step ${cls}"><span class="step-index">Шаг ${stepNumber}</span><span class="step-title">${title}</span></div>`;
    }).join('');
  }

  function renderToolOptions() {
    $('toolSelect').innerHTML = TOOL_OPTIONS.map((tool) => `<option value="${tool.code}" ${tool.code === state.tool ? 'selected' : ''}>${tool.title}</option>`).join('');
    updateToolHeader();
  }

  function updateToolHeader() {
    const active = TOOL_OPTIONS.find((tool) => tool.code === state.tool);
    $('activeToolBadge').textContent = active?.title || 'Не выбран';
    $('toolDescription').textContent = active?.description || '';
  }

  function renderDatasetPickers() {
    $('mainDatasetPicker').innerHTML = DATASET_ORDER.map((code) => renderDatasetOption(DATASETS[code], true, state.mainDataset === code)).join('');
    $('compareDatasetPicker').innerHTML = availableCompareDatasets().map((code) => renderDatasetOption(DATASETS[code], false, state.compareDatasets.includes(code))).join('');

    $('mainDatasetPicker').querySelectorAll('input[name="mainDataset"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        state.mainDataset = e.target.value;
        state.compareDatasets = availableCompareDatasets().filter((code) => state.compareDatasets.includes(code));
        if (!state.compareDatasets.length) state.compareDatasets = availableCompareDatasets();
        if (!activeFilterDatasets().includes(state.customPriorityRules[0]?.datasetCode)) {
          state.customPriorityRules = [createPriorityRule(state.mainDataset)];
        }
        renderDatasetPickers();
        renderFilters();
        renderWeightsPanel();
      });
    });

    $('compareDatasetPicker').querySelectorAll('input[name="compareDataset"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!state.compareDatasets.includes(e.target.value)) state.compareDatasets.push(e.target.value);
        } else {
          state.compareDatasets = state.compareDatasets.filter((code) => code !== e.target.value);
        }
        renderFilters();
        renderWeightsPanel();
      });
    });
  }

  function renderDatasetOption(dataset, radio, checked) {
    return `
      <label class="dataset-option">
        <input type="${radio ? 'radio' : 'checkbox'}" name="${radio ? 'mainDataset' : 'compareDataset'}" value="${dataset.code}" ${checked ? 'checked' : ''}>
        <div>
          <div class="dataset-option-title">${dataset.title}</div>
          <div class="dataset-option-description">${dataset.description}</div>
        </div>
      </label>
    `;
  }

  function renderBaseWeights() {
    $('baseWeightsChips').innerHTML = Object.entries(baseWeights).map(([key, value]) => `<span class="chip">${weightLabels[key]} — ${value}%</span>`).join('');
  }

  function renderFilters() {
    $('filtersBlocks').innerHTML = activeFilterDatasets().map((datasetCode) => renderFilterBlock(datasetCode)).join('');
    bindFilterEvents();
  }

  function renderFilterBlock(datasetCode) {
    const dataset = DATASETS[datasetCode];
    const group = state.filters[datasetCode];
    const role = datasetCode === state.mainDataset ? 'Основной набор' : 'Набор сравнения';
    return `
      <section class="filter-block" data-dataset-block="${datasetCode}">
        <div class="filter-block-head">
          <div>
            <div class="filter-block-title-line">
              <span class="role-pill ${datasetCode === state.mainDataset ? 'main' : 'compare'}">${role}</span>
              <h3>${dataset.title}</h3>
            </div>
            <p>${dataset.description}</p>
          </div>
        </div>
        <div class="group-box highlighted">
          <div class="group-head single-group-head">
            <div>
              <div class="group-title">Группа условий для набора</div>
              <div class="group-logic-note">Группа не удаляется. Можно редактировать строки, выделять их галочками и объединять в логические подгруппы.</div>
            </div>
            <label class="take-all-toggle">
              <input type="checkbox" data-all-data-toggle="${datasetCode}" ${group.allData ? 'checked' : ''}>
              <span>Взять в анализ все данные без фильтрации</span>
            </label>
          </div>

          <div class="filters-toolbar ${group.allData ? 'disabled-area' : ''}">
            <button class="btn btn-secondary btn-small" data-add-row="${datasetCode}" ${group.allData ? 'disabled' : ''}>Добавить условие</button>
            <button class="btn btn-secondary btn-small" data-group-selected="${datasetCode}" ${group.allData ? 'disabled' : ''}>Группировать выделенные</button>
            <button class="btn btn-secondary btn-small" data-ungroup-selected="${datasetCode}" ${group.allData ? 'disabled' : ''}>Разгруппировать</button>
            <span class="group-toolbar-note">Выдели две или больше строки и объедини их в подгруппу.</span>
          </div>

          <div class="rows ${group.allData ? 'disabled-area' : ''}">
            ${renderRows(datasetCode, group)}
          </div>

          <div class="group-footer ${group.allData ? 'disabled-area' : ''}">
            <div class="group-logic-note">Условия внутри подгруппы можно связать через И, ИЛИ или НЕ. НЕ инвертирует результат выбранной подгруппы.</div>
          </div>
        </div>
      </section>
    `;
  }

  function renderRows(datasetCode, group) {
    const rows = group.rows;
    const html = [];
    rows.forEach((row, index) => {
      const prev = rows[index - 1];
      const startsCluster = row.clusterId && (!prev || prev.clusterId !== row.clusterId);
      if (startsCluster) html.push(renderClusterHeader(datasetCode, row));
      html.push(renderRow(datasetCode, row, index));
    });
    return html.join('');
  }

  function renderClusterHeader(datasetCode, row) {
    const mode = state.filters[datasetCode].clusterModes[row.clusterId] || 'OR';
    return `
      <div class="grouped-strip ${mode === 'NOT' ? 'negated' : ''}">
        <div>
          <div class="grouped-strip-title">Подгруппа</div>
          <div class="dataset-option-description">Выделенные строки объединены в отдельное логическое условие.</div>
        </div>
        <label class="field">
          <span class="field-label">Логика подгруппы</span>
          <select data-cluster-mode="${row.clusterId}" data-dataset-code="${datasetCode}">
            <option value="OR" ${mode === 'OR' ? 'selected' : ''}>ИЛИ</option>
            <option value="AND" ${mode === 'AND' ? 'selected' : ''}>И</option>
            <option value="NOT" ${mode === 'NOT' ? 'selected' : ''}>НЕ</option>
          </select>
        </label>
      </div>
    `;
  }

  function renderRow(datasetCode, row, index) {
    const fields = FILTER_FIELDS[datasetCode] || [];
    const meta = getFieldMeta(datasetCode, row.field) || fields[0];
    const operators = operatorsFor(meta.type);
    const isBetween = row.operator === 'between';
    const placeholder = meta.type === 'text' ? 'Введите значение' : meta.type === 'number' ? 'Например, 2025' : '';
    const group = state.filters[datasetCode];
    const selected = group.selectedRowIds.includes(row.id);
    const unitStart = isUnitStart(group.rows, index);
    const classes = [
      'row-filter',
      isBetween ? '' : 'single-value',
      selected ? 'row-selected' : '',
      row.clusterId ? 'row-in-cluster' : '',
      unitStart ? 'row-highlighted' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="${classes}" data-row-id="${row.id}">
        <div class="row-select-box">
          <input type="checkbox" data-row-select="${row.id}" data-dataset-code="${datasetCode}" ${selected ? 'checked' : ''}>
        </div>
        ${unitStart ? renderJoinControl(datasetCode, row, index) : `<div class="logic-anchor">↳</div>`}
        <label class="field">
          <span class="field-label">Атрибут</span>
          <select data-row-field="${row.id}" data-dataset-code="${datasetCode}">
            ${fields.map((field) => `<option value="${field.code}" ${field.code === row.field ? 'selected' : ''}>${field.label}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Оператор</span>
          <select data-row-operator="${row.id}" data-dataset-code="${datasetCode}">
            ${operators.map(([code, label]) => `<option value="${code}" ${code === row.operator ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        ${isBetween ? `
          <label class="field">
            <span class="field-label">Значение</span>
            <div class="range-box">
              ${renderValueControl(datasetCode, row, meta, 'value1', placeholder)}
              ${renderValueControl(datasetCode, row, meta, 'value2', placeholder)}
            </div>
          </label>
        ` : `
          <label class="field">
            <span class="field-label">Значение</span>
            ${renderValueControl(datasetCode, row, meta, 'value1', placeholder)}
          </label>
        `}
        <button class="btn btn-secondary btn-small btn-danger" data-remove-row="${row.id}" data-dataset-code="${datasetCode}" ${group.rows.length === 1 ? 'disabled' : ''}>Удалить</button>
      </div>
    `;
  }

  function renderJoinControl(datasetCode, row, index) {
    if (index === 0) return `<div class="logic-anchor">Старт</div>`;
    return `
      <label class="field logic-field">
        <span class="field-label">Связь</span>
        <select data-row-join="${row.id}" data-dataset-code="${datasetCode}">
          <option value="AND" ${row.join === 'AND' ? 'selected' : ''}>И</option>
          <option value="OR" ${row.join === 'OR' ? 'selected' : ''}>ИЛИ</option>
        </select>
      </label>
    `;
  }

  function renderValueControl(datasetCode, row, meta, valueKey, placeholder) {
    const value = row[valueKey] || '';
    if (meta.type === 'enum' && row.operator !== 'in') {
      return `
        <select data-row-value="${row.id}" data-value-key="${valueKey}" data-dataset-code="${datasetCode}">
          <option value="">Выберите</option>
          ${meta.options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
      `;
    }
    if (meta.type === 'date') {
      return `<input type="date" value="${value}" data-row-value="${row.id}" data-value-key="${valueKey}" data-dataset-code="${datasetCode}">`;
    }
    if (meta.type === 'number') {
      return `<input type="number" value="${value}" placeholder="${placeholder}" data-row-value="${row.id}" data-value-key="${valueKey}" data-dataset-code="${datasetCode}">`;
    }
    const fieldPlaceholder = row.operator === 'in' ? 'Через запятую' : placeholder;
    return `<input type="text" value="${value}" placeholder="${fieldPlaceholder}" data-row-value="${row.id}" data-value-key="${valueKey}" data-dataset-code="${datasetCode}">`;
  }

  function isUnitStart(rows, index) {
    if (index === 0) return true;
    const current = rows[index];
    const prev = rows[index - 1];
    if (current.clusterId) return prev.clusterId !== current.clusterId;
    return true;
  }

  function bindFilterEvents() {
    document.querySelectorAll('[data-all-data-toggle]').forEach((input) => {
      input.addEventListener('change', () => {
        state.filters[input.dataset.allDataToggle].allData = input.checked;
        renderFilters();
      });
    });

    document.querySelectorAll('[data-add-row]').forEach((button) => {
      button.addEventListener('click', () => {
        const datasetCode = button.dataset.addRow;
        state.filters[datasetCode].rows.push(createRow(datasetCode, 'AND'));
        renderFilters();
      });
    });

    document.querySelectorAll('[data-group-selected]').forEach((button) => {
      button.addEventListener('click', () => groupSelectedRows(button.dataset.groupSelected));
    });

    document.querySelectorAll('[data-ungroup-selected]').forEach((button) => {
      button.addEventListener('click', () => ungroupSelectedRows(button.dataset.ungroupSelected));
    });

    document.querySelectorAll('[data-row-select]').forEach((input) => {
      input.addEventListener('change', () => {
        const group = state.filters[input.dataset.datasetCode];
        if (input.checked) {
          if (!group.selectedRowIds.includes(input.dataset.rowSelect)) group.selectedRowIds.push(input.dataset.rowSelect);
        } else {
          group.selectedRowIds = group.selectedRowIds.filter((id) => id !== input.dataset.rowSelect);
        }
        renderFilters();
      });
    });

    document.querySelectorAll('[data-remove-row]').forEach((button) => {
      button.addEventListener('click', () => {
        const datasetCode = button.dataset.datasetCode;
        const rowId = button.dataset.removeRow;
        const group = state.filters[datasetCode];
        group.rows = group.rows.filter((row) => row.id !== rowId);
        group.selectedRowIds = group.selectedRowIds.filter((id) => id !== rowId);
        if (!group.rows.length) group.rows = [createRow(datasetCode)];
        cleanupClusters(group);
        renderFilters();
      });
    });

    document.querySelectorAll('[data-row-join]').forEach((select) => {
      select.addEventListener('change', () => {
        const group = state.filters[select.dataset.datasetCode];
        const row = group.rows.find((item) => item.id === select.dataset.rowJoin);
        row.join = select.value;
      });
    });

    document.querySelectorAll('[data-row-field]').forEach((select) => {
      select.addEventListener('change', () => {
        const group = state.filters[select.dataset.datasetCode];
        const row = group.rows.find((item) => item.id === select.dataset.rowField);
        const meta = getFieldMeta(select.dataset.datasetCode, select.value);
        row.field = select.value;
        row.operator = defaultOperator(meta.type);
        row.value1 = '';
        row.value2 = '';
        renderFilters();
      });
    });

    document.querySelectorAll('[data-row-operator]').forEach((select) => {
      select.addEventListener('change', () => {
        const group = state.filters[select.dataset.datasetCode];
        const row = group.rows.find((item) => item.id === select.dataset.rowOperator);
        row.operator = select.value;
        row.value1 = '';
        row.value2 = '';
        renderFilters();
      });
    });

    document.querySelectorAll('[data-row-value]').forEach((input) => {
      const event = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(event, () => {
        const group = state.filters[input.dataset.datasetCode];
        const row = group.rows.find((item) => item.id === input.dataset.rowValue);
        row[input.dataset.valueKey] = input.value;
      });
    });

    document.querySelectorAll('[data-cluster-mode]').forEach((select) => {
      select.addEventListener('change', () => {
        const group = state.filters[select.dataset.datasetCode];
        group.clusterModes[select.dataset.clusterMode] = select.value;
      });
    });
  }

  function groupSelectedRows(datasetCode) {
    const group = state.filters[datasetCode];
    const selectedRows = group.rows.filter((row) => group.selectedRowIds.includes(row.id));
    if (selectedRows.length < 2) {
      alert('Выделите минимум две строки для группировки.');
      return;
    }
    const clusterId = cryptoId();
    selectedRows.forEach((row) => { row.clusterId = clusterId; });
    group.clusterModes[clusterId] = 'OR';
    renderFilters();
  }

  function ungroupSelectedRows(datasetCode) {
    const group = state.filters[datasetCode];
    const selectedRows = group.rows.filter((row) => group.selectedRowIds.includes(row.id));
    if (!selectedRows.length) {
      alert('Выделите строки, которые нужно разгруппировать.');
      return;
    }
    selectedRows.forEach((row) => { row.clusterId = null; });
    cleanupClusters(group);
    renderFilters();
  }

  function cleanupClusters(group) {
    const counts = {};
    group.rows.forEach((row) => {
      if (!row.clusterId) return;
      counts[row.clusterId] = (counts[row.clusterId] || 0) + 1;
    });
    Object.keys(group.clusterModes).forEach((clusterId) => {
      if (!counts[clusterId] || counts[clusterId] < 2) {
        delete group.clusterModes[clusterId];
        group.rows.forEach((row) => {
          if (row.clusterId === clusterId) row.clusterId = null;
        });
      }
    });
  }

  function renderWeightsPanel() {
    if (!state.customPriorityRules.length) {
      state.customPriorityRules = [createPriorityRule(state.mainDataset)];
    }
    const visibleDatasets = activeFilterDatasets();
    $('weightsPanel').innerHTML = `
      <div class="weights-stack">
        ${Object.entries(state.weights).map(([key, value]) => `
          <div class="weight-row">
            <div>
              <div class="dataset-option-title">${weightLabels[key]}</div>
              <div class="dataset-option-description">Влияет на базовый порядок объектов в реестре.</div>
            </div>
            <input type="number" min="0" max="100" step="1" value="${value}" data-weight-key="${key}">
          </div>
        `).join('')}
      </div>
      <div class="priority-rules-box">
        <div class="card-head small-head">
          <div>
            <h3>Кастомные правила приоритизации</h3>
            <p>Можно добавить свой коэффициент по набору, атрибуту, условию и значению.</p>
          </div>
          <button class="btn btn-secondary btn-small" id="addPriorityRuleBtn">Добавить правило</button>
        </div>
        <div class="stack compact-stack">
          ${state.customPriorityRules.map((rule, index) => renderPriorityRule(rule, index, visibleDatasets)).join('')}
        </div>
      </div>
    `;

    $('weightsPanel').querySelectorAll('[data-weight-key]').forEach((input) => {
      input.addEventListener('input', (e) => {
        state.weights[e.target.dataset.weightKey] = Number(e.target.value || 0);
        if (state.results.length) recomputeResults();
      });
    });

    $('addPriorityRuleBtn')?.addEventListener('click', () => {
      state.customPriorityRules.push(createPriorityRule(state.mainDataset));
      renderWeightsPanel();
    });

    bindPriorityRuleEvents(visibleDatasets);
  }

  function renderPriorityRule(rule, index, visibleDatasets) {
    const allowedDatasets = visibleDatasets.includes(rule.datasetCode) ? visibleDatasets : visibleDatasets.length ? visibleDatasets : [state.mainDataset];
    const datasetCode = allowedDatasets.includes(rule.datasetCode) ? rule.datasetCode : allowedDatasets[0];
    if (datasetCode !== rule.datasetCode) {
      rule.datasetCode = datasetCode;
      const field = FILTER_FIELDS[datasetCode][0];
      rule.field = field.code;
      rule.operator = defaultOperator(field.type);
      rule.value1 = '';
      rule.value2 = '';
    }
    const fieldMeta = getFieldMeta(rule.datasetCode, rule.field) || FILTER_FIELDS[rule.datasetCode][0];
    const operatorOptions = operatorsFor(fieldMeta.type);
    const isBetween = rule.operator === 'between';

    return `
      <div class="priority-rule">
        <div class="priority-rule-title">Правило ${index + 1}</div>
        <div class="priority-grid ${isBetween ? 'between' : ''}">
          <label class="field">
            <span class="field-label">Набор</span>
            <select data-priority-dataset="${rule.id}">
              ${allowedDatasets.map((code) => `<option value="${code}" ${code === rule.datasetCode ? 'selected' : ''}>${DATASETS[code].title}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span class="field-label">Атрибут</span>
            <select data-priority-field="${rule.id}">
              ${FILTER_FIELDS[rule.datasetCode].map((field) => `<option value="${field.code}" ${field.code === rule.field ? 'selected' : ''}>${field.label}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span class="field-label">Оператор</span>
            <select data-priority-operator="${rule.id}">
              ${operatorOptions.map(([code, label]) => `<option value="${code}" ${code === rule.operator ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </label>
          ${isBetween ? `
            <label class="field">
              <span class="field-label">От</span>
              ${renderPriorityValue(rule, fieldMeta, 'value1')}
            </label>
            <label class="field">
              <span class="field-label">До</span>
              ${renderPriorityValue(rule, fieldMeta, 'value2')}
            </label>
          ` : `
            <label class="field">
              <span class="field-label">Значение</span>
              ${renderPriorityValue(rule, fieldMeta, 'value1')}
            </label>
          `}
          <label class="field coef-field">
            <span class="field-label">Коэффициент</span>
            <input type="number" min="0" max="100" step="1" value="${rule.coefficient}" data-priority-coef="${rule.id}">
          </label>
          <button class="btn btn-secondary btn-small btn-danger" data-priority-remove="${rule.id}" ${state.customPriorityRules.length === 1 ? 'disabled' : ''}>Удалить</button>
        </div>
      </div>
    `;
  }

  function renderPriorityValue(rule, meta, key) {
    const value = rule[key] || '';
    if (meta.type === 'enum' && rule.operator !== 'in') {
      return `<select data-priority-value="${rule.id}" data-value-key="${key}"><option value="">Выберите</option>${meta.options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}</select>`;
    }
    if (meta.type === 'date') return `<input type="date" value="${value}" data-priority-value="${rule.id}" data-value-key="${key}">`;
    if (meta.type === 'number') return `<input type="number" value="${value}" data-priority-value="${rule.id}" data-value-key="${key}">`;
    return `<input type="text" value="${value}" placeholder="${rule.operator === 'in' ? 'Через запятую' : 'Введите значение'}" data-priority-value="${rule.id}" data-value-key="${key}">`;
  }

  function bindPriorityRuleEvents() {
    document.querySelectorAll('[data-priority-dataset]').forEach((select) => {
      select.addEventListener('change', () => {
        const rule = state.customPriorityRules.find((item) => item.id === select.dataset.priorityDataset);
        rule.datasetCode = select.value;
        const field = FILTER_FIELDS[rule.datasetCode][0];
        rule.field = field.code;
        rule.operator = defaultOperator(field.type);
        rule.value1 = '';
        rule.value2 = '';
        renderWeightsPanel();
        if (state.results.length) recomputeResults();
      });
    });

    document.querySelectorAll('[data-priority-field]').forEach((select) => {
      select.addEventListener('change', () => {
        const rule = state.customPriorityRules.find((item) => item.id === select.dataset.priorityField);
        const meta = getFieldMeta(rule.datasetCode, select.value);
        rule.field = select.value;
        rule.operator = defaultOperator(meta.type);
        rule.value1 = '';
        rule.value2 = '';
        renderWeightsPanel();
        if (state.results.length) recomputeResults();
      });
    });

    document.querySelectorAll('[data-priority-operator]').forEach((select) => {
      select.addEventListener('change', () => {
        const rule = state.customPriorityRules.find((item) => item.id === select.dataset.priorityOperator);
        rule.operator = select.value;
        rule.value1 = '';
        rule.value2 = '';
        renderWeightsPanel();
        if (state.results.length) recomputeResults();
      });
    });

    document.querySelectorAll('[data-priority-value]').forEach((input) => {
      const event = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(event, () => {
        const rule = state.customPriorityRules.find((item) => item.id === input.dataset.priorityValue);
        rule[input.dataset.valueKey] = input.value;
        if (state.results.length) recomputeResults();
      });
    });

    document.querySelectorAll('[data-priority-coef]').forEach((input) => {
      input.addEventListener('input', () => {
        const rule = state.customPriorityRules.find((item) => item.id === input.dataset.priorityCoef);
        rule.coefficient = Number(input.value || 0);
        if (state.results.length) recomputeResults();
      });
    });

    document.querySelectorAll('[data-priority-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        state.customPriorityRules = state.customPriorityRules.filter((item) => item.id !== button.dataset.priorityRemove);
        if (!state.customPriorityRules.length) state.customPriorityRules = [createPriorityRule(state.mainDataset)];
        renderWeightsPanel();
        if (state.results.length) recomputeResults();
      });
    });
  }

  function hasValue(row) {
    return Boolean(String(row.value1 || '').trim()) || Boolean(String(row.value2 || '').trim());
  }

  function comparable(value, type) {
    if (type === 'number') return Number(value || 0);
    if (type === 'date') return String(value || '');
    return String(value || '').trim().toLowerCase();
  }

  function normalize(value, type) {
    if (type === 'number') return Number(value);
    if (type === 'date') return String(value || '');
    return String(value || '').trim().toLowerCase();
  }

  function evaluateRow(record, row, datasetCode) {
    const meta = getFieldMeta(datasetCode, row.field);
    const recordValue = record[row.field];
    const operator = row.operator;
    const value1 = row.value1;
    const value2 = row.value2;

    if (operator === 'contains') return String(recordValue || '').toLowerCase().includes(String(value1 || '').toLowerCase());
    if (operator === 'eq') return normalize(recordValue, meta?.type) === normalize(value1, meta?.type);
    if (operator === 'gte') return comparable(recordValue, meta?.type) >= comparable(value1, meta?.type);
    if (operator === 'lte') return comparable(recordValue, meta?.type) <= comparable(value1, meta?.type);
    if (operator === 'between') {
      const current = comparable(recordValue, meta?.type);
      return current >= comparable(value1, meta?.type) && current <= comparable(value2, meta?.type);
    }
    if (operator === 'in') {
      const options = String(value1 || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
      return options.includes(String(recordValue || '').trim().toLowerCase());
    }
    return true;
  }

  function buildUnits(rows, datasetCode) {
    const units = [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!hasValue(row)) continue;

      if (row.clusterId) {
        const clusterRows = [row];
        while (i + 1 < rows.length && rows[i + 1].clusterId === row.clusterId) {
          i += 1;
          if (hasValue(rows[i])) clusterRows.push(rows[i]);
        }
        units.push({
          join: clusterRows[0].join,
          clusterId: row.clusterId,
          mode: state.filters[datasetCode].clusterModes[row.clusterId] || 'OR',
          rows: clusterRows
        });
      } else {
        units.push({ join: row.join, rows: [row], mode: 'ROW' });
      }
    }
    return units;
  }

  function evaluateUnit(record, unit, datasetCode) {
    if (unit.mode === 'ROW') {
      return evaluateRow(record, unit.rows[0], datasetCode);
    }
    const rowResults = unit.rows.map((row) => evaluateRow(record, row, datasetCode));
    if (unit.mode === 'AND') return rowResults.every(Boolean);
    if (unit.mode === 'NOT') return !rowResults.some(Boolean);
    return rowResults.some(Boolean);
  }

  function evaluateDataset(records, datasetCode) {
    const group = state.filters[datasetCode];
    if (!group || group.allData) return records.slice();
    const units = buildUnits(group.rows, datasetCode);
    if (!units.length) return records.slice();

    return records.filter((record) => {
      let result = evaluateUnit(record, units[0], datasetCode);
      for (let i = 1; i < units.length; i += 1) {
        const unitResult = evaluateUnit(record, units[i], datasetCode);
        result = units[i].join === 'OR' ? (result || unitResult) : (result && unitResult);
      }
      return result;
    });
  }

  async function runAnalysis() {
    $('loadingSection').classList.remove('hidden');
    $('resultsSection').classList.add('hidden');
    await showLoading('Подготовка анализируемого набора...', 18);

    const filteredMain = evaluateDataset(mainRecords, state.mainDataset);
    await showLoading('Подготовка сравниваемых наборов...', 44);

    const filteredCompare = {};
    state.compareDatasets.forEach((code) => {
      filteredCompare[code] = evaluateDataset(compareRecords[code] || [], code);
    });
    await showLoading('Расчёт приоритетов и формирование реестра...', 78);

    state.resultMeta = {
      mainCount: filteredMain.length,
      compareCounts: Object.fromEntries(state.compareDatasets.map((code) => [code, (filteredCompare[code] || []).length]))
    };
    state.results = buildResults(filteredMain, filteredCompare);

    await showLoading('Отрисовка карты и таблицы...', 100);
    $('loadingSection').classList.add('hidden');

    $('criteriaCard').classList.add('is-collapsed');
    $('launchCard').classList.add('is-collapsed');
    $('resultsSection').classList.remove('hidden');
    state.currentStep = 5;
    renderStepper();
    renderResults();
    scrollToNode($('resultsSection'));
  }

  function recomputeResults() {
    if (!state.resultMeta) return;
    const filteredMain = evaluateDataset(mainRecords, state.mainDataset);
    const filteredCompare = {};
    state.compareDatasets.forEach((code) => {
      filteredCompare[code] = evaluateDataset(compareRecords[code] || [], code);
    });
    state.resultMeta = {
      mainCount: filteredMain.length,
      compareCounts: Object.fromEntries(state.compareDatasets.map((code) => [code, (filteredCompare[code] || []).length]))
    };
    state.results = buildResults(filteredMain, filteredCompare);
    renderResults();
  }

  function showLoading(text, percent) {
    $('loadingText').textContent = text;
    $('loadingPercent').textContent = `${percent}%`;
    $('loadingFill').style.width = `${percent}%`;
    return new Promise((resolve) => setTimeout(resolve, 240));
  }

  function buildResults(filteredMain, filteredCompare) {
    const compareByObjectId = new Map();
    state.compareDatasets.forEach((code) => {
      (filteredCompare[code] || []).forEach((record) => {
        if (!compareByObjectId.has(record.linkObjectId)) compareByObjectId.set(record.linkObjectId, []);
        compareByObjectId.get(record.linkObjectId).push(record);
      });
    });

    const enriched = filteredMain.map((item) => {
      const matches = compareByObjectId.get(item.objectId) || [];
      const matchedDatasets = [...new Set(matches.map((m) => m.datasetCode))];
      const score = calculatePriority(item, matches);
      const priorityLevel = score >= 0.72 ? 'high' : score >= 0.45 ? 'medium' : 'low';
      const reasonParts = [];
      if (matchedDatasets.length) {
        reasonParts.push(`Найдено пересечений: ${matchedDatasets.map((code) => DATASETS[code].short).join(', ')}`);
      } else {
        reasonParts.push('Пересечения в выбранных наборах не найдены');
      }
      if (item.reason) reasonParts.push(item.reason);

      return {
        ...item,
        matchesCount: matches.length,
        matchedDatasets,
        priorityScore: score,
        priorityLevel,
        resultReason: reasonParts.join('; ')
      };
    }).filter((item) => item.uncoveredArea > 0);

    return enriched.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  function calculatePriority(item, compareMatches) {
    const weights = state.useCustomWeights ? state.weights : baseWeights;
    const normalized = {
      coveragePercent: 1 - clamp(item.coveragePercent / 100, 0, 1),
      repairAge: clamp((item.repairAge || 0) / 10, 0, 1),
      estimatedCost: clamp(item.estimatedCost / 40000000, 0, 1),
      recommendedVolume: clamp(item.recommendedVolume / 15000, 0, 1)
    };
    const totalWeight = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0) || 1;
    const weighted = Object.entries(weights).reduce((sum, [key, value]) => sum + normalized[key] * Number(value || 0), 0);
    let score = weighted / totalWeight;

    if (state.useCustomWeights) {
      const bonus = state.customPriorityRules.reduce((sum, rule) => {
        if (!hasValue(rule)) return sum;
        const sourceRecords = rule.datasetCode === 'ogh'
          ? [item]
          : compareMatches.filter((match) => match.datasetCode === rule.datasetCode);
        const matched = sourceRecords.some((record) => evaluateRow(record, rule, rule.datasetCode));
        return matched ? sum + (Number(rule.coefficient || 0) / 100) : sum;
      }, 0);
      score += bonus;
    }

    return Number(clamp(score, 0, 1).toFixed(2));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function renderResults() {
    renderSummaryCards();
    renderTable();
    renderMap();
  }

  function renderSummaryCards() {
    const total = state.results.length;
    const totalCost = state.results.reduce((sum, item) => sum + Number(item.estimatedCost || 0), 0);
    const totalVolume = state.results.reduce((sum, item) => sum + Number(item.recommendedVolume || 0), 0);
    const compared = Object.values(state.resultMeta?.compareCounts || {}).reduce((sum, value) => sum + value, 0);

    $('resultSummaryCards').innerHTML = `
      <div class="summary-card">
        <div class="summary-card-title">Объекты в результате</div>
        <span class="summary-card-value">${total}</span>
        <div class="summary-card-sub">Итоговый реестр по анализируемому набору ОГХ</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-title">Записей сравнения</div>
        <span class="summary-card-value">${compared}</span>
        <div class="summary-card-sub">После применения фильтров к выбранным наборам</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-title">Рекомендуемый объём</div>
        <span class="summary-card-value">${formatNumber(totalVolume)}</span>
        <div class="summary-card-sub">Суммарный расчёт по выбранным объектам</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-title">Ориентировочная стоимость</div>
        <span class="summary-card-value">${formatCurrency(totalCost)}</span>
        <div class="summary-card-sub">Сводная оценка по итоговому реестру</div>
      </div>
    `;
  }

  function renderTable() {
    $('resultsBody').innerHTML = state.results.map((item, index) => `
      <tr data-result-object="${item.objectId}" class="${state.selectedObjectId === item.objectId ? 'is-active' : ''}">
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.objectId}</td>
        <td>${item.district}</td>
        <td>${item.area}</td>
        <td>${item.resultReason}</td>
        <td>${formatDecimal(item.coveragePercent)}</td>
        <td>${formatNumber(item.coveredArea)}</td>
        <td>${formatNumber(item.uncoveredArea)}</td>
        <td>${formatNumber(item.recommendedVolume)}</td>
        <td>${formatCurrency(item.estimatedCost)}</td>
        <td>${item.lastWorkYear ?? '—'}</td>
        <td>${item.repairAge ?? '—'}</td>
        <td><span class="priority-pill ${item.priorityLevel}">${priorityLabel(item.priorityLevel)}</span></td>
      </tr>
    `).join('');

    $('resultsBody').querySelectorAll('[data-result-object]').forEach((row) => {
      row.addEventListener('click', () => {
        const objectId = Number(row.dataset.resultObject);
        const item = state.results.find((record) => record.objectId === objectId);
        state.selectedObjectId = objectId;
        highlightOnMap(item);
        renderTable();
      });
    });
  }

  function renderMapLegend() {
    $('mapLegend').innerHTML = `
      <div class="map-legend-title">Уровень приоритета</div>
      <div class="map-legend-row"><span class="map-legend-swatch" style="background:#15803d"></span>Высокий</div>
      <div class="map-legend-row"><span class="map-legend-swatch" style="background:#c97711"></span>Средний</div>
      <div class="map-legend-row"><span class="map-legend-swatch" style="background:#d23b3b"></span>Низкий</div>
    `;
  }

  function renderMap() {
    if (!state.map) {
      state.map = L.map('map', { attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
      }).addTo(state.map);
    }

    if (state.mapLayer) state.map.removeLayer(state.mapLayer);

    const features = state.results.map((item) => toFeature(item));
    state.mapLayer = L.geoJSON(features, {
      style: (feature) => styleByPriority(feature.properties.priorityLevel, feature.properties.objectId === state.selectedObjectId),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>${feature.properties.name}</strong><br>${feature.properties.area}, ${feature.properties.district}<br>Приоритет: ${priorityLabel(feature.properties.priorityLevel)}`);
      }
    }).addTo(state.map);

    if (features.length) state.map.fitBounds(state.mapLayer.getBounds(), { padding: [20, 20] });
    else state.map.setView([55.751244, 37.618423], 10);

    setTimeout(() => state.map.invalidateSize(), 50);

    if (!state.selectedObjectId && state.results.length) {
      state.selectedObjectId = state.results[0].objectId;
    }
    if (state.selectedObjectId) {
      const selected = state.results.find((item) => item.objectId === state.selectedObjectId);
      if (selected) highlightOnMap(selected, false);
    }
  }

  function styleByPriority(priorityLevel, selected = false) {
    const color = priorityLevel === 'high' ? '#15803d' : priorityLevel === 'medium' ? '#c97711' : '#d23b3b';
    return {
      color,
      weight: selected ? 4 : 2,
      fillOpacity: selected ? 0.28 : 0.18
    };
  }

  function toFeature(item) {
    const geometry = item.geometry?.odh || item.geometry?.qgis || item.geometry;
    return {
      type: 'Feature',
      geometry,
      properties: {
        objectId: item.objectId,
        name: item.name,
        area: item.area,
        district: item.district,
        priorityLevel: item.priorityLevel
      }
    };
  }

  function highlightOnMap(item, openPopup = true) {
    if (!item || !state.mapLayer) return;
    state.selectedObjectId = item.objectId;
    state.mapLayer.eachLayer((layer) => {
      const selected = layer.feature?.properties?.objectId === item.objectId;
      layer.setStyle(styleByPriority(layer.feature?.properties?.priorityLevel, selected));
      if (selected) {
        state.map.fitBounds(layer.getBounds(), { padding: [32, 32] });
        if (openPopup) layer.openPopup();
      }
    });
  }

  function priorityLabel(value) {
    if (value === 'high') return 'Высокий';
    if (value === 'medium') return 'Средний';
    return 'Низкий';
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  function formatDecimal(value) {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Number(value || 0));
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  function exportExcel() {
    const rows = state.results.map((item, index) => ({
      '№': index + 1,
      'Объект': item.name,
      'ID ОГХ': item.objectId,
      'Округ': item.district,
      'Район': item.area,
      'Основание включения': item.resultReason,
      'Покрытие, %': item.coveragePercent,
      'Покрытая площадь': item.coveredArea,
      'Непокрытая площадь': item.uncoveredArea,
      'Рекомендуемый объём': item.recommendedVolume,
      'Стоимость': item.estimatedCost,
      'Последний год работ': item.lastWorkYear,
      'Давность ремонта': item.repairAge,
      'Приоритет': priorityLabel(item.priorityLevel)
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Реестр ОГХ');
    XLSX.writeFile(workbook, 'itogovy_reestr_ogh.xlsx');
  }

  function resetAll() {
    state.tool = 'predictive';
    state.mainDataset = 'ogh';
    state.compareDatasets = ['sok', 'krr'];
    state.useCustomWeights = false;
    state.weights = { ...baseWeights };
    state.customPriorityRules = [createPriorityRule('ogh')];
    state.results = [];
    state.resultMeta = null;
    state.currentStep = 1;
    state.selectedObjectId = null;

    $('toolSection').classList.remove('is-collapsed');
    $('datasetsSection').classList.remove('is-collapsed');
    $('datasetsSection').classList.add('hidden');
    $('filtersSection').classList.add('hidden');
    $('criteriaCard').classList.remove('is-collapsed');
    $('launchCard').classList.remove('is-collapsed');
    $('loadingSection').classList.add('hidden');
    $('resultsSection').classList.add('hidden');
    $('weightsToggle').checked = false;
    $('weightsPanel').classList.add('hidden');

    resetFilters();
    renderToolOptions();
    renderDatasetPickers();
    renderBaseWeights();
    renderWeightsPanel();
    renderFilters();
    renderStepper();
    updateToolHeader();
    scrollToNode(document.body);
  }

  function scrollToNode(node) {
    window.scrollTo({ top: Math.max((node?.offsetTop || 0) - 20, 0), behavior: 'smooth' });
  }

  init();
})();
