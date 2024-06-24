let options = [];
let history = [];

// ページが読み込まれた際に、ローカルストレージから履歴を読み込む
window.onload = function() {
    if(localStorage.getItem("history")) {
        history = JSON.parse(localStorage.getItem("history"));
        updateHistoryList();
    }
};

document.getElementById('optionInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        addOption();
    }
});

function addOption() {
    const optionInput = document.getElementById('optionInput');
    const optionValue = optionInput.value.trim();
    if (optionValue) {
        options.push(optionValue);
        updateOptionList();
        optionInput.value = '';
        saveHistory(); // 選択肢が追加された後に履歴を保存する
    }
}

function updateOptionList() {
    const optionList = document.getElementById('optionList');
    optionList.innerHTML = '';
    options.forEach((option, index) => {
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';

        const optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.value = option;
        optionInput.onchange = () => editOption(index, optionInput.value);
        optionItem.appendChild(optionInput);

        const deleteButton = document.createElement('button');
        deleteButton.innerText = '削除';
        deleteButton.onclick = () => removeOption(index);
        optionItem.appendChild(deleteButton);

        optionList.appendChild(optionItem);
    });
}

function editOption(index, newValue) {
    options[index] = newValue.trim();
}

function removeOption(index) {
    options.splice(index, 1);
    updateOptionList();
    saveHistory(); // 選択肢が削除された後に履歴を保存する
}

function choose() {
    if (options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length);
        const chosenOption = options[randomIndex];
        document.getElementById('result').innerText = chosenOption + 'が選ばれました！';
        addToHistory(chosenOption);
        clearOptions();
    } else {
        document.getElementById('result').innerText = '選択肢を追加してください。';
    }
}

function clearOptions() {
    options.length = 0;
    updateOptionList();
    document.getElementById('result').innerText = '';
}

function addToHistory(option) {
    history.unshift(option);
    if (history.length > 10) {
        history.pop();
    }
    updateHistoryList();
    saveHistory(); // 履歴が更新された後に履歴を保存する
}

function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    history.forEach((option, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerText = `${index + 1}: ${option}`;

        const deleteButton = document.createElement('button');
        deleteButton.innerText = '削除';
        deleteButton.onclick = () => removeHistory(index);
        historyItem.appendChild(deleteButton);

        historyList.appendChild(historyItem);
    });
}

function removeHistory(index) {
    history.splice(index, 1);
    updateHistoryList();
    saveHistory(); // 履歴が削除された後に履歴を保存する
}

function clearHistory() {
    history.length = 0;
    updateHistoryList();
    localStorage.removeItem("history"); // ローカルストレージから履歴を削除する
}

// 履歴をローカルストレージに保存する関数
function saveHistory() {
    localStorage.setItem("history", JSON.stringify(history));
}
