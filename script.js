document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');

    let lastValidData = null; // Store the last valid parsed JSON object

    function formatJSON(jsonString) {
        try {
            const obj = JSON.parse(jsonString);
            return JSON.stringify(obj, null, 4);
        } catch (error) {
            return `错误: ${error.message}`;
        }
    }

    function minifyJSON(jsonString) {
        try {
            const obj = JSON.parse(jsonString);
            return JSON.stringify(obj);
        } catch (error) {
            return `错误: ${error.message}`;
        }
    }

    function createJsonTree(data, keyName = null, forceExpand = false) {
        const nodeContainer = document.createElement('div');
        nodeContainer.className = 'tree-node';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'tree-item';
        
        if (keyName !== null) {
            const keySpan = document.createElement('span');
            keySpan.className = 'tree-key';
            keySpan.textContent = `"${keyName}": `;
            itemDiv.appendChild(keySpan);
        }

        if (typeof data === 'object' && data !== null) {
            const isArray = Array.isArray(data);
            const keys = Object.keys(data);
            const hasItems = keys.length > 0;

            const toggle = document.createElement('span');
            toggle.className = 'tree-toggle';
            if (!hasItems) toggle.style.visibility = 'hidden';

            const startBracket = document.createElement('span');
            startBracket.className = 'tree-bracket';
            startBracket.textContent = isArray ? '[' : '{';

            const endBracket = document.createElement('span');
            endBracket.className = 'tree-bracket';
            endBracket.textContent = isArray ? ']' : '}';

            const preview = document.createElement('span');
            preview.className = 'tree-preview';
            if (hasItems) {
                preview.textContent = `...`;
            }

            itemDiv.appendChild(toggle);
            itemDiv.appendChild(startBracket);
            if (hasItems) {
                itemDiv.appendChild(preview);
            }
            
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-content collapsed';
            childrenContainer.style.marginLeft = '1.5rem';
            itemDiv.appendChild(childrenContainer);
            itemDiv.appendChild(endBracket);
            
            let childrenRendered = false;

            const expand = () => {
                if (toggle.classList.contains('collapsed')) return;

                preview.classList.add('collapsed');
                childrenContainer.classList.remove('collapsed');
                toggle.classList.add('collapsed');

                if (!childrenRendered && hasItems) {
                    const fragment = document.createDocumentFragment();
                    const items = isArray ? data : Object.entries(data);
                    items.forEach((item, index) => {
                        let childNode;
                        if (isArray) {
                            childNode = createJsonTree(item, null, forceExpand);
                        } else {
                            const [key, value] = item;
                            childNode = createJsonTree(value, key, forceExpand);
                        }
                        if (index < items.length - 1) {
                            const comma = document.createElement('span');
                            comma.className = 'tree-comma';
                            comma.textContent = ',';
                            childNode.appendChild(comma);
                        }
                        fragment.appendChild(childNode);
                    });
                    childrenContainer.appendChild(fragment);
                    childrenRendered = true;
                }
            };
            
            const collapse = () => {
                preview.classList.remove('collapsed');
                childrenContainer.classList.add('collapsed');
                toggle.classList.remove('collapsed');
            };

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggle.classList.toggle('collapsed');
                if (toggle.classList.contains('collapsed')) {
                    expand();
                } else {
                    collapse();
                }
            });

            if (forceExpand) {
                expand();
            }

        } else {
            const valueSpan = document.createElement('span');
            const type = typeof data === 'string' ? 'string' : (typeof data === 'number' ? 'number' : (typeof data === 'boolean' ? 'boolean' : 'null'));
            valueSpan.className = `tree-value ${type}`;
            valueSpan.textContent = type === 'string' ? `"${data}"` : String(data);
            itemDiv.appendChild(valueSpan);
        }
        
        nodeContainer.appendChild(itemDiv);
        return nodeContainer;
    }

    function processInput() {
        const input = jsonInput.value.trim();
        lastValidData = null; // Reset on new input
        if (!input) {
            jsonOutput.innerHTML = '';
            return;
        }

        let result;
        try {
            // Only format mode is needed now
            result = formatJSON(input);

            if (result.startsWith('错误:')) {
                jsonOutput.innerHTML = `<div class="error">${result}</div>`;
            } else {
                const obj = JSON.parse(result);
                lastValidData = obj; // Store valid data
                jsonOutput.innerHTML = '';
                const tree = createJsonTree(obj);
                jsonOutput.appendChild(tree);
            }
        } catch (error) {
            jsonOutput.innerHTML = `<div class="error">错误: ${error.message}</div>`;
        }
    }

    function countNodes(obj) {
        let count = 1;
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    count += countNodes(obj[key]);
                }
            }
        }
        return count;
    }

    expandAllBtn.addEventListener('click', () => {
        if (!lastValidData) return;

        const nodeCount = countNodes(lastValidData);
        if (nodeCount > 5000) {
             if (!confirm(`JSON 数据包含超过 ${nodeCount} 个节点，全部展开可能会导致性能问题。确定要继续吗？`)) {
                 return;
             }
        }
        
        jsonOutput.innerHTML = '';
        const tree = createJsonTree(lastValidData, null, true);
        jsonOutput.appendChild(tree);
    });

    collapseAllBtn.addEventListener('click', () => {
        if (!lastValidData) return;
        jsonOutput.innerHTML = '';
        const tree = createJsonTree(lastValidData, null, false);
        jsonOutput.appendChild(tree);
    });

    // 事件监听器
    formatBtn.addEventListener('click', processInput);
    minifyBtn.addEventListener('click', () => {
        const input = jsonInput.value.trim();
        if (input) {
            const result = minifyJSON(input);
            jsonOutput.innerHTML = `<pre>${result}</pre>`; // Minify doesn't use the tree view
        }
    });
    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        jsonOutput.innerHTML = '';
        lastValidData = null;
    });

    // 输入时自动处理（添加防抖）
    let debounceTimer;
    jsonInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(processInput, 300);
    });

    // 初始化
    processInput();
});