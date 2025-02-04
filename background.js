function injectContentScriptAndSendMessage(tabId, prompt) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['contentScript.js']
    }, () => {
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
      "DeepSeek": "https://chat.deepseek.com/",
      "Qwen": "https://chat.qwenlm.ai/"
    };
  
    const urlsToOpen = message.services.map(service => serviceUrls[service]);
  
    urlsToOpen.forEach(url => {
      chrome.tabs.query({}, tabs => {
        let foundTab = tabs.find(tab => new URL(tab.url).origin === new URL(url).origin);
  
        if (foundTab) {
          chrome.tabs.update(foundTab.id, {
            active: true
          }, () => {
            chrome.windows.update(foundTab.windowId, {
              focused: true
            }, () => {
              injectContentScriptAndSendMessage(foundTab.id, message.prompt);
            });
          });
        } else {
          chrome.tabs.create({
            url: url
          }, newTab => {
            function tabUpdateListener(tabId, changeInfo) {
              if (tabId === newTab.id && changeInfo.status === "complete") {
                chrome.tabs.onUpdated.removeListener(tabUpdateListener);
                sendMessageToTab(newTab.id, message.prompt);
              }
            }
            chrome.tabs.onUpdated.addListener(tabUpdateListener);
          });
        }
      });
    });
  });