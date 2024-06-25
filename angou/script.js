function encryptText() {
    const plainText = document.getElementById('plainText').value;
    const encryptionKey = document.getElementById('encryptionKey').value;

    if (!plainText || !encryptionKey) {
        alert('テキストと暗号化キーを入力してください');
        return;
    }

    const encrypted = CryptoJS.AES.encrypt(plainText, encryptionKey).toString();
    const encryptedBase64 = btoa(encrypted).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    document.getElementById('encryptedText').value = encryptedBase64;
}

function decryptText() {
    const encryptedText = document.getElementById('textToDecrypt').value;
    const decryptionKey = document.getElementById('decryptionKey').value;

    if (!encryptedText || !decryptionKey) {
        alert('暗号化テキストと復号化キーを入力してください');
        return;
    }

    const encryptedBase64 = atob(encryptedText.replace(/-/g, '+').replace(/_/g, '/'));
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, decryptionKey).toString(CryptoJS.enc.Utf8);
        document.getElementById('decryptedText').value = decrypted;
    } catch (e) {
        alert('復号化に失敗しました。キーまたは暗号化テキストを確認してください。');
    }
}
