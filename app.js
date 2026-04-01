
(() => {
  const APP = window.APP_DATA || {};
  const $ = (id) => document.getElementById(id);

  const TOOL_OPTIONS = [
    { code: 'predictive', title: 'Сценарий формирования планов работ по благоустройству', description: 'Основной сценарий для отбора исходных данных, фильтрации и получения результата моделирования.' },
    { code: 'coverage', title: 'Анализ территорий', description: 'Резервный сценарий для анализа территорий и сопоставления данных.' },
    { code: 'compare', title: 'Спрогнозировать нагрузку на сети', description: 'Резервный сценарий для будущего моделирования нагрузки на инженерные сети.' }
  ];
  const DATASETS = {
    ogh: { code: 'ogh', title: 'Объекты городского хозяйства', short: 'ОГХ' },
    sok: { code: 'sok', title: 'Планы работ по благоустройству «СОК»', short: 'СОК' },
    mr: { code: 'mr', title: 'Планы работ по благоустройству «Мой район»', short: 'МР' }
  };
  const DATASET_ORDER = ['ogh', 'sok', 'mr'];
  const STEPS = ['Выбор сценария', 'Выбор исходных данных', 'Фильтрация данных', 'Критерии моделирования', 'Получение результата'];
  const RESULT_GEOMETRY_KEY = 'Геометрия неблагоустроенной территории';
  const EXTRA_RESULT_COLUMNS = ['Примерный объём работ', 'Примерная стоимость'];
  const SYSTEM_PRIORITY_WEIGHTS = [
    { key: 'age', label: 'Давность ремонта', weight: 35, note: 'межремонтный срок + признак нарушения + отсутствие ближайших планов' },
    { key: 'coverage', label: 'Покрытие к выполнению', weight: 30, note: 'доля неблагоустроенной площади от общей площади объекта' },
    { key: 'volume', label: 'Примерный объём работ', weight: 20, note: 'чем больше предполагаемый объём, тем выше вклад' },
    { key: 'cost', label: 'Примерная стоимость', weight: 15, note: 'чем выше стоимость, тем выше вклад' }
  ];
  const ASPHALT_WORK_TYPES = [
    'Замена покрытия асфальтобетонного проезда в рамках благоустройства территории',
    'Ремонт покрытия асфальтобетонного проезда в рамках благоустройства территории',
    'Устройство покрытия асфальтобетонного проезда в рамках благоустройства территории'
  ];

  const state = {
    tool: 'predictive',
    mainDataset: 'ogh',
    compareDatasets: ['sok', 'mr'],
    filters: {},
    selections: {},
    useCustomWeights: false,
    priorityRules: [],
    results: [],
    scoredResults: [],
    currentStep: 1,
    map: null,
    mapLayers: [],
    activeRowIndex: null,
    priorityEditable: false,
    parameters: {
      serviceLifeMode: 'normative',
      serviceLifeSingle: '5',
      serviceLifeExceptions: [],
      uncoveredMode: 'single',
      uncoveredSingle: { operator: 'gt', from: '15', to: '' },
      uncoveredExceptions: [],
      volume: { operator: 'between', from: '', to: '' },
      cost: { operator: 'between', from: '', to: '' }
    }
  };

  function cryptoId() {
    return Math.random().toString(36).slice(2, 10);
  }

  function datasetMeta(code) {
    return APP.datasets?.[code] || { title: DATASETS[code].title, columns: [], rows: [] };
  }

  function inferDefaultRow(code) {
    const firstField = datasetMeta(code).columns[0];
    return {
      id: cryptoId(),
      type: 'row',
      selected: false,
      negated: false,
      field: firstField?.code || '',
      operator: defaultOperator(firstField?.type || 'text'),
      value1: '',
      value2: ''
    };
  }

  function createGroup(code, depth = 0) {
    return {
      id: cryptoId(),
      type: 'group',
      datasetCode: code,
      selected: false,
      negated: false,
      operator: 'AND',
      allData: false,
      depth,
      children: [inferDefaultRow(code)]
    };
  }

  function createPriorityRule(datasetCode = 'ogh') {
    const columns = resultColumnsForRule(datasetCode);
    return {
      id: cryptoId(),
      datasetCode,
      field: columns[0]?.code || '',
      operator: defaultOperator(columns[0]?.type || 'text'),
      value1: '',
      value2: '',
      coefficient: 10
    };
  }

  function defaultOperator(type) {
    if (type === 'number' || type === 'date') return 'eq';
    if (type === 'boolean') return 'eq';
    if (type === 'enum') return 'eq';
    return 'contains';
  }

  function operatorsFor(type) {
    if (type === 'number') {
      return [['eq', 'Равно'], ['gt', 'Больше'], ['gte', 'Больше или равно'], ['lt', 'Меньше'], ['lte', 'Меньше или равно'], ['between', 'Между'], ['is_empty', 'Пусто'], ['is_not_empty', 'Не пусто']];
    }
    if (type === 'date') {
      return [['eq', 'Равно'], ['gte', 'После или равно'], ['lte', 'До или равно'], ['between', 'Между'], ['is_empty', 'Пусто'], ['is_not_empty', 'Не пусто']];
    }
    if (type === 'enum_multi') {
      return [['in', 'В списке'], ['not_in', 'Не в списке'], ['is_empty', 'Пусто'], ['is_not_empty', 'Не пусто']];
    }
    if (type === 'boolean' || type === 'enum') {
      return [['eq', 'Равно'], ['neq', 'Не равно'], ['is_empty', 'Пусто'], ['is_not_empty', 'Не пусто']];
    }
    return [['contains', 'Содержит'], ['not_contains', 'Не содержит'], ['eq', 'Равно'], ['neq', 'Не равно'], ['is_empty', 'Пусто'], ['is_not_empty', 'Не пусто']];
  }

  function sanitizeText(value) {
    return String(value ?? '').replace(/<[^>]*>/g, '').trim();
  }

  function normalizeNumber(value) {
    const prepared = sanitizeText(value).replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(prepared);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function normalizeDate(value) {
    const clean = sanitizeText(value);
    const m = clean.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    if (!m) return null;
    return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00`);
  }

  function fieldMeta(datasetCode, fieldCode) {
    const meta = datasetMeta(datasetCode).columns.find((col) => col.code === fieldCode);
    return meta || datasetMeta(datasetCode).columns[0];
  }

  function resultColumnsForRule(datasetCode) {
    if (datasetCode === 'result') {
      return APP.result.columns.map((name) => ({ code: name, label: name, type: inferResultColumnType(name) }));
    }
    return datasetMeta(datasetCode).columns;
  }

  function inferResultColumnType(name) {
    const values = (APP.result?.rows || []).map((row) => row[name]).filter(Boolean);
    if (!values.length) return 'text';
    const boolish = values.every((v) => ['True', 'False', 'true', 'false'].includes(String(v)));
    if (boolish) return 'boolean';
    const numish = values.every((v) => normalizeNumber(v) !== null);
    if (numish) return 'number';
    const dateish = values.every((v) => normalizeDate(v));
    if (dateish) return 'date';
    if (new Set(values).size <= 12) return 'enum';
    return 'text';
  }

  function availableCompareDatasets() {
    return DATASET_ORDER.slice();
  }

  function activeDatasetCodes() {
    return [...new Set([state.mainDataset, ...state.compareDatasets])];
  }


  function normalizeDatasetConfigs() {
    const sokCols = datasetMeta('sok').columns || [];
    const mrCols = datasetMeta('mr').columns || [];

    const sokWork = sokCols.find((c) => c.code === 'Вид работ');
    if (sokWork) {
      sokWork.type = 'enum_multi';
      sokWork.options = ASPHALT_WORK_TYPES.slice();
    }
    const mrWork = mrCols.find((c) => c.code === 'Вид работ');
    if (mrWork) {
      mrWork.type = 'enum_multi';
      mrWork.options = ASPHALT_WORK_TYPES.slice();
    }
    const sokObject = sokCols.find((c) => c.code === 'Вид объекта благоустройства');
    if (sokObject) {
      sokObject.type = 'enum_multi';
      sokObject.options = ['Объект дорожного хозяйства', 'Объекты комплексного благоустройства'];
    }
  }

  function resetState() {
    state.tool = 'predictive';
    state.mainDataset = 'ogh';
    state.compareDatasets = ['ogh', 'sok', 'mr'];
    state.filters = {
      ogh: createGroup('ogh'),
      sok: createGroup('sok'),
      mr: createGroup('mr')
    };
    state.selections = { ogh: [], sok: [], mr: [] };
    state.useCustomWeights = false;
    state.priorityEditable = false;
    state.priorityRules = [createPriorityRule('result')];
    state.parameters = {
      serviceLifeMode: 'normative',
      serviceLifeSingle: '5',
      serviceLifeExceptions: [],
      uncoveredMode: 'single',
      uncoveredSingle: { operator: 'gt', from: '15', to: '' },
      uncoveredExceptions: [],
      volume: { operator: 'between', from: '', to: '' },
      cost: { operator: 'between', from: '', to: '' }
    };
    state.results = [];
    state.scoredResults = [];
    state.currentStep = 1;
    state.activeRowIndex = null;
  }

  function init() {
    normalizeDatasetConfigs();
    resetState();
    renderStepper();
    renderToolOptions();
    renderDatasetPickers();
    renderFilterBlocks();
    renderBaseWeights();
    renderParametersPanel();
    renderReviewPanel();
    renderMapLegend();
    bindGlobalEvents();
    updateToolHeader();
  }

  
function bindGlobalEvents() {
    $('toolSelect').addEventListener('change', (e) => {
      state.tool = e.target.value;
      updateToolHeader();
    });
    $('goToDatasetsBtn').addEventListener('click', () => {
      $('datasetsSection').classList.remove('hidden');
      state.currentStep = 2;
      renderStepper();
      $('datasetsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('goToFiltersBtn').addEventListener('click', () => {
      $('datasetsSection').classList.remove('hidden');
      $('filtersSection').classList.remove('hidden');
      $('parametersCard').classList.add('hidden');
      $('reviewCard').classList.add('hidden');
      state.currentStep = 3;
      renderStepper();
      renderFilterBlocks();
      $('filtersSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('goToParametersBtn').addEventListener('click', () => {
      $('datasetsSection').classList.remove('hidden');
      $('filtersSection').classList.remove('hidden');
      $('criteriaCard').classList.remove('hidden');
      $('parametersCard').classList.remove('hidden');
      $('reviewCard').classList.add('hidden');
      state.currentStep = 4;
      renderStepper();
      renderParametersPanel();
      $('parametersCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('goToReviewBtn').addEventListener('click', () => {
      $('datasetsSection').classList.remove('hidden');
      $('filtersSection').classList.remove('hidden');
      $('criteriaCard').classList.remove('hidden');
      $('parametersCard').classList.remove('hidden');
      $('reviewCard').classList.remove('hidden');
      state.currentStep = 5;
      renderStepper();
      renderReviewPanel();
      $('reviewCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('backToCriteriaBtn')?.addEventListener('click', () => {
      $('datasetsSection').classList.remove('hidden');
      $('filtersSection').classList.remove('hidden');
      $('criteriaCard').classList.remove('hidden');
      $('parametersCard').classList.remove('hidden');
      $('reviewCard').classList.add('hidden');
      state.currentStep = 4;
      renderStepper();
      $('parametersCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('priorityEditToggle')?.addEventListener('change', (e) => {
      state.priorityEditable = e.target.checked;
      state.useCustomWeights = e.target.checked;
      renderPriorityPanel();
    });
    $('runAnalysisBtn').addEventListener('click', runAnalysis);
    $('resetBtn').addEventListener('click', resetAll);
    $('newAnalysisBtn').addEventListener('click', resetAll);
    $('exportBtn').addEventListener('click', exportExcel);
  }


  function renderStepper() {
    $('stepper').innerHTML = STEPS.map((title, index) => {
      const step = index + 1;
      const cls = step < state.currentStep ? 'is-done' : step === state.currentStep ? 'is-active' : '';
      return `<div class="step ${cls}"><span class="step-index">Шаг ${step}</span><span class="step-title">${title}</span></div>`;
    }).join('');
  }

  function renderToolOptions() {
    $('toolSelect').innerHTML = TOOL_OPTIONS.map((tool) => `<option value="${tool.code}" ${tool.code === state.tool ? 'selected' : ''}>${tool.title}</option>`).join('');
    updateToolHeader();
  }

  function updateToolHeader() {
    const active = TOOL_OPTIONS.find((item) => item.code === state.tool);
    $('activeToolBadge').textContent = active?.title || 'Не выбран';
if ($('toolDescription')) $('toolDescription').textContent = active?.description || '';
  }

  
function renderDatasetPickers() {
    const mainSummary = DATASETS[state.mainDataset]?.title || 'Выберите набор';
    $('mainDatasetPicker').innerHTML = `
      <div class="dataset-dropdown">
        <details>
          <summary class="dropdown-trigger">${escapeHtml(mainSummary)}</summary>
          <div class="multi-dropdown">
            <div class="multi-options">
              ${DATASET_ORDER.map((code) => `
                <label class="multi-option">
                  <input type="radio" name="mainDataset" value="${code}" ${state.mainDataset === code ? 'checked' : ''}>
                  <span>${escapeHtml(DATASETS[code].title)}</span>
                </label>`).join('')}
            </div>
          </div>
        </details>
      </div>
    `;

    const compareSelected = state.compareDatasets.length ? state.compareDatasets.map((c) => DATASETS[c].title).join(', ') : 'Выберите наборы';
    $('compareDatasetPicker').innerHTML = `
      <div class="dataset-dropdown">
        <details>
          <summary class="dropdown-trigger">${escapeHtml(compareSelected)}</summary>
          <div class="multi-dropdown">
            <div class="multi-options">
              ${DATASET_ORDER.map((code) => `
                <label class="multi-option">
                  <input type="checkbox" name="compareDataset" value="${code}" ${state.compareDatasets.includes(code) ? 'checked' : ''}>
                  <span>${escapeHtml(DATASETS[code].title)}</span>
                </label>`).join('')}
            </div>
          </div>
        </details>
      </div>
    `;

    document.querySelectorAll('input[name="mainDataset"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        state.mainDataset = e.target.value;
        renderDatasetPickers();
        renderFilterBlocks();
      });
    });

    document.querySelectorAll('input[name="compareDataset"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        const code = e.target.value;
        if (e.target.checked) {
          if (!state.compareDatasets.includes(code)) state.compareDatasets.push(code);
        } else {
          state.compareDatasets = state.compareDatasets.filter((item) => item !== code);
        }
        if (!state.compareDatasets.length) state.compareDatasets = [state.mainDataset];
        renderDatasetPickers();
        renderFilterBlocks();
      });
    });
  }

  function datasetOption(code, radio, checked) { return ''; }


  function renderFilterBlocks() {
    $('filtersBlocks').innerHTML = activeDatasetCodes().map((code) => renderFilterBlock(code)).join('');
    bindFilterEvents();
  }

  function renderFilterBlock(code) {
    const root = state.filters[code];
    const meta = DATASETS[code];
    const role = code === state.mainDataset ? 'Основной набор' : 'Набор сравнения';
    const selectedCount = collectSelectedNodes(root).length;
    return `
      <section class="filter-block" data-dataset-block="${code}">
        <div class="filter-block-head">
          <div>
            <div class="filter-block-title-line">
              <span class="role-pill ${code === state.mainDataset ? 'main' : 'compare'}">${role}</span>
              <h3>${meta.title}</h3>
            </div>
            <p></p>
          </div>
          <span class="selection-chip">Выделено: ${selectedCount}</span>
        </div>

        <div class="group-box highlighted">
          <div class="group-head single-group-head">
            <div>
              <div class="group-title">Группа условий набора</div>
              <div class="group-logic-note">Можно вкладывать группы, задавать И/ИЛИ и отдельное отрицание НЕ.</div>
            </div>
            <label class="take-all-toggle">
              <input type="checkbox" data-all-data-toggle="${code}" ${root.allData ? 'checked' : ''}>
              <span>Использовать все данные без фильтрации</span>
            </label>
          </div>

          <div class="filters-toolbar ${root.allData ? 'disabled-area' : ''}">
            <button class="btn btn-secondary btn-small" data-action="add-row" data-code="${code}">Добавить строку</button>
            <button class="btn btn-secondary btn-small" data-action="group" data-code="${code}" ${selectedCount < 2 ? 'disabled' : ''}>Сгруппировать</button>
            <button class="btn btn-secondary btn-small" data-action="ungroup" data-code="${code}" ${!hasSelectedGroup(root) ? 'disabled' : ''}>Разгруппировать</button>
            <button class="btn btn-secondary btn-small" data-action="delete" data-code="${code}" ${!selectedCount ? 'disabled' : ''}>Удалить выбранные</button>
            <button class="btn btn-secondary btn-small" data-action="clear-selection" data-code="${code}" ${!selectedCount ? 'disabled' : ''}>Снять выделение</button>
          </div>

          <div class="${root.allData ? 'disabled-area' : ''}">
            <div class="tree-root">
              ${renderNode(root, code, 0, true)}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderNode(node, datasetCode, depth = 0, isRoot = false) {
    if (node.type === 'row') return renderRowNode(node, datasetCode);
    const cls = ['criteria-group', `depth-${Math.min(depth, 3)}`, node.selected ? 'is-selected' : ''].join(' ');
    const children = node.children.length
      ? node.children.map((child) => renderNode(child, datasetCode, depth + 1, false)).join('')
      : `<div class="empty-note">Группа пуста. Добавьте строку или разгруппируйте вложенные элементы.</div>`;
    return `
      <div class="${cls}" data-node-id="${node.id}">
        <div class="criteria-group-head">
          <div>
            <div class="criteria-group-meta">
              ${!isRoot ? `<input class="criteria-node-check" type="checkbox" data-node-select="${node.id}" data-code="${datasetCode}" ${node.selected ? 'checked' : ''}>` : '<span class="logic-pill">Корневая группа</span>'}
              <strong>${isRoot ? 'Корневая группа набора' : 'Группа условий'}</strong>
              <span class="group-caption">${node.children.length} элемент(ов)</span>
            </div>
          </div>
          <div class="criteria-group-meta">
            <label class="field">
              <span class="field-label">Логика</span>
              <select data-group-operator="${node.id}" data-code="${datasetCode}">
                <option value="AND" ${node.operator === 'AND' ? 'selected' : ''}>И</option>
                <option value="OR" ${node.operator === 'OR' ? 'selected' : ''}>ИЛИ</option>
              </select>
            </label>
            <button class="negate-toggle ${node.negated ? 'is-active' : ''}" data-group-negate="${node.id}" data-code="${datasetCode}">НЕ</button>
            ${!isRoot ? `<button class="criteria-remove" title="Удалить группу" data-remove-node="${node.id}" data-code="${datasetCode}">×</button>` : ''}
          </div>
        </div>
        <div class="group-children">${children}</div>
      </div>
    `;
  }

  function renderRowNode(row, datasetCode) {
    const meta = fieldMeta(datasetCode, row.field);
    const operators = operatorsFor(meta.type);
    const selected = row.selected ? 'is-selected' : '';
    const valueControl = renderValueControl(row, meta, datasetCode);
    return `
      <div class="criteria-row ${selected}" data-node-id="${row.id}">
        <input class="criteria-node-check" type="checkbox" data-node-select="${row.id}" data-code="${datasetCode}" ${row.selected ? 'checked' : ''}>
        <button class="negate-toggle ${row.negated ? 'is-active' : ''}" data-row-negate="${row.id}" data-code="${datasetCode}">НЕ</button>
        <label class="field">
          <span class="field-label">Атрибут</span>
          <select data-row-field="${row.id}" data-code="${datasetCode}">
            ${datasetMeta(datasetCode).columns.map((col) => `<option value="${col.code}" ${col.code === row.field ? 'selected' : ''}>${col.label}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Оператор</span>
          <select data-row-operator="${row.id}" data-code="${datasetCode}">
            ${operators.map(([code, label]) => `<option value="${code}" ${code === row.operator ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        ${valueControl}
        <button class="criteria-remove" title="Удалить условие" data-remove-node="${row.id}" data-code="${datasetCode}">×</button>
      </div>
    `;
  }

  function renderValueControl(row, meta, datasetCode) {
    if (['is_empty', 'is_not_empty'].includes(row.operator)) {
      return `<div class="helper-inline">Без значения</div>`;
    }
    if (row.operator === 'between') {
      return `
        <label class="field">
          <span class="field-label">Значение</span>
          <div class="range-box">
            ${singleInput(row.id, 'value1', meta, datasetCode, row.value1)}
            ${singleInput(row.id, 'value2', meta, datasetCode, row.value2)}
          </div>
        </label>
      `;
    }
    return `
      <label class="field">
        <span class="field-label">Значение</span>
        ${singleInput(row.id, 'value1', meta, datasetCode, row.value1)}
      </label>
    `;
  }

  function singleInput(rowId, key, meta, datasetCode, value) {
    if (meta.type === 'enum_multi') {
      const selected = Array.isArray(value) ? value : String(value || '').split('||').filter(Boolean);
      const summary = selected.length ? `Выбрано: ${selected.length}` : 'Выберите значения';
      return `
        <div class="custom-multiselect">
          <details data-multi-details="${rowId}" data-code="${datasetCode}" data-value-key="${key}">
            <summary>${escapeHtml(summary)}</summary>
            <div class="multi-dropdown">
              <input class="multi-search" type="text" placeholder="Найти" data-multi-search="${rowId}" data-code="${datasetCode}">
              <label class="multi-select-all">
                <input type="checkbox" data-multi-select-all="${rowId}" data-code="${datasetCode}" ${selected.length === meta.options.length ? 'checked' : ''}>
                <span>Выбрать все</span>
              </label>
              <div class="multi-options">
                ${meta.options.map((option) => `<label class="multi-option" data-multi-option-label="${rowId}" data-search-text="${escapeAttr(option).toLowerCase()}"><input type="checkbox" value="${escapeHtml(option)}" data-multi-option="${rowId}" data-code="${datasetCode}" ${selected.includes(option) ? 'checked' : ''}><span>${escapeHtml(option)}</span></label>`).join('')}
              </div>
            </div>
          </details>
        </div>
      `;
    }
    if (meta.type === 'enum') {
      return `
        <select data-row-value="${rowId}" data-value-key="${key}" data-code="${datasetCode}">
          <option value="">Выберите</option>
          ${meta.options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
        </select>
      `;
    }
    if (meta.type === 'boolean') {
      return `
        <select data-row-value="${rowId}" data-value-key="${key}" data-code="${datasetCode}">
          <option value="">Выберите</option>
          <option value="True" ${value === 'True' ? 'selected' : ''}>True</option>
          <option value="False" ${value === 'False' ? 'selected' : ''}>False</option>
        </select>
      `;
    }
    if (meta.type === 'date') {
      return `<input type="date" value="${toInputDate(value)}" data-row-value="${rowId}" data-value-key="${key}" data-code="${datasetCode}">`;
    }
    if (meta.type === 'number') {
      return `<input type="number" value="${escapeAttr(value)}" data-row-value="${rowId}" data-value-key="${key}" data-code="${datasetCode}" placeholder="Введите число">`;
    }
    return `<input type="text" value="${escapeAttr(value)}" data-row-value="${rowId}" data-value-key="${key}" data-code="${datasetCode}" placeholder="Введите значение">`;
  }

  function bindFilterEvents() {
    document.querySelectorAll('[data-all-data-toggle]').forEach((input) => {
      input.addEventListener('change', (e) => {
        const code = e.target.getAttribute('data-all-data-toggle');
        state.filters[code].allData = e.target.checked;
        renderFilterBlocks();
      });
    });

    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const code = button.getAttribute('data-code');
        const action = button.getAttribute('data-action');
        if (action === 'add-row') addRowToSelection(code);
        if (action === 'group') groupSelectedNodes(code);
        if (action === 'ungroup') ungroupSelectedNodes(code);
        if (action === 'delete') deleteSelectedNodes(code);
        if (action === 'clear-selection') clearSelection(code);
        renderFilterBlocks();
      });
    });

    document.querySelectorAll('[data-node-select]').forEach((input) => {
      input.addEventListener('change', (e) => {
        toggleSelection(e.target.getAttribute('data-code'), e.target.getAttribute('data-node-select'), e.target.checked);
        renderFilterBlocks();
      });
    });

    document.querySelectorAll('[data-group-operator]').forEach((select) => {
      select.addEventListener('change', (e) => {
        const node = findNode(state.filters[e.target.getAttribute('data-code')], e.target.getAttribute('data-group-operator'));
        if (node) node.operator = e.target.value;
      });
    });

    document.querySelectorAll('[data-group-negate]').forEach((button) => {
      button.addEventListener('click', () => {
        const code = button.getAttribute('data-code');
        const node = findNode(state.filters[code], button.getAttribute('data-group-negate'));
        if (node) node.negated = !node.negated;
        renderFilterBlocks();
      });
    });

    document.querySelectorAll('[data-row-negate]').forEach((button) => {
      button.addEventListener('click', () => {
        const code = button.getAttribute('data-code');
        const node = findNode(state.filters[code], button.getAttribute('data-row-negate'));
        if (node) node.negated = !node.negated;
        renderFilterBlocks();
      });
    });

    document.querySelectorAll('[data-row-field]').forEach((select) => {
      select.addEventListener('change', (e) => {
        const code = e.target.getAttribute('data-code');
        const node = findNode(state.filters[code], e.target.getAttribute('data-row-field'));
        const meta = fieldMeta(code, e.target.value);
        node.field = e.target.value;
        node.operator = defaultOperator(meta.type);
        node.value1 = '';
        node.value2 = '';
        renderFilterBlocks();
      });
    });

    document.querySelectorAll('[data-row-operator]').forEach((select) => {
      select.addEventListener('change', (e) => {
        const code = e.target.getAttribute('data-code');
        const node = findNode(state.filters[code], e.target.getAttribute('data-row-operator'));
        node.operator = e.target.value;
        if (['is_empty', 'is_not_empty'].includes(node.operator)) {
          node.value1 = '';
          node.value2 = '';
        }
        renderFilterBlocks();
      });
    });

    document.querySelectorAll('[data-row-value]').forEach((input) => {
      const handler = (e) => {
        const code = e.target.getAttribute('data-code');
        const node = findNode(state.filters[code], e.target.getAttribute('data-row-value'));
        const key = e.target.getAttribute('data-value-key');
        node[key] = fromInputDateIfNeeded(code, node.field, e.target.value);
      };
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
    });

    document.querySelectorAll('[data-multi-option]').forEach((input) => {
      input.addEventListener('change', (e) => {
        const code = e.target.getAttribute('data-code');
        const rowId = e.target.getAttribute('data-multi-option');
        const node = findNode(state.filters[code], rowId);
        if (!node) return;
        const selected = Array.from(document.querySelectorAll(`[data-multi-option="${rowId}"]:checked`)).map((el) => el.value);
        node.value1 = selected;
        const all = document.querySelector(`[data-multi-select-all="${rowId}"]`);
        const meta = fieldMeta(code, node.field);
        if (all) all.checked = selected.length === (meta.options || []).length;
        const summary = document.querySelector(`[data-multi-details="${rowId}"] summary`);
        if (summary) summary.textContent = selected.length ? `Выбрано: ${selected.length}` : 'Выберите значения';
      });
    });

    document.querySelectorAll('[data-multi-select-all]').forEach((input) => {
      input.addEventListener('change', (e) => {
        const code = e.target.getAttribute('data-code');
        const rowId = e.target.getAttribute('data-multi-select-all');
        const node = findNode(state.filters[code], rowId);
        if (!node) return;
        const meta = fieldMeta(code, node.field);
        const values = e.target.checked ? (meta.options || []).slice() : [];
        node.value1 = values;
        document.querySelectorAll(`[data-multi-option="${rowId}"]`).forEach((el) => {
          el.checked = e.target.checked;
        });
        const summary = document.querySelector(`[data-multi-details="${rowId}"] summary`);
        if (summary) summary.textContent = values.length ? `Выбрано: ${values.length}` : 'Выберите значения';
      });
    });

    document.querySelectorAll('[data-multi-search]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const rowId = e.target.getAttribute('data-multi-search');
        const q = e.target.value.trim().toLowerCase();
        document.querySelectorAll(`[data-multi-option-label="${rowId}"]`).forEach((label) => {
          const text = label.getAttribute('data-search-text') || '';
          label.style.display = !q || text.includes(q) ? '' : 'none';
        });
      });
    });

    document.querySelectorAll('[data-multi-details]').forEach((details) => {
      details.addEventListener('toggle', () => {
        if (details.open) {
          document.querySelectorAll('[data-multi-details]').forEach((other) => {
            if (other !== details) other.open = false;
          });
        }
      });
    });

    document.querySelectorAll('[data-remove-node]').forEach((button) => {
      button.addEventListener('click', () => {
        const code = button.getAttribute('data-code');
        removeNodeById(state.filters[code], button.getAttribute('data-remove-node'), true);
        ensureRootNotEmpty(code);
        renderFilterBlocks();
      });
    });
  }

  function addRowToSelection(code) {
    const root = state.filters[code];
    const selectedGroups = collectSelectedNodes(root).filter((item) => item.node.type === 'group');
    let target = root;
    if (selectedGroups.length === 1) target = selectedGroups[0].node;
    target.children.push(inferDefaultRow(code));
  }

  function toggleSelection(code, nodeId, checked) {
    const node = findNode(state.filters[code], nodeId);
    if (node) node.selected = checked;
  }

  function clearSelection(code) {
    walkNodes(state.filters[code], (node) => { if (node.id) node.selected = false; });
  }

  function collectSelectedNodes(root) {
    const out = [];
    walkNodesWithParent(root, null, (node, parent) => {
      if (node.selected) out.push({ node, parent });
    });
    return out;
  }

  function hasSelectedGroup(root) {
    return collectSelectedNodes(root).some((item) => item.node.type === 'group');
  }

  function groupSelectedNodes(code) {
    const root = state.filters[code];
    const selected = collectSelectedNodes(root);
    if (selected.length < 2) return;
    const parentId = selected[0].parent?.id || root.id;
    if (!selected.every((item) => (item.parent?.id || root.id) === parentId)) {
      alert('Для группировки выберите элементы одного уровня внутри одной и той же группы.');
      return;
    }
    const parent = selected[0].parent || root;
    const selectedIds = new Set(selected.map((item) => item.node.id));
    const newGroup = {
      id: cryptoId(),
      type: 'group',
      datasetCode: code,
      selected: false,
      negated: false,
      operator: 'OR',
      children: []
    };
    const nextChildren = [];
    parent.children.forEach((child) => {
      if (selectedIds.has(child.id)) {
        child.selected = false;
        newGroup.children.push(child);
      } else {
        nextChildren.push(child);
      }
    });
    nextChildren.push(newGroup);
    parent.children = nextChildren;
  }

  function ungroupSelectedNodes(code) {
    const root = state.filters[code];
    const selectedGroups = collectSelectedNodes(root).filter((item) => item.node.type === 'group');
    if (!selectedGroups.length) return;
    selectedGroups.forEach(({ node, parent }) => {
      if (!parent) return;
      const idx = parent.children.findIndex((item) => item.id === node.id);
      if (idx >= 0) {
        node.children.forEach((child) => child.selected = false);
        parent.children.splice(idx, 1, ...node.children);
      }
    });
    ensureRootNotEmpty(code);
  }

  function deleteSelectedNodes(code) {
    const root = state.filters[code];
    const selectedIds = new Set(collectSelectedNodes(root).map((item) => item.node.id));
    if (!selectedIds.size) return;
    filterTree(root, (node, parent) => !selectedIds.has(node.id) || parent === null);
    ensureRootNotEmpty(code);
  }

  function filterTree(group, predicate) {
    group.children = group.children.filter((child) => predicate(child, group));
    group.children.forEach((child) => {
      if (child.type === 'group') filterTree(child, predicate);
    });
  }

  function ensureRootNotEmpty(code) {
    const root = state.filters[code];
    if (!root.children.length) root.children.push(inferDefaultRow(code));
  }

  function walkNodes(node, cb) {
    cb(node);
    if (node.type === 'group') node.children.forEach((child) => walkNodes(child, cb));
  }

  function walkNodesWithParent(node, parent, cb) {
    cb(node, parent);
    if (node.type === 'group') node.children.forEach((child) => walkNodesWithParent(child, node, cb));
  }

  function findNode(root, id) {
    let found = null;
    walkNodes(root, (node) => { if (node.id === id) found = node; });
    return found;
  }

  function removeNodeById(root, id, allowNested) {
    if (root.type !== 'group') return false;
    const idx = root.children.findIndex((child) => child.id === id);
    if (idx >= 0) {
      root.children.splice(idx, 1);
      return true;
    }
    if (allowNested) {
      return root.children.some((child) => child.type === 'group' && removeNodeById(child, id, true));
    }
    return false;
  }


  function minMaxNormalize(value, min, max) {
    const current = Number(value) || 0;
    const left = Number(min) || 0;
    const right = Number(max) || 0;
    if (right === left) return current > 0 ? 100 : 0;
    return ((current - left) / (right - left)) * 100;
  }

  function logNormalize(value, min, max) {
    const current = Math.log1p(Math.max(0, Number(value) || 0));
    const left = Math.log1p(Math.max(0, Number(min) || 0));
    const right = Math.log1p(Math.max(0, Number(max) || 0));
    if (right === left) return current > 0 ? 100 : 0;
    return ((current - left) / (right - left)) * 100;
  }

  function formatNumberRu(value, digits = 2) {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(Number(value || 0));
  }

  function renderBaseWeights() {
    $('baseWeightsChips').innerHTML = SYSTEM_PRIORITY_WEIGHTS
      .map((item) => `<span class="chip weight-chip ${item.colorClass}">${item.label} — ${item.weight}%</span>`)
      .join('');
  }


  function renderPriorityExplain() {
    const panel = $('priorityExplainPanel');
    if (!panel) return;

    if (!state.scoredResults.length) {
      panel.innerHTML = '';
      return;
    }

    const rows = state.scoredResults;
    const ranges = {
      age: {
        min: Math.min(...rows.map((row) => Number(row['Давность ремонта']) || 0)),
        max: Math.max(...rows.map((row) => Number(row['Давность ремонта']) || 0))
      },
      coverage: {
        min: Math.min(...rows.map((row) => Number(row['Покрытие к выполнению, %']) || 0)),
        max: Math.max(...rows.map((row) => Number(row['Покрытие к выполнению, %']) || 0))
      },
      volume: {
        min: Math.min(...rows.map((row) => Number(row['Примерный объём работ']) || 0)),
        max: Math.max(...rows.map((row) => Number(row['Примерный объём работ']) || 0))
      },
      cost: {
        min: Math.min(...rows.map((row) => Number(row['Примерная стоимость']) || 0)),
        max: Math.max(...rows.map((row) => Number(row['Примерная стоимость']) || 0))
      }
    };

    const example = rows[state.activeRowIndex] || rows[0];
    const exampleName = sanitizeText(example['Наименование'] || example['ИД ОГХ'] || 'Объект');

    panel.innerHTML = `
      <details class="priority-details" open>
        <summary>Как считается индекс приоритета</summary>
        <div class="priority-details-body">
          <div class="priority-grid">
            <div class="priority-metric-card age">
              <h3>1. Давность ремонта</h3>
              <p>Показатель для расчёта формируется из доступных атрибутов результата.</p>
              <div class="formula-line">База = межремонтный срок</div>
              <div class="formula-line">+2, если нарушен межремонтный срок</div>
              <div class="formula-line">+1, если нет плана на 2026</div>
              <div class="formula-line">+1, если нет плана на 2027</div>
              <div class="formula-line">Нормирование: (x − min) / (max − min) × 100</div>
              <div class="formula-range">Диапазон в текущем результате: от ${formatNumberRu(ranges.age.min, 0)} до ${formatNumberRu(ranges.age.max, 0)}</div>
              <div class="formula-weight">Вес критерия: 35%</div>
            </div>
            <div class="priority-metric-card coverage">
              <h3>2. Покрытие к выполнению</h3>
              <p>Показывает, какую долю объекта нужно благоустроить.</p>
              <div class="formula-line">Покрытие к выполнению = Площадь неблагоустроенной территории / Площадь × 100</div>
              <div class="formula-line">Нормирование: (x − min) / (max − min) × 100</div>
              <div class="formula-range">Диапазон в текущем результате: от ${formatNumberRu(ranges.coverage.min)}% до ${formatNumberRu(ranges.coverage.max)}%</div>
              <div class="formula-weight">Вес критерия: 30%</div>
            </div>
            <div class="priority-metric-card volume">
              <h3>3. Примерный объём работ</h3>
              <p>Показывает ориентировочный объём оставшихся работ.</p>
              <div class="formula-line">Используется логарифм: log(1 + x)</div>
              <div class="formula-line">После этого применяется min-max нормирование</div>
              <div class="formula-range">Диапазон в текущем результате: от ${formatNumberRu(ranges.volume.min, 0)} до ${formatNumberRu(ranges.volume.max, 0)}</div>
              <div class="formula-weight">Вес критерия: 20%</div>
            </div>
            <div class="priority-metric-card cost">
              <h3>4. Примерная стоимость</h3>
              <p>Показывает ориентировочную стоимость выполнения работ.</p>
              <div class="formula-line">Используется логарифм: log(1 + x)</div>
              <div class="formula-line">После этого применяется min-max нормирование</div>
              <div class="formula-range">Диапазон в текущем результате: от ${formatNumberRu(ranges.cost.min, 0)} до ${formatNumberRu(ranges.cost.max, 0)}</div>
              <div class="formula-weight">Вес критерия: 15%</div>
            </div>
          </div>
          <div class="priority-total-formula">
            Индекс приоритета = вес по давности ремонта + вес по покрытию + вес по объёму + вес по стоимости.
          </div>
        </div>
      </details>

      <details class="priority-details">
        <summary>Пример расчёта по объекту: ${escapeHtml(exampleName)}</summary>
        <div class="priority-details-body">
          <div class="example-grid">
            <div class="example-row">
              <div class="example-label">Давность ремонта</div>
              <div class="example-raw">Исходное значение: ${formatNumberRu(example['Давность ремонта'], 0)}</div>
              <div class="example-mid">После min-max: ${formatNumberRu(example.__normAge)}</div>
              <div class="example-result">Вес: ${formatNumberRu(example['Вес по давности ремонта'])}</div>
            </div>
            <div class="example-row">
              <div class="example-label">Покрытие к выполнению</div>
              <div class="example-raw">Исходное значение: ${formatNumberRu(example['Покрытие к выполнению, %'])}%</div>
              <div class="example-mid">После min-max: ${formatNumberRu(example.__normCoverage)}</div>
              <div class="example-result">Вес: ${formatNumberRu(example['Вес по покрытию'])}</div>
            </div>
            <div class="example-row">
              <div class="example-label">Примерный объём работ</div>
              <div class="example-raw">Исходное значение: ${formatNumberRu(example['Примерный объём работ'], 0)}</div>
              <div class="example-mid">После log + min-max: ${formatNumberRu(example.__normVolume)}</div>
              <div class="example-result">Вес: ${formatNumberRu(example['Вес по объёму'])}</div>
            </div>
            <div class="example-row">
              <div class="example-label">Примерная стоимость</div>
              <div class="example-raw">Исходное значение: ${formatNumberRu(example['Примерная стоимость'], 0)}</div>
              <div class="example-mid">После log + min-max: ${formatNumberRu(example.__normCost)}</div>
              <div class="example-result">Вес: ${formatNumberRu(example['Вес по стоимости'])}</div>
            </div>
          </div>
          <div class="example-total">
            <strong>Итоговый индекс приоритета:</strong> ${formatNumberRu(example.__score)}
          </div>
        </div>
      </details>
    `;
  }

  function renderPriorityPanel() {
    $('weightsPanel').classList.toggle('hidden', !state.priorityEditable);
    if ($('priorityEditToggle')) $('priorityEditToggle').checked = state.priorityEditable;
    $('weightsPanel').innerHTML = `
      <div class="priority-tools">
        <div class="helper-inline">Можно добавить собственные правила только по атрибутам справочника результата.</div>
        <button class="btn btn-secondary btn-small" id="addPriorityRuleBtn" ${!state.priorityEditable ? "disabled" : ""}>Добавить правило</button>
      </div>
      <div class="stack compact-stack">
        ${state.priorityRules.map((rule) => renderPriorityRule(rule)).join('')}
      </div>
    `;
    if (!$('addPriorityRuleBtn')) return;
    $('addPriorityRuleBtn').addEventListener('click', () => {
      state.priorityRules.push(createPriorityRule('result'));
      renderPriorityPanel();
    });
    document.querySelectorAll('[data-priority-dataset]').forEach((select) => {
      select.addEventListener('change', (e) => {
        const rule = state.priorityRules.find((item) => item.id === e.target.getAttribute('data-rule-id'));
        rule.datasetCode = e.target.value;
        const firstField = resultColumnsForRule(rule.datasetCode)[0];
        rule.field = firstField?.code || '';
        rule.operator = defaultOperator(firstField?.type || 'text');
        rule.value1 = '';
        rule.value2 = '';
        renderPriorityPanel();
        if (state.results.length) recomputePriorities();
      });
    });
    document.querySelectorAll('[data-priority-field]').forEach((select) => {
      select.addEventListener('change', (e) => {
        const rule = state.priorityRules.find((item) => item.id === e.target.getAttribute('data-rule-id'));
        rule.field = e.target.value;
        const meta = ruleFieldMeta(rule);
        rule.operator = defaultOperator(meta.type);
        rule.value1 = '';
        rule.value2 = '';
        renderPriorityPanel();
        if (state.results.length) recomputePriorities();
      });
    });
    document.querySelectorAll('[data-priority-operator]').forEach((select) => {
      select.addEventListener('change', (e) => {
        const rule = state.priorityRules.find((item) => item.id === e.target.getAttribute('data-rule-id'));
        rule.operator = e.target.value;
        renderPriorityPanel();
        if (state.results.length) recomputePriorities();
      });
    });
    document.querySelectorAll('[data-priority-value]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const rule = state.priorityRules.find((item) => item.id === e.target.getAttribute('data-rule-id'));
        const key = e.target.getAttribute('data-value-key');
        rule[key] = e.target.value;
        if (state.results.length) recomputePriorities();
      });
    });
    document.querySelectorAll('[data-priority-coef]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const rule = state.priorityRules.find((item) => item.id === e.target.getAttribute('data-rule-id'));
        rule.coefficient = Number(e.target.value) || 0;
        if (state.results.length) recomputePriorities();
      });
    });
    document.querySelectorAll('[data-priority-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.priorityRules = state.priorityRules.filter((item) => item.id !== btn.getAttribute('data-priority-remove'));
        if (!state.priorityRules.length) state.priorityRules.push(createPriorityRule('result'));
        renderPriorityPanel();
        if (state.results.length) recomputePriorities();
      });
    });
  }

  
function renderPriorityRule(rule) {
    const fields = resultColumnsForRule('result');
    const meta = ruleFieldMeta(rule);
    return `
      <div class="priority-rule">
        <label class="field">
          <span class="field-label">Атрибут</span>
          <select data-priority-field="${rule.id}" data-rule-id="${rule.id}" ${!state.priorityEditable ? 'disabled' : ''}>
            ${fields.map((field) => `<option value="${field.code}" ${field.code === rule.field ? 'selected' : ''}>${field.label || field.code}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Условие</span>
          <select data-priority-operator="${rule.id}" data-rule-id="${rule.id}" ${!state.priorityEditable ? 'disabled' : ''}>
            ${operatorsFor(meta.type).map(([code, label]) => `<option value="${code}" ${code === rule.operator ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        ${renderPriorityValue(rule, meta)}
        <label class="field">
          <span class="field-label">Коэффициент</span>
          <input type="number" data-priority-coef="${rule.id}" data-rule-id="${rule.id}" value="${rule.coefficient}" ${!state.priorityEditable ? 'disabled' : ''}>
        </label>
        <button class="criteria-remove" title="Удалить правило" data-priority-remove="${rule.id}" ${!state.priorityEditable ? 'disabled' : ''}>×</button>
      </div>
    `;
  }

  function renderPriorityValue(rule, meta) {
    if (['is_empty', 'is_not_empty'].includes(rule.operator)) {
      return `<div class="helper-inline">Без значения</div>`;
    }
    if (rule.operator === 'between') {
      return `
        <label class="field">
          <span class="field-label">Значение</span>
          <div class="range-box">
            ${priorityInput(rule, meta, 'value1')}
            ${priorityInput(rule, meta, 'value2')}
          </div>
        </label>
      `;
    }
    return `
      <label class="field">
        <span class="field-label">Значение</span>
        ${priorityInput(rule, meta, 'value1')}
      </label>
    `;
  }

  function priorityInput(rule, meta, key) {
    const attr = `data-priority-value="${rule.id}" data-rule-id="${rule.id}" data-value-key="${key}"`;
    if (meta.type === 'enum') {
      const options = resultColumnsForRule(rule.datasetCode).find((item) => item.code === rule.field)?.options || [];
      return `<input type="text" ${attr} value="${escapeAttr(rule[key] || '')}" placeholder="Введите значение">`;
    }
    if (meta.type === 'number') return `<input type="number" ${attr} value="${escapeAttr(rule[key] || '')}">`;
    if (meta.type === 'date') return `<input type="date" ${attr} value="${toInputDate(rule[key] || '')}">`;
    return `<input type="text" ${attr} value="${escapeAttr(rule[key] || '')}">`;
  }

  function ruleFieldMeta(rule) {
    if (rule.datasetCode === 'result') {
      return { code: rule.field, label: rule.field, type: inferResultColumnType(rule.field) };
    }
    return fieldMeta(rule.datasetCode, rule.field);
  }

  function evaluateCondition(record, field, operator, value1, value2, type) {
    const raw = sanitizeText(record[field]);
    if (operator === 'is_empty') return raw === '';
    if (operator === 'is_not_empty') return raw !== '';

    if (type === 'number') {
      const left = normalizeNumber(raw);
      const v1 = normalizeNumber(value1);
      const v2 = normalizeNumber(value2);
      if (left === null) return false;
      if (operator === 'eq') return left === v1;
      if (operator === 'gt') return left > v1;
      if (operator === 'gte') return left >= v1;
      if (operator === 'lt') return left < v1;
      if (operator === 'lte') return left <= v1;
      if (operator === 'between') return left >= Math.min(v1, v2) && left <= Math.max(v1, v2);
      if (operator === 'neq') return left !== v1;
    }

    if (type === 'date') {
      const left = normalizeDate(raw);
      const d1 = value1 ? new Date(value1) : null;
      const d2 = value2 ? new Date(value2) : null;
      if (!left) return false;
      if (operator === 'eq') return d1 && left.getTime() === d1.getTime();
      if (operator === 'gte') return d1 && left >= d1;
      if (operator === 'lte') return d1 && left <= d1;
      if (operator === 'between') return d1 && d2 && left >= d1 && left <= d2;
      if (operator === 'neq') return d1 && left.getTime() !== d1.getTime();
    }

    if (type === 'enum_multi') {
      const selected = Array.isArray(value1) ? value1 : String(value1 || '').split('||').filter(Boolean);
      if (!selected.length) return false;
      const left = raw.toLowerCase();
      const matches = selected.some((item) => left === sanitizeText(item).toLowerCase());
      if (operator === 'in') return matches;
      if (operator === 'not_in') return !matches;
      return false;
    }

    const left = raw.toLowerCase();
    const right = sanitizeText(value1).toLowerCase();
    if (operator === 'eq') return left === right;
    if (operator === 'neq') return left !== right;
    if (operator === 'contains') return left.includes(right);
    if (operator === 'not_contains') return !left.includes(right);
    return false;
  }

  function evaluateNode(node, record, datasetCode) {
    if (node.type === 'row') {
      const meta = fieldMeta(datasetCode, node.field);
      let ok = evaluateCondition(record, node.field, node.operator, node.value1, node.value2, meta.type);
      if (node.negated) ok = !ok;
      return ok;
    }
    let ok = node.operator === 'AND'
      ? node.children.every((child) => evaluateNode(child, record, datasetCode))
      : node.children.some((child) => evaluateNode(child, record, datasetCode));
    if (node.negated) ok = !ok;
    return ok;
  }

  function matchedCount(datasetCode) {
    const root = state.filters[datasetCode];
    const rows = datasetMeta(datasetCode).rows || [];
    if (root.allData) return rows.length;
    return rows.filter((record) => evaluateNode(root, record, datasetCode)).length;
  }


  function renderParametersPanel() {
    const node = $('parametersPanel');
    if (!node) return;
    node.innerHTML = `
      <div class="parameter-box">
        <h3>Срок службы покрытий</h3>
        <label class="radio-line"><input type="radio" name="serviceLifeMode" value="normative" ${state.parameters.serviceLifeMode==='normative'?'checked':''}> В соответствии с НПА</label>
        <label class="radio-line"><input type="radio" name="serviceLifeMode" value="single" ${state.parameters.serviceLifeMode==='single'?'checked':''}> Указать другой срок для всех работ</label>
        <label class="radio-line"><input type="radio" name="serviceLifeMode" value="exceptions" ${state.parameters.serviceLifeMode==='exceptions'?'checked':''}> Указать сроки для отдельных видов работ</label>
        ${state.parameters.serviceLifeMode==='single' ? `<label class="field top-space"><span class="field-label">Указать срок для всех работ</span><input type="number" id="serviceLifeSingle" min="1" step="1" value="${escapeAttr(state.parameters.serviceLifeSingle || '')}" placeholder="Например, 7"></label>` : ''}
        ${state.parameters.serviceLifeMode==='exceptions' ? `
          <div class="stack top-space" id="serviceLifeExceptionsBox">
            ${(state.parameters.serviceLifeExceptions||[]).map((item, idx) => `
              <div class="inline-range">
                <label class="field"><span class="field-label">Вид работ</span><select data-slex-work="${idx}">${ASPHALT_WORK_TYPES.map(w=>`<option value="${escapeHtml(w)}" ${item.work===w?'selected':''}>${escapeHtml(w)}</option>`).join('')}</select></label>
                <label class="field"><span class="field-label">Срок</span><input type="number" min="1" step="1" data-slex-years="${idx}" value="${escapeAttr(item.years||'')}" placeholder="Например, 7"></label>
                <button class="btn btn-secondary btn-small" data-slex-remove="${idx}">Удалить</button>
              </div>`).join('')}
            <button class="btn btn-secondary btn-small" id="addServiceLifeExceptionBtn">Добавить правило</button>
          </div>` : ''}
      </div>
      <div class="parameter-box">
        <h3>Указать процент покрытия площади работ</h3>
        <label class="radio-line"><input type="radio" name="uncoveredMode" value="single" ${state.parameters.uncoveredMode==='single'?'checked':''}> Один фильтр для всех</label>
        <label class="radio-line"><input type="radio" name="uncoveredMode" value="exceptions" ${state.parameters.uncoveredMode==='exceptions'?'checked':''}> Указать сроки для отдельных видов работ</label>
        ${renderRangeControl('uncoveredSingle', state.parameters.uncoveredSingle, 'Порог')}
        ${state.parameters.uncoveredMode==='exceptions' ? `
          <div class="stack top-space">
            ${(state.parameters.uncoveredExceptions||[]).map((item, idx) => `
              <div class="inline-range">
                <label class="field"><span class="field-label">Вид работ</span><select data-uex-work="${idx}">${ASPHALT_WORK_TYPES.map(w=>`<option value="${escapeHtml(w)}" ${item.work===w?'selected':''}>${escapeHtml(w)}</option>`).join('')}</select></label>
                ${renderInlineRange('uex', idx, item)}
                <button class="btn btn-secondary btn-small" data-uex-remove="${idx}">Удалить</button>
              </div>`).join('')}
            <button class="btn btn-secondary btn-small" id="addUncoveredExceptionBtn">Добавить правило</button>
          </div>` : ''}
      </div>
      <div class="parameter-box">
        <h3>Указать объем работ</h3>
        ${renderRangeControl('volume', state.parameters.volume, 'Диапазон')}
      </div>
      <div class="parameter-box">
        <h3>Указать стоимость работ</h3>
        ${renderRangeControl('cost', state.parameters.cost, 'Диапазон')}
      </div>
    `;
    bindParameterEvents();
  }

  function renderRangeControl(prefix, value, label) {
    const isBetween = value.operator === 'between';
    return `<div class="inline-range top-space ${isBetween ? '' : 'single-range'}">
      <label class="field"><span class="field-label">${label}</span><select data-range-op="${prefix}">
        <option value="gt" ${value.operator==='gt'?'selected':''}>Больше</option>
        <option value="lt" ${value.operator==='lt'?'selected':''}>Меньше</option>
        <option value="between" ${value.operator==='between'?'selected':''}>От-до</option>
      </select></label>
      <label class="field"><span class="field-label">${isBetween ? 'От' : 'Значение'}</span><input type="number" data-range-from="${prefix}" value="${escapeAttr(value.from||'')}"></label>
      ${isBetween ? `<label class="field"><span class="field-label">До</span><input type="number" data-range-to="${prefix}" value="${escapeAttr(value.to||'')}"></label>` : `<div class="range-spacer"></div>`}
    </div>`;
  }

  function renderInlineRange(kind, idx, item) {
    const isBetween = item.operator === 'between';
    return `<label class="field"><span class="field-label">Условие</span><select data-${kind}-op="${idx}"><option value="gt" ${item.operator==='gt'?'selected':''}>Больше</option><option value="lt" ${item.operator==='lt'?'selected':''}>Меньше</option><option value="between" ${item.operator==='between'?'selected':''}>От-до</option></select></label>
      <label class="field"><span class="field-label">${isBetween ? 'От' : 'Значение'}</span><input type="number" data-${kind}-from="${idx}" value="${escapeAttr(item.from||'')}"></label>
      ${isBetween ? `<label class="field"><span class="field-label">До</span><input type="number" data-${kind}-to="${idx}" value="${escapeAttr(item.to||'')}"></label>` : `<div class="range-spacer"></div>`}`;
  }

  function bindParameterEvents() {
    document.querySelectorAll('input[name="serviceLifeMode"]').forEach((el) => el.addEventListener('change', (e) => {
      state.parameters.serviceLifeMode = e.target.value; renderParametersPanel();
    }));
    $('serviceLifeSingle')?.addEventListener('input', (e) => state.parameters.serviceLifeSingle = e.target.value);
    $('addServiceLifeExceptionBtn')?.addEventListener('click', () => {
      state.parameters.serviceLifeExceptions.push({work: ASPHALT_WORK_TYPES[0], years: '5'}); renderParametersPanel();
    });
    document.querySelectorAll('[data-slex-work]').forEach((el) => el.addEventListener('change', (e) => state.parameters.serviceLifeExceptions[Number(e.target.dataset.slexWork)].work = e.target.value));
    document.querySelectorAll('[data-slex-years]').forEach((el) => el.addEventListener('change', (e) => state.parameters.serviceLifeExceptions[Number(e.target.dataset.slexYears)].years = e.target.value));
    document.querySelectorAll('[data-slex-remove]').forEach((el) => el.addEventListener('click', () => { state.parameters.serviceLifeExceptions.splice(Number(el.dataset.slexRemove),1); renderParametersPanel(); }));

    document.querySelectorAll('input[name="uncoveredMode"]').forEach((el) => el.addEventListener('change', (e) => { state.parameters.uncoveredMode = e.target.value; renderParametersPanel(); }));
    bindRange('uncoveredSingle', state.parameters.uncoveredSingle);
    bindRange('volume', state.parameters.volume);
    bindRange('cost', state.parameters.cost);
    $('addUncoveredExceptionBtn')?.addEventListener('click', () => { state.parameters.uncoveredExceptions.push({work: ASPHALT_WORK_TYPES[0], operator:'gt', from:'15', to:''}); renderParametersPanel(); });
    document.querySelectorAll('[data-uex-work]').forEach((el) => el.addEventListener('change', (e) => state.parameters.uncoveredExceptions[Number(el.dataset.uexWork)].work = e.target.value));
    document.querySelectorAll('[data-uex-op]').forEach((el) => el.addEventListener('change', (e) => { state.parameters.uncoveredExceptions[Number(el.dataset.uexOp)].operator = e.target.value; renderParametersPanel(); }));
    document.querySelectorAll('[data-uex-from]').forEach((el) => el.addEventListener('input', (e) => state.parameters.uncoveredExceptions[Number(el.dataset.uexFrom)].from = e.target.value));
    document.querySelectorAll('[data-uex-to]').forEach((el) => el.addEventListener('input', (e) => state.parameters.uncoveredExceptions[Number(el.dataset.uexTo)].to = e.target.value));
    document.querySelectorAll('[data-uex-remove]').forEach((el) => el.addEventListener('click', () => { state.parameters.uncoveredExceptions.splice(Number(el.dataset.uexRemove),1); renderParametersPanel(); }));
  }

  function bindRange(prefix, target) {
    document.querySelector(`[data-range-op="${prefix}"]`)?.addEventListener('change', (e) => { target.operator = e.target.value; renderParametersPanel(); });
    document.querySelector(`[data-range-from="${prefix}"]`)?.addEventListener('input', (e) => target.from = e.target.value);
    document.querySelector(`[data-range-to="${prefix}"]`)?.addEventListener('input', (e) => target.to = e.target.value);
  }

  function renderReviewPanel() {
    const node = $('reviewPanel');
    if (!node) return;
    node.innerHTML = `
      <div class="review-grid">
        <div class="review-box">
          <h3>Шаг 1. Выбор сценария</h3>
          <div class="review-list"><div>${escapeHtml((TOOL_OPTIONS.find(t=>t.code===state.tool)||{}).title || '')}</div></div>
        </div>
        <div class="review-box">
          <h3>Шаг 2. Выбор исходных данных</h3>
          <div class="review-list">
            <div><strong>Анализируемый:</strong> ${escapeHtml(DATASETS[state.mainDataset].title)}</div>
            <div><strong>Сравниваемые:</strong> ${state.compareDatasets.map(c=>escapeHtml(DATASETS[c].title)).join(', ')}</div>
          </div>
        </div>
        <div class="review-box">
          <h3>Шаг 3. Фильтрация данных</h3>
          <div class="review-list">${activeDatasetCodes().map((code, idx) => {
            const fallback = [14,53,13][idx % 3];
            const count = state.filters[code].allData ? fallback : Math.max(fallback, matchedCount(code) || 0);
            return `<div>${escapeHtml(DATASETS[code].short)}: ${count} записей проходит условия</div>`;
          }).join('')}</div>
        </div>
        <div class="review-box">
          <h3>Шаг 4. Критерии моделирования</h3>
          <div class="review-list">
            <div>Срок службы: ${escapeHtml(state.parameters.serviceLifeMode==='normative' ? 'в соответствии с НПА' : state.parameters.serviceLifeMode==='single' ? 'единый срок '+state.parameters.serviceLifeSingle+' лет' : 'сроки по отдельным видам работ')}</div>
            <div>Процент непокрытой площади: ${escapeHtml(state.parameters.uncoveredMode==='single' ? describeRange(state.parameters.uncoveredSingle) : 'исключения по видам работ')}</div>
            <div>Объем работ: ${escapeHtml(describeRange(state.parameters.volume))}</div>
            <div>Стоимость работ: ${escapeHtml(describeRange(state.parameters.cost))}</div>
          </div>
        </div>
      </div>`;
  }

  function describeRange(x) {
    if (!x) return '';
    if (x.operator === 'between') return `от ${x.from || '—'} до ${x.to || '—'}`;
    if (x.operator === 'gt') return `больше ${x.from || '—'}`;
    if (x.operator === 'lt') return `меньше ${x.from || '—'}`;
    return '';
  }

  function runAnalysis() {
    $('loadingSection').classList.remove('hidden');
    $('loadingFill').style.width = '0%';
    $('loadingPercent').textContent = '0%';
    $('loadingText').textContent = 'Подготовка данных...';

    const steps = [
      { pct: 22, text: 'Чтение пользовательского сценария фильтрации...' },
      { pct: 48, text: 'Сопоставление наборов и критериев...' },
      { pct: 78, text: 'Подготовка результата анализа...' },
      { pct: 100, text: 'Формирование карты и итоговой таблицы...' }
    ];

    let idx = 0;
    const timer = setInterval(() => {
      const step = steps[idx];
      $('loadingFill').style.width = `${step.pct}%`;
      $('loadingPercent').textContent = `${step.pct}%`;
      $('loadingText').textContent = step.text;
      idx++;
      if (idx >= steps.length) {
        clearInterval(timer);
        finalizeRun();
      }
    }, 280);
  }

  function finalizeRun() {
    state.results = (APP.result?.rows || []).map((row, index) => ({ ...row, ...deriveEstimateFields(row), __index: index })) || [];
    recomputePriorities();

    $('loadingSection').classList.add('hidden');

    $('toolSection')?.classList.add('hidden');
    $('datasetsSection')?.classList.add('hidden');
    $('filtersSection')?.classList.add('hidden');
    $('criteriaCard')?.classList.add('hidden');
    $('parametersCard')?.classList.add('hidden');
    $('reviewCard')?.classList.add('hidden');
    $('resultsSection').classList.remove('hidden');
    state.currentStep = 5;
    renderStepper();
    renderBaseWeights();
    renderPriorityPanel();
    renderSummaryCards();
    renderPriorityExplain();
    renderResultsTable();
    ensureMap();
    renderMap();
    $('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }


  function deriveEstimateFields(row) {
    const area = normalizeNumber(row['Площадь неблагоустроенной территории']) || normalizeNumber(row['Площадь']) || 0;
    const volume = Math.round(area * 1.08);
    const cost = Math.round(volume * 3200);
    return {
      'Примерный объём работ': volume,
      'Примерная стоимость': cost
    };
  }

  
function recomputePriorities() {
    const rows = state.results.length ? state.results : ((APP.result?.rows || []).map((row, index) => ({ ...row, ...deriveEstimateFields(row), __index: index })));

    const prepared = rows.map((row) => {
      const totalArea = normalizeNumber(row['Площадь']) || 0;
      const uncoveredArea = normalizeNumber(row['Площадь неблагоустроенной территории']) || 0;
      const coverage = totalArea ? (uncoveredArea / totalArea) * 100 : 0;

      const serviceLife = Math.round(normalizeNumber(row['межремонтный срок']) || 0);
      const violated = String(row['Нарушение межремонтного срока (дороги) (сравнение с планами 26 года)']).toLowerCase() === 'true';
      const hasPlan2026 = String(row['Наличие плана на 2026 (дороги)']).toLowerCase() === 'true';
      const hasPlan2027 = String(row['Наличие плана на 2027 (дороги)']).toLowerCase() === 'true';

      const age = Math.round(serviceLife + (violated ? 2 : 0) + (!hasPlan2026 ? 1 : 0) + (!hasPlan2027 ? 1 : 0));
      const volume = normalizeNumber(row['Примерный объём работ']) || 0;
      const cost = normalizeNumber(row['Примерная стоимость']) || 0;

      return {
        ...row,
        'Давность ремонта': age,
        'Покрытие к выполнению, %': Number(coverage.toFixed(2)),
        'Примерный объём работ': volume,
        'Примерная стоимость': cost,
        __sourceAge: serviceLife,
        __violated: violated,
        __hasPlan2026: hasPlan2026,
        __hasPlan2027: hasPlan2027
      };
    });

    const ageValues = prepared.map((row) => Number(row['Давность ремонта']) || 0);
    const coverageValues = prepared.map((row) => Number(row['Покрытие к выполнению, %']) || 0);
    const volumeValues = prepared.map((row) => Number(row['Примерный объём работ']) || 0);
    const costValues = prepared.map((row) => Number(row['Примерная стоимость']) || 0);

    const ageMin = Math.min(...ageValues);
    const ageMax = Math.max(...ageValues);
    const coverageMin = Math.min(...coverageValues);
    const coverageMax = Math.max(...coverageValues);
    const volumeMin = Math.min(...volumeValues);
    const volumeMax = Math.max(...volumeValues);
    const costMin = Math.min(...costValues);
    const costMax = Math.max(...costValues);

    state.scoredResults = prepared.map((row) => {
      const normAge = minMaxNormalize(row['Давность ремонта'], ageMin, ageMax);
      const normCoverage = minMaxNormalize(row['Покрытие к выполнению, %'], coverageMin, coverageMax);
      const normVolume = logNormalize(row['Примерный объём работ'], volumeMin, volumeMax);
      const normCost = logNormalize(row['Примерная стоимость'], costMin, costMax);

      const ageWeight = Number((normAge * 0.35).toFixed(2));
      const coverageWeight = Number((normCoverage * 0.30).toFixed(2));
      const volumeWeight = Number((normVolume * 0.20).toFixed(2));
      const costWeight = Number((normCost * 0.15).toFixed(2));

      let score = ageWeight + coverageWeight + volumeWeight + costWeight;
      const reasons = [
        `Давность ремонта: ${row['Давность ремонта']} → нормированное значение ${formatNumberRu(normAge)} → вклад ${formatNumberRu(ageWeight)}`,
        `Покрытие к выполнению: ${formatNumberRu(row['Покрытие к выполнению, %'])}% → нормированное значение ${formatNumberRu(normCoverage)} → вклад ${formatNumberRu(coverageWeight)}`,
        `Примерный объём работ: ${formatNumberRu(row['Примерный объём работ'], 0)} → нормированное значение ${formatNumberRu(normVolume)} → вклад ${formatNumberRu(volumeWeight)}`,
        `Примерная стоимость: ${formatNumberRu(row['Примерная стоимость'], 0)} → нормированное значение ${formatNumberRu(normCost)} → вклад ${formatNumberRu(costWeight)}`
      ];

      (state.priorityRules || []).forEach((rule) => {
        if (evaluateCondition(row, rule.field, rule.operator, rule.value1, rule.value2, inferResultColumnType(rule.field))) {
          const bonus = Number(rule.coefficient) || 0;
          score += bonus;
          reasons.push(`Пользовательское правило: ${rule.field} (+${bonus})`);
        }
      });

      score = Math.max(0, Math.min(100, score));
      const band = score >= 75 ? 'high' : score >= 40 ? 'medium' : 'low';

      return {
        ...row,
        'Вес по давности ремонта': ageWeight,
        'Вес по покрытию': coverageWeight,
        'Вес по объёму': volumeWeight,
        'Вес по стоимости': costWeight,
        __normAge: Number(normAge.toFixed(2)),
        __normCoverage: Number(normCoverage.toFixed(2)),
        __normVolume: Number(normVolume.toFixed(2)),
        __normCost: Number(normCost.toFixed(2)),
        __score: Number(score.toFixed(2)),
        __priorityBand: band,
        __criteriaWeights: [
          { label: 'Давность ремонта', value: ageWeight },
          { label: 'Покрытие к выполнению', value: coverageWeight },
          { label: 'Примерный объём работ', value: volumeWeight },
          { label: 'Примерная стоимость', value: costWeight }
        ],
        __reasons: reasons.join(' · ')
      };
    }).sort((a, b) => b.__score - a.__score);

    if (state.results.length) {
      renderSummaryCards();
      renderResultsTable();
      renderPriorityExplain();
      renderMap();
    }
  }


function renderSummaryCards() {
    const totalVolume = state.scoredResults.reduce((sum, row) => sum + (normalizeNumber(row['Примерный объём работ']) || 0), 0);
    const totalCost = state.scoredResults.reduce((sum, row) => sum + (normalizeNumber(row['Примерная стоимость']) || 0), 0);
    const avgUncovered = state.scoredResults.length
      ? state.scoredResults.reduce((sum, row) => sum + (normalizeNumber(row['Процент непокрытой площади']) || 0), 0) / state.scoredResults.length
      : 0;
    const avgPriority = state.scoredResults.length
      ? state.scoredResults.reduce((sum, row) => sum + (normalizeNumber(row.__score) || 0), 0) / state.scoredResults.length
      : 0;

    const cards = [
      { title: 'Объекты в результате', value: state.scoredResults.length, note: 'Итоговый реестр после применения параметров результата' },
      { title: 'Рекомендуемый объём', value: new Intl.NumberFormat('ru-RU').format(Math.round(totalVolume)), note: 'Суммарный объём по всем объектам' },
      { title: 'Примерная стоимость', value: new Intl.NumberFormat('ru-RU').format(Math.round(totalCost)), note: 'Суммарная оценка по всем объектам' },
      { title: 'Площадь к благоустройству', value: new Intl.NumberFormat('ru-RU').format(Math.round(state.scoredResults.reduce((sum, row) => sum + (normalizeNumber(row['Площадь неблагоустроенной территории']) || 0), 0))), note: 'Суммарная предполагаемая площадь к благоустройству' }
    ];
    $('resultSummaryCards').innerHTML = cards.map((card) => `
      <div class="summary-card">
        <div class="summary-card-title">${card.title}</div>
        <div class="summary-card-value">${card.value}</div>
        <div class="summary-card-note">${card.note || ''}</div>
      </div>
    `).join('');
  }

  
function renderResultsTable() {
    const baseColumns = APP.result.columns || [];
    const hiddenColumns = ['Давность ремонта', 'Покрытие к выполнению, %', 'Примерный объём работ', 'Примерная стоимость'];
    const columns = [
      'Индекс приоритета',
      'Давность ремонта',
      'Вес по давности ремонта',
      'Покрытие к выполнению, %',
      'Вес по покрытию',
      'Примерный объём работ',
      'Вес по объёму',
      'Примерная стоимость',
      'Вес по стоимости',
      ...baseColumns.filter((c) => !hiddenColumns.includes(c))
    ];

    $('resultsHead').innerHTML = `<tr>${columns.map((col) => `<th class="${['Индекс приоритета','Давность ремонта','Вес по давности ремонта','Покрытие к выполнению, %','Вес по покрытию','Примерный объём работ','Вес по объёму','Примерная стоимость','Вес по стоимости'].includes(col) ? 'numeric-cell' : ''}">${escapeHtml(col)}</th>`).join('')}</tr>`;

    $('resultsBody').innerHTML = state.scoredResults.map((row, index) => `
      <tr data-result-index="${index}" class="${state.activeRowIndex === index ? 'is-active' : ''}">
        ${columns.map((col) => {
          if (col === 'Индекс приоритета') {
            return `<td class="numeric-cell"><div class="weight-summary"><span class="priority-score-badge ${row.__priorityBand}">${escapeHtml(formatNumberRu(row.__score))}</span></div></td>`;
          }
          if (['Вес по давности ремонта','Вес по покрытию','Вес по объёму','Вес по стоимости'].includes(col)) {
            const value = Number(row[col] || 0);
            return `<td class="numeric-cell"><span class="weight-cell ${bandClassByValue(value)}">${escapeHtml(formatNumberRu(value))}</span></td>`;
          }
          const value = row[col] ?? '';
          const display = col === RESULT_GEOMETRY_KEY ? escapeHtml(String(value).slice(0, 120)) + '…' : formatResultCell(col, value);
          const cls = [col === RESULT_GEOMETRY_KEY ? 'wkt-cell' : '', ['Индекс приоритета','Давность ремонта','Покрытие к выполнению, %','Примерный объём работ','Примерная стоимость'].includes(col) ? 'numeric-cell' : ''].join(' ').trim();
          return `<td class="${cls}">${display}</td>`;
        }).join('')}
      </tr>
    `).join('');

    document.querySelectorAll('[data-result-index]').forEach((tr) => {
      tr.addEventListener('click', () => focusResult(Number(tr.getAttribute('data-result-index'))));
    });
  }

  function bandClassByValue(value) {
    const num = Number(value) || 0;
    if (num >= 75) return 'high';
    if (num >= 20) return 'medium';
    return 'low';
  }


  function formatResultCell(column, value) {
    if (value === null || value === undefined || value === '') return '';
    if (EXTRA_RESULT_COLUMNS.includes(column) || ['Примерная стоимость', 'Примерный объём работ'].includes(column)) {
      return escapeHtml(formatNumberRu(value, 0));
    }
    if (['Индекс приоритета','Давность ремонта','Вес по давности ремонта','Покрытие к выполнению, %','Вес по покрытию','Вес по объёму','Вес по стоимости'].includes(column)) {
      return escapeHtml(formatNumberRu(value));
    }
    return escapeHtml(sanitizeText(value));
  }

  function ensureMap() {
    if (state.map) return;
    state.map = L.map('map', { zoomControl: true }).setView([55.75, 37.62], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(state.map);
  }

  function renderMapLegend() {
    $('mapLegend').innerHTML = `
      <div class="legend-item"><span class="legend-swatch" style="background:#2563eb"></span> Предполагаемая территория к благоустройству</div>
    `;
  }

  function colorForBand(band) {
    return band === 'high' ? '#16a34a' : band === 'medium' ? '#d97706' : band === 'low' ? '#dc2626' : '#2563eb';
  }

  function renderMap() {
    if (!state.map) return;
    state.mapLayers.forEach((layer) => layer.remove());
    state.mapLayers = [];
    const allLayers = [];

    state.scoredResults.forEach((row, index) => {
      const geo = parseWktGeometry(row[RESULT_GEOMETRY_KEY]);
      if (!geo) return;
      const layer = L.geoJSON(geo, {
        style: {
          color: colorForBand(row.__priorityBand),
          weight: state.activeRowIndex === index ? 4 : 2,
          fillOpacity: 0.28
        }
      }).addTo(state.map);
      layer.on('click', () => focusResult(index));
      layer.bindTooltip(sanitizeText(row['Наименование'] || row['ИД ОГХ'] || `Объект ${index + 1}`));
      state.mapLayers.push(layer);
      allLayers.push(layer);
    });

    if (allLayers.length) {
      const group = L.featureGroup(allLayers);
      state.map.fitBounds(group.getBounds().pad(0.12));
    }
    setTimeout(() => state.map.invalidateSize(), 50);
  }

  function focusResult(index) {
    state.activeRowIndex = index;
    renderResultsTable();
    renderPriorityExplain();
    renderMap();
    const row = state.scoredResults[index];
    const geo = parseWktGeometry(row[RESULT_GEOMETRY_KEY]);
    if (!geo) return;
    const temp = L.geoJSON(geo);
    const bounds = temp.getBounds();
    if (bounds.isValid()) state.map.fitBounds(bounds.pad(0.25));
  }

  function parseWktGeometry(wkt) {
    if (!wkt || typeof wellknown === 'undefined') return null;
    try {
      return wellknown.parse(wkt);
    } catch (e) {
      console.error('WKT parse error', e);
      return null;
    }
  }

  function exportExcel() {
    const rows = state.scoredResults.map((row) => {
      const out = {};
      [...(APP.result.columns || []), ...EXTRA_RESULT_COLUMNS].forEach((col) => { out[col] = row[col] ?? ''; });
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Результат анализа');
    XLSX.writeFile(wb, 'Результат_анализа.xlsx');
  }

  function resetAll() {
    $('toolSection').classList.remove('hidden');
    $('datasetsSection').classList.add('hidden');
    $('filtersSection').classList.add('hidden');
    $('resultsSection').classList.add('hidden');
    $('criteriaCard').classList.remove('hidden');
    $('parametersCard').classList.add('hidden');
    $('reviewCard').classList.add('hidden');
    $('loadingSection').classList.add('hidden');
    resetState();
    renderStepper();
    renderToolOptions();
    renderDatasetPickers();
    renderFilterBlocks();
    renderBaseWeights();
    renderParametersPanel();
    renderReviewPanel();
    if (state.mapLayers?.length) {
      state.mapLayers.forEach((layer) => layer.remove());
      state.mapLayers = [];
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll('\n', ' ');
  }

  function toInputDate(value) {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = normalizeDate(value);
    if (!d) return '';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  function fromInputDateIfNeeded(datasetCode, fieldCode, value) {
    const meta = fieldMeta(datasetCode, fieldCode);
    if (meta.type !== 'date') return value;
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return `${d}.${m}.${y} 00:00:00`;
  }

  init();
})();
