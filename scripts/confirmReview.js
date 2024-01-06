function waitForElement(selector, timeout = 100) {
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(
          `Element with selector "${selector}" not found within ${timeout} ms`
        )
      );
    }, timeout);
  });
}

waitForElement('kat-button[label="Yes"]')
  .then((element) => {
    if (element) element.click();
    chrome.runtime.sendMessage({ action: "closeRequestWindow" });
  })
  .catch((error) => {
    console.error(error.message);
    chrome.runtime.sendMessage({ action: "logError", error: error.message });
    chrome.runtime.sendMessage({ action: "closeRequestWindow" });
  });
