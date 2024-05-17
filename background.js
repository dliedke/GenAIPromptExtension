function injectContentScriptAndSendMessage(tabId, prompt) {
  chrome.scripting.executeScript({
      target: {
          tabId: tabId
      },
      files: ['contentScript.js']
  }, () => {
      // After ensuring the script is injected, send the prompt message
      sendMessageToTab(tabId, prompt);
  });
}

function sendMessageToTab(tabId, prompt) {
  chrome.tabs.sendMessage(tabId, {
      action: "fillPrompt",
      prompt: prompt
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const serviceUrls = {
      "GPT": "https://chatgpt.com/",
      "Gemini": "https://gemini.google.com/app",
      "Claude": "https://claude.ai/chats",
      "Groq": "https://groq.com/"
  };

  // Filter URLs based on the selected services
  const urlsToOpen = message.services.map(service => serviceUrls[service]);

  urlsToOpen.forEach(url => {
      chrome.tabs.query({}, tabs => {
          let foundTab = tabs.find(tab => new URL(tab.url).origin === new URL(url).origin);

          if (foundTab) {
              // Focus the tab
              chrome.tabs.update(foundTab.id, {
                  active: true
              }, () => {
                  // After focusing the tab, focus the window it's in
                  chrome.windows.update(foundTab.windowId, {
                      focused: true
                  }, () => {
                      // Then inject the content script and send the message
                      injectContentScriptAndSendMessage(foundTab.id, message.prompt);
                  });
              });
          } else {
              // If the tab is not found, create a new one
              chrome.tabs.create({
                  url: url
              }, newTab => {
                  function tabUpdateListener(tabId, changeInfo) {
                      if (tabId === newTab.id && changeInfo.status === "complete") {
                          // Remove the listener to avoid memory leaks
                          chrome.tabs.onUpdated.removeListener(tabUpdateListener);
                          // Send the message to the new tab
                          sendMessageToTab(newTab.id, message.prompt);
                      }
                  }
                  // Add a listener to know when the tab has finished loading
                  chrome.tabs.onUpdated.addListener(tabUpdateListener);
              });
          }
      });
  });
});