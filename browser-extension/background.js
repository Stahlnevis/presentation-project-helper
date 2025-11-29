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
            url: "https://presentation-project-helper.vercel.app/evidence-vault/capture"
        });
    }
});
