document.addEventListener('DOMContentLoaded', () => {
    const json1Input = document.getElementById('json1');
    const json2Input = document.getElementById('json2');
    const diffBtn = document.getElementById('diffBtn');
    const diffResultContainer = document.getElementById('diffResult');

    // 1. Create a jsondiffpatch instance
    const jdp = jsondiffpatch.create({
        // objectHash: (obj, index) -> obj.id || obj._id || `$$index:${index}`
    });

    diffBtn.addEventListener('click', () => {
        let json1, json2;

        // 2. Clear previous results and parse JSON inputs
        diffResultContainer.innerHTML = '';
        try {
            json1 = json1Input.value ? JSON.parse(json1Input.value) : undefined;
            json2 = json2Input.value ? JSON.parse(json2Input.value) : undefined;
        } catch (e) {
            diffResultContainer.innerHTML = `<div class="result-block error"><h4>JSON解析失败</h4><pre>${e.message}</pre></div>`;
            return;
        }

        // 3. Compute the difference
        const delta = jdp.diff(json1, json2);

        // 4. Format and display the difference, or a "no difference" message
        if (delta) {
            diffResultContainer.innerHTML = jsondiffpatch.formatters.html.format(delta, json1);
        } else {
            diffResultContainer.innerHTML = '<div class="no-diff-message">✅ 两个JSON完全一致</div>';
        }
    });
}); 