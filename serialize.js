document.addEventListener('DOMContentLoaded', () => {
    const jsInput = document.getElementById('jsInput');
    const jsonInput = document.getElementById('jsonInput');
    const toJsonBtn = document.getElementById('toJsonBtn');
    const toJsBtn = document.getElementById('toJsBtn');
    const resultContainer = document.getElementById('resultContainer');

    /**
     * Creates a result block with a title, content, and an optional copy button.
     * @param {string} title The title for the result block.
     * @param {string} content The content to display in the pre tag.
     * @param {boolean} isError Whether this block represents an error message.
     */
    function createResultBlock(title, content, isError = false) {
        const block = document.createElement('div');
        block.className = 'result-block';
        if (isError) {
            block.classList.add('error');
        }

        const titleEl = document.createElement('h4');
        titleEl.textContent = title;
        block.appendChild(titleEl);

        const pre = document.createElement('pre');
        pre.textContent = content;
        block.appendChild(pre);

        if (!isError) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = '复制';
            block.appendChild(copyBtn);

            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(content).then(() => {
                    copyBtn.textContent = '已复制!';
                    copyBtn.style.backgroundColor = '#a5d6a7'; // Green feedback
                    setTimeout(() => {
                        copyBtn.textContent = '复制';
                        copyBtn.style.backgroundColor = ''; // Revert style
                    }, 2000);
                }).catch(err => {
                    copyBtn.textContent = '失败';
                    console.error('复制失败: ', err);
                });
            });
        }
        return block;
    }

    /**
     * Serializes a JavaScript object into a standard or an embedded JSON string.
     */
    toJsonBtn.addEventListener('click', () => {
        resultContainer.innerHTML = ''; // Clear previous results
        const jsString = jsInput.value;
        if (!jsString.trim()) {
            resultContainer.appendChild(createResultBlock('错误', '请输入 JavaScript 对象。', true));
            return;
        }

        try {
            const obj = eval(`(${jsString})`);
            const standardJson = JSON.stringify(obj, null, 4);
            const embeddedJson = JSON.stringify(standardJson);

            resultContainer.appendChild(createResultBlock('内嵌式JSON字符串 (双重序列化)', embeddedJson));
            resultContainer.appendChild(createResultBlock('标准JSON字符串 (单次序列化)', standardJson));
        } catch (e) {
            resultContainer.appendChild(createResultBlock('JS对象转JSON失败', `错误: ${e.message}`, true));
        }
    });

    /**
     * Deserializes a standard or embedded JSON string into a JavaScript object.
     */
    toJsBtn.addEventListener('click', () => {
        resultContainer.innerHTML = ''; // Clear previous results
        const jsonString = jsonInput.value;
        if (!jsonString.trim()) {
            resultContainer.appendChild(createResultBlock('错误', '请输入 JSON 字符串。', true));
            return;
        }

        try {
            let parsedData = JSON.parse(jsonString);
            let title = '✅ 成功反序列化 (标准JSON)';
            let content = parsedData;

            if (typeof parsedData === 'string' && (parsedData.trim().startsWith('{') || parsedData.trim().startsWith('['))) {
                content = JSON.parse(parsedData);
                title = '✅ 成功反序列化 (内嵌式JSON)';
            }
            
            resultContainer.appendChild(createResultBlock(title, JSON.stringify(content, null, 4)));

        } catch (e) {
            resultContainer.appendChild(createResultBlock('JSON转JS对象失败', `错误: ${e.message}`, true));
        }
    });
}); 