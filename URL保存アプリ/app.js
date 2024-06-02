document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        authForm: document.getElementById('authForm'),
        usernameInput: document.getElementById('usernameInput'),
        passwordInput: document.getElementById('passwordInput'),
        appSection: document.getElementById('appSection'),
        authSection: document.getElementById('authSection'),
        addUrlButton: document.getElementById('addUrlButton'),
        urlForm: document.getElementById('urlForm'),
        urlInput: document.getElementById('urlInput'),
        titleInput: document.getElementById('titleInput'),
        descriptionInput: document.getElementById('descriptionInput'),
        tagInput: document.getElementById('tagInput'),
        searchInput: document.getElementById('searchInput'),
        searchButton: document.getElementById('searchButton'),
        openModeSelect: document.getElementById('openMode'),
        urlCategories: document.getElementById('urlCategories'),
        logoutButton: document.getElementById('logoutButton'),
        exportButton: document.getElementById('exportButton'),
        importButton: document.getElementById('importButton'),
        importData: document.getElementById('importData')
    };

    const users = JSON.parse(localStorage.getItem('users')) || {};

    elements.authForm.addEventListener('submit', event => {
        event.preventDefault();
        const username = elements.usernameInput.value;
        const password = elements.passwordInput.value;
        handleAuthentication(username, password);
    });

    elements.logoutButton.addEventListener('click', handleLogout);
    elements.addUrlButton.addEventListener('click', () => elements.urlForm.style.display = 'block');
    elements.urlForm.addEventListener('submit', event => {
        event.preventDefault();
        saveAndDisplayUrl();
    });
    elements.searchButton.addEventListener('click', () => {
        const query = elements.searchInput.value.toLowerCase();
        searchUrls(query);
    });
    elements.exportButton.addEventListener('click', exportData);
    elements.importButton.addEventListener('click', importData);

    if (localStorage.getItem('currentUser')) {
        elements.authSection.style.display = 'none';
        elements.appSection.style.display = 'block';
        displayUrls();
    }

    function handleAuthentication(username, password) {
        if (!users[username]) {
            users[username] = { password, urls: {} };
            localStorage.setItem('users', JSON.stringify(users));
        }
        if (users[username].password === password) {
            localStorage.setItem('currentUser', username);
            elements.authSection.style.display = 'none';
            elements.appSection.style.display = 'block';
            displayUrls();
        } else {
            alert('パスワードが間違っています');
        }
    }

    function handleLogout() {
        localStorage.removeItem('currentUser');
        elements.authSection.style.display = 'block';
        elements.appSection.style.display = 'none';
    }

    function saveAndDisplayUrl() {
        const url = elements.urlInput.value;
        const title = elements.titleInput.value || 'No Title';
        const description = elements.descriptionInput.value || 'No Description';
        const tag = elements.tagInput.value;

        saveUrl(url, title, description, tag);
        clearForm();
        elements.urlForm.style.display = 'none';
        displayUrls();
    }

    function clearForm() {
        elements.urlInput.value = '';
        elements.titleInput.value = '';
        elements.descriptionInput.value = '';
    }

    function saveUrl(url, title, description, tag) {
        const currentUser = localStorage.getItem('currentUser');
        const userUrls = users[currentUser].urls;
        const domain = new URL(url).hostname;

        if (!userUrls[domain]) {
            userUrls[domain] = [];
        }
        if (!userUrls[domain].some(item => item.url === url)) {
            userUrls[domain].push({ url, title, description, tag });
            users[currentUser].urls = userUrls;
            localStorage.setItem('users', JSON.stringify(users));
        } else {
            alert('このURLはすでに保存されています');
        }
    }

    function getUrls() {
        const currentUser = localStorage.getItem('currentUser');
        return users[currentUser].urls;
    }

    function searchUrls(query) {
        const urls = getUrls();
        const results = [];

        for (const [domain, urlList] of Object.entries(urls)) {
            urlList.forEach(urlItem => {
                if (urlItem.title.toLowerCase().includes(query) ||
                    domain.toLowerCase().includes(query) ||
                    urlItem.tag.toLowerCase().includes(query) ||
                    urlItem.description.toLowerCase().includes(query)) {
                    results.push(urlItem);
                }
            });
        }

        displaySearchResults(results);
    }

    function displaySearchResults(results) {
        elements.urlCategories.innerHTML = '';

        if (results.length === 0) {
            elements.urlCategories.innerHTML = '<p>検索結果がありません。</p>';
            return;
        }

        results.forEach((urlItem, index) => {
            const li = createUrlListItem(urlItem, index);
            elements.urlCategories.appendChild(li);
        });
    }

    function displayUrls() {
        const urls = getUrls();
        elements.urlCategories.innerHTML = '';

        for (const [domain, urlList] of Object.entries(urls)) {
            const domainSection = document.createElement('div');
            const domainTitle = document.createElement('h3');
            domainTitle.textContent = domain;
            domainSection.appendChild(domainTitle);

            const ul = document.createElement('ul');
            urlList.forEach((urlItem, index) => {
                const li = createUrlListItem(urlItem, index, domain);
                ul.appendChild(li);
            });
            domainSection.appendChild(ul);
            elements.urlCategories.appendChild(domainSection);
        }
    }

    function createUrlListItem(urlItem, index, domain = null) {
        const li = document.createElement('li');

        const a = document.createElement('a');
        a.href = urlItem.url;
        a.textContent = urlItem.title;
        a.classList.add('editable');
        li.appendChild(a);

        const shortDescription = document.createElement('span');
        shortDescription.textContent = urlItem.description.slice(0, 30) + (urlItem.description.length > 30 ? '...' : '');
        shortDescription.classList.add('editable');
        li.appendChild(shortDescription);

        const tagSelectDetailsContainer = document.createElement('div');
        tagSelectDetailsContainer.classList.add('tag-select-details-container');

        const tagSelect = document.createElement('select');
        tagSelect.innerHTML = `<option value="#動画">#動画</option>
                                <option value="#サイト">#サイト</option>
                                <option value="#ゲーム">#ゲーム</option>`;
        tagSelect.value = urlItem.tag;
        tagSelect.addEventListener('change', () => {
            updateTag(index, tagSelect.value, domain);
        });
        tagSelectDetailsContainer.appendChild(tagSelect);

        const detailsButton = document.createElement('button');
        detailsButton.textContent = '▽';
        detailsButton.addEventListener('click', () => {
            toggleDetails(li, detailsButton);
        });
        tagSelectDetailsContainer.appendChild(detailsButton);

        li.appendChild(tagSelectDetailsContainer);

        const details = document.createElement('div');
        details.classList.add('details', 'hidden');
        li.appendChild(details);

        const openButton = createButton('開く', () => openUrl(urlItem, li));
        details.appendChild(openButton);

        const copyButton = createButton('コピー', () => copyUrl(urlItem.url));
        details.appendChild(copyButton);

        const editButton = createButton('✎', () => toggleEdit(a, shortDescription, editButton, urlItem, index, domain));
        details.appendChild(editButton);

        const deleteButton = createButton('削除', () => {
            deleteUrl(index, domain);
            displayUrls();
        });
        details.appendChild(deleteButton);

        const iframeContainer = document.createElement('div');
        iframeContainer.classList.add('iframe-container');
        iframeContainer.style.display = 'none';
        const urlIframe = document.createElement('iframe');
        urlIframe.width = '100%';
        urlIframe.height = '500px';
        urlIframe.frameBorder = '0';
        urlIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        urlIframe.allowFullscreen = true;
        iframeContainer.appendChild(urlIframe);
        li.appendChild(iframeContainer);

        return li;
    }

    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }

    function toggleDetails(li, detailsButton) {
        const details = li.querySelector('.details');
        if (details.classList.contains('hidden')) {
            details.classList.remove('hidden');
            detailsButton.textContent = '▼';
        } else {
            details.classList.add('hidden');
            detailsButton.textContent = '▽';
        }
    }

    function openUrl(urlItem, li) {
        const iframeContainer = li.querySelector('.iframe-container');
        if (elements.openModeSelect.value === 'samePage') {
            if (iframeContainer.style.display === 'block') {
                iframeContainer.style.display = 'none';
            } else {
                iframeContainer.style.display = 'block';
                const urlIframe = iframeContainer.querySelector('iframe');
                if (urlItem.url.includes('youtube.com')) {
                    const videoId = new URL(urlItem.url).searchParams.get('v');
                    urlIframe.src = `https://www.youtube.com/embed/${videoId}`;
                } else {
                    urlIframe.src = urlItem.url;
                }
            }
        } else {
            window.open(urlItem.url, '_blank');
        }
    }

    function copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            alert('URLがコピーされました');
        }).catch(err => {
            alert('URLのコピーに失敗しました: ' + err);
        });
    }

    function toggleEdit(a, shortDescription, editButton, urlItem, index, domain) {
        if (a.contentEditable === 'true') {
            const updatedUrlItem = {
                ...urlItem,
                title: a.textContent,
                description: shortDescription.textContent
            };
            a.contentEditable = 'false';
            shortDescription.contentEditable = 'false';
            editButton.textContent = '✎';
            updateUrl(index, updatedUrlItem, domain);
        } else {
            a.contentEditable = 'true';
            shortDescription.contentEditable = 'true';
            editButton.textContent = '✔';
        }
    }

    function updateUrl(index, updatedUrlItem, domain) {
        const currentUser = localStorage.getItem('currentUser');
        if (domain) {
            users[currentUser].urls[domain][index] = updatedUrlItem;
        } else {
            for (const [dom, urlList] of Object.entries(users[currentUser].urls)) {
                if (urlList[index] === updatedUrlItem) {
                    users[currentUser].urls[dom][index] = updatedUrlItem;
                }
            }
        }
        localStorage.setItem('users', JSON.stringify(users));
    }

    function updateTag(index, newTag, domain) {
        const currentUser = localStorage.getItem('currentUser');
        if (domain) {
            users[currentUser].urls[domain][index].tag = newTag;
        } else {
            for (const [dom, urlList] of Object.entries(users[currentUser].urls)) {
                if (urlList[index].tag === newTag) {
                    users[currentUser].urls[dom][index].tag = newTag;
                }
            }
        }
        localStorage.setItem('users', JSON.stringify(users));
    }

    function deleteUrl(index, domain) {
        const currentUser = localStorage.getItem('currentUser');
        let userUrls = users[currentUser].urls;
        userUrls[domain].splice(index, 1);
        if (userUrls[domain].length === 0) {
            delete userUrls[domain];
        }
        users[currentUser].urls = userUrls;
        localStorage.setItem('users', JSON.stringify(users));
    }

    function exportData() {
        const currentUser = localStorage.getItem('currentUser');
        const userUrls = users[currentUser].urls;
        const exportText = JSON.stringify(userUrls);
        navigator.clipboard.writeText(exportText).then(() => {
            alert('データがクリップボードにコピーされました');
        }).catch(err => {
            alert('データのコピーに失敗しました: ' + err);
        });
    }

    function importData() {
        const currentUser = localStorage.getItem('currentUser');
        try {
            const importText = elements.importData.value;
            const importedUrls = JSON.parse(importText);
            users[currentUser].urls = importedUrls;
            localStorage.setItem('users', JSON.stringify(users));
            displayUrls();
            alert('データがインポートされました');
        } catch (error) {
            alert('データのインポートに失敗しました: ' + error);
        }
    }
});
