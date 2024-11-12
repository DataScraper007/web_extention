chrome.action.onClicked.addListener((tab) => {
    // Check if the current tab's URL is not a `chrome://` URL
    if (!tab.url.startsWith("chrome://")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
    } else {
        console.warn("Cannot inject script on a chrome:// page.");
    }
});
