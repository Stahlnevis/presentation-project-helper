document.getElementById('openVault').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://presentation-project-helper.vercel.app/evidence-vault/capture' });
});
