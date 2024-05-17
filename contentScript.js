function waitForElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    let interval = 100; // Check every 100 ms
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
        quillEditor.innerHTML = `<p>${text}</p>`; // Replace content
        // Trigger input event to simulate user typing
        const event = new Event('input', { bubbles: true });
        quillEditor.dispatchEvent(event);
    }
}

function setElementTextForProseMirror(element, text) {
    if (element) {
        element.innerHTML = `<p>${text}</p>`; // Replace content
        // You may need to trigger additional events here, similar to Quill
        const event = new Event('input', { bubbles: true });
        element.dispatchEvent(event);
    }
}

function setElementText(element, text) {
    if (!element) return;

    // Handling standard textarea or input elements
    if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'rich-textarea'|| element.tagName.toLowerCase() === 'input') {
        element.value = text;
    }
    
    // Trigger an input event to ensure any JavaScript listening for this event reacts appropriately
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
}

function triggerSendAction(siteURL, element) {
    // For Gemini, find and click the send button
    if (siteURL.includes('gemini.google.com')) {
        const sendButton = document.querySelector('button.send-button');
        if (sendButton) sendButton.click();
    } 
    // For Groq, also find and click the send button
    else  if (siteURL.includes('groq.com')) {
        const sendButton = document.querySelector('button[type="submit"]');
        if (sendButton) sendButton.click();
    }
    // Default action, simulates Enter key press if needed for other sites
    else {
        const keyboardEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: "Enter",
            keyCode: 13 // Though `keyCode` is deprecated, it's included for completeness
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

                // Determine the selector based on the current URL
                if (location.href.includes('chatgpt.com')) {
                    selector = '#prompt-textarea'; 
                } else if (location.href.includes('gemini.google.com')) {
                    selector = '.ql-container';
                } else if (location.href.includes('claude.ai')) {
                    selector = '.ProseMirror';
                } else if (location.href.includes('groq.com')) {
                    selector = '#chat';
                }

                if (selector) {
                    const element = await waitForElement(selector);
                    // Set the text for the detected editor
                    if (location.href.includes('gemini.google.com')) {
                        setElementTextForQuill(element, prompt);
                    } else if (location.href.includes('claude.ai')) {
                        setElementTextForProseMirror(element, prompt);
                    } else if (location.href.includes('groq.com')) {

                        setTimeout(() => {

                            selectGroqLlama3ModelAndSendPrompt(element, prompt);
                         
                        }, 3000); // 3000 milliseconds delay to wait for model list to be loaded
                    }
                    else 
                    {
                        // Applies for chat.openai.com assuming standard inputs
                        setElementText(element, prompt);
                    }
					
                    // Wait a bit before trying to click the send button
                    await delay(1500); // 1500 milliseconds delay

                    // Trigger the send action based on the site
                    triggerSendAction(location.href, element);
                }
                
            } catch (error) {
                console.error('Error populating element with prompt:', error);
            }
        })();
    }
});

function selectGroqLlama3ModelAndSendPrompt(element, prompt) {

    // If Llama3 already select, set the prompt, send it and return
    if (isLlama3OptionSelected()) {
    
        setTimeout(() => {

            // Set prompt
            setElementText(element, prompt);
            
            // Send the prompt
            triggerSendAction(location.href, element);
                
        }, 500); // 500 milliseconds delay

        return;
    }

    /**** Open Model Selection ****/

    // Select the SVG element by its class
    var svgElement = document.querySelector('svg.lucide-chevron-down');

    // Set the tabindex attribute to -1 to make it programmatically focusable
    svgElement.setAttribute('tabindex', '-1');

    // Focus the SVG element
    svgElement.focus();

    // Creating and dispatching a keydown event for the SPACE key
    var spaceEvent = new KeyboardEvent('keydown', {
        key: " ", // the value for the SPACE key
        code: "Space", // the 'code' value for the SPACE key
        bubbles: true, // this event should bubble up
        cancelable: true, // this event can be canceled
    });

    // Dispatch the event on the focused SVG element
    svgElement.dispatchEvent(spaceEvent);


    /**** Select llama3-70b model ****/

    function findLlama3OptionAndSelect() {

        const llama3ModelName = 'llama3-70b-8192';

        // 1. Find the <li> with the specific text
        const spanList = document.querySelectorAll('span');
        let targetSpan = null;

        for (let i = 0; i < spanList.length; i++) {
            if (spanList[i].textContent.trim() === llama3ModelName) {
                targetSpan = spanList[i];
                break; // Found it!
            }
        }

        // 2. Find the parent <div>
        if (targetSpan) {
            const targetDiv = targetSpan.closest('div[role="option"]');

            // 3. Simulate spacebar press on the <div>
            if (targetDiv) {

                var spaceEvent = new KeyboardEvent('keydown', {
                    key: " ", // the value for the SPACE key
                    code: "Space", // the 'code' value for the SPACE key
                    bubbles: true, // this event should bubble up
                    cancelable: true, // this event can be canceled
                });

                targetDiv.dispatchEvent(spaceEvent);
            } else {
                console.error("Couldn't find the parent <div>!");
            }
        } else {
            console.error("Couldn't find <span> with the specified text!");
        }
    }

    setTimeout(() => {

        // Find the model and select it
        findLlama3OptionAndSelect();

        setTimeout(() => {

            // Set prompt
            setElementText(element, prompt);
            
            // Send the prompt
            triggerSendAction(location.href, element);
                
        }, 500); // 500 milliseconds delay
            
    }, 1000); // 1000 milliseconds delay
}

function isLlama3OptionSelected() {
    
    // Find the selected model    
    const buttonElement = document.querySelector('button[role="combobox"]');
    const selectedModel = buttonElement.querySelector('p').textContent.trim();

    // Check if the button's text content matches the desired value
    if (selectedModel === 'llama3-70b-8192') {
        return true;
    } else {
        return false;
    }
}
