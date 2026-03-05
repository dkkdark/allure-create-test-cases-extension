(function () {
    const API_BASE_URL = window.ALLURE_EXTENSION_CONFIG?.API_BASE_URL;

    function ensureStylesInjected() {
        if (document.getElementById('create-test-styles')) return;
        const style = document.createElement('style');
        style.id = 'create-test-styles';
        style.textContent = `
            #create-test-container { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 14px;
                padding: 16px;
                margin-bottom: 14px;
                box-shadow: 0 6px 24px rgba(0,0,0,0.06);
            }
            #create-test-container h3 {
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
                color: #0f172a;
            }
            #create-test-container .ctc-row { margin-top: 12px; }
            #create-test-container label { color: #334155; font-weight: 600; font-size: 13px; }
            #create-test-container .ctc-textarea {
                width: 100%;
                min-height: 90px;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 10px;
                background: #f8fafc;
                color: #0f172a;
                resize: vertical;
                outline: none;
                transition: box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;
            }
            #create-test-container .ctc-textarea:focus {
                border-color: #60a5fa;
                background: #ffffff;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
            }
            #create-test-container .ctc-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
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
            #create-test-container .ctc-btn:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

            /* Button variants */
            #create-test-container .primary { background: #2563eb; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }
            #create-test-container .primary:hover:not(:disabled) { background: #1d4ed8; }
            #create-test-container .secondary { background: #f1f5f9; color: #0f172a; border-color: #e2e8f0; box-shadow: 0 2px 8px rgba(15,23,42,0.06); }
            #create-test-container .secondary:hover:not(:disabled) { background: #e2e8f0; }
            #create-test-container .success { background: #16a34a; color: #fff; box-shadow: 0 2px 8px rgba(22,163,74,0.28); }
            #create-test-container .success:hover:not(:disabled) { background: #15803d; }
            #create-test-container .danger { background: #ef4444; color: #fff; box-shadow: 0 2px 8px rgba(239,68,68,0.28); }
            #create-test-container .danger:hover:not(:disabled) { background: #dc2626; }

            #create-test-status { margin-top: 8px; font-size: 12px; color: #475569; }

            /* Cards / sections */
            .ctc-card {
                background: linear-gradient(180deg, #ffffff, #fbfdff);
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.06);
            }
            .ctc-card + .ctc-card { margin-top: 12px; }

            /* Viewer */
            #test-case-viewer { margin-top: 12px; }
            .ctc-view h4 { margin: 0 0 12px 0; color: #0f172a; font-weight: 700; font-size: 15px; }
            .ctc-field-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
            .ctc-field-row label { width: 160px; font-weight: 600; color: #334155; }
            .ctc-input { flex: 1; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; background: #ffffff; }
            .ctc-input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }

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

    function injectUI(target) {
        if (document.getElementById('create-test-container')) return;
        ensureStylesInjected();

        const container = document.createElement('div');
        container.id = 'create-test-container';
        container.innerHTML = `
            <h3>🧩 Test Case Creation Tool</h3>
            <div class="ctc-card">
                <div class="ctc-row">
                    <label for="create-test-input">Paste documentation:</label>
                    <textarea id="create-test-input" class="ctc-textarea" placeholder="Paste documentation or test details here"></textarea>
                </div>
                <div class="ctc-actions">
                    <button id="create-test-button" class="ctc-btn primary">Generate Test Case</button>
                    <button id="load-tests-btn" class="ctc-btn secondary">Load Allure Test Cases</button>
                    <button id="save-tests-btn" class="ctc-btn success">Save Allure Test Cases</button>
                </div>
                <div id="create-test-status"></div>
            </div>
            <div id="test-case-viewer"></div>
        `;

        target.prepend(container);

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
            const row = document.createElement('div');
            row.className = 'ctc-field-row';
            row.innerHTML = `
                <label for="field-${i}">${f.fieldName}:</label>
                <input id="field-${i}" class="ctc-input" type="text" value="${f.fieldValue}" />
            `;
            fieldsContainer.appendChild(row);
        });
    
        document.getElementById('prev-btn').addEventListener('click', () => {
            if (currentIndex > 0) currentIndex--;
            renderCurrentTestCase();
        });
    
        document.getElementById('next-btn').addEventListener('click', () => {
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
