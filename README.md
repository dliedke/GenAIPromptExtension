# 🤖 GenAI Prompt Extension

A powerful Chrome/Edge extension to send prompts simultaneously to multiple AI chat services with a single click!

## ✨ Features

- 🚀 Send prompts to multiple AI services simultaneously
- 💬 Supports major AI chat platforms:
 - ChatGPT
 - Google Gemini
 - Anthropic Claude
 - DeepSeek Chat
 - Qwen Chat
 - Grok Chat
- 📝 Convenient prompt history tracking (last 20 prompts)
- ⌨️ Keyboard shortcuts support (Ctrl+Shift+Z / Command+Shift+X on Mac)
- 🎯 Smart tab management - reuses existing tabs when possible
- ⚡ Quick checkbox toggles for service selection
- 📋 Multi-line input support (Shift+Enter)

## 🔧 Installation

### Chrome Installation
1. Download latest ZIP file from [GitHub Releases](https://github.com/dliedke/GenAIPromptExtension/releases) and extract it
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extracted folder

### Edge Installation
1. Download latest ZIP file from [GitHub Releases](https://github.com/dliedke/GenAIPromptExtension/releases) and extract it
2. Go to `edge://extensions/`
3. Turn on "Developer mode" (bottom left)
4. Click "Load unpacked"
5. Select the extracted folder

## 🔑 Permissions

The extension requires the following permissions:
- `tabs`
- `activeTab`
- `scripting`
- `storage`
- `windows`

And access to these domains:
- `*://chatgpt.com/*`
- `*://gemini.google.com/app/*`
- `*://claude.ai/chats/*`
- `*://chat.deepseek.com/*`
- `*://chat.qwen.ai/*`
- `*://grok.com/*`

## 🎮 Usage

1. Click the extension icon or use the keyboard shortcut (Ctrl+Shift+Z)
2. Enter your prompt in the text area
3. Select which AI services you want to send the prompt to
4. Press Enter to submit (or Shift+Enter for new line)
5. The extension will automatically open or reuse tabs for each selected service and send your prompt

## 💾 Local Storage

The extension stores:
- Your last entered prompt
- Selected service preferences
- History of your last 20 prompts

## 🌟 Key Features Explained

### Tab Management
- Automatically detects if a service tab is already open
- Reuses existing tabs instead of creating duplicates
- Brings existing tabs into focus when used

### Prompt History
- Maintains a record of your last 20 prompts
- Click any historical prompt to quickly reuse it
- Clear history option available

### Service Selection
- Individual toggles for each AI service
- Settings persist between sessions
- All services enabled by default

## 🔧 Technical Details

Built using:
- Chrome Extension Manifest V3
- Pure JavaScript
- HTML & CSS
- Chrome Storage API
- Chrome Tabs API

## 🤝 Contributing

Feel free to fork, submit PRs, or report issues!

## 📄 License

This project is open source and available under the MIT License.

---
*Made with ❤️ for AI enthusiasts*
