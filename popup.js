document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('prompt');
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="ai_options"]');
    const historyContainer = document.getElementById('historyContainer');
    const clearHistoryBtn = document.createElement('button');
    document.body.appendChild(historyContainer);
    document.body.appendChild(clearHistoryBtn);

    clearHistoryBtn.textContent = 'Clear History';
    clearHistoryBtn.style.cursor = 'pointer';
    clearHistoryBtn.addEventListener('click', function() {
        chrome.storage.local.set({ 'promptHistory': [] }, function() {
            updatePromptHistoryDisplay([]);
        });
    });

    function updatePromptHistoryDisplay(history) {
        historyContainer.innerHTML = '<h3>History<h3>'; // Add a title to the history container
        
        history.forEach((prompt, index) => {
            let promptDiv = document.createElement('div');
            promptDiv.textContent = prompt.length > 90 ? prompt.substring(0, 90) + '...' : prompt;
            promptDiv.style.cursor = 'pointer';

            // When clicking in the history item
            promptDiv.addEventListener('click', () => {
                promptInput.value = prompt; // Populate the prompt input on click
                savePromptText();
                handleSubmit(false); // Send the prompt and do not save history for this
            });
            historyContainer.appendChild(promptDiv);
        });
    }

    function savePromptHistory(prompt) {
        chrome.storage.local.get(['promptHistory'], function(result) {
            let promptHistory = result.promptHistory || [];
            promptHistory.unshift(prompt); // Add the new prompt to the beginning of the array
            if (promptHistory.length > 20) { // Keep only the last 20 prompts
                // Since we're adding to the beginning, we trim from the end
                promptHistory = promptHistory.slice(0, 20);
            }
            
            chrome.storage.local.set({ 'promptHistory': promptHistory }, function() {
                updatePromptHistoryDisplay(promptHistory);
            });
        });
    }
    
    document.getElementById('closeBtn').addEventListener('click', function() {
        window.close(); // Close the popup window
    });

    function saveCheckboxState() {
        let services = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                services.push(checkbox.value);
            }
        });

        chrome.storage.local.set({ 'services': services }, function() {
            console.log('Checkbox state saved.');
        });
    }

    function savePromptText() {
        const promptText = promptInput.value;
        chrome.storage.local.set({ 'promptText': promptText }, function() {
            console.log('Prompt text saved.');
        });
    }

    chrome.storage.local.get(['services', 'promptText', 'promptHistory'], function(result) {
        if (result.services) {
            checkboxes.forEach(checkbox => {
                checkbox.checked = result.services.includes(checkbox.value);
            });
        }

        if (result.promptText) {
            promptInput.value = result.promptText;
            promptInput.focus();
            promptInput.select();
        }

        if (result.promptHistory) {
            updatePromptHistoryDisplay(result.promptHistory);
        }
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveCheckboxState();
            savePromptText();
        });
    });

    promptInput.addEventListener('input', savePromptText);

    function handleSubmit(saveHistory) {
        const prompt = promptInput.value.trim();
        if (prompt === '') return;

        if (saveHistory) {
            savePromptHistory(prompt);
        }

        let services = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                services.push(checkbox.value);
            }
        });

        chrome.runtime.sendMessage({ prompt: prompt, services: services });
        window.close(); // Close the popup after submission
    }

    promptInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            if (!event.shiftKey) {
                event.preventDefault();
                handleSubmit(true);
            }
        }
    });

    function insertNewLine() {
        const currentValue = promptInput.value;
        const currentCaretPosition = promptInput.selectionStart;
        const newText = currentValue.substring(0, currentCaretPosition) + '\n' + currentValue.substring(currentCaretPosition); 
        promptInput.value = newText;
        promptInput.selectionStart = currentCaretPosition + 1;
        promptInput.selectionEnd = currentCaretPosition + 1;
    }

    promptInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault();
            insertNewLine();
        }
    });
});
