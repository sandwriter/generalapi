document.getElementById('fillForm').addEventListener('click', () => {
    console.log('fillForm clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('Sending message to content script');
        chrome.tabs.sendMessage(tabs[0].id, { action: "fillForm" });
    });
});
