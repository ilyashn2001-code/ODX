
(() => {
  const APP = window.APP_DATA || {};
  const $ = (id) => document.getElementById(id);

  const TOOL_OPTIONS = APP.toolOptions || [];
  const DATASETS = {
    ogh: { code: 'ogh', title: APP.datasets?.ogh?.title || 'Набор ОГХ', short: 'ОГХ' },
    sok: { code: 'sok', title: APP.datasets?.sok?.title || 'Набор благоустройства (СОК)', short: 'СОК' },
    mr: { code: 'mr', title: APP.datasets?.mr?.title || 'Набор благоустройства (МР)', short: 'МР' }
  };
  const DATASET_ORDER = ['ogh', 'sok', 'mr'];
  const STEPS = ['Инструмент', 'Наборы', 'Фильтры', 'Приоритизация', 'Результат'];
  const RESULT_GEOMETRY_KEY = 'Геометрия неблагоустроенной территории';
  const EXTRA_RESULT_COLUMNS = ['Примерный объём работ', 'Примерная стоимость'];
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
    activeRowIndex: null
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
    return DATASET_ORDER.filter((code) => code !== state.mainDataset);
  }

  function activeDatasetCodes() {
    return [state.mainDataset, ...state.compareDatasets];
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
    state.compareDatasets = ['sok', 'mr'];
    state.filters = {
      ogh: createGroup('ogh'),
      sok: createGroup('sok'),
      mr: createGroup('mr')
    };
    state.selections = { ogh: [], sok: [], mr: [] };
    state.useCustomWeights = false;
    state.priorityRules = [createPriorityRule('result')];
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
    renderPriorityPanel();
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
      $('toolSection').classList.add('is-collapsed');
      $('datasetsSection').classList.remove('hidden');
      state.currentStep = 2;
      renderStepper();
      $('datasetsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('goToFiltersBtn').addEventListener('click', () => {
      $('datasetsSection').classList.add('is-collapsed');
      $('filtersSection').classList.remove('hidden');
      state.currentStep = 3;
      renderStepper();
      renderFilterBlocks();
      renderPriorityPanel();
      $('filtersSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('weightsToggle').addEventListener('change', (e) => {
      state.useCustomWeights = e.target.checked;
      $('weightsPanel').classList.toggle('hidden', !state.useCustomWeights);
      if (state.results.length) recomputePriorities();
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
    $('toolDescription').textContent = active?.description || '';
  }

  function renderDatasetPickers() {
    $('mainDatasetPicker').innerHTML = DATASET_ORDER.map((code) => datasetOption(code, true, state.mainDataset === code)).join('');
    $('compareDatasetPicker').innerHTML = availableCompareDatasets().map((code) => datasetOption(code, false, state.compareDatasets.includes(code))).join('');

    document.querySelectorAll('input[name="mainDataset"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        state.mainDataset = e.target.value;
        state.compareDatasets = availableCompareDatasets();
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
        renderFilterBlocks();
      });
    });
  }

  function datasetOption(code, radio, checked) {
    const meta = DATASETS[code];
    const rowsCount = datasetMeta(code).rows.length;
    return `
      <label class="dataset-option">
        <input type="${radio ? 'radio' : 'checkbox'}" name="${radio ? 'mainDataset' : 'compareDataset'}" value="${code}" ${checked ? 'checked' : ''}>
        <div>
          <div class="dataset-option-title">${meta.title}</div>
          
        </div>
      </label>
    `;
  }

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
            <p>Критерии строятся по атрибутам файла CSV.</p>
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
      return `
        <select multiple class="multi-select" data-row-value="${rowId}" data-value-key="${key}" data-code="${datasetCode}">
          ${meta.options.map((option) => `<option value="${escapeHtml(option)}" ${selected.includes(option) ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
        </select>
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
        const meta = fieldMeta(code, node.field);
        if (meta.type === 'enum_multi') {
          node[key] = Array.from(e.target.selectedOptions).map((opt) => opt.value);
        } else {
          node[key] = fromInputDateIfNeeded(code, node.field, e.target.value);
        }
      };
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
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

  function renderBaseWeights() {
    $('baseWeightsChips').innerHTML = [
      '<span class="chip">Результат таблицы и карта берутся из файла результата анализа</span>',
      '<span class="chip">Блок приоритизации сохранён как дополнительная пользовательская настройка</span>',
      '<span class="chip">WKT геометрия отображается на карте</span>'
    ].join('');
  }

  function renderPriorityPanel() {
    $('weightsPanel').classList.toggle('hidden', !state.useCustomWeights);
    $('weightsToggle').checked = state.useCustomWeights;
    $('weightsPanel').innerHTML = `
      <div class="priority-tools">
        <div class="helper-inline">Правила можно настраивать, но в этой версии они не влияют на итоговую таблицу и карту.</div>
        <button class="btn btn-secondary btn-small" id="addPriorityRuleBtn">Добавить правило</button>
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
    const fields = resultColumnsForRule(rule.datasetCode);
    const meta = ruleFieldMeta(rule);
    return `
      <div class="priority-rule">
        <label class="field">
          <span class="field-label">Набор</span>
          <select data-priority-dataset="${rule.id}" data-rule-id="${rule.id}">
            <option value="result" ${rule.datasetCode === 'result' ? 'selected' : ''}>Результат анализа</option>
            <option value="ogh" ${rule.datasetCode === 'ogh' ? 'selected' : ''}>Набор ОГХ</option>
            <option value="sok" ${rule.datasetCode === 'sok' ? 'selected' : ''}>Набор благоустройства (СОК)</option>
            <option value="mr" ${rule.datasetCode === 'mr' ? 'selected' : ''}>Набор благоустройства (МР)</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Атрибут</span>
          <select data-priority-field="${rule.id}" data-rule-id="${rule.id}">
            ${fields.map((field) => `<option value="${field.code}" ${field.code === rule.field ? 'selected' : ''}>${field.label || field.code}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Условие</span>
          <select data-priority-operator="${rule.id}" data-rule-id="${rule.id}">
            ${operatorsFor(meta.type).map(([code, label]) => `<option value="${code}" ${code === rule.operator ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        ${renderPriorityValue(rule, meta)}
        <label class="field">
          <span class="field-label">Коэффициент</span>
          <input type="number" data-priority-coef="${rule.id}" data-rule-id="${rule.id}" value="${rule.coefficient}">
        </label>
        <button class="criteria-remove" title="Удалить правило" data-priority-remove="${rule.id}">×</button>
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
    $('criteriaCard').classList.add('hidden');
    $('launchCard').classList.add('hidden');
    $('resultsSection').classList.remove('hidden');
    state.currentStep = 5;
    renderStepper();
    renderSummaryCards();
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
    state.scoredResults = rows
      .slice()
      .sort((a, b) => (a.__index ?? 0) - (b.__index ?? 0))
      .map((row) => ({ ...row, __score: 0, __priorityBand: 'base' }));
    if (state.results.length) {
      renderSummaryCards();
      renderResultsTable();
      renderMap();
    }
  }

  function renderSummaryCards() {
    const cards = [
      { title: 'Строк в наборе ОГХ', value: datasetMeta('ogh').rows.length, note: `Совпало по фильтрам: ${matchedCount('ogh')}` },
      { title: 'Строк в наборе СОК', value: datasetMeta('sok').rows.length, note: `Совпало по фильтрам: ${matchedCount('sok')}` },
      { title: 'Строк в наборе МР', value: datasetMeta('mr').rows.length, note: `Совпало по фильтрам: ${matchedCount('mr')}` },
      { title: 'Строк в результате', value: state.scoredResults.length, note: 'Все строки и атрибуты из файла результата анализа' }
    ];
    $('resultSummaryCards').innerHTML = cards.map((card) => `
      <div class="summary-card">
        <div class="summary-card-title">${card.title}</div>
        <div class="summary-card-value">${card.value}</div>
        <div class="summary-card-note">${card.note}</div>
      </div>
    `).join('');
  }

  function renderResultsTable() {
    const columns = [...(APP.result.columns || []), ...EXTRA_RESULT_COLUMNS];
    $('resultsHead').innerHTML = `<tr>${columns.map((col) => `<th class="${EXTRA_RESULT_COLUMNS.includes(col) ? 'numeric-cell' : ''}">${escapeHtml(col)}</th>`).join('')}</tr>`;
    $('resultsBody').innerHTML = state.scoredResults.map((row, index) => `
      <tr data-result-index="${index}" class="${state.activeRowIndex === index ? 'is-active' : ''}">
        ${columns.map((col) => {
          const value = row[col] ?? '';
          const display = col === RESULT_GEOMETRY_KEY ? escapeHtml(String(value).slice(0, 120)) + '…' : formatResultCell(col, value);
          const cls = [col === RESULT_GEOMETRY_KEY ? 'wkt-cell' : '', EXTRA_RESULT_COLUMNS.includes(col) ? 'numeric-cell' : ''].join(' ').trim();
          return `<td class="${cls}">${display}</td>`;
        }).join('')}
      </tr>
    `).join('');
    document.querySelectorAll('[data-result-index]').forEach((tr) => {
      tr.addEventListener('click', () => focusResult(Number(tr.getAttribute('data-result-index'))));
    });
  }


  function formatResultCell(column, value) {
    if (value === null || value === undefined || value === '') return '';
    if (EXTRA_RESULT_COLUMNS.includes(column)) {
      return escapeHtml(new Intl.NumberFormat('ru-RU').format(Number(value || 0)));
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
      <div class="legend-item"><span class="legend-swatch" style="background:#2563eb"></span> Объекты результата анализа</div>
    `;
  }

  function colorForBand(band) {
    return band === 'high' ? '#dc2626' : band === 'medium' ? '#d97706' : band === 'low' ? '#16a34a' : '#2563eb';
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
    $('toolSection').classList.remove('is-collapsed');
    $('datasetsSection').classList.add('hidden');
    $('datasetsSection').classList.remove('is-collapsed');
    $('filtersSection').classList.add('hidden');
    $('resultsSection').classList.add('hidden');
    $('criteriaCard').classList.remove('hidden');
    $('launchCard').classList.remove('hidden');
    $('loadingSection').classList.add('hidden');
    resetState();
    renderStepper();
    renderToolOptions();
    renderDatasetPickers();
    renderFilterBlocks();
    renderBaseWeights();
    renderPriorityPanel();
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
