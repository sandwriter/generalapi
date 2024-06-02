chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background script:', request);
    if (request.action === "fillForm") {
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            files: ['content.js']
        });
    }
});
