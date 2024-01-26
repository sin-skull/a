const codeNameInput = document.getElementById('code-name');
const saveButton = document.getElementById('save-button');
const runButton = document.getElementById('run-button');
const codeList = document.getElementById('code-list');
const htmlCodeInput = document.getElementById('html-code');
const cssCodeInput = document.getElementById('css-code');
const jsCodeInput = document.getElementById('js-code');
const previewFrame = document.getElementById('preview-frame');

// 実行ボタンのイベントリスナー
runButton.addEventListener('click', () => {
    const htmlCode = htmlCodeInput.value;
    const cssCode = `<style>${cssCodeInput.value}</style>`;
    const jsCode = `<script>window.onload = function() { ${jsCodeInput.value} }<\/script>`;
    const combinedCode = `${htmlCode}${cssCode}${jsCode}`;

    const blob = new Blob([combinedCode], { type: 'text/html' });
    previewFrame.src = URL.createObjectURL(blob);
});

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
        });

        codeList.appendChild(li);
    });
}

// 保存ボタンのイベントリスナー
saveButton.addEventListener('click', () => {
    const codeName = codeNameInput.value;
    if (!codeName) {
        alert('コード名を入力してください。');
        return;
    }
    const savedCodes = JSON.parse(localStorage.getItem('savedCodes') || '{}');
    savedCodes[codeName] = {
        html: htmlCodeInput.value,
        css: cssCodeInput.value,
        js: jsCodeInput.value
    };
    localStorage.setItem('savedCodes', JSON.stringify(savedCodes));
    updateCodeList();
    alert(`${codeName} として保存しました。`);
});

// ページ読み込み時に保存されたコードリストを更新
window.onload = updateCodeList;

document.getElementById('add-code-set-button').addEventListener('click', addCodeSet);
let codeSetCounter = 0;

function addCodeSet() {
    const container = document.getElementById('code-set-container');
    const codeSetDiv = document.createElement('div');
    const codeSetName = `code-set-${codeSetCounter++}`;
    codeSetDiv.id = codeSetName;
    codeSetDiv.classList.add('code-set');

    // コード名を入力するフィールドを作成
    const nameInput = document.createElement('input');
    nameInput.placeholder = 'コード名を入力';
    codeSetDiv.appendChild(nameInput);

    // HTMLコードエリアを作成
    const htmlTextArea = document.createElement('textarea');
    htmlTextArea.placeholder = 'HTMLコードを入力';
    codeSetDiv.appendChild(htmlTextArea);

    // CSSコードエリアを作成
    const cssTextArea = document.createElement('textarea');
    cssTextArea.placeholder = 'CSSコードを入力';
    codeSetDiv.appendChild(cssTextArea);

    // JavaScriptコードエリアを作成
    const jsTextArea = document.createElement('textarea');
    jsTextArea.placeholder = 'JavaScriptコードを入力';
    codeSetDiv.appendChild(jsTextArea);

    // 実行ボタンを作成
    const runButton = document.createElement('button');
    runButton.textContent = 'このコードを実行';
    runButton.addEventListener('click', () => executeCode(htmlTextArea.value, cssTextArea.value, jsTextArea.value));
    codeSetDiv.appendChild(runButton);

    container.appendChild(codeSetDiv);
}

function executeCode(htmlCode, cssCode, jsCode) {
    const fullCode = `
        <html>
        <head>
            <style>${cssCode}</style>
        </head>
        <body>
            ${htmlCode}
            <script>${jsCode}<\/script>
        </body>
        </html>
    `;

    // 新しいウィンドウまたはiframeでコードを実行
    const newWindow = window.open();
    newWindow.document.open();
    newWindow.document.write(fullCode);
    newWindow.document.close();
}

document.getElementById('save-all-code-sets-button').addEventListener('click', saveAllCodeSets);

function saveAllCodeSets() {
    const allCodeSets = document.querySelectorAll('.code-set');
    const codeSetsData = Array.from(allCodeSets).map(codeSet => {
        return {
            name: codeSet.querySelector('input').value,
            html: codeSet.querySelector('textarea:nth-child(2)').value,
            css: codeSet.querySelector('textarea:nth-child(3)').value,
            js: codeSet.querySelector('textarea:nth-child(4)').value
        };
    });

    localStorage.setItem('allCodeSets', JSON.stringify(codeSetsData));
    alert('全てのコードセットを保存しました。');
}
const frame = document.getElementById("preview-frame");
let isResizing = false;
let initialX;
let currentWidth;

frame.addEventListener("mousedown", (e) => {
    isResizing = true;
    initialX = e.clientX;
    currentWidth = frame.offsetWidth;
});

document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    const newWidth = currentWidth + (e.clientX - initialX);
    frame.style.width = newWidth + "px";
});

document.addEventListener("mouseup", () => {
    isResizing = false;
});
