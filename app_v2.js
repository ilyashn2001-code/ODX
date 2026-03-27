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
      description: 'Резервный сценарий для будущего расчёта покрытия и анализа благоустроенности по территориальным зонам.'
    },
    {
      code: 'compare',
      title: 'Инструмент сценарного сопоставления наборов',
      description: 'Резервный сценарий для будущего сопоставления и сравнения нескольких тематических наборов данных.'
    }
  ];

  const DATASETS = {
    ogh: {
      code: 'ogh',
      role: 'main',
      title: 'Набор ОГХ',
      description: 'Основной анализируемый набор дорожных объектов.',
      short: 'ОГХ'
    },
    sok: {
      code: 'sok',
      role: 'compare',
      title: 'Набор благоустройства (СОК)',
      description: 'Сравниваемый набор работ и благоустройства из СОК.',
      short: 'СОК'
    },
    mr: {
      code: 'mr',
      role: 'compare',
      title: 'Набор благоустройства (МР)',
      description: 'Сравниваемый набор работ и благоустройства из МР.',
      short: 'МР'
    }
  };

  const baseWeights = APP.baseWeights || {
    coveragePercent: 35,
    repairAge: 25,
    estimatedCost: 20,
    recommendedVolume: 20
  };

  const weightLabels = {
    coveragePercent: 'Процент покрытия',
    repairAge: 'Давность ремонта',
    estimatedCost: 'Ориентировочная стоимость',
    recommendedVolume: 'Рекомендуемый объём'
  };

  const FILTER_FIELDS = {
    ogh: [
      { code: 'kind', label: 'Вид', type: 'enum', options: ['ОДХ', 'ОКБ'] },
      { code: 'passportEndDate', label: 'Дата окончания паспорта', type: 'date' },
      { code: 'name', label: 'Наименование', type: 'text' },
      { code: 'district', label: 'Округ', type: 'enum', options: uniqueValues('district') },
      { code: 'area', label: 'Район', type: 'enum', options: uniqueValues('area') },
      { code: 'department', label: 'ОИВ', type: 'enum', options: uniqueValues('department') },
      { code: 'lastWorkYear', label: 'Последний год работ', type: 'number' }
    ],
    sok: [
      { code: 'compareObjectType', label: 'Тип объекта', type: 'enum', options: ['ОДХ', 'ОКБ'] },
      { code: 'workYear', label: 'Год проведения работ', type: 'number' },
      { code: 'workType', label: 'Вид работ', type: 'enum', options: ['Асфальт 1', 'Асфальт 2', 'Асфальт 3', 'Озеленение', 'Бортовой камень'] },
      { code: 'district', label: 'Округ', type: 'enum', options: uniqueValues('district') },
      { code: 'area', label: 'Район', type: 'enum', options: uniqueValues('area') }
    ],
    mr: [
      { code: 'compareObjectType', label: 'Тип объекта', type: 'enum', options: ['ОДХ', 'ОКБ'] },
      { code: 'workYear', label: 'Год проведения работ', type: 'number' },
      { code: 'workType', label: 'Вид работ', type: 'enum', options: ['Асфальт 1', 'Асфальт 2', 'Асфальт 3', 'Озеленение', 'Бортовой камень'] },
      { code: 'district', label: 'Округ', type: 'enum', options: uniqueValues('district') },
      { code: 'area', label: 'Район', type: 'enum', options: uniqueValues('area') }
    ]
  };

  const steps = [
    'Инструмент',
    'Наборы',
    'Фильтры',
    'Приоритизация',
    'Результат'
  ];

  const state = {
    tool: 'predictive',
    mainDataset: 'ogh',
    compareDatasets: ['sok', 'mr'],
    filters: {},
    useCustomWeights: false,
    weights: { ...baseWeights },
    results: [],
    resultMeta: null,
    currentStep: 1,
    map: null,
    mapLayer: null
  };

  const mainRecords = buildMainRecords(APP.objects || []);
  const compareRecords = {
    sok: buildCompareRecords(mainRecords, 'sok'),
    mr: buildCompareRecords(mainRecords, 'mr')
  };

  function uniqueValues(key) {
    return [...new Set((APP.objects || []).map((item) => item[key]).filter(Boolean))].sort();
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
      const base = datasetCode === 'sok' ? 2016 : 2019;
      const span = datasetCode === 'sok' ? 10 : 5;
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
        workYear: base + (index % span),
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
        workYear: base + ((index + 3) % span),
        workType: types[(index + 2) % types.length],
        geometry: item.geometry,
        sourceName: item.name
      });
      return records;
    });
  }

  function createRow(datasetCode) {
    const field = FILTER_FIELDS[datasetCode]?.[0];
    return {
      id: cryptoId(),
      field: field?.code || 'name',
      operator: defaultOperator(field?.type || 'text'),
      value1: '',
      value2: ''
    };
  }

  function createGroup(datasetCode) {
    return {
      id: cryptoId(),
      rowsJoin: 'AND',
      rows: [createRow(datasetCode)]
    };
  }

  function resetFilters() {
    state.filters = {
      ogh: [createGroup('ogh')],
      sok: [createGroup('sok')],
      mr: [createGroup('mr')]
    };
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
      return [
        ['eq', 'Равно'],
        ['gte', 'Больше или равно'],
        ['lte', 'Меньше или равно'],
        ['between', 'Между']
      ];
    }
    if (type === 'enum') {
      return [
        ['eq', 'Равно'],
        ['in', 'В списке']
      ];
    }
    return [
      ['contains', 'Содержит'],
      ['eq', 'Равно']
    ];
  }

  function getFieldMeta(datasetCode, fieldCode) {
    return (FILTER_FIELDS[datasetCode] || []).find((field) => field.code === fieldCode);
  }

  function init() {
    resetFilters();
    renderStepper();
    renderToolOptions();
    renderDatasetPickers();
    renderBaseWeights();
    renderWeightsPanel();
    renderFilters();
    renderScenarioSummary();
    bindEvents();
    updateToolHeader();
  }

  function bindEvents() {
    $('toolSelect').addEventListener('change', (e) => {
      state.tool = e.target.value;
      updateToolHeader();
      renderScenarioSummary();
    });

    $('goToDatasetsBtn').addEventListener('click', () => {
      $('datasetsSection').classList.remove('hidden');
      state.currentStep = 2;
      renderStepper();
      window.scrollTo({ top: $('datasetsSection').offsetTop - 20, behavior: 'smooth' });
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
      $('filtersSection').classList.remove('hidden');
      state.currentStep = 3;
      renderStepper();
      renderFilters();
      renderScenarioSummary();
      window.scrollTo({ top: $('filtersSection').offsetTop - 20, behavior: 'smooth' });
    });

    $('fillScenarioBtn').addEventListener('click', applyTestScenario);

    $('weightsToggle').addEventListener('change', (e) => {
      state.useCustomWeights = e.target.checked;
      $('weightsPanel').classList.toggle('hidden', !state.useCustomWeights);
      state.currentStep = state.useCustomWeights ? 4 : 3;
      renderStepper();
      renderWeightsPanel();
      renderScenarioSummary();
    });

    $('runAnalysisBtn').addEventListener('click', runAnalysis);
    $('resetBtn').addEventListener('click', resetAll);
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
    const active = TOOL_OPTIONS.find((tool) => tool.code === state.tool);
    $('toolDescription').textContent = active?.description || '';
  }

  function updateToolHeader() {
    const active = TOOL_OPTIONS.find((tool) => tool.code === state.tool);
    $('activeToolBadge').textContent = active?.title || 'Не выбран';
    $('toolDescription').textContent = active?.description || '';
  }

  function renderDatasetPickers() {
    $('mainDatasetPicker').innerHTML = renderDatasetOption(DATASETS.ogh, true, state.mainDataset === 'ogh');
    $('compareDatasetPicker').innerHTML = ['sok', 'mr'].map((code) => renderDatasetOption(DATASETS[code], false, state.compareDatasets.includes(code))).join('');

    $('mainDatasetPicker').querySelectorAll('input[name="mainDataset"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        state.mainDataset = e.target.value;
        renderScenarioSummary();
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
        renderScenarioSummary();
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

  function renderWeightsPanel() {
    $('weightsPanel').innerHTML = Object.entries(state.weights).map(([key, value]) => `
      <div class="weight-row">
        <div>
          <div class="dataset-option-title">${weightLabels[key]}</div>
          <div class="dataset-option-description">Влияет только на порядок объектов в реестре.</div>
        </div>
        <input type="number" min="0" max="100" step="1" value="${value}" data-weight-key="${key}">
      </div>
    `).join('');

    $('weightsPanel').querySelectorAll('[data-weight-key]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.weightKey;
        const value = Number(e.target.value || 0);
        state.weights[key] = value;
        renderScenarioSummary();
      });
    });
  }

  function activeFilterDatasets() {
    return [state.mainDataset, ...state.compareDatasets].filter(Boolean);
  }

  function renderFilters() {
    const blocks = activeFilterDatasets().map((datasetCode) => renderFilterBlock(datasetCode)).join('');
    $('filtersBlocks').innerHTML = blocks;
    bindFilterEvents();
  }

  function renderFilterBlock(datasetCode) {
    const dataset = DATASETS[datasetCode];
    const groups = state.filters[datasetCode] || [];
    return `
      <section class="filter-block" data-dataset-block="${datasetCode}">
        <div class="filter-block-head">
          <div>
            <div class="filter-block-title-line">
              <span class="role-pill ${dataset.role === 'main' ? 'main' : 'compare'}">${dataset.role === 'main' ? 'Основной набор' : 'Набор сравнения'}</span>
              <h3>${dataset.title}</h3>
            </div>
            <p>${dataset.description}</p>
          </div>
          <button class="btn btn-secondary btn-small" data-add-group="${datasetCode}">Добавить группу</button>
        </div>
        <div class="group-list">
          ${groups.map((group, index) => renderGroup(datasetCode, group, index)).join('')}
        </div>
      </section>
    `;
  }

  function renderGroup(datasetCode, group, index) {
    return `
      <div class="group-box" data-group-id="${group.id}" data-dataset-code="${datasetCode}">
        <div class="group-head">
          <div>
            <div class="group-title">Группа ${index + 1}</div>
            <div class="group-logic-note">Строки внутри группы объединяются через <strong>${group.rowsJoin === 'AND' ? 'И' : 'ИЛИ'}</strong></div>
          </div>
          <div class="group-tools">
            <label class="field">
              <span class="field-label">Связь строк</span>
              <select data-group-join="${group.id}" data-dataset-code="${datasetCode}">
                <option value="AND" ${group.rowsJoin === 'AND' ? 'selected' : ''}>И</option>
                <option value="OR" ${group.rowsJoin === 'OR' ? 'selected' : ''}>ИЛИ</option>
              </select>
            </label>
            <button class="btn btn-secondary btn-small" data-remove-group="${group.id}" data-dataset-code="${datasetCode}">Удалить группу</button>
          </div>
        </div>
        <div class="rows">
          ${group.rows.map((row) => renderRow(datasetCode, group.id, row)).join('')}
        </div>
        <div class="group-footer">
          <div class="group-logic-note">Следующая группа внутри этого набора объединяется через <strong>ИЛИ</strong>.</div>
          <button class="btn btn-secondary btn-small" data-add-row="${group.id}" data-dataset-code="${datasetCode}">Добавить условие</button>
        </div>
      </div>
    `;
  }

  function renderRow(datasetCode, groupId, row) {
    const fields = FILTER_FIELDS[datasetCode] || [];
    const meta = getFieldMeta(datasetCode, row.field) || fields[0];
    const operators = operatorsFor(meta.type);
    const isBetween = row.operator === 'between';
    const hasOptions = meta.type === 'enum';
    const placeholder = meta.type === 'text' ? 'Введите значение' : meta.type === 'number' ? 'Например, 2025' : meta.type === 'date' ? '' : 'Выберите';
    return `
      <div class="row-filter ${isBetween ? '' : 'single-value'}" data-row-id="${row.id}">
        <label class="field">
          <span class="field-label">Атрибут</span>
          <select data-row-field="${row.id}" data-group-id="${groupId}" data-dataset-code="${datasetCode}">
            ${fields.map((field) => `<option value="${field.code}" ${field.code === row.field ? 'selected' : ''}>${field.label}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Оператор</span>
          <select data-row-operator="${row.id}" data-group-id="${groupId}" data-dataset-code="${datasetCode}">
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
            ${renderValueControl(datasetCode, row, meta, 'value1', placeholder, hasOptions)}
          </label>
          <div></div>
        `}
        <button class="btn btn-secondary btn-small btn-danger" data-remove-row="${row.id}" data-group-id="${groupId}" data-dataset-code="${datasetCode}">Удалить</button>
      </div>
    `;
  }

  function renderValueControl(datasetCode, row, meta, valueKey, placeholder) {
    const value = row[valueKey] || '';
    if (meta.type === 'enum' && row.operator !== 'in') {
      return `
        <select data-row-value="${row.id}" data-value-key="${valueKey}" data-group-id="${findGroupIdByRow(datasetCode, row.id)}" data-dataset-code="${datasetCode}">
          <option value="">Выберите</option>
          ${meta.options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
      `;
    }
    if (meta.type === 'date') {
      return `<input type="date" value="${value}" data-row-value="${row.id}" data-value-key="${valueKey}" data-group-id="${findGroupIdByRow(datasetCode, row.id)}" data-dataset-code="${datasetCode}">`;
    }
    if (meta.type === 'number') {
      return `<input type="number" value="${value}" placeholder="${placeholder}" data-row-value="${row.id}" data-value-key="${valueKey}" data-group-id="${findGroupIdByRow(datasetCode, row.id)}" data-dataset-code="${datasetCode}">`;
    }
    const fieldPlaceholder = row.operator === 'in' ? 'Через запятую' : placeholder;
    return `<input type="text" value="${value}" placeholder="${fieldPlaceholder}" data-row-value="${row.id}" data-value-key="${valueKey}" data-group-id="${findGroupIdByRow(datasetCode, row.id)}" data-dataset-code="${datasetCode}">`;
  }

  function findGroupIdByRow(datasetCode, rowId) {
    const group = (state.filters[datasetCode] || []).find((item) => item.rows.some((row) => row.id === rowId));
    return group?.id || '';
  }

  function bindFilterEvents() {
    document.querySelectorAll('[data-add-group]').forEach((button) => {
      button.addEventListener('click', () => {
        const datasetCode = button.dataset.addGroup;
        state.filters[datasetCode].push(createGroup(datasetCode));
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-remove-group]').forEach((button) => {
      button.addEventListener('click', () => {
        const datasetCode = button.dataset.datasetCode;
        const groupId = button.dataset.removeGroup;
        state.filters[datasetCode] = state.filters[datasetCode].filter((group) => group.id !== groupId);
        if (!state.filters[datasetCode].length) state.filters[datasetCode] = [createGroup(datasetCode)];
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-add-row]').forEach((button) => {
      button.addEventListener('click', () => {
        const datasetCode = button.dataset.datasetCode;
        const groupId = button.dataset.addRow;
        const group = state.filters[datasetCode].find((item) => item.id === groupId);
        group.rows.push(createRow(datasetCode));
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-remove-row]').forEach((button) => {
      button.addEventListener('click', () => {
        const datasetCode = button.dataset.datasetCode;
        const groupId = button.dataset.groupId;
        const rowId = button.dataset.removeRow;
        const group = state.filters[datasetCode].find((item) => item.id === groupId);
        group.rows = group.rows.filter((row) => row.id !== rowId);
        if (!group.rows.length) group.rows = [createRow(datasetCode)];
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-group-join]').forEach((select) => {
      select.addEventListener('change', () => {
        const datasetCode = select.dataset.datasetCode;
        const groupId = select.dataset.groupJoin;
        const group = state.filters[datasetCode].find((item) => item.id === groupId);
        group.rowsJoin = select.value;
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-row-field]').forEach((select) => {
      select.addEventListener('change', () => {
        const datasetCode = select.dataset.datasetCode;
        const groupId = select.dataset.groupId;
        const rowId = select.dataset.rowField;
        const group = state.filters[datasetCode].find((item) => item.id === groupId);
        const row = group.rows.find((item) => item.id === rowId);
        const meta = getFieldMeta(datasetCode, select.value);
        row.field = select.value;
        row.operator = defaultOperator(meta.type);
        row.value1 = '';
        row.value2 = '';
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-row-operator]').forEach((select) => {
      select.addEventListener('change', () => {
        const datasetCode = select.dataset.datasetCode;
        const groupId = select.dataset.groupId;
        const rowId = select.dataset.rowOperator;
        const group = state.filters[datasetCode].find((item) => item.id === groupId);
        const row = group.rows.find((item) => item.id === rowId);
        row.operator = select.value;
        row.value1 = '';
        row.value2 = '';
        renderFilters();
        renderScenarioSummary();
      });
    });

    document.querySelectorAll('[data-row-value]').forEach((input) => {
      const event = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(event, () => {
        const datasetCode = input.dataset.datasetCode;
        const groupId = input.dataset.groupId;
        const rowId = input.dataset.rowValue;
        const group = state.filters[datasetCode].find((item) => item.id === groupId);
        const row = group.rows.find((item) => item.id === rowId);
        row[input.dataset.valueKey] = input.value;
        renderScenarioSummary();
      });
    });
  }

  function renderScenarioSummary() {
    const tool = TOOL_OPTIONS.find((item) => item.code === state.tool);
    const datasetText = [DATASETS[state.mainDataset]?.title, ...state.compareDatasets.map((code) => DATASETS[code].title)].filter(Boolean).join(' · ');
    const filterCount = activeFilterDatasets().reduce((sum, code) => sum + ((state.filters[code] || []).reduce((acc, group) => acc + group.rows.filter(hasValue).length, 0)), 0);
    const weightsLabel = state.useCustomWeights ? 'Ручная настройка' : 'Базовые коэффициенты';

    $('scenarioSummary').innerHTML = `
      <div class="summary-box">
        <div class="summary-box-title">Инструмент</div>
        <strong>${tool?.title || '—'}</strong>
        <div class="dataset-option-description">${tool?.description || ''}</div>
      </div>
      <div class="summary-box">
        <div class="summary-box-title">Наборы</div>
        <strong>${datasetText || 'Наборы не выбраны'}</strong>
        <div class="dataset-option-description">Основной набор: ${DATASETS[state.mainDataset]?.short || '—'}</div>
      </div>
      <div class="summary-box">
        <div class="summary-box-title">Конфигурация</div>
        <strong>${filterCount} активных условий</strong>
        <div class="dataset-option-description">Приоритизация: ${weightsLabel}</div>
      </div>
    `;
  }

  function hasValue(row) {
    return Boolean(row.value1) || Boolean(row.value2);
  }

  function applyTestScenario() {
    state.mainDataset = 'ogh';
    state.compareDatasets = ['sok', 'mr'];
    renderDatasetPickers();

    state.filters.ogh = [
      {
        id: cryptoId(),
        rowsJoin: 'AND',
        rows: [
          { id: cryptoId(), field: 'kind', operator: 'eq', value1: 'ОДХ', value2: '' },
          { id: cryptoId(), field: 'passportEndDate', operator: 'gte', value1: '2025-08-31', value2: '' }
        ]
      }
    ];

    state.filters.sok = [
      {
        id: cryptoId(),
        rowsJoin: 'AND',
        rows: [
          { id: cryptoId(), field: 'compareObjectType', operator: 'eq', value1: 'ОДХ', value2: '' },
          { id: cryptoId(), field: 'workYear', operator: 'between', value1: '2016', value2: '2025' },
          { id: cryptoId(), field: 'workType', operator: 'in', value1: 'Асфальт 1, Асфальт 2, Асфальт 3', value2: '' }
        ]
      },
      {
        id: cryptoId(),
        rowsJoin: 'AND',
        rows: [
          { id: cryptoId(), field: 'compareObjectType', operator: 'eq', value1: 'ОКБ', value2: '' },
          { id: cryptoId(), field: 'workYear', operator: 'between', value1: '2024', value2: '2025' },
          { id: cryptoId(), field: 'workType', operator: 'in', value1: 'Асфальт 1, Асфальт 2, Асфальт 3', value2: '' }
        ]
      }
    ];

    state.filters.mr = [
      {
        id: cryptoId(),
        rowsJoin: 'AND',
        rows: [
          { id: cryptoId(), field: 'compareObjectType', operator: 'eq', value1: 'ОКБ', value2: '' },
          { id: cryptoId(), field: 'workYear', operator: 'between', value1: '2019', value2: '2023' },
          { id: cryptoId(), field: 'workType', operator: 'in', value1: 'Асфальт 1, Асфальт 2, Асфальт 3', value2: '' }
        ]
      }
    ];

    renderFilters();
    renderScenarioSummary();
    alert('Тестовый сценарий заполнен. Такой вариант уже можно показывать как пример рабочего потока.');
  }

  function evaluateDataset(records, datasetCode) {
    const groups = state.filters[datasetCode] || [];
    const activeGroups = groups.filter((group) => group.rows.some(hasValue));
    if (!activeGroups.length) return records.slice();
    return records.filter((record) => activeGroups.some((group) => evaluateGroup(record, group, datasetCode)));
  }

  function evaluateGroup(record, group, datasetCode) {
    const activeRows = group.rows.filter(hasValue);
    if (!activeRows.length) return true;
    const results = activeRows.map((row) => evaluateRow(record, row, datasetCode));
    return group.rowsJoin === 'OR' ? results.some(Boolean) : results.every(Boolean);
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

  function normalize(value, type) {
    if (type === 'number') return Number(value);
    if (type === 'date') return String(value || '');
    return String(value || '').trim().toLowerCase();
  }

  function comparable(value, type) {
    if (type === 'number') return Number(value || 0);
    if (type === 'date') return Number(String(value || '').replaceAll('-', ''));
    return Number(value || 0);
  }

  async function runAnalysis() {
    if (state.tool !== 'predictive') {
      alert('Сейчас рабочая логика реализована только для инструмента предиктивного анализа.');
      return;
    }

    state.currentStep = 5;
    renderStepper();
    $('loadingSection').classList.remove('hidden');
    $('resultsSection').classList.add('hidden');

    await showLoading('Подготовка основного набора...', 20);
    const filteredMain = evaluateDataset(mainRecords, 'ogh');

    await showLoading('Подготовка наборов сравнения...', 48);
    const filteredCompare = {};
    state.compareDatasets.forEach((code) => {
      filteredCompare[code] = evaluateDataset(compareRecords[code], code);
    });

    await showLoading('Передача выборок в сервис пересечений...', 76);
    const results = buildResults(filteredMain, filteredCompare);

    await showLoading('Формирование карты и итогового реестра...', 100);
    state.results = results;
    state.resultMeta = {
      mainCount: filteredMain.length,
      compareCounts: Object.fromEntries(state.compareDatasets.map((code) => [code, filteredCompare[code]?.length || 0]))
    };

    $('loadingSection').classList.add('hidden');
    $('resultsSection').classList.remove('hidden');

    renderResults();
    window.scrollTo({ top: $('resultsSection').offsetTop - 20, behavior: 'smooth' });
  }

  function showLoading(text, percent) {
    $('loadingText').textContent = text;
    $('loadingPercent').textContent = `${percent}%`;
    $('loadingFill').style.width = `${percent}%`;
    return new Promise((resolve) => setTimeout(resolve, 280));
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
      const reasonParts = [item.reason || ''];
      if (matchedDatasets.length) {
        reasonParts.unshift(`Найдено пересечений: ${matchedDatasets.map((code) => DATASETS[code].short).join(', ')}`);
      } else {
        reasonParts.unshift('Пересечения в выбранных наборах не найдены');
      }

      const score = calculatePriority(item);
      const priorityLevel = score >= 0.72 ? 'high' : score >= 0.45 ? 'medium' : 'low';

      return {
        ...item,
        matchesCount: matches.length,
        matchedDatasets,
        priorityScore: score,
        priorityLevel,
        resultReason: reasonParts.filter(Boolean).join('; ')
      };
    }).filter((item) => item.uncoveredArea > 0);

    return enriched.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  function calculatePriority(item) {
    const weights = state.useCustomWeights ? state.weights : baseWeights;
    const normalized = {
      coveragePercent: 1 - clamp(item.coveragePercent / 100, 0, 1),
      repairAge: clamp(item.repairAge / 10, 0, 1),
      estimatedCost: clamp(item.estimatedCost / 40000000, 0, 1),
      recommendedVolume: clamp(item.recommendedVolume / 15000, 0, 1)
    };

    const totalWeight = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0) || 1;
    const weighted = Object.entries(weights).reduce((sum, [key, value]) => sum + normalized[key] * Number(value || 0), 0);
    return Number((weighted / totalWeight).toFixed(2));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function renderResults() {
    renderSummaryCards();
    renderMirror();
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

  function renderMirror() {
    const tool = TOOL_OPTIONS.find((item) => item.code === state.tool);
    $('mirrorTool').textContent = tool?.title || '—';
    $('mirrorDatasets').innerHTML = [state.mainDataset, ...state.compareDatasets].map((code) => `<span class="chip">${DATASETS[code]?.title || code}</span>`).join('');

    const filterItems = activeFilterDatasets().flatMap((code) => {
      const dataset = DATASETS[code];
      return (state.filters[code] || []).map((group, idx) => {
        const activeRows = group.rows.filter(hasValue);
        if (!activeRows.length) return null;
        const rowsText = activeRows.map((row) => {
          const meta = getFieldMeta(code, row.field);
          const operatorLabel = operatorsFor(meta?.type || 'text').find(([value]) => value === row.operator)?.[1] || row.operator;
          const valueText = row.operator === 'between' ? `${row.value1} — ${row.value2}` : row.value1;
          return `${meta?.label || row.field} ${operatorLabel} ${valueText}`;
        }).join(group.rowsJoin === 'AND' ? ' И ' : ' ИЛИ ');
        return `<div class="mirror-item"><strong>${dataset.title}, группа ${idx + 1}.</strong> ${rowsText}</div>`;
      }).filter(Boolean);
    });
    $('mirrorFilters').innerHTML = filterItems.join('') || '<div class="mirror-item">Активные фильтры не заданы.</div>';

    const effectiveWeights = state.useCustomWeights ? state.weights : baseWeights;
    $('mirrorWeights').innerHTML = Object.entries(effectiveWeights).map(([key, value]) => `<div class="mirror-item"><strong>${weightLabels[key]}</strong> — ${value}%</div>`).join('');
  }

  function renderTable() {
    $('resultsBody').innerHTML = state.results.map((item, index) => `
      <tr>
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
        <td><button class="table-link" data-map-object="${item.objectId}">На карте</button></td>
      </tr>
    `).join('');

    $('resultsBody').querySelectorAll('[data-map-object]').forEach((button) => {
      button.addEventListener('click', () => {
        const objectId = Number(button.dataset.mapObject);
        const item = state.results.find((record) => record.objectId === objectId);
        highlightOnMap(item);
      });
    });
  }

  function renderMap() {
    if (!state.map) {
      state.map = L.map('map');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(state.map);
    }

    if (state.mapLayer) {
      state.map.removeLayer(state.mapLayer);
    }

    const features = state.results.map((item) => toFeature(item));
    state.mapLayer = L.geoJSON(features, {
      style: (feature) => ({
        color: feature.properties.priorityLevel === 'high' ? '#15803d' : feature.properties.priorityLevel === 'medium' ? '#c97711' : '#d23b3b',
        weight: 2,
        fillOpacity: .18
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>${feature.properties.name}</strong><br>${feature.properties.area}, ${feature.properties.district}<br>Приоритет: ${priorityLabel(feature.properties.priorityLevel)}`);
      }
    }).addTo(state.map);

    if (features.length) {
      state.map.fitBounds(state.mapLayer.getBounds(), { padding: [20, 20] });
    } else {
      state.map.setView([55.751244, 37.618423], 10);
    }

    setTimeout(() => state.map.invalidateSize(), 50);
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

  function highlightOnMap(item) {
    if (!item || !state.mapLayer) return;
    const targetLayer = state.mapLayer.getLayers().find((layer) => layer.feature?.properties?.objectId === item.objectId);
    if (!targetLayer) return;
    state.map.fitBounds(targetLayer.getBounds(), { padding: [30, 30] });
    targetLayer.openPopup();
  }

  function exportExcel() {
    if (!state.results.length) {
      alert('Сначала запусти расчёт, чтобы выгружать результат.');
      return;
    }

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
      'Ориентировочная стоимость': item.estimatedCost,
      'Последний год работ': item.lastWorkYear,
      'Давность': item.repairAge,
      'Приоритет': priorityLabel(item.priorityLevel)
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Итоговый реестр');
    XLSX.writeFile(wb, 'predicitive_analysis_result_v2.xlsx');
  }

  function resetAll() {
    state.tool = 'predictive';
    state.mainDataset = 'ogh';
    state.compareDatasets = ['sok', 'mr'];
    state.useCustomWeights = false;
    state.weights = { ...baseWeights };
    state.results = [];
    state.resultMeta = null;
    state.currentStep = 1;
    resetFilters();
    $('datasetsSection').classList.add('hidden');
    $('filtersSection').classList.add('hidden');
    $('loadingSection').classList.add('hidden');
    $('resultsSection').classList.add('hidden');
    $('weightsToggle').checked = false;
    $('weightsPanel').classList.add('hidden');
    renderStepper();
    renderToolOptions();
    updateToolHeader();
    renderDatasetPickers();
    renderWeightsPanel();
    renderFilters();
    renderScenarioSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  function formatDecimal(value) {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value || 0));
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));
  }

  function priorityLabel(level) {
    return level === 'high' ? 'Высокий' : level === 'medium' ? 'Средний' : 'Низкий';
  }

  init();
})();
