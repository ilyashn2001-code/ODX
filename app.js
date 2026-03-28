
(() => {
  const APP = window.APP_DATA || {};
  const $ = (id) => document.getElementById(id);

  const DATASETS = {
    ogh: { code: 'ogh', title: APP.datasets?.ogh?.title || 'Набор ОГХ', short: 'ОГХ' },
    sok: { code: 'sok', title: APP.datasets?.sok?.title || 'Набор благоустройства (СОК)', short: 'СОК' },
    mr:  { code: 'mr',  title: APP.datasets?.mr?.title  || 'Набор благоустройства (МР)', short: 'МР' }
  };
  const DATASET_ORDER = ['ogh', 'sok', 'mr'];
  const STEPS = ['Инструмент', 'Наборы', 'Критерии', 'Параметры', 'Проверка'];
  const RESULT_GEOMETRY_KEY = 'Геометрия неблагоустроенной территории';

  const state = {
    tool: APP.toolOptions?.[0]?.code || 'predictive',
    mainDataset: 'ogh',
    compareDatasets: ['sok', 'mr'],
    criteria: {},
    parameters: {
      serviceLifeMode: 'normative',
      serviceLifeSingle: '5',
      serviceLifeMixed: {},
      uncoveredMode: 'single',
      uncoveredSingle: { operator: 'gt', from: '15', to: '' },
      uncoveredMixed: {},
      volume: { operator: 'between', from: '', to: '' },
      cost: { operator: 'between', from: '', to: '' }
    },
    baseWeights: { ...(APP.baseWeights || {}) },
    customPriorityRules: [],
    currentStep: 1,
    results: [],
    activeRowIndex: null,
    map: null,
    layers: []
  };

  function datasetMeta(code) {
    return APP.datasets?.[code] || { title: DATASETS[code]?.title || code, columns: [], rows: [] };
  }

  function getResultColumns() {
    return (APP.result?.columns || []).slice();
  }

  function defaultRow(datasetCode) {
    const meta = datasetMeta(datasetCode);
    const first = meta.columns[0];
    return {
      id: cryptoId(),
      field: first?.code || '',
      operator: defaultOperator(first?.type || 'text'),
      value1: '',
      value2: '',
      negated: false,
      join: 'AND',
      clusterId: null
    };
  }

  function createPriorityRule() {
    const fields = resultFieldOptions();
    const first = fields[0];
    return {
      id: cryptoId(),
      field: first?.code || '',
      operator: defaultOperator(first?.type || 'text'),
      value1: '',
      value2: '',
      coefficient: 10
    };
  }

  function initState() {
    DATASET_ORDER.forEach((code) => {
      state.criteria[code] = { allData: false, rows: [defaultRow(code)], selectedRowIds: [], clusterModes: {} };
    });
    APP.asphaltWorkTypes?.forEach((work) => {
      state.parameters.serviceLifeMixed[work] = '5';
      state.parameters.uncoveredMixed[work] = { operator: 'gt', from: '15', to: '' };
    });
    if (!state.customPriorityRules.length) state.customPriorityRules = [createPriorityRule()];
  }

  function cryptoId() {
    return Math.random().toString(36).slice(2, 10);
  }

  function availableCompareDatasets() {
    return DATASET_ORDER.slice();
  }

  function activeDatasetCodes() {
    return [...new Set([state.mainDataset, ...state.compareDatasets.filter(Boolean)])];
  }

  function sanitizeText(value) {
    return String(value ?? '').replace(/<[^>]*>/g, '').trim();
  }

  function normalizeNumber(value) {
    const prepared = sanitizeText(value).replace(/\s/g, '').replace(',', '.');
    if (!prepared) return null;
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
    return datasetMeta(datasetCode).columns.find((col) => col.code === fieldCode) || datasetMeta(datasetCode).columns[0];
  }

  function resultFieldOptions() {
    return getResultColumns().map((name) => ({ code: name, label: name, type: inferResultColumnType(name) }));
  }

  function inferResultColumnType(name) {
    const values = (APP.result?.rows || []).map((row) => row[name]).filter((v) => sanitizeText(v) !== '');
    if (!values.length) return 'text';
    if (values.every((v) => normalizeNumber(v) !== null)) return 'number';
    if (values.every((v) => normalizeDate(v))) return 'date';
    if (new Set(values).size <= 12) return 'enum';
    return 'text';
  }

  function defaultOperator(type) {
    if (type === 'number') return 'eq';
    if (type === 'date') return 'eq';
    if (type === 'enum' || type === 'enum_multi') return 'in';
    return 'contains';
  }

  function operatorsFor(type) {
    if (type === 'number') return [['eq', 'Равно'], ['gt', 'Больше'], ['gte', 'Больше или равно'], ['lt', 'Меньше'], ['lte', 'Меньше или равно'], ['between', 'Между']];
    if (type === 'date') return [['eq', 'Равно'], ['gte', 'После или равно'], ['lte', 'До или равно'], ['between', 'Между']];
    if (type === 'enum_multi') return [['in', 'В списке'], ['not_in', 'Не в списке']];
    if (type === 'enum') return [['in', 'В списке'], ['not_in', 'Не в списке'], ['eq', 'Равно'], ['neq', 'Не равно']];
    return [['contains', 'Содержит'], ['not_contains', 'Не содержит'], ['eq', 'Равно'], ['neq', 'Не равно']];
  }

  function bindGlobalEvents() {
    $('goToDatasetsBtn').addEventListener('click', () => gotoStep(2));
    $('goToFiltersBtn').addEventListener('click', () => {
      if (!state.mainDataset) return alert('Выберите анализируемый набор.');
      if (!state.compareDatasets.length) return alert('Выберите хотя бы один набор для сравнения.');
      gotoStep(3);
    });
    $('goToParametersBtn').addEventListener('click', () => gotoStep(4));
    $('goToReviewBtn').addEventListener('click', () => {
      renderReview();
      gotoStep(5);
    });
    $('runAnalysisBtn').addEventListener('click', runAnalysis);
    $('resetBtn').addEventListener('click', resetAll);
    $('newAnalysisBtn').addEventListener('click', resetAll);
    $('exportBtn').addEventListener('click', exportExcel);
    $('priorityEditToggle')?.addEventListener('change', (e) => { state.priorityEditable = e.target.checked; renderPriorityPanel(); });
    $('toolSelect').addEventListener('change', (e) => {
      state.tool = e.target.value;
      updateToolHeader();
    });

    document.querySelectorAll('input[name="serviceLifeMode"]').forEach((input) => input.addEventListener('change', (e) => {
      state.parameters.serviceLifeMode = e.target.value;
      renderParameters();
    }));
    document.querySelectorAll('input[name="uncoveredMode"]').forEach((input) => input.addEventListener('change', (e) => {
      state.parameters.uncoveredMode = e.target.value;
      renderParameters();
    }));
  }

  function gotoStep(step) {
    state.currentStep = step;
    renderStepper();
    $('datasetsSection').classList.toggle('hidden', step < 2);
    $('filtersSection').classList.toggle('hidden', step < 3);
    $('parametersCard').classList.toggle('hidden', step !== 4);
    $('reviewCard').classList.toggle('hidden', step !== 5);
    if (step >= 2) $('toolSection').classList.add('hidden');
    if (step >= 3) $('datasetsSection').classList.add('hidden');
    if (step >= 4) $('criteriaCard').classList.add('hidden');
    if (step === 5) {
      $('criteriaCard').classList.add('hidden');
      $('parametersCard').classList.add('hidden');
      $('reviewCard').classList.remove('hidden');
    }
    if (step === 3) {
      $('filtersSection').classList.remove('hidden');
      $('criteriaCard').classList.remove('hidden');
      $('parametersCard').classList.add('hidden');
      $('reviewCard').classList.add('hidden');
    }
    if (step === 4) {
      $('filtersSection').classList.remove('hidden');
      $('parametersCard').classList.remove('hidden');
      $('reviewCard').classList.add('hidden');
    }
    scrollToTopCard(step);
  }

  function scrollToTopCard(step) {
    const mapping = {1:'toolSection',2:'datasetsSection',3:'criteriaCard',4:'parametersCard',5:'reviewCard'};
    const el = $(mapping[step]);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderStepper() {
    $('stepper').innerHTML = STEPS.map((title, index) => {
      const stepNumber = index + 1;
      const cls = stepNumber < state.currentStep ? 'is-done' : stepNumber === state.currentStep ? 'is-active' : '';
      return `<div class="step ${cls}"><span class="step-index">Шаг ${stepNumber}</span><span class="step-title">${title}</span></div>`;
    }).join('');
  }

  function renderToolOptions() {
    $('toolSelect').innerHTML = (APP.toolOptions || []).map((tool) => `<option value="${tool.code}" ${tool.code === state.tool ? 'selected' : ''}>${tool.title}</option>`).join('');
    updateToolHeader();
  }

  function updateToolHeader() {
    const active = (APP.toolOptions || []).find((tool) => tool.code === state.tool);
    $('activeToolBadge').textContent = active?.title || 'Не выбран';
  }

  function renderDropdown(elId, config) {
    const mount = $(elId);
    const selectedCodes = config.multiple ? config.selected.slice() : (config.selected ? [config.selected] : []);
    const selectedTitles = config.options.filter((opt) => selectedCodes.includes(opt.value)).map((opt) => opt.label);
    mount.innerHTML = `
      <div class="dropdown" data-dropdown="${elId}">
        <button type="button" class="dropdown-trigger">
          <span class="value">${selectedTitles.length ? selectedTitles.join(', ') : config.placeholder}</span>
          <span>▾</span>
        </button>
        <div class="dropdown-panel hidden">
          <input class="dropdown-search" type="text" placeholder="Найти">
          ${config.multiple ? `<label class="option-row select-all-row"><input type="checkbox" data-select-all="${elId}" ${config.options.every((opt) => selectedCodes.includes(opt.value)) ? 'checked' : ''}><div class="option-label">Выбрать все</div></label>` : ''}
          <div class="dropdown-list">
            ${config.options.map((opt) => `
              <label class="option-row" data-option-row>
                <input type="${config.multiple ? 'checkbox' : 'radio'}" name="${elId}" value="${opt.value}" ${selectedCodes.includes(opt.value) ? 'checked' : ''}>
                <div>
                  <div class="option-label">${opt.label}</div>
                  ${opt.note ? `<div class="option-note">${opt.note}</div>` : ''}
                </div>
              </label>`).join('')}
          </div>
        </div>
      </div>
    `;

    const dropdown = mount.querySelector('.dropdown');
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const panel = dropdown.querySelector('.dropdown-panel');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-panel').forEach((p) => { if (p !== panel) p.classList.add('hidden'); });
      panel.classList.toggle('hidden');
    });
    dropdown.querySelector('.dropdown-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      dropdown.querySelectorAll('[data-option-row]').forEach((row) => {
        row.classList.toggle('hidden', !row.textContent.toLowerCase().includes(q));
      });
    });
    if (config.multiple) {
      const selectAll = dropdown.querySelector(`[data-select-all="${elId}"]`);
      if (selectAll) selectAll.addEventListener('change', (e) => {
        const checked = e.target.checked;
        dropdown.querySelectorAll('input[type="checkbox"][value]').forEach((input) => { input.checked = checked; });
        const values = checked ? config.options.map((opt) => opt.value) : [];
        config.onChange(values);
        renderDatasetAndCriteriaViewsIfNeeded(elId);
      });
      dropdown.querySelectorAll('input[type="checkbox"][value]').forEach((input) => input.addEventListener('change', () => {
        const values = [...dropdown.querySelectorAll('input[type="checkbox"][value]:checked')].map((el) => el.value);
        config.onChange(values);
        renderDatasetAndCriteriaViewsIfNeeded(elId);
      }));
    } else {
      dropdown.querySelectorAll('input[type="radio"][value]').forEach((input) => input.addEventListener('change', (e) => {
        config.onChange(e.target.value);
        panel.classList.add('hidden');
        renderDatasetAndCriteriaViewsIfNeeded(elId);
      }));
    }
  }

  function renderDatasetAndCriteriaViewsIfNeeded(elId) {
    renderDatasetPickers();
    renderCriteria();
    renderReview();
  }

  function renderDatasetPickers() {
    const options = DATASET_ORDER.map((code) => ({ value: code, label: DATASETS[code].title }));
    renderDropdown('mainDatasetPicker', {
      multiple: false,
      selected: state.mainDataset,
      options,
      placeholder: 'Выберите набор',
      onChange: (value) => {
        state.mainDataset = value;
        if (!state.compareDatasets.length) state.compareDatasets = availableCompareDatasets().slice(0, 1);
      }
    });

    renderDropdown('compareDatasetPicker', {
      multiple: true,
      selected: state.compareDatasets,
      options: availableCompareDatasets().map((code) => ({ value: code, label: DATASETS[code].title })),
      placeholder: 'Выберите наборы',
      onChange: (values) => {
        state.compareDatasets = values;
      }
    });
  }

  function renderCriteria() {
    $('filtersBlocks').innerHTML = activeDatasetCodes().map((datasetCode) => renderCriteriaBlock(datasetCode)).join('');
    bindCriteriaEvents();
  }


  function renderCriteriaBlock(datasetCode) {
    const ds = DATASETS[datasetCode];
    const criteria = state.criteria[datasetCode];
    const role = datasetCode === state.mainDataset ? 'Основной набор' : 'Набор сравнения';
    return `
      <section class="filter-block">
        <div class="filter-block-title-line">
          <span class="role-pill ${datasetCode === state.mainDataset ? 'main' : 'compare'}">${role}</span>
          <h3>${ds.title}</h3>
        </div>
        <div class="group-box">
          <div class="group-head single-group-head">
            <div class="group-title">Группа условий для набора</div>
            <label class="radio-line">
              <input type="checkbox" data-all-data="${datasetCode}" ${criteria.allData ? 'checked' : ''}>
              Использовать все данные без фильтрации
            </label>
          </div>
          <div class="criteria-toolbar ${criteria.allData ? 'hidden' : ''}">
            <button class="btn btn-secondary btn-small" data-add-criteria-row="${datasetCode}">Добавить условие</button>
            <button class="btn btn-secondary btn-small" data-group-selected="${datasetCode}">Группировать выделенные</button>
            <button class="btn btn-secondary btn-small" data-ungroup-selected="${datasetCode}">Разгруппировать</button>
          </div>
          <div class="stack ${criteria.allData ? 'hidden' : ''}">
            ${renderCriteriaRows(datasetCode, criteria)}
          </div>
        </div>
      </section>
    `;
  }

  function renderCriteriaRows(datasetCode, criteria) {
    const rows = criteria.rows;
    const html = [];
    rows.forEach((row, index) => {
      const prev = rows[index - 1];
      const startsCluster = row.clusterId && (!prev || prev.clusterId !== row.clusterId);
      if (startsCluster) html.push(renderClusterHeader(datasetCode, row));
      html.push(renderCriteriaRow(datasetCode, row, index));
    });
    return html.join('');
  }

  function renderClusterHeader(datasetCode, row) {
    const mode = state.criteria[datasetCode].clusterModes[row.clusterId] || 'OR';
    return `
      <div class="grouped-strip ${mode === 'NOT' ? 'negated' : ''}">
        <div>
          <div class="grouped-strip-title">Подгруппа</div>
          <div class="option-note">Выделенные строки объединены в отдельное логическое условие.</div>
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

  function renderCriteriaRow(datasetCode, row, index) {
    const meta = fieldMeta(datasetCode, row.field);
    const operators = operatorsFor(meta.type);
    const isBetween = row.operator === 'between';
    const criteria = state.criteria[datasetCode];
    const selected = criteria.selectedRowIds.includes(row.id);
    const unitStart = isCriteriaUnitStart(criteria.rows, index);
    return `
      <div class="row-filter ${selected ? 'row-selected' : ''} ${row.clusterId ? 'row-in-cluster' : ''} ${unitStart ? 'row-highlighted' : ''}">
        <div class="row-select-box">
          <input type="checkbox" data-row-select="${row.id}" data-dataset-code="${datasetCode}" ${selected ? 'checked' : ''}>
        </div>
        ${unitStart ? renderCriteriaJoinControl(datasetCode, row, index) : `<div class="logic-anchor">↳</div>`}
        <label class="field">
          <span class="field-label">Атрибут</span>
          <select data-row-field="${datasetCode}:${row.id}">
            ${datasetMeta(datasetCode).columns.map((col) => `<option value="${col.code}" ${col.code === row.field ? 'selected' : ''}>${col.label}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Оператор</span>
          <select data-row-operator="${datasetCode}:${row.id}">
            ${operators.map(([code, label]) => `<option value="${code}" ${code === row.operator ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field-label">Значение</span>
          ${isBetween ? `<div class="range-box">${renderValueControl(`criteria:${datasetCode}:${row.id}:value1`, meta, row.value1)}${renderValueControl(`criteria:${datasetCode}:${row.id}:value2`, meta, row.value2)}</div>` : renderValueControl(`criteria:${datasetCode}:${row.id}:value1`, meta, row.value1)}
        </label>
        <button type="button" class="icon-btn subtle-remove" data-remove-row="${datasetCode}:${row.id}" title="Удалить">✕</button>
      </div>
    `;
  }

  function renderCriteriaJoinControl(datasetCode, row, index) {
    if (index === 0) return `<div class="logic-anchor">Старт</div>`;
    return `
      <label class="field logic-field">
        <span class="field-label">Связь</span>
        <select data-row-join="${datasetCode}:${row.id}">
          <option value="AND" ${row.join === 'AND' ? 'selected' : ''}>И</option>
          <option value="OR" ${row.join === 'OR' ? 'selected' : ''}>ИЛИ</option>
        </select>
      </label>
    `;
  }

  function bindCriteriaEvents() {
    document.querySelectorAll('[data-add-criteria-row]').forEach((btn) => btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-add-criteria-row');
      state.criteria[code].rows.push(defaultRow(code));
      renderCriteria();
    }));
    document.querySelectorAll('[data-group-selected]').forEach((btn) => btn.addEventListener('click', () => {
      groupSelectedRows(btn.getAttribute('data-group-selected'));
    }));
    document.querySelectorAll('[data-ungroup-selected]').forEach((btn) => btn.addEventListener('click', () => {
      ungroupSelectedRows(btn.getAttribute('data-ungroup-selected'));
    }));
    document.querySelectorAll('[data-all-data]').forEach((input) => input.addEventListener('change', (e) => {
      const code = e.target.getAttribute('data-all-data');
      state.criteria[code].allData = e.target.checked;
      renderCriteria();
    }));
    document.querySelectorAll('[data-row-select]').forEach((el) => el.addEventListener('change', (e) => {
      const code = e.target.getAttribute('data-dataset-code');
      const id = e.target.getAttribute('data-row-select');
      const criteria = state.criteria[code];
      if (e.target.checked) {
        if (!criteria.selectedRowIds.includes(id)) criteria.selectedRowIds.push(id);
      } else {
        criteria.selectedRowIds = criteria.selectedRowIds.filter((x) => x !== id);
      }
      renderCriteria();
    }));
    document.querySelectorAll('[data-remove-row]').forEach((btn) => btn.addEventListener('click', () => {
      const [code, rowId] = btn.getAttribute('data-remove-row').split(':');
      const criteria = state.criteria[code];
      criteria.rows = criteria.rows.filter((r) => r.id !== rowId);
      criteria.selectedRowIds = criteria.selectedRowIds.filter((x) => x !== rowId);
      if (!criteria.rows.length) criteria.rows = [defaultRow(code)];
      cleanupClusters(criteria);
      renderCriteria();
    }));
    document.querySelectorAll('[data-row-field]').forEach((el) => el.addEventListener('change', (e) => {
      const [code, rowId] = e.target.getAttribute('data-row-field').split(':');
      const row = state.criteria[code].rows.find((r) => r.id === rowId);
      row.field = e.target.value;
      row.operator = defaultOperator(fieldMeta(code, row.field)?.type || 'text');
      row.value1 = '';
      row.value2 = '';
      renderCriteria();
    }));
    document.querySelectorAll('[data-row-operator]').forEach((el) => el.addEventListener('change', (e) => {
      const [code, rowId] = e.target.getAttribute('data-row-operator').split(':');
      const row = state.criteria[code].rows.find((r) => r.id === rowId);
      row.operator = e.target.value;
      row.value2 = '';
      renderCriteria();
    }));
    document.querySelectorAll('[data-row-join]').forEach((el) => el.addEventListener('change', (e) => {
      const [code, rowId] = e.target.getAttribute('data-row-join').split(':');
      const row = state.criteria[code].rows.find((r) => r.id === rowId);
      row.join = e.target.value;
    }));
    document.querySelectorAll('[data-cluster-mode]').forEach((el) => el.addEventListener('change', (e) => {
      state.criteria[e.target.getAttribute('data-dataset-code')].clusterModes[e.target.getAttribute('data-cluster-mode')] = e.target.value;
      renderCriteria();
    }));
    document.querySelectorAll('[data-simple-input]').forEach((el) => el.addEventListener('input', (e) => {
      const parts = e.target.getAttribute('data-simple-input').split(':');
      if (parts[0] === 'criteria') {
        const [, code, rowId, valueKey] = parts;
        const row = state.criteria[code].rows.find((r) => r.id === rowId);
        row[valueKey] = e.target.value;
      } else if (parts[0] === 'rule') {
        const [, ruleId, valueKey] = parts;
        const rule = state.customPriorityRules.find((r) => r.id === ruleId);
        rule[valueKey] = e.target.value;
        if (state.results.length) recomputeResults();
      } else if (parts[0] === 'param') {
        handleParameterInput(parts.slice(1), e.target.value);
      }
    }));

    activeDatasetCodes().forEach((datasetCode) => {
      state.criteria[datasetCode].rows.forEach((row) => {
        const meta = fieldMeta(datasetCode, row.field);
        if (meta.type === 'enum' || meta.type === 'enum_multi') {
          renderDropdown(escapeId(`criteria:${datasetCode}:${row.id}:value1`), {
            multiple: true,
            selected: splitMulti(row.value1),
            options: (meta.options || []).map((v) => ({ value: v, label: sanitizeText(v) || v })),
            placeholder: 'Выберите значения',
            onChange: (values) => { row.value1 = values.join('||'); }
          });
        }
      });
    });
  }

  function isCriteriaUnitStart(rows, index) {
    if (index === 0) return true;
    const current = rows[index];
    const prev = rows[index - 1];
    if (current.clusterId) return prev.clusterId !== current.clusterId;
    return true;
  }

  function groupSelectedRows(datasetCode) {
    const criteria = state.criteria[datasetCode];
    const selectedRows = criteria.rows.filter((row) => criteria.selectedRowIds.includes(row.id));
    if (selectedRows.length < 2) {
      alert('Выделите минимум две строки для группировки.');
      return;
    }
    const clusterId = cryptoId();
    selectedRows.forEach((row) => { row.clusterId = clusterId; });
    criteria.clusterModes[clusterId] = 'OR';
    renderCriteria();
  }

  function ungroupSelectedRows(datasetCode) {
    const criteria = state.criteria[datasetCode];
    const selectedRows = criteria.rows.filter((row) => criteria.selectedRowIds.includes(row.id));
    if (!selectedRows.length) {
      alert('Выделите строки, которые нужно разгруппировать.');
      return;
    }
    selectedRows.forEach((row) => { row.clusterId = null; });
    cleanupClusters(criteria);
    renderCriteria();
  }

  function cleanupClusters(criteria) {
    const counts = {};
    criteria.rows.forEach((row) => {
      if (!row.clusterId) return;
      counts[row.clusterId] = (counts[row.clusterId] || 0) + 1;
    });
    Object.keys(criteria.clusterModes).forEach((clusterId) => {
      if (!counts[clusterId] || counts[clusterId] < 2) {
        delete criteria.clusterModes[clusterId];
        criteria.rows.forEach((row) => { if (row.clusterId === clusterId) row.clusterId = null; });
      }
    });
  }

  function splitMulti(value) {
    return String(value || '').split('||').filter(Boolean);
  }
  function splitMulti(value) {
    return String(value || '').split('||').filter(Boolean);
  }

  function renderParameters() {
    $('serviceLifeSingleBox').classList.toggle('hidden', state.parameters.serviceLifeMode !== 'single');
    $('serviceLifeMixedBox').classList.toggle('hidden', state.parameters.serviceLifeMode !== 'mixed');
    $('serviceLifeSingle').value = state.parameters.serviceLifeSingle;

    $('serviceLifeSingle').onchange = (e) => { state.parameters.serviceLifeSingle = e.target.value; };
    $('serviceLifeMixedBox').innerHTML = (APP.asphaltWorkTypes || []).map((work) => `
      <div class="mixed-rule-row">
        <div class="field"><span class="field-label">${work}</span></div>
        <label class="field">
          <span class="field-label">Срок</span>
          <select data-service-mixed="${work}">
            <option value="5" ${state.parameters.serviceLifeMixed[work] === '5' ? 'selected' : ''}>5 лет</option>
            <option value="10" ${state.parameters.serviceLifeMixed[work] === '10' ? 'selected' : ''}>10 лет</option>
            <option value="15" ${state.parameters.serviceLifeMixed[work] === '15' ? 'selected' : ''}>15 лет</option>
          </select>
        </label>
      </div>`).join('');
    document.querySelectorAll('[data-service-mixed]').forEach((el) => el.addEventListener('change', (e) => {
      state.parameters.serviceLifeMixed[e.target.getAttribute('data-service-mixed')] = e.target.value;
    }));

    $('uncoveredSingleBox').innerHTML = renderRangeFilter('param:uncoveredSingle', state.parameters.uncoveredSingle);
    $('uncoveredSingleBox').querySelectorAll('[data-simple-input]').forEach((el) => el.addEventListener('input', (e) => {
      handleParameterInput(e.target.getAttribute('data-simple-input').split(':').slice(1), e.target.value);
    }));

    $('uncoveredSingleBox').querySelector('select').addEventListener('change', (e) => {
      state.parameters.uncoveredSingle.operator = e.target.value;
      renderParameters();
    });

    $('uncoveredMixedBox').classList.toggle('hidden', state.parameters.uncoveredMode !== 'mixed');
    $('uncoveredSingleBox').classList.toggle('hidden', state.parameters.uncoveredMode !== 'single');
    $('uncoveredMixedBox').innerHTML = (APP.asphaltWorkTypes || []).map((work) => `
      <div class="mixed-rule-row">
        <div class="field"><span class="field-label">${work}</span></div>
        <div>${renderRangeFilter(`param:uncoveredMixed:${work}`, state.parameters.uncoveredMixed[work])}</div>
      </div>`).join('');

    document.querySelectorAll('[data-operator-range]').forEach((el) => el.addEventListener('change', (e) => {
      const path = e.target.getAttribute('data-operator-range').split(':').slice(1);
      const target = getParameterObject(path);
      target.operator = e.target.value;
      renderParameters();
    }));
    document.querySelectorAll('[data-simple-input]').forEach((el) => {
      if (el.closest('#parametersCard')) {
        el.addEventListener('input', (e) => handleParameterInput(e.target.getAttribute('data-simple-input').split(':').slice(1), e.target.value));
      }
    });

    $('volumeFilterBox').innerHTML = renderRangeFilter('param:volume', state.parameters.volume);
    $('costFilterBox').innerHTML = renderRangeFilter('param:cost', state.parameters.cost);
    document.querySelectorAll('#parametersCard [data-operator-range]').forEach((el) => el.addEventListener('change', (e) => {
      const path = e.target.getAttribute('data-operator-range').split(':').slice(1);
      const target = getParameterObject(path);
      target.operator = e.target.value;
      renderParameters();
    }));
    document.querySelectorAll('#parametersCard [data-simple-input]').forEach((el) => el.addEventListener('input', (e) => {
      handleParameterInput(e.target.getAttribute('data-simple-input').split(':').slice(1), e.target.value);
    }));
  }

  function renderRangeFilter(baseKey, model) {
    const isBetween = model.operator === 'between';
    return `
      <div class="inline-filter-grid">
        <label class="field">
          <span class="field-label">Оператор</span>
          <select data-operator-range="${baseKey}">
            <option value="gt" ${model.operator === 'gt' ? 'selected' : ''}>Больше</option>
            <option value="gte" ${model.operator === 'gte' ? 'selected' : ''}>Больше или равно</option>
            <option value="lt" ${model.operator === 'lt' ? 'selected' : ''}>Меньше</option>
            <option value="lte" ${model.operator === 'lte' ? 'selected' : ''}>Меньше или равно</option>
            <option value="between" ${model.operator === 'between' ? 'selected' : ''}>От / До</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">${isBetween ? 'От' : 'Значение'}</span>
          <input type="number" step="any" value="${sanitizeAttr(model.from)}" data-simple-input="${baseKey}:from">
        </label>
        <label class="field ${isBetween ? '' : 'hidden'}">
          <span class="field-label">До</span>
          <input type="number" step="any" value="${sanitizeAttr(model.to)}" data-simple-input="${baseKey}:to">
        </label>
      </div>`;
  }

  function getParameterObject(path) {
    if (path[0] === 'uncoveredSingle') return state.parameters.uncoveredSingle;
    if (path[0] === 'uncoveredMixed') return state.parameters.uncoveredMixed[path[1]];
    if (path[0] === 'volume') return state.parameters.volume;
    if (path[0] === 'cost') return state.parameters.cost;
    return null;
  }

  function handleParameterInput(path, value) {
    const target = getParameterObject(path);
    if (!target) return;
    const key = path[path.length - 1];
    target[key] = value;
  }

  function renderReview() {
    const criteriaCount = activeDatasetCodes().reduce((sum, code) => sum + (state.criteria[code].allData ? 0 : state.criteria[code].rows.length), 0);
    const serviceLifeText = state.parameters.serviceLifeMode === 'normative'
      ? 'По нормативке'
      : state.parameters.serviceLifeMode === 'single'
        ? `Единый срок: ${state.parameters.serviceLifeSingle} лет`
        : 'Гибкая настройка по видам работ';

    $('reviewSummary').innerHTML = `
      <div class="review-box">
        <div class="review-box-title">Инструмент</div>
        <strong>${(APP.toolOptions || []).find((t) => t.code === state.tool)?.title || ''}</strong>
        <button class="btn btn-secondary btn-small top-space" data-jump-step="1">Изменить</button>
      </div>
      <div class="review-box">
        <div class="review-box-title">Наборы</div>
        <strong>Анализируемый: ${DATASETS[state.mainDataset].title}</strong>
        <div>Сравниваемые: ${state.compareDatasets.map((c) => DATASETS[c].title).join(', ')}</div>
        <button class="btn btn-secondary btn-small top-space" data-jump-step="2">Изменить</button>
      </div>
      <div class="review-box">
        <div class="review-box-title">Критерии</div>
        <strong>Настроенных условий: ${criteriaCount}</strong>
        <div>${activeDatasetCodes().map((code) => `${DATASETS[code].short}: ${state.criteria[code].allData ? 'без фильтрации' : state.criteria[code].rows.length + ' условий'}`).join(' · ')}</div>
        <button class="btn btn-secondary btn-small top-space" data-jump-step="3">Изменить</button>
      </div>
      <div class="review-box">
        <div class="review-box-title">Параметры результата</div>
        <strong>${serviceLifeText}</strong>
        <div>Процент непокрытой площади: ${describeRange(state.parameters.uncoveredMode === 'single' ? state.parameters.uncoveredSingle : state.parameters.uncoveredMixed[APP.asphaltWorkTypes?.[0]])}</div>
        <button class="btn btn-secondary btn-small top-space" data-jump-step="4">Изменить</button>
      </div>
    `;
    $('reviewSummary').querySelectorAll('[data-jump-step]').forEach((btn) => btn.addEventListener('click', () => gotoStep(Number(btn.getAttribute('data-jump-step')))));
  }

  function describeRange(model) {
    if (!model) return 'не задан';
    if (model.operator === 'between') return `от ${model.from || '—'} до ${model.to || '—'}`;
    const map = { gt: 'больше', gte: 'больше или равно', lt: 'меньше', lte: 'меньше или равно' };
    return `${map[model.operator] || model.operator} ${model.from || '—'}`;
  }

  async function runAnalysis() {
    $('loadingSection').classList.remove('hidden');
    $('resultsSection').classList.add('hidden');
    await showLoading('Подготовка пользовательского сценария...', 20);
    await showLoading('Формирование результата по файлу анализа...', 55);

    const base = (APP.result?.rows || []).map((row) => ({ ...row }));
    let rows = base.filter((row) => passesParameterFilters(row));
    await showLoading('Расчёт приоритетов...', 85);
    state.results = applyPriority(rows);
    await showLoading('Отрисовка карты и таблицы...', 100);

    $('loadingSection').classList.add('hidden');
    state.currentStep = 5;
    renderStepper();
    $('reviewCard').classList.remove('hidden');
    $('resultsSection').classList.remove('hidden');
    renderPriorityPanel();
    renderSummaryCards();
    renderTable();
    renderMap();
    $('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function passesParameterFilters(row) {
    const uncovered = normalizeNumber(row['Процент непокрытой площади']);
    const volume = normalizeNumber(row['Примерный объём работ']);
    const cost = normalizeNumber(row['Примерная стоимость']);
    if (!passesRange(uncovered, state.parameters.uncoveredSingle)) return false;
    if (!passesRange(volume, state.parameters.volume)) return false;
    if (!passesRange(cost, state.parameters.cost)) return false;

    if (state.parameters.serviceLifeMode === 'single') {
      const service = normalizeNumber(row['Нормативный срок службы']);
      if (service !== null && service < normalizeNumber(state.parameters.serviceLifeSingle)) return false;
    }
    return true;
  }

  function passesRange(value, model) {
    if (value === null) return true;
    const from = normalizeNumber(model.from);
    const to = normalizeNumber(model.to);
    switch (model.operator) {
      case 'gt': return from === null ? true : value > from;
      case 'gte': return from === null ? true : value >= from;
      case 'lt': return from === null ? true : value < from;
      case 'lte': return from === null ? true : value <= from;
      case 'between': return (from === null || value >= from) && (to === null || value <= to);
      default: return true;
    }
  }

  function applyPriority(rows) {
    const fields = APP.prioritySystemFields || [];
    const weights = state.baseWeights;
    const stats = {};
    fields.forEach((f) => {
      const vals = rows.map((r) => normalizeNumber(r[f.code])).filter((v) => v !== null);
      stats[f.code] = { min: Math.min(...vals, 0), max: Math.max(...vals, 1) };
    });

    const scored = rows.map((row) => {
      let score = 0;
      let reasons = [];
      fields.forEach((f) => {
        const num = normalizeNumber(row[f.code]);
        if (num === null) return;
        const range = stats[f.code];
        const norm = range.max === range.min ? 1 : (num - range.min) / (range.max - range.min);
        score += norm * (weights[f.code] || 0);
        reasons.push(`${f.label}: ${num}`);
      });

      state.customPriorityRules.forEach((rule) => {
        if (rowMatchesRule(row, rule, 'result')) {
          score += Number(rule.coefficient || 0);
          reasons.push(`Правило: ${rule.field}`);
        }
      });

      return {
        ...row,
        'Приоритетный вес': score.toFixed(2),
        'Причины приоритезации': reasons.join(' · ')
      };
    }).sort((a, b) => Number(b['Приоритетный вес']) - Number(a['Приоритетный вес']));
    return scored;
  }

  function rowMatchesRule(row, rule, datasetCode) {
    const meta = resultFieldOptions().find((f) => f.code === rule.field) || { type: 'text' };
    const raw = row[rule.field];
    if (meta.type === 'number') {
      const val = normalizeNumber(raw);
      const a = normalizeNumber(rule.value1);
      const b = normalizeNumber(rule.value2);
      if (val === null) return false;
      if (rule.operator === 'between') return (a === null || val >= a) && (b === null || val <= b);
      if (rule.operator === 'gt') return val > a;
      if (rule.operator === 'gte') return val >= a;
      if (rule.operator === 'lt') return val < a;
      if (rule.operator === 'lte') return val <= a;
      return val === a;
    }
    const text = sanitizeText(raw).toLowerCase();
    const target = sanitizeText(rule.value1).toLowerCase();
    if (rule.operator === 'contains') return text.includes(target);
    if (rule.operator === 'not_contains') return !text.includes(target);
    if (rule.operator === 'neq') return text !== target;
    return text === target;
  }

  async function showLoading(text, percent) {
    $('loadingText').textContent = text;
    $('loadingFill').style.width = `${percent}%`;
    $('loadingPercent').textContent = `${percent}%`;
    await new Promise((resolve) => setTimeout(resolve, 220));
  }

  
  function renderPriorityPanel() {
    $('baseWeightsChips').innerHTML = (APP.prioritySystemFields || []).map((field) => `<span class="chip">${field.label} — ${state.baseWeights[field.code] || 0}%</span>`).join('');
    $('priorityEditToggle').checked = state.priorityEditable;
    $('weightsPanel').innerHTML = `
      <div class="toolbar-line priority-toolbar-line">
        <label class="radio-line">
          <input type="checkbox" id="priorityEditToggleInner" ${state.priorityEditable ? 'checked' : ''}>
          Включить редактирование
        </label>
      </div>
      <div class="stack">
        ${(APP.prioritySystemFields || []).map((field) => `
          <div class="weight-row">
            <div>
              <div class="option-label">${field.label}</div>
              <div class="option-note">Системный атрибут из результата</div>
            </div>
            <input type="number" min="0" max="100" value="${state.baseWeights[field.code] || 0}" data-base-weight="${field.code}" ${state.priorityEditable ? '' : 'disabled'}>
          </div>
        `).join('')}
      </div>
      <div class="priority-rules-box" style="padding:14px;">
        <div class="card-head">
          <div>
            <h3>Кастомные правила</h3>
            <p>Можно задать свой коэффициент только по атрибутам справочника результата.</p>
          </div>
          <button class="btn btn-secondary btn-small" id="addPriorityRuleBtn" ${state.priorityEditable ? '' : 'disabled'}>Добавить правило</button>
        </div>
        <div class="stack">
          ${state.customPriorityRules.map((rule) => renderPriorityRule(rule)).join('')}
        </div>
      </div>
    `;
    $('priorityEditToggleInner')?.addEventListener('change', (e) => {
      state.priorityEditable = e.target.checked;
      $('priorityEditToggle').checked = state.priorityEditable;
      renderPriorityPanel();
    });
    $('weightsPanel').querySelectorAll('[data-base-weight]').forEach((input) => input.addEventListener('input', (e) => {
      state.baseWeights[e.target.getAttribute('data-base-weight')] = Number(e.target.value || 0);
      state.results = applyPriority(state.results);
      renderPriorityPanel();
      renderTable();
      renderMap();
    }));
    const addBtn = $('addPriorityRuleBtn');
    if (addBtn) addBtn.addEventListener('click', () => {
      state.customPriorityRules.push(createPriorityRule());
      renderPriorityPanel();
    });
    state.customPriorityRules.forEach((rule) => {
      const fieldMeta = resultFieldOptions().find((f) => f.code === rule.field) || { type: 'text' };
      if (fieldMeta.type === 'enum') {
        renderDropdown(escapeId(`rule:${rule.id}:value1`), {
          multiple: true,
          selected: splitMulti(rule.value1),
          options: distinctResultValues(rule.field).map((v) => ({ value: v, label: sanitizeText(v) || v })),
          placeholder: 'Выберите значения',
          onChange: (values) => {
            rule.value1 = values.join('||');
            recomputeResults();
          }
        });
      }
    });
    $('weightsPanel').querySelectorAll('[data-rule-field]').forEach((el) => el.addEventListener('change', (e) => {
      const rule = state.customPriorityRules.find((r) => r.id === e.target.getAttribute('data-rule-field'));
      rule.field = e.target.value;
      rule.operator = defaultOperator((resultFieldOptions().find((f) => f.code === rule.field) || {}).type || 'text');
      rule.value1 = '';
      rule.value2 = '';
      renderPriorityPanel();
      recomputeResults();
    }));
    $('weightsPanel').querySelectorAll('[data-rule-operator]').forEach((el) => el.addEventListener('change', (e) => {
      const rule = state.customPriorityRules.find((r) => r.id === e.target.getAttribute('data-rule-operator'));
      rule.operator = e.target.value;
      renderPriorityPanel();
      recomputeResults();
    }));
    $('weightsPanel').querySelectorAll('[data-rule-remove]').forEach((el) => el.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-rule-remove');
      state.customPriorityRules = state.customPriorityRules.filter((r) => r.id !== id);
      if (!state.customPriorityRules.length) state.customPriorityRules = [createPriorityRule()];
      renderPriorityPanel();
      recomputeResults();
    }));
    $('weightsPanel').querySelectorAll('[data-simple-input]').forEach((el) => el.addEventListener('input', (e) => {
      const parts = e.target.getAttribute('data-simple-input').split(':');
      if (parts[0] === 'rule') {
        const [, ruleId, valueKey] = parts;
        const rule = state.customPriorityRules.find((r) => r.id === ruleId);
        rule[valueKey] = e.target.value;
        recomputeResults();
      }
    }));
  }

function renderSummaryCards() {
    const total = state.results.length;
    const totalCost = state.results.reduce((sum, item) => sum + (normalizeNumber(item['Примерная стоимость']) || 0), 0);
    const totalVolume = state.results.reduce((sum, item) => sum + (normalizeNumber(item['Примерный объём работ']) || 0), 0);

    $('resultSummaryCards').innerHTML = `
      <div class="summary-card">
        <div class="summary-card-title">Объекты в результате</div>
        <span class="summary-card-value">${total}</span>
        <div class="summary-card-sub">Итоговый реестр после применения параметров результата</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-title">Рекомендуемый объём</div>
        <span class="summary-card-value">${formatNumber(totalVolume)}</span>
        <div class="summary-card-sub">Суммарный объём по всем объектам</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-title">Ориентировочная стоимость</div>
        <span class="summary-card-value">${formatCurrency(totalCost)}</span>
        <div class="summary-card-sub">Суммарная оценка по результату</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-title">Максимальный вес</div>
        <span class="summary-card-value">${state.results[0]?.['Приоритетный вес'] || '0.00'}</span>
        <div class="summary-card-sub">Лидер списка по приоритизации</div>
      </div>
    `;
  }

  function resultColumnsOrdered() {
    const base = getResultColumns();
    const front = ['Приоритетный вес', 'Причины приоритезации', 'Давность ремонта', 'Процент непокрытой площади', 'Примерный объём работ', 'Примерная стоимость', 'Нормативный срок службы'];
    return [...front, ...base.filter((c) => !front.includes(c))];
  }

  function renderTable() {
    const columns = resultColumnsOrdered().filter((col) => col !== RESULT_GEOMETRY_KEY);
    const table = $('resultsTable');
    table.innerHTML = `
      <thead>
        <tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${state.results.map((row, index) => `
          <tr data-result-row="${index}" class="${state.activeRowIndex === index ? 'is-active' : ''}">
            ${columns.map((col) => `<td>${renderCell(row[col], col)}</td>`).join('')}
          </tr>`).join('')}
      </tbody>
    `;
    table.querySelectorAll('[data-result-row]').forEach((tr) => tr.addEventListener('click', () => {
      const index = Number(tr.getAttribute('data-result-row'));
      state.activeRowIndex = index;
      renderTable();
      focusMapOnRow(state.results[index]);
    }));
  }

  function renderCell(value, column) {
    const clean = String(value ?? '');
    if (column === 'Приоритетный вес') {
      const score = Number(clean || 0);
      return `<span class="priority-weight-badge" style="background:${getPriorityColor(score)}">${sanitizeHtml(clean || '0')}</span>`;
    }
    if (clean.includes('<span')) return clean;
    return sanitizeHtml(clean || '—');
  }

  function renderMapLegend() {
    $('mapLegend').innerHTML = `
      <div class="legend-item"><span class="legend-dot" style="background:#d12f2f"></span> Высокий приоритет</div>
      <div class="legend-item"><span class="legend-dot" style="background:#e39b14"></span> Средний приоритет</div>
      <div class="legend-item"><span class="legend-dot" style="background:#2d7de0"></span> Низкий приоритет</div>
    `;
  }

  function renderMap() {
    if (!state.map) {
      state.map = L.map('map');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(state.map);
    }
    state.layers.forEach((layer) => state.map.removeLayer(layer));
    state.layers = [];

    const group = [];
    state.results.forEach((row, index) => {
      const coords = wktToLatLngs(row[RESULT_GEOMETRY_KEY]);
      if (!coords.length) return;
      const color = getPriorityColor(Number(row['Приоритетный вес']));
      const polygon = L.polygon(coords, { color, weight: 2, fillOpacity: 0.25 });
      polygon.addTo(state.map);
      polygon.on('click', () => {
        state.activeRowIndex = index;
        renderTable();
        focusMapOnRow(row);
      });
      state.layers.push(polygon);
      group.push(polygon);
    });
    if (group.length) {
      const fg = L.featureGroup(group);
      state.map.fitBounds(fg.getBounds().pad(0.1));
    } else {
      state.map.setView([55.75, 37.62], 10);
    }
    setTimeout(() => state.map && state.map.invalidateSize(), 80);
    renderMapLegend();
  }

  function getPriorityColor(score) {
    if (score >= 65) return '#d12f2f';
    if (score >= 40) return '#e39b14';
    return '#2d7de0';
  }

  function focusMapOnRow(row) {
    const coords = wktToLatLngs(row[RESULT_GEOMETRY_KEY]);
    if (!coords.length || !state.map) return;
    const bounds = L.latLngBounds(coords.flat());
    state.map.fitBounds(bounds.pad(0.2));
  }

  function wktToLatLngs(wkt) {
    const text = String(wkt || '').trim();
    if (!text) return [];
    const multipolyMatch = text.match(/^MULTIPOLYGON\s*\(\(\((.*)\)\)\)$/i);
    const polyMatch = text.match(/^POLYGON\s*\(\((.*)\)\)$/i);
    let body = multipolyMatch ? multipolyMatch[1] : (polyMatch ? polyMatch[1] : '');
    if (!body) return [];
    const rings = body.split(')),((');
    return rings.map((ring) => ring.split(',').map((pair) => {
      const [lng, lat] = pair.trim().split(/\s+/).map(Number);
      return [lat, lng];
    }));
  }

  function exportExcel() {
    const cols = resultColumnsOrdered().filter((c) => c !== RESULT_GEOMETRY_KEY);
    const rows = [cols.join('\t'), ...state.results.map((row) => cols.map((c) => sanitizeText(row[c])).join('\t'))];
    const blob = new Blob([rows.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.tsv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetAll() {
    state.tool = APP.toolOptions?.[0]?.code || 'predictive';
    state.mainDataset = 'ogh';
    state.compareDatasets = ['sok', 'mr'];
    state.parameters = {
      serviceLifeMode: 'normative',
      serviceLifeSingle: '5',
      serviceLifeMixed: {},
      uncoveredMode: 'single',
      uncoveredSingle: { operator: 'gt', from: '15', to: '' },
      uncoveredMixed: {},
      volume: { operator: 'between', from: '', to: '' },
      cost: { operator: 'between', from: '', to: '' }
    };
    APP.asphaltWorkTypes?.forEach((work) => {
      state.parameters.serviceLifeMixed[work] = '5';
      state.parameters.uncoveredMixed[work] = { operator: 'gt', from: '15', to: '' };
    });
    state.baseWeights = { ...(APP.baseWeights || {}) };
    state.customPriorityRules = [createPriorityRule()];
    state.priorityEditable = false;
    state.results = [];
    state.activeRowIndex = null;
    DATASET_ORDER.forEach((code) => state.criteria[code] = { allData: false, rows: [defaultRow(code)], selectedRowIds: [], clusterModes: {} });
    $('resultsSection').classList.add('hidden');
    $('toolSection').classList.remove('hidden');
    $('datasetsSection').classList.add('hidden');
    $('filtersSection').classList.add('hidden');
    $('criteriaCard').classList.remove('hidden');
    $('parametersCard').classList.add('hidden');
    $('reviewCard').classList.add('hidden');
    state.currentStep = 1;
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderAll() {
    renderStepper();
    renderToolOptions();
    renderDatasetPickers();
    renderCriteria();
    renderParameters();
    renderReview();
    updateToolHeader();
  }

  function formatNumber(value) {
    const n = Number(value || 0);
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
  }

  function formatCurrency(value) {
    const n = Number(value || 0);
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
  }

  function escapeId(str) {
    return String(str).replace(/[^a-zA-Z0-9\-_:.]/g, '_');
  }

  function sanitizeAttr(value) {
    return String(value ?? '').replace(/"/g, '&quot;');
  }

  function sanitizeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, (s) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[s]));
  }

  function toDateInput(value) {
    const d = normalizeDate(value);
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-panel').forEach((panel) => panel.classList.add('hidden'));
    }
  });

  initState();
  renderAll();
  bindGlobalEvents();
})();
