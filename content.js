(function () {
    const API_BASE_URL = window.ALLURE_EXTENSION_CONFIG?.API_BASE_URL;

    const GROUP_CONFIG = {
        most_important: {
            title: 'Самые важные',
            subtitle: 'Минимальный критичный набор, который стоит покрыть в первую очередь.',
            accent: 'critical',
        },
        less_important: {
            title: 'Менее важные',
            subtitle: 'Полезные сценарии второго приоритета без перегруза покрытия.',
            accent: 'secondary',
        },
        possibly_affected_existing: {
            title: 'Возможно затронутые',
            subtitle: 'Существующие кейсы, которые стоит проверить или обновить.',
            accent: 'impact',
        },
    };

    let groupedCases = {
        most_important: [],
        less_important: [],
        possibly_affected_existing: [],
    };
    let selectedKey = null;

    function ensureStylesInjected() {
        if (document.getElementById('create-test-styles')) return;
        const style = document.createElement('style');
        style.id = 'create-test-styles';
        style.textContent = `
            #create-test-container {
                --ctc-bg: linear-gradient(180deg, #f4f8ff 0%, #eaf2ff 100%);
                --ctc-panel: rgba(255, 255, 255, 0.96);
                --ctc-border: rgba(86, 132, 214, 0.18);
                --ctc-shadow: rgba(58, 105, 191, 0.14);
                --ctc-text: #12304f;
                --ctc-text-soft: #4c6a8f;
                --ctc-text-muted: #7f98b8;
                --ctc-input-bg: rgba(248, 251, 255, 0.98);
                --ctc-input-border: rgba(117, 156, 224, 0.24);
                --ctc-focus: rgba(55, 125, 255, 0.16);
                --ctc-primary: #2f80ed;
                --ctc-primary-hover: #226fd7;
                --ctc-secondary: #edf4ff;
                --ctc-secondary-hover: #dfebff;
                --ctc-critical: #2274e5;
                --ctc-less: #4f8df0;
                --ctc-impact: #1d5db8;
                font-family: "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif;
                color: var(--ctc-text);
                background: var(--ctc-bg);
                border: 1px solid var(--ctc-border);
                border-radius: 24px;
                padding: 18px;
                margin-bottom: 16px;
                box-shadow: 0 18px 40px var(--ctc-shadow);
            }
            #create-test-container.ctc-dark {
                --ctc-bg: linear-gradient(180deg, #101a2b 0%, #0d1522 100%);
                --ctc-panel: rgba(17, 29, 47, 0.94);
                --ctc-border: rgba(102, 145, 213, 0.16);
                --ctc-shadow: rgba(0, 0, 0, 0.35);
                --ctc-text: #eaf3ff;
                --ctc-text-soft: #a8c0df;
                --ctc-text-muted: #7890b1;
                --ctc-input-bg: rgba(15, 25, 40, 0.98);
                --ctc-input-border: rgba(102, 145, 213, 0.15);
                --ctc-focus: rgba(47, 128, 237, 0.2);
                --ctc-primary: #4c9cff;
                --ctc-primary-hover: #318cff;
                --ctc-secondary: rgba(52, 82, 128, 0.34);
                --ctc-secondary-hover: rgba(61, 96, 150, 0.48);
                --ctc-critical: #66abff;
                --ctc-less: #89bcff;
                --ctc-impact: #4f94ff;
            }
            #create-test-container * { box-sizing: border-box; }
            #create-test-container .ctc-shell {
                display: grid;
                gap: 16px;
            }
            #create-test-container .ctc-hero,
            #create-test-container .ctc-results,
            #create-test-container .ctc-editor {
                background: var(--ctc-panel);
                border: 1px solid var(--ctc-border);
                border-radius: 20px;
                box-shadow: 0 10px 24px rgba(0, 0, 0, 0.04);
            }
            #create-test-container .ctc-hero {
                padding: 18px;
                position: relative;
                overflow: hidden;
            }
            #create-test-container .ctc-hero::after {
                content: '';
                position: absolute;
                right: -60px;
                top: -50px;
                width: 180px;
                height: 180px;
                background: radial-gradient(circle, rgba(47,128,237,0.18), transparent 70%);
                pointer-events: none;
            }
            #create-test-container .ctc-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 14px;
            }
            #create-test-container .ctc-kicker {
                text-transform: uppercase;
                letter-spacing: 0.12em;
                font-size: 11px;
                color: var(--ctc-text-muted);
                margin-bottom: 6px;
            }
            #create-test-container h3 {
                margin: 0;
                font-size: 25px;
                line-height: 1.1;
                color: var(--ctc-text);
            }
            #create-test-container .ctc-subtitle {
                margin: 8px 0 0;
                max-width: 780px;
                color: var(--ctc-text-soft);
                font-size: 14px;
                line-height: 1.5;
            }
            #create-test-container .ctc-theme-toggle {
                border: 1px solid var(--ctc-border);
                background: var(--ctc-secondary);
                color: var(--ctc-text);
                border-radius: 999px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 700;
            }
            #create-test-container .ctc-query {
                width: 100%;
                min-height: 128px;
                padding: 14px 16px;
                border-radius: 16px;
                border: 1px solid var(--ctc-input-border);
                background: var(--ctc-input-bg);
                color: var(--ctc-text);
                resize: vertical;
                outline: none;
                font: inherit;
                line-height: 1.5;
            }
            #create-test-container .ctc-source-grid {
                display: grid;
                gap: 12px;
            }
            #create-test-container .ctc-input-wrap {
                display: grid;
                gap: 6px;
            }
            #create-test-container .ctc-query:focus,
            #create-test-container .ctc-input:focus {
                border-color: var(--ctc-primary);
                box-shadow: 0 0 0 4px var(--ctc-focus);
            }
            #create-test-container .ctc-actions {
                margin-top: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            #create-test-container .ctc-btn {
                border: 1px solid transparent;
                border-radius: 999px;
                padding: 10px 16px;
                cursor: pointer;
                font: inherit;
                font-size: 13px;
                font-weight: 700;
                transition: background 120ms ease, transform 80ms ease, border-color 120ms ease;
            }
            #create-test-container .ctc-btn:active { transform: translateY(1px); }
            #create-test-container .ctc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            #create-test-container .ctc-btn-primary {
                background: var(--ctc-primary);
                color: #fff7f0;
            }
            #create-test-container .ctc-btn-primary:hover:not(:disabled) {
                background: var(--ctc-primary-hover);
            }
            #create-test-container .ctc-btn-secondary {
                background: var(--ctc-secondary);
                color: var(--ctc-text);
                border-color: var(--ctc-border);
            }
            #create-test-container .ctc-btn-secondary:hover:not(:disabled) {
                background: var(--ctc-secondary-hover);
            }
            #create-test-container .ctc-status {
                color: var(--ctc-text-soft);
                font-size: 13px;
                min-height: 18px;
            }
            #create-test-container .ctc-results {
                padding: 16px;
            }
            #create-test-container .ctc-summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 10px;
                margin-bottom: 16px;
            }
            #create-test-container .ctc-summary-card {
                border-radius: 16px;
                padding: 14px;
                border: 1px solid var(--ctc-border);
                background: rgba(255,255,255,0.45);
            }
            #create-test-container.ctc-dark .ctc-summary-card {
                background: rgba(255,255,255,0.03);
            }
            #create-test-container .ctc-summary-label {
                font-size: 12px;
                color: var(--ctc-text-muted);
                text-transform: uppercase;
                letter-spacing: 0.08em;
            }
            #create-test-container .ctc-summary-count {
                margin-top: 8px;
                font-size: 30px;
                font-weight: 700;
                line-height: 1;
            }
            #create-test-container .ctc-summary-card.critical .ctc-summary-count { color: var(--ctc-critical); }
            #create-test-container .ctc-summary-card.secondary .ctc-summary-count { color: var(--ctc-less); }
            #create-test-container .ctc-summary-card.impact .ctc-summary-count { color: var(--ctc-impact); }
            #create-test-container .ctc-group + .ctc-group {
                margin-top: 18px;
                padding-top: 18px;
                border-top: 1px solid var(--ctc-border);
            }
            #create-test-container .ctc-group-title {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                gap: 8px;
                margin-bottom: 8px;
            }
            #create-test-container .ctc-group-title h4 {
                margin: 0;
                font-size: 18px;
                color: var(--ctc-text);
            }
            #create-test-container .ctc-group-subtitle {
                margin: 0 0 12px;
                color: var(--ctc-text-soft);
                font-size: 13px;
                line-height: 1.45;
            }
            #create-test-container .ctc-cards {
                display: grid;
                gap: 10px;
            }
            #create-test-container .ctc-item {
                border: 1px solid var(--ctc-border);
                border-radius: 16px;
                background: rgba(255,255,255,0.5);
                padding: 14px;
                cursor: pointer;
                transition: transform 100ms ease, border-color 120ms ease, background 120ms ease;
            }
            #create-test-container.ctc-dark .ctc-item {
                background: rgba(255,255,255,0.03);
            }
            #create-test-container .ctc-item:hover {
                transform: translateY(-1px);
                border-color: rgba(47, 128, 237, 0.38);
            }
            #create-test-container .ctc-item.ctc-item-selected {
                border-color: var(--ctc-primary);
                box-shadow: 0 0 0 3px var(--ctc-focus);
                background: rgba(47, 128, 237, 0.06);
            }
            #create-test-container .ctc-item-top {
                display: flex;
                gap: 8px;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            #create-test-container .ctc-item-name {
                font-size: 16px;
                font-weight: 700;
                color: var(--ctc-text);
            }
            #create-test-container .ctc-pill {
                display: inline-flex;
                align-items: center;
                border-radius: 999px;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
            }
            #create-test-container .ctc-pill-create {
                background: rgba(47, 128, 237, 0.12);
                color: #226fd7;
            }
            #create-test-container .ctc-pill-update {
                background: rgba(29, 93, 184, 0.12);
                color: #1d5db8;
            }
            #create-test-container.ctc-dark .ctc-pill-create {
                background: rgba(76, 156, 255, 0.18);
                color: #c6e0ff;
            }
            #create-test-container.ctc-dark .ctc-pill-update {
                background: rgba(54, 115, 214, 0.2);
                color: #a8ceff;
            }
            #create-test-container .ctc-item-summary {
                color: var(--ctc-text-soft);
                font-size: 13px;
                line-height: 1.45;
            }
            #create-test-container .ctc-item-meta {
                margin-top: 10px;
                color: var(--ctc-text-muted);
                font-size: 12px;
            }
            #create-test-container .ctc-empty {
                color: var(--ctc-text-muted);
                font-size: 13px;
                padding: 12px 0;
            }
            #create-test-container .ctc-editor {
                padding: 16px;
            }
            #create-test-container .ctc-editor-header {
                display: flex;
                gap: 10px;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }
            #create-test-container .ctc-editor-title {
                margin: 0;
                font-size: 19px;
                color: var(--ctc-text);
            }
            #create-test-container .ctc-editor-hint {
                margin: 6px 0 0;
                color: var(--ctc-text-soft);
                font-size: 13px;
            }
            #create-test-container .ctc-form-grid {
                display: grid;
                gap: 12px;
            }
            #create-test-container .ctc-label {
                display: block;
                margin-bottom: 6px;
                color: var(--ctc-text-soft);
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
            }
            #create-test-container .ctc-input {
                width: 100%;
                min-height: 46px;
                padding: 12px 14px;
                border-radius: 14px;
                border: 1px solid var(--ctc-input-border);
                background: var(--ctc-input-bg);
                color: var(--ctc-text);
                outline: none;
                font: inherit;
                resize: vertical;
            }
            #create-test-container .ctc-fields {
                display: grid;
                gap: 8px;
            }
            #create-test-container .ctc-field-row {
                display: grid;
                grid-template-columns: 170px minmax(0, 1fr);
                gap: 10px;
                align-items: center;
            }
            #create-test-container .ctc-field-name {
                color: var(--ctc-text-soft);
                font-size: 13px;
                font-weight: 700;
            }
            @media (max-width: 900px) {
                #create-test-container .ctc-field-row {
                    grid-template-columns: 1fr;
                }
                #create-test-container .ctc-header,
                #create-test-container .ctc-editor-header,
                #create-test-container .ctc-group-title {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function waitForMount() {
        const timer = setInterval(() => {
            const target = document.querySelector('._3Cy1IG_tree');
            if (!target) return;
            clearInterval(timer);
            injectUI(target);
        }, 500);
    }

    function injectUI(target) {
        if (document.getElementById('create-test-container')) return;
        ensureStylesInjected();

        const container = document.createElement('div');
        container.id = 'create-test-container';
        if (localStorage.getItem('ctc-theme-v2') === 'dark') {
            container.classList.add('ctc-dark');
        }

        container.innerHTML = `
            <div class="ctc-shell">
                <section class="ctc-hero">
                    <div class="ctc-header">
                        <div>
                            <div class="ctc-kicker">Test Design Studio</div>
                            <h3>Генератор тест-кейсов</h3>
                            <p class="ctc-subtitle">После запроса ты сразу увидишь три группы: самые важные кейсы, менее важные и существующие тесты, которые, возможно, попадают под изменения. Можно использовать описание, ссылку на доку или оба источника вместе.</p>
                        </div>
                        <button id="ctc-theme-btn" class="ctc-theme-toggle" type="button">Тема</button>
                    </div>
                    <div class="ctc-source-grid">
                        <div class="ctc-input-wrap">
                            <label class="ctc-label" for="ctc-query">Описание задачи</label>
                            <textarea id="ctc-query" class="ctc-query" placeholder="Вставь описание новой фичи, изменений в доке или сценария, который нужно покрыть"></textarea>
                        </div>
                        <div class="ctc-input-wrap">
                            <label class="ctc-label" for="ctc-doc-url">Ссылка на доку</label>
                            <input id="ctc-doc-url" class="ctc-input" type="url" placeholder="https://your-company.atlassian.net/wiki/..." />
                        </div>
                    </div>
                    <div class="ctc-actions">
                        <button id="ctc-generate-btn" class="ctc-btn ctc-btn-primary" type="button">Собрать предложения</button>
                        <button id="ctc-clear-btn" class="ctc-btn ctc-btn-secondary" type="button">Очистить</button>
                        <div id="ctc-status" class="ctc-status"></div>
                    </div>
                </section>
                <section id="ctc-results" class="ctc-results"></section>
                <section id="ctc-editor" class="ctc-editor"></section>
            </div>
        `;

        target.prepend(container);

        document.getElementById('ctc-theme-btn').addEventListener('click', () => {
            container.classList.toggle('ctc-dark');
            localStorage.setItem('ctc-theme-v2', container.classList.contains('ctc-dark') ? 'dark' : 'light');
        });

        document.getElementById('ctc-clear-btn').addEventListener('click', () => {
            groupedCases = emptyGroupedCases();
            selectedKey = null;
            document.getElementById('ctc-query').value = '';
            document.getElementById('ctc-doc-url').value = '';
            setStatus('');
            renderResults();
            renderEditor();
        });

        document.getElementById('ctc-generate-btn').addEventListener('click', handleGenerate);

        renderResults();
        renderEditor();
    }

    async function handleGenerate() {
        const query = document.getElementById('ctc-query').value.trim();
        const docUrl = document.getElementById('ctc-doc-url').value.trim();
        if (!query && !docUrl) {
            setStatus('Нужно добавить описание, ссылку на доку или оба источника сразу.');
            return;
        }

        setStatus('Анализирую запрос и собираю группы кейсов...');
        try {
            const response = await fetch(`${API_BASE_URL}/get_test_case`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, doc_url: docUrl })
            });
            const data = await response.json();
            const parsed = parseResult(data?.result);
            groupedCases = normalizeGroupedResponse(parsed);
            selectedKey = firstExistingKey();

            const counts = countCases(groupedCases);
            setStatus(`Готово: ${counts.total} предложений в 3 группах.`);
            renderResults();
            renderEditor();
        } catch (error) {
            console.error(error);
            setStatus(`Ошибка: ${error}`);
        }
    }

    function renderResults() {
        const results = document.getElementById('ctc-results');
        const counts = countCases(groupedCases);

        results.innerHTML = `
            <div class="ctc-summary-grid">
                ${renderSummaryCard('most_important', counts.most_important)}
                ${renderSummaryCard('less_important', counts.less_important)}
                ${renderSummaryCard('possibly_affected_existing', counts.possibly_affected_existing)}
            </div>
            ${renderGroup('most_important')}
            ${renderGroup('less_important')}
            ${renderGroup('possibly_affected_existing')}
        `;

        results.querySelectorAll('[data-case-key]').forEach((node) => {
            node.addEventListener('click', () => {
                saveCurrentEditor();
                selectedKey = node.getAttribute('data-case-key');
                renderResults();
                renderEditor();
            });
        });
    }

    function renderSummaryCard(groupKey, count) {
        const config = GROUP_CONFIG[groupKey];
        return `
            <div class="ctc-summary-card ${config.accent}">
                <div class="ctc-summary-label">${escapeHtml(config.title)}</div>
                <div class="ctc-summary-count">${count}</div>
            </div>
        `;
    }

    function renderGroup(groupKey) {
        const config = GROUP_CONFIG[groupKey];
        const items = groupedCases[groupKey] || [];
        return `
            <div class="ctc-group">
                <div class="ctc-group-title">
                    <h4>${escapeHtml(config.title)}</h4>
                    <span class="ctc-summary-label">${items.length}</span>
                </div>
                <p class="ctc-group-subtitle">${escapeHtml(config.subtitle)}</p>
                <div class="ctc-cards">
                    ${items.length ? items.map((item, index) => renderCaseCard(groupKey, item, index)).join('') : '<div class="ctc-empty">Пока ничего не предложено в этой группе.</div>'}
                </div>
            </div>
        `;
    }

    function renderCaseCard(groupKey, item, index) {
        const key = makeCaseKey(groupKey, index);
        const selectedClass = key === selectedKey ? 'ctc-item-selected' : '';
        const operation = item.operation === 'update' ? 'update' : 'create';
        const badgeLabel = operation === 'update' ? `update #${item.existing_id ?? '?'}` : 'create';
        const badgeClass = operation === 'update' ? 'ctc-pill-update' : 'ctc-pill-create';
        return `
            <article class="ctc-item ${selectedClass}" data-case-key="${escapeAttribute(key)}">
                <div class="ctc-item-top">
                    <div class="ctc-item-name">${escapeHtml(item.name || 'Без названия')}</div>
                    <span class="ctc-pill ${badgeClass}">${escapeHtml(badgeLabel)}</span>
                </div>
                <div class="ctc-item-summary">${escapeHtml(item.change_summary || 'Без пояснения')}</div>
                <div class="ctc-item-meta">${escapeHtml(GROUP_CONFIG[groupKey].title)}</div>
            </article>
        `;
    }

    function renderEditor() {
        const editor = document.getElementById('ctc-editor');
        const selected = getSelectedCase();

        if (!selected) {
            editor.innerHTML = `
                <div class="ctc-editor-header">
                    <div>
                        <h4 class="ctc-editor-title">Детали кейса</h4>
                        <p class="ctc-editor-hint">Выбери карточку из любой группы, чтобы посмотреть и при необходимости отредактировать её перед созданием или обновлением в Allure.</p>
                    </div>
                </div>
            `;
            return;
        }

        const { groupKey, item } = selected;
        const submitLabel = item.operation === 'update' ? 'Обновить в Allure' : 'Создать в Allure';

        editor.innerHTML = `
            <div class="ctc-editor-header">
                <div>
                    <h4 class="ctc-editor-title">${escapeHtml(item.name || 'Без названия')}</h4>
                    <p class="ctc-editor-hint">${escapeHtml(GROUP_CONFIG[groupKey].title)}. ${escapeHtml(item.change_summary || '')}</p>
                </div>
                <button id="ctc-apply-btn" class="ctc-btn ctc-btn-primary" type="button">${escapeHtml(submitLabel)}</button>
            </div>
            <div class="ctc-form-grid">
                <div>
                    <label class="ctc-label" for="ctc-name">Name</label>
                    <textarea id="ctc-name" class="ctc-input">${escapeHtml(item.name)}</textarea>
                </div>
                <div>
                    <label class="ctc-label" for="ctc-summary">Change summary</label>
                    <textarea id="ctc-summary" class="ctc-input">${escapeHtml(item.change_summary)}</textarea>
                </div>
                <div>
                    <label class="ctc-label" for="ctc-precondition">Precondition</label>
                    <textarea id="ctc-precondition" class="ctc-input">${escapeHtml(item.precondition)}</textarea>
                </div>
                <div>
                    <label class="ctc-label" for="ctc-steps">Steps</label>
                    <textarea id="ctc-steps" class="ctc-input">${escapeHtml((item.steps || []).join('\n'))}</textarea>
                </div>
                <div>
                    <label class="ctc-label" for="ctc-expected">Expected result</label>
                    <textarea id="ctc-expected" class="ctc-input">${escapeHtml(item.expected_result)}</textarea>
                </div>
                <div>
                    <div class="ctc-label">Fields</div>
                    <div id="ctc-fields" class="ctc-fields">
                        ${(item.fields || []).map((field, index) => `
                            <div class="ctc-field-row">
                                <div class="ctc-field-name">${escapeHtml(field.fieldName || `Field ${index + 1}`)}</div>
                                <input class="ctc-input" data-field-index="${index}" value="${escapeAttribute(field.fieldValue || '')}" />
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ctc-apply-btn').addEventListener('click', applyCurrentCase);
    }

    function saveCurrentEditor() {
        const selected = getSelectedCase();
        if (!selected) return;

        const { item } = selected;
        const nameEl = document.getElementById('ctc-name');
        const summaryEl = document.getElementById('ctc-summary');
        const preconditionEl = document.getElementById('ctc-precondition');
        const stepsEl = document.getElementById('ctc-steps');
        const expectedEl = document.getElementById('ctc-expected');
        const fieldInputs = document.querySelectorAll('#ctc-fields [data-field-index]');

        if (!nameEl || !summaryEl || !preconditionEl || !stepsEl || !expectedEl) return;

        item.name = nameEl.value.trim();
        item.change_summary = summaryEl.value.trim();
        item.precondition = preconditionEl.value.trim();
        item.steps = stepsEl.value.split('\n').map((line) => line.trim()).filter(Boolean);
        item.expected_result = expectedEl.value.trim();

        fieldInputs.forEach((input) => {
            const idx = Number(input.getAttribute('data-field-index'));
            if (!Number.isNaN(idx) && item.fields[idx]) {
                const fieldName = item.fields[idx].fieldName;
                const fieldValue = input.value;
                item.fields[idx].fieldValue = fieldValue;
                propagateFieldValue(fieldName, fieldValue);
            }
        });
    }

    async function applyCurrentCase() {
        const selected = getSelectedCase();
        if (!selected) return;
        saveCurrentEditor();

        const { item } = selected;
        const endpoint = item.operation === 'update' ? '/update_test_case' : '/create_test_case';
        const payload = {
            name: item.name,
            precondition: item.precondition,
            steps: item.steps,
            expected_result: item.expected_result,
            fields: item.fields,
        };

        if (item.operation === 'update') {
            if (!item.existing_id) {
                setStatus('Для update нужен Existing ID.');
                return;
            }
            payload.test_case_id = Number(item.existing_id);
        }

        setStatus(item.operation === 'update' ? 'Обновляю кейс в Allure...' : 'Создаю кейс в Allure...');
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            setStatus(String(data?.result || 'Операция завершена.'));
            renderResults();
            renderEditor();
        } catch (error) {
            console.error(error);
            setStatus(`Ошибка применения: ${error}`);
        }
    }

    function parseResult(result) {
        if (typeof result !== 'string') return result;
        const trimmed = result.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            return JSON.parse(trimmed);
        }
        const match = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (!match) {
            throw new Error('Не удалось распарсить JSON из ответа модели');
        }
        return JSON.parse(match[1]);
    }

    function normalizeGroupedResponse(raw) {
        if (Array.isArray(raw)) {
            const normalized = {
                most_important: raw.map((item) => normalizeCase(item)),
                less_important: [],
                possibly_affected_existing: [],
            };
            applySharedFields(normalized);
            return normalized;
        }

        const source = raw && typeof raw === 'object' ? raw : {};
        const normalized = {
            most_important: normalizeCaseArray(
                source.most_important || source.mostImportant || source['Самые важные кейсы']
            ),
            less_important: normalizeCaseArray(
                source.less_important || source.lessImportant || source['Менее важные кейсы']
            ),
            possibly_affected_existing: normalizeCaseArray(
                source.possibly_affected_existing || source.possiblyAffectedExisting || source['Возможно затронутые']
            ).map((item) => {
                if (!item.existing_id) {
                    item.operation = 'update';
                }
                return item;
            }),
        };
        applySharedFields(normalized);
        return normalized;
    }

    function normalizeCaseArray(items) {
        return Array.isArray(items) ? items.map((item) => normalizeCase(item)) : [];
    }

    function normalizeCase(raw) {
        const source = raw || {};
        return {
            operation: String(source.operation || source.Operation || 'create').toLowerCase(),
            existing_id: source.existing_id ?? source['Existing ID'] ?? null,
            change_summary: source.change_summary || source['Change summary'] || '',
            name: source.name || source.Name || '',
            precondition: source.precondition || source.Precondition || '',
            steps: Array.isArray(source.Step) ? source.Step : Array.isArray(source.steps) ? source.steps : [],
            expected_result: source.expected_result || source['Expected result'] || '',
            fields: Array.isArray(source.Fields) ? source.Fields : Array.isArray(source.fields) ? source.fields : [],
        };
    }

    function countCases(groups) {
        const most_important = (groups.most_important || []).length;
        const less_important = (groups.less_important || []).length;
        const possibly_affected_existing = (groups.possibly_affected_existing || []).length;
        return {
            most_important,
            less_important,
            possibly_affected_existing,
            total: most_important + less_important + possibly_affected_existing,
        };
    }

    function firstExistingKey() {
        for (const groupKey of Object.keys(GROUP_CONFIG)) {
            if ((groupedCases[groupKey] || []).length) {
                return makeCaseKey(groupKey, 0);
            }
        }
        return null;
    }

    function getSelectedCase() {
        if (!selectedKey) return null;
        const [groupKey, rawIndex] = selectedKey.split(':');
        const index = Number(rawIndex);
        if (!GROUP_CONFIG[groupKey] || Number.isNaN(index)) return null;
        const item = groupedCases[groupKey]?.[index];
        if (!item) return null;
        return { groupKey, index, item };
    }

    function makeCaseKey(groupKey, index) {
        return `${groupKey}:${index}`;
    }

    function emptyGroupedCases() {
        return {
            most_important: [],
            less_important: [],
            possibly_affected_existing: [],
        };
    }

    function applySharedFields(groups) {
        const shared = new Map();
        Object.keys(GROUP_CONFIG).forEach((groupKey) => {
            (groups[groupKey] || []).forEach((item) => {
                (item.fields || []).forEach((field) => {
                    if (!field?.fieldName || shared.has(field.fieldName)) return;
                    shared.set(field.fieldName, field.fieldValue || '');
                });
            });
        });

        Object.keys(GROUP_CONFIG).forEach((groupKey) => {
            (groups[groupKey] || []).forEach((item) => {
                const own = new Map((item.fields || []).filter((field) => field?.fieldName).map((field) => [field.fieldName, field.fieldValue || '']));
                item.fields = Array.from(shared.entries()).map(([fieldName, fieldValue]) => ({
                    fieldName,
                    fieldValue: own.has(fieldName) ? own.get(fieldName) : fieldValue,
                }));
            });
        });
    }

    function propagateFieldValue(fieldName, fieldValue) {
        if (!fieldName) return;
        Object.keys(GROUP_CONFIG).forEach((groupKey) => {
            (groupedCases[groupKey] || []).forEach((caseItem) => {
                const target = (caseItem.fields || []).find((field) => field.fieldName === fieldName);
                if (target) target.fieldValue = fieldValue;
            });
        });
    }

    function setStatus(text) {
        const status = document.getElementById('ctc-status');
        if (status) status.textContent = text || '';
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value)
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    waitForMount();
})();
