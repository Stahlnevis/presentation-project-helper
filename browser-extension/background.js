chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "secureEvidence",
        title: "🔐 Secure Page as Evidence",
        contexts: ["page", "selection", "image"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "secureEvidence") {
        chrome.tabs.create({
            url: "http://localhost:5173/evidence-vault/capture"
        });
    }
});
