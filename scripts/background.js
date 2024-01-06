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
          sendResponse(); // Send response back to content script
        }
      });
    });
  }
  if (request.action === "acceptRequestConfirmation") {
    // Update the current tab to the specified URL
    chrome.tabs.update(sender.tab.id, { url: request.href }, (updatedTab) => {
      // Wait for the tab to finish loading before injecting the new script
      chrome.tabs.onUpdated.addListener(function listener(
        tabId,
        changeInfo,
        tab
      ) {
        if (tabId === updatedTab.id && changeInfo.status === "complete") {
          // Inject the new script into the tab
          chrome.scripting.executeScript({
            target: { tabId: updatedTab.id },
            files: ["scripts/confirmReview.js"], // Replace with the path to your new script
          });
          // Remove the listener to avoid duplicate injections
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }
  if (request.action === "closeRequestWindow") {
    chrome.tabs.remove(sender.tab.id);
    // Check if the originalTabId is stored and valid
    if (originalTabId) {
      chrome.tabs.update(originalTabId, { active: true }); // Focus back on the original tab
      originalTabId = null; // Reset the originalTabId
    }
  }
  return true;
});
