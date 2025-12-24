function waitForElement(selector, timeout = 30000) {
    return new Promise((resolve, reject) => {
      let interval = 100;
      let totalTime = 0;
  
      const checker = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(checker);
          resolve(element);
        } else if (totalTime >= timeout) {
          clearInterval(checker);
          reject(new Error(`Element ${selector} not found within ${timeout} ms`));
        }
        totalTime += interval;
      }, interval);
    });
  }
  
  function setElementTextForQuill(element, text) {
    let quillEditor = element.querySelector('.ql-editor');
    if (quillEditor) {
      quillEditor.innerHTML = `<p>${text}</p>`;
      const event = new Event('input', { bubbles: true });
      quillEditor.dispatchEvent(event);
    }
  }
  
  function setElementTextForProseMirror(element, text) {
    if (element) {
      element.innerHTML = `<p>${text}</p>`;
      const event = new Event('input', { bubbles: true });
      element.dispatchEvent(event);
    }
  }
  
function setElementText(element, text) {
  if (!element) return;

  if (element.tagName.toLowerCase() === 'textarea' || 
      element.tagName.toLowerCase() === 'rich-textarea' || 
      element.tagName.toLowerCase() === 'input') {
    
    // Use native setter for React-controlled inputs
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    nativeInputValueSetter.call(element, text);
    
    // Dispatch InputEvent (more comprehensive than Event for React)
    const inputEvent = new InputEvent('input', { 
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text
    });
    element.dispatchEvent(inputEvent);
    
    // Also dispatch change event for some frameworks
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
    
    if (location.href.includes('chat.qwen.ai') || location.href.includes('chat.deepseek.com')) {
      element.style.height = 'auto';
      element.style.height = element.scrollHeight + 'px';
    }
  } else {
    element.innerHTML = `<p>${text}</p>`;
  }
}
  
function triggerSendAction(siteURL, element) {
    if (siteURL.includes('gemini.google.com')) {
      const keyboardEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: "Enter",
        keyCode: 13
      });
      element.dispatchEvent(keyboardEvent);
    }
    else if (siteURL.includes('chat.deepseek.com')) {
      const sendButton = document.querySelector('div._7436101[role="button"][aria-disabled="false"]');
      if (sendButton) sendButton.click();
    }
    else if (siteURL.includes('chat.qwen.ai')) {
      const sendButton = document.querySelector('button.send-button');
      if (sendButton) sendButton.click();
    }
    else if (siteURL.includes('grok.com')) {
      const sendButton = document.querySelector('button[type="submit"]');
      if (sendButton) sendButton.click();
    }
    else {
      const keyboardEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: "Enter",
        keyCode: 13
      });
      element.dispatchEvent(keyboardEvent);
    }
  }
  
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fillPrompt") {
      const prompt = message.prompt;
      (async () => {
        try {
          let selector;
  
          if (location.href.includes('chatgpt.com')) {
            selector = '#prompt-textarea';
          } else if (location.href.includes('gemini.google.com')) {
            selector = '.ql-container';
          } else if (location.href.includes('claude.ai')) {
            selector = '.ProseMirror';
          } else if (location.href.includes('chat.deepseek.com')) {
            selector = 'textarea[placeholder*="DeepSeek"]';
          } else if (location.href.includes('chat.qwen.ai')) {
            selector = '#chat-input';
          } else if (location.href.includes('grok.com')) {
            selector = 'div.ProseMirror[contenteditable="true"]';
          }
  
          if (selector) {
            const element = await waitForElement(selector);
            
            if (location.href.includes('gemini.google.com')) {
              setElementTextForQuill(element, prompt);
            } else if (location.href.includes('claude.ai') || location.href.includes('grok.com')) {
              setElementTextForProseMirror(element, prompt);
            } else {
              setElementText(element, prompt);
            }
  
            await delay(1500);
            triggerSendAction(location.href, element);
          }
        } catch (error) {
          console.error('Error populating element with prompt:', error);
        }
      })();
    }
  });