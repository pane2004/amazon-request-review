function waitForElement(selector, timeout = 1000) {
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

    // Timeout to reject the promise if the element is not found within the given time
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

waitForElement('[data-test-id="plugin-button-requestAReview"] a')
  .then((element) => {
    console.log("Element found:", element);
    chrome.runtime.sendMessage({
      action: "acceptRequestConfirmation",
      href: element.href,
    });
  })
  .catch((error) => {
    console.error(error.message);
    // Optionally, send an error message to the background script
    chrome.runtime.sendMessage({ action: "logError", error: error.message });
    chrome.runtime.sendMessage({ action: "closeRequestWindow" });
  });
