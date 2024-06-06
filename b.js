const codeNameInput = document.getElementById('code-name');
const codeList = document.getElementById('code-list');
const htmlCodeInput = document.getElementById('html-code');
const cssCodeInput = document.getElementById('css-code');
const jsCodeInput = document.getElementById('js-code');
const previewFrame = document.getElementById('preview-frame');

// 入力フィールドの変更を検知してリアルタイムでプレビューを更新するイベントリスナーを追加
htmlCodeInput.addEventListener('input', updatePreview);
cssCodeInput.addEventListener('input', updatePreview);
jsCodeInput.addEventListener('input', updatePreview);

function updatePreview() {
    const htmlCode = htmlCodeInput.value;
    const cssCode = `<style>${cssCodeInput.value}</style>`;
    const jsCode = `<script>window.onload = function() { ${jsCodeInput.value} }<\/script>`;
    const combinedCode = `${htmlCode}${cssCode}${jsCode}`;

    const blob = new Blob([combinedCode], { type: 'text/html' });
    previewFrame.src = URL.createObjectURL(blob);

    previewFrame.onload = function() {
        adjustIframeHeight();
    };
}

// iframeの高さを調整する関数
function adjustIframeHeight() {
    const iframeDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
    previewFrame.style.height = iframeDocument.documentElement.scrollHeight + 'px';
}

// 保存されたコードリストの更新
function updateCodeList() {
    codeList.innerHTML = '';
    const savedCodes = JSON.parse(localStorage.getItem('savedCodes') || '{}');
    Object.keys(savedCodes).forEach(codeName => {
        const li = document.createElement('li');
        const text = document.createTextNode(codeName);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.style.marginLeft = '10px';

        li.appendChild(text);
        li.appendChild(deleteButton);

        deleteButton.addEventListener('click', () => {
            delete savedCodes[codeName];
            localStorage.setItem('savedCodes', JSON.stringify(savedCodes));
            updateCodeList();
        });

        li.addEventListener('click', () => {
            const code = savedCodes[codeName];
            htmlCodeInput.value = code.html;
            cssCodeInput.value = code.css;
            jsCodeInput.value = code.js;
            updatePreview();  // コードを読み込んだ後にプレビューを更新
        });

        codeList.appendChild(li);
    });
}

// ページ読み込み時に保存されたコードリストを更新
window.onload = updateCodeList;