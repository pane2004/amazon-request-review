console.log("hello world from background!");
let originalTabId = null;

// listen to
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openNewTabOrder") {
    originalTabId = sender.tab.id;
    chrome.tabs.create({ url: request.url }, (newTab) => {
      chrome.tabs.onUpdated.addListener(function listener(
        tabId,
        changeInfo,
        tab
      ) {
        if (tabId === newTab.id && changeInfo.status === "complete") {
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            files: ["scripts/requestReview.js"],
          });
          chrome.tabs.onUpdated.removeListener(listener);
          sendResponse(); 
        }
      });
    });
  }
  if (request.action === "acceptRequestConfirmation") {
    chrome.tabs.update(sender.tab.id, { url: request.href }, (updatedTab) => {
      chrome.tabs.onUpdated.addListener(function listener(
        tabId,
        changeInfo,
        tab
      ) {
        if (tabId === updatedTab.id && changeInfo.status === "complete") {
          chrome.scripting.executeScript({
            target: { tabId: updatedTab.id },
            files: ["scripts/confirmReview.js"],
          });
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }
  if (request.action === "closeRequestWindow") {
    chrome.tabs.remove(sender.tab.id);
    if (originalTabId) {
      chrome.tabs.update(originalTabId, { active: true }); 
      originalTabId = null;
    }
  }
  return true;
});
