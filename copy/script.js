document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const checkButton = document.getElementById('checkButton');
    const outputDiv = document.getElementById('outputDiv');
    const copyButton = document.getElementById('copyButton');
    const registerKey = document.getElementById('registerKey');
    const registerValue = document.getElementById('registerValue');
    const registerButton = document.getElementById('registerButton');
    const registerOutput = document.getElementById('registerOutput');
    const editSelect = document.getElementById('editSelect');
    const editValue = document.getElementById('editValue');
    const editButton = document.getElementById('editButton');
    const deleteButton = document.getElementById('deleteButton');
    const editOutput = document.getElementById('editOutput');
    const homeDiv = document.getElementById('home');
    const registerDiv = document.getElementById('register');
    const editDiv = document.getElementById('edit');
    const homeLink = document.getElementById('homeLink');
    const registerLink = document.getElementById('registerLink');
    const editLink = document.getElementById('editLink');
    const suggestionsDiv = document.getElementById('suggestions');

    // Load responses from localStorage or set default responses
    const responses = JSON.parse(localStorage.getItem('responses')) || {
        "こんにちは": "こんにちは！お元気ですか？",
        "ありがとう": "どういたしまして！",
        "さようなら": "さようなら！またお会いしましょう！"
    };

    function saveResponses() {
        localStorage.setItem('responses', JSON.stringify(responses));
    }

    function updateEditSelect() {
        editSelect.innerHTML = '<option value="" disabled selected>編集または削除するテキストを選択してください</option>';
        for (const key in responses) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            editSelect.appendChild(option);
        }
    }

    function showSuggestions(input) {
        suggestionsDiv.innerHTML = '';
        if (input.length === 0) return;

        const suggestions = Object.keys(responses).filter(key => key.includes(input));
        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = suggestion;
            div.addEventListener('click', () => {
                inputText.value = suggestion;
                suggestionsDiv.innerHTML = '';
            });
            suggestionsDiv.appendChild(div);
        });
    }

    function linkify(text) {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
    }

    // Navigation links event listeners
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        homeDiv.style.display = 'block';
        registerDiv.style.display = 'none';
        editDiv.style.display = 'none';
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        homeDiv.style.display = 'none';
        registerDiv.style.display = 'block';
        editDiv.style.display = 'none';
    });

    editLink.addEventListener('click', (e) => {
        e.preventDefault();
        homeDiv.style.display = 'none';
        registerDiv.style.display = 'none';
        editDiv.style.display = 'block';
        updateEditSelect();
    });

    // Add event listener to check button
    checkButton.addEventListener('click', () => {
        const text = inputText.value.trim();
        if (responses[text]) {
            outputDiv.innerHTML = linkify(responses[text]);
            copyButton.style.display = 'inline-block';
        } else {
            outputDiv.textContent = "すみません、このテキストには応答が登録されていません。";
            copyButton.style.display = 'none';
        }
    });

    // Add event listener to register button
    registerButton.addEventListener('click', () => {
        const key = registerKey.value.trim();
        const value = registerValue.value.trim();
        if (key && value) {
            responses[key] = value;
            registerOutput.textContent = `"${key}" に対する応答が "${value}" として登録されました。`;
            registerKey.value = '';
            registerValue.value = '';
            saveResponses();
            updateEditSelect();
        } else {
            registerOutput.textContent = "特定テキストと応答テキストの両方を入力してください。";
        }
    });

    // Add event listener to edit button
    editButton.addEventListener('click', () => {
        const key = editSelect.value;
        const newValue = editValue.value.trim();
        if (key && newValue) {
            responses[key] = newValue;
            editOutput.textContent = `"${key}" の応答が "${newValue}" に更新されました。`;
            editValue.value = '';
            saveResponses();
            updateEditSelect();
        } else {
            editOutput.textContent = "編集するテキストと新しい応答テキストの両方を入力してください。";
        }
    });

    // Add event listener to delete button
    deleteButton.addEventListener('click', () => {
        const key = editSelect.value;
        if (key) {
            delete responses[key];
            editOutput.textContent = `"${key}" の応答が削除されました。`;
            saveResponses();
            updateEditSelect();
        } else {
            editOutput.textContent = "削除するテキストを選択してください。";
        }
    });

    // Add event listener to editSelect to show current response
    editSelect.addEventListener('change', () => {
        const key = editSelect.value;
        if (key) {
            editValue.value = responses[key];
        }
    });

    // Add event listener to inputText for suggestions
    inputText.addEventListener('input', () => {
        showSuggestions(inputText.value.trim());
    });

    // Add event listener to copy button
    copyButton.addEventListener('click', () => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = outputDiv.innerHTML;
        const textToCopy = tempDiv.textContent || tempDiv.innerText || "";
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('テキストがコピーされました');
        }).catch(err => {
            alert('コピーに失敗しました');
        });
    });

    updateEditSelect();
});
