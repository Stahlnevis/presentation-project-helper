document.getElementById('openVault').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173/evidence-vault/capture' });
});
