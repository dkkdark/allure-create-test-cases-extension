(function () {
    const API_BASE_URL = window.ALLURE_EXTENSION_CONFIG?.API_BASE_URL;

    function ensureStylesInjected() {
        if (document.getElementById('create-test-styles')) return;
        const style = document.createElement('style');
        style.id = 'create-test-styles';
        style.textContent = `
            /* ===== Light theme (default) ===== */
            #create-test-container {
                --ctc-bg: #ffffff;
                --ctc-border: #e5e7eb;
                --ctc-shadow: rgba(0,0,0,0.06);
                --ctc-text: #0f172a;
                --ctc-text-secondary: #334155;
                --ctc-text-muted: #475569;
                --ctc-input-bg: #f8fafc;
                --ctc-input-bg-focus: #ffffff;
                --ctc-input-border: #d1d5db;
                --ctc-input-text: #0f172a;
                --ctc-placeholder: #94a3b8;
                --ctc-card-bg: linear-gradient(180deg, #ffffff, #fbfdff);
                --ctc-card-border: #e5e7eb;
                --ctc-card-shadow: rgba(0,0,0,0.06);
                --ctc-focus-ring: rgba(59, 130, 246, 0.15);
                --ctc-focus-border: #60a5fa;
                --ctc-btn-secondary-bg: #f1f5f9;
                --ctc-btn-secondary-text: #0f172a;
                --ctc-btn-secondary-border: #e2e8f0;
                --ctc-btn-secondary-hover: #e2e8f0;
                --ctc-btn-secondary-shadow: rgba(15,23,42,0.06);
                --ctc-toggle-bg: #f1f5f9;
                --ctc-toggle-hover: #e2e8f0;
                --ctc-toggle-border: #e2e8f0;
            }

            /* ===== Dark theme ===== */
            #create-test-container.ctc-dark {
                --ctc-bg: #1a1b2e;
                --ctc-border: #2d2e45;
                --ctc-shadow: rgba(0,0,0,0.35);
                --ctc-text: #e2e4f0;
                --ctc-text-secondary: #a0a4be;
                --ctc-text-muted: #8a8ea8;
                --ctc-input-bg: #22233a;
                --ctc-input-bg-focus: #282940;
                --ctc-input-border: #3a3b55;
                --ctc-input-text: #e2e4f0;
                --ctc-placeholder: #5c5f7a;
                --ctc-card-bg: linear-gradient(180deg, #202136, #1c1d30);
                --ctc-card-border: #2d2e45;
                --ctc-card-shadow: rgba(0,0,0,0.25);
                --ctc-focus-ring: rgba(91, 141, 239, 0.18);
                --ctc-focus-border: #5b8def;
                --ctc-btn-secondary-bg: #2d2e45;
                --ctc-btn-secondary-text: #c5c8e0;
                --ctc-btn-secondary-border: #3a3b55;
                --ctc-btn-secondary-hover: #3a3b55;
                --ctc-btn-secondary-shadow: rgba(0,0,0,0.2);
                --ctc-toggle-bg: #2d2e45;
                --ctc-toggle-hover: #3a3b55;
                --ctc-toggle-border: #3a3b55;
            }

            #create-test-container { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: var(--ctc-bg);
                border: 1px solid var(--ctc-border);
                border-radius: 14px;
                padding: 16px;
                margin-bottom: 14px;
                box-shadow: 0 6px 24px var(--ctc-shadow);
                transition: background 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
            }
            #create-test-container .ctc-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }
            #create-test-container h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--ctc-text);
            }
            #create-test-container .ctc-theme-toggle {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                border: 1px solid var(--ctc-toggle-border);
                background: var(--ctc-toggle-bg);
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                transition: background 150ms ease, border-color 150ms ease;
            }
            #create-test-container .ctc-theme-toggle:hover {
                background: var(--ctc-toggle-hover);
            }
            #create-test-container .ctc-row { margin-top: 12px; }
            #create-test-container label { color: var(--ctc-text-secondary); font-weight: 600; font-size: 13px; }
            #create-test-container .ctc-textarea {
                width: 100%;
                min-height: 90px;
                padding: 10px 12px;
                border: 1px solid var(--ctc-input-border);
                border-radius: 10px;
                background: var(--ctc-input-bg);
                color: var(--ctc-input-text);
                resize: vertical;
                outline: none;
                transition: box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;
            }
            #create-test-container .ctc-textarea:focus {
                border-color: var(--ctc-focus-border);
                background: var(--ctc-input-bg-focus);
                box-shadow: 0 0 0 4px var(--ctc-focus-ring);
            }
            #create-test-container .ctc-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; align-items: center; }
            #create-test-container .ctc-actions-right { margin-left: auto; display: flex; gap: 6px; }
            #create-test-container .ctc-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 10px;
                border: 1px solid transparent;
                font-weight: 600;
                font-size: 13px;
                cursor: pointer;
                transition: transform 60ms ease, box-shadow 120ms ease, background 120ms ease, border-color 120ms ease;
                user-select: none;
            }
            #create-test-container .ctc-btn:active { transform: translateY(1px); }
            #create-test-container .ctc-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

            /* Button variants */
            #create-test-container .ctc-btn-lg { padding: 10px 20px; font-size: 14px; }
            #create-test-container .primary { background: #2563eb; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }
            #create-test-container .primary:hover:not(:disabled) { background: #1d4ed8; }
            #create-test-container .secondary { background: var(--ctc-btn-secondary-bg); color: var(--ctc-btn-secondary-text); border-color: var(--ctc-btn-secondary-border); box-shadow: 0 2px 8px var(--ctc-btn-secondary-shadow); }
            #create-test-container .secondary:hover:not(:disabled) { background: var(--ctc-btn-secondary-hover); }
            #create-test-container .success { background: #16a34a; color: #fff; box-shadow: 0 2px 8px rgba(22,163,74,0.28); }
            #create-test-container .success:hover:not(:disabled) { background: #15803d; }
            #create-test-container .danger { background: #ef4444; color: #fff; box-shadow: 0 2px 8px rgba(239,68,68,0.28); }
            #create-test-container .danger:hover:not(:disabled) { background: #dc2626; }

            #create-test-container .ctc-btn-sm { padding: 6px 10px; font-size: 12px; }

            #create-test-status { margin-top: 8px; font-size: 12px; color: var(--ctc-text-muted); }

            /* Cards / sections */
            .ctc-card {
                background: var(--ctc-card-bg);
                border: 1px solid var(--ctc-card-border);
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 1px 4px var(--ctc-card-shadow);
                transition: background 200ms ease, border-color 200ms ease;
            }
            .ctc-card + .ctc-card { margin-top: 12px; }

            /* Viewer */
            #test-case-viewer { margin-top: 12px; }
            .ctc-view h4 { margin: 0 0 12px 0; color: var(--ctc-text); font-weight: 700; font-size: 15px; }
            .ctc-field-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
            .ctc-field-row label { width: 160px; font-weight: 600; color: var(--ctc-text-secondary); }
            .ctc-input { flex: 1; padding: 8px 10px; border: 1px solid var(--ctc-input-border); border-radius: 8px; background: var(--ctc-input-bg); color: var(--ctc-input-text) !important; transition: background 200ms ease, border-color 200ms ease; }
            .ctc-input:focus { outline: none; border-color: var(--ctc-focus-border); box-shadow: 0 0 0 4px var(--ctc-focus-ring); }

            #create-test-container input,
            #create-test-container textarea {
                color: var(--ctc-input-text) !important;
            }
            #create-test-container input::placeholder,
            #create-test-container textarea::placeholder {
                color: var(--ctc-placeholder);
            }

            .ctc-nav { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        `;
        document.head.appendChild(style);
    }

    const waitForContainer = setInterval(() => {
        const target = document.querySelector('._3Cy1IG_tree');
        if (target) {
            clearInterval(waitForContainer);
            injectUI(target);
        }
    }, 500);

    let testCasesList = [];
    let currentIndex = 0;
    let editableFields = {};
    let globalFieldValues = {};

    function injectUI(target) {
        if (document.getElementById('create-test-container')) return;
        ensureStylesInjected();

        const container = document.createElement('div');
        container.id = 'create-test-container';
        const isDark = localStorage.getItem('ctc-theme') === 'dark';
        if (isDark) container.classList.add('ctc-dark');

        container.innerHTML = `
            <div class="ctc-header">
                <h3>🧩 Test Case Creation Tool</h3>
                <button id="ctc-theme-btn" class="ctc-theme-toggle" title="Toggle theme">${isDark ? '☀️' : '🌙'}</button>
            </div>
            <div class="ctc-card">
                <div class="ctc-row">
                    <label for="create-test-input">Paste documentation:</label>
                    <textarea id="create-test-input" class="ctc-textarea" placeholder="Paste documentation or test details here"></textarea>
                </div>
                <div class="ctc-actions">
                    <button id="create-test-button" class="ctc-btn primary ctc-btn-lg">Generate Test Case</button>
                    <div class="ctc-actions-right">
                        <button id="load-tests-btn" class="ctc-btn secondary ctc-btn-sm" title="Load Allure Test Cases">📥 Load</button>
                        <button id="save-tests-btn" class="ctc-btn success ctc-btn-sm" title="Save Allure Test Cases">💾 Save</button>
                    </div>
                </div>
                <div id="create-test-status"></div>
            </div>
            <div id="test-case-viewer"></div>
        `;

        target.prepend(container);

        document.getElementById('ctc-theme-btn').addEventListener('click', () => {
            container.classList.toggle('ctc-dark');
            const nowDark = container.classList.contains('ctc-dark');
            localStorage.setItem('ctc-theme', nowDark ? 'dark' : 'light');
            document.getElementById('ctc-theme-btn').textContent = nowDark ? '☀️' : '🌙';
        });

        document.getElementById('create-test-button').addEventListener('click', async () => {
            const input = document.getElementById('create-test-input').value;
            const statusDiv = document.getElementById('create-test-status');
            statusDiv.textContent = 'Generating test case...';
        
            try {
                const response = await fetch(`${API_BASE_URL}/get_test_case`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: input })
                });
        
                let data = await response.json();
                console.log("Raw response:", data);
        
                let result = data.result;
                if (typeof result === 'string') {
                    try {
                        result = JSON.parse(result);
                    } catch {
                        const match = result.match(/(\[.*\]|\{.*\})/s);
                        if (match) result = JSON.parse(match[1]);
                    }
                }
        
                testCasesList = Array.isArray(result) ? result : [result];
                currentIndex = 0;
                globalFieldValues = {};
        
                if (!testCasesList.length || !testCasesList[0]) {
                    statusDiv.textContent = '⚠️ No test case data returned.';
                    return;
                }
        
                statusDiv.textContent = `✅ Generated ${testCasesList.length} test case(s)`;
                renderCurrentTestCase();
            } catch (err) {
                console.error(err);
                statusDiv.textContent = `❌ Error: ${err}`;
            }
        });        

        document.getElementById('load-tests-btn').addEventListener('click', async () => {
            const statusDiv = document.getElementById('create-test-status');
            const loadBtn = document.getElementById('load-tests-btn');
            const timeoutMs = 900000;
            statusDiv.textContent = 'Loading Allure test cases...';
            loadBtn.disabled = true;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                const response = await fetch(`${API_BASE_URL}/load_test_cases_from_allure`, { method: 'POST', signal: controller.signal });
                clearTimeout(timeoutId);
                const data = await response.json();
                const result = data.result?.result || data.result;
                testCasesList = Array.isArray(result) ? result : [result];
                currentIndex = 0;
                globalFieldValues = {};
                statusDiv.textContent = `Loaded ${testCasesList.length} test case(s)`;
                renderCurrentTestCase();
            } catch (err) {
                if (err && err.name === 'AbortError') {
                    statusDiv.textContent = `Error: Request timed out after ${Math.floor(timeoutMs / 60000)} minutes`;
                } else {
                    statusDiv.textContent = `Error: ${err?.message || err}`;
                }
            } finally {
                loadBtn.disabled = false;
            }
        });

        document.getElementById('save-tests-btn').addEventListener('click', async () => {
            const statusDiv = document.getElementById('create-test-status');
            statusDiv.textContent = 'Saving Allure test cases...';
            try {
                const response = await fetch(`${API_BASE_URL}/save_allure_test_cases`, { method: 'POST' });
                const data = await response.json();
                statusDiv.textContent = `Saved: ${JSON.stringify(data.result)}`;
            } catch (err) {
                statusDiv.textContent = `Error: ${err}`;
            }
        });
    }

    function saveCurrentFields() {
        const container = document.getElementById('fields-container');
        if (!container) return;

        const inputs = container.querySelectorAll('input');
        inputs.forEach((inp, idx) => {
            const label = container.querySelector(`label[for="field-${idx}"]`);
            if (label) {
                const fieldName = label.textContent.replace(':', '').trim();
                globalFieldValues[fieldName] = inp.value;
            }
        });
    }

    function renderCurrentTestCase() {
        const viewer = document.getElementById('test-case-viewer');
        viewer.innerHTML = '';
        if (!testCasesList.length) return;
    
        const tc = normalizeTestCase(testCasesList[currentIndex]);
        editableFields = {};
    
        const html = document.createElement('div');
        html.className = 'ctc-card ctc-view';
    
        html.innerHTML = `
            <h4>🧪 Test Case ${currentIndex + 1} of ${testCasesList.length}</h4>
    
            <div class="ctc-row">
                <label for="tc-name">Name</label>
                <textarea id="tc-name" class="ctc-textarea" style="min-height:60px;">${tc.name}</textarea>
            </div>
    
            <div class="ctc-row">
                <label for="tc-precondition">Precondition</label>
                <textarea id="tc-precondition" class="ctc-textarea" style="min-height:80px;">${tc.precondition}</textarea>
            </div>
    
            <div class="ctc-row">
                <label for="tc-steps">Steps</label>
                <textarea id="tc-steps" class="ctc-textarea" style="min-height:120px;">${tc.steps.join('\n')}</textarea>
            </div>
    
            <div class="ctc-row">
                <label for="tc-expected">Expected Result</label>
                <textarea id="tc-expected" class="ctc-textarea" style="min-height:80px;">${tc.expected_result}</textarea>
            </div>
    
            <div class="ctc-row">
                <label>Fields</label>
                <div id="fields-container"></div>
            </div>
    
            <div id="test-case-navigation" class="ctc-nav">
                <button id="prev-btn" class="ctc-btn secondary" ${currentIndex === 0 ? 'disabled' : ''}>Previous</button>
                <button id="next-btn" class="ctc-btn secondary" ${currentIndex === testCasesList.length - 1 ? 'disabled' : ''}>Next</button>
                <button id="remove-btn" class="ctc-btn danger">Remove Current</button>
                <button id="create-btn" class="ctc-btn primary">Create in Allure</button>
            </div>
        `;
        viewer.appendChild(html);
    
        const fieldsContainer = html.querySelector('#fields-container');
        tc.fields.forEach((f, i) => {
            const displayValue = (f.fieldName in globalFieldValues)
                ? globalFieldValues[f.fieldName]
                : f.fieldValue;
            const row = document.createElement('div');
            row.className = 'ctc-field-row';
            row.innerHTML = `
                <label for="field-${i}">${f.fieldName}:</label>
                <input id="field-${i}" class="ctc-input" type="text" value="${displayValue}" />
            `;
            fieldsContainer.appendChild(row);
        });
    
        document.getElementById('prev-btn').addEventListener('click', () => {
            saveCurrentFields();
            if (currentIndex > 0) currentIndex--;
            renderCurrentTestCase();
        });
    
        document.getElementById('next-btn').addEventListener('click', () => {
            saveCurrentFields();
            if (currentIndex < testCasesList.length - 1) currentIndex++;
            renderCurrentTestCase();
        });
    
        document.getElementById('remove-btn').addEventListener('click', () => {
            testCasesList.splice(currentIndex, 1);
            if (currentIndex >= testCasesList.length) currentIndex = Math.max(0, testCasesList.length - 1);
            renderCurrentTestCase();
        });
    
        document.getElementById('create-btn').addEventListener('click', async () => {
            const statusDiv = document.getElementById('create-test-status');
    
            const newFields = [];
            const inputs = html.querySelectorAll('#fields-container input');
            inputs.forEach((inp, idx) => {
                const label = html.querySelector(`label[for="field-${idx}"]`).textContent.replace(':','').trim();
                newFields.push({ fieldName: label, fieldValue: inp.value });
            });
    
            const args = {
                name: document.getElementById('tc-name').value,
                precondition: document.getElementById('tc-precondition').value,
                steps: document.getElementById('tc-steps').value.split('\n').filter(x => x.trim()),
                expected_result: document.getElementById('tc-expected').value,
                fields: newFields
            };
    
            statusDiv.textContent = 'Creating test in Allure...';
            try {
                const response = await fetch(`${API_BASE_URL}/create_test_case`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(args)
                });
                const data = await response.json();
                statusDiv.textContent = `✅ Created: ${JSON.stringify(data.result)}`;
            } catch (err) {
                statusDiv.textContent = `Error: ${err}`;
            }
        });
    }
    
    function normalizeTestCase(raw) {
        if (!raw) return { name: '', precondition: '', steps: [], expected_result: '', fields: [] };
        return {
            name: raw.name || raw.Name || '',
            precondition: raw.precondition || raw.Precondition || '',
            steps: Array.isArray(raw.Step) ? raw.Step : raw.steps || [],
            expected_result: raw.expected_result || raw["Expected result"] || '',
            fields: Array.isArray(raw.Fields)
                ? raw.Fields
                : (raw.fields || [])
        };
    }    
})();
