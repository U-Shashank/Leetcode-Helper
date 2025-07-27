import { LeetCodeContextExtractor } from '@/services/content-extractor';

export default defineContentScript({
  matches: ['*://leetcode.com/*'],
  main() {
    console.log('LeetCode AI Assistant initialized 🤖');
    
    // Simple chat history for testing
    const chatHistory: string[] = [];
    let isOpen = false;

    // Create floating button
    const fab = document.createElement('div');
    fab.innerHTML = '🤖';
    fab.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
      font-size: 20px;
      color: white;
      transition: transform 0.2s;
    `;
    
    fab.addEventListener('click', toggleChat);
    fab.addEventListener('mouseenter', () => fab.style.transform = 'scale(1.1)');
    fab.addEventListener('mouseleave', () => fab.style.transform = 'scale(1)');
    document.body.appendChild(fab);

    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      height: 450px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: none;
      flex-direction: column;
    `;

    // Header
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>🤖</span>
        <span style="font-weight: 600;">AI Assistant</span>
      </div>
      <button id="close-chat-btn" style="
        background: none; border: none; font-size: 18px; cursor: pointer; color: white;
      ">×</button>
    `;
    header.style.cssText = `
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    // Add close button event listener
    const closeBtn = header.querySelector('#close-chat-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        chatContainer.style.display = 'none';
        isOpen = false;
      });
    }

    // Messages area
    const messages = document.createElement('div');
    messages.id = 'messages';
    messages.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Input area
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      padding: 16px;
      border-top: 1px solid #eee;
      border-radius: 0 0 12px 12px;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ask me anything...';
    input.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
      box-sizing: border-box;
    `;

    inputContainer.appendChild(input);
    chatContainer.id = 'chat-container';
    chatContainer.appendChild(header);
    chatContainer.appendChild(messages);
    chatContainer.appendChild(inputContainer);
    document.body.appendChild(chatContainer);

    // Add welcome message
    addMessage('assistant', "👋 Hello! I'm your LeetCode AI assistant. Type 'extract' to analyze the current problem!");

    // Toggle chat function
    function toggleChat() {
      isOpen = !isOpen;
      chatContainer.style.display = isOpen ? 'flex' : 'none';
      if (isOpen) input.focus();
    }

    // Add message function
    function addMessage(type: 'user' | 'assistant', text: string) {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        display: flex;
        ${type === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
      `;

      const bubble = document.createElement('div');
      bubble.textContent = text;
      bubble.style.cssText = `
        max-width: 80%;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 14px;
        ${type === 'user' 
          ? 'background: #667eea; color: white; border-bottom-right-radius: 4px;'
          : 'background: #f0f0f0; color: #333; border-bottom-left-radius: 4px;'
        }
      `;

      messageDiv.appendChild(bubble);
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;

      // Store in chat history
      chatHistory.push(`${type}: ${text}`);
    }

    // Handle user input
    input.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const userMessage = input.value.trim();
        addMessage('user', userMessage);
        input.value = '';

        // Simple AI responses
        setTimeout(async () => {
          if (userMessage.toLowerCase().includes('extract')) {
            await handleExtraction();
          } else if (userMessage.toLowerCase().includes('help')) {
            addMessage('assistant', "💡 I can help you analyze LeetCode problems! Try typing 'extract' to get started.");
          } else {
            addMessage('assistant', "🤔 Interesting! Type 'extract' to analyze the current problem, or 'help' for more options.");
          }
        }, 800);
      }
    });

    // Context extraction handler
    async function handleExtraction() {
      if (LeetCodeContextExtractor.isOnProblemPage()) {
        addMessage('assistant', '🔄 Extracting problem context...');
        
        try {
          const context = await LeetCodeContextExtractor.extractContext();
          
          setTimeout(() => {
            const summary = `✅ Problem: ${context.title || 'Unknown'}
Difficulty: ${context.difficulty || 'Unknown'}
Code: ${context.currentCode?.length || 0} characters

${context.currentCode ? 'I can see your code! Ask me for help reviewing it.' : 'Ready to help with this problem!'}`;
            
            addMessage('assistant', summary);
          }, 1000);
          
        } catch (error) {
          addMessage('assistant', `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        addMessage('assistant', '⚠️ Please go to a LeetCode problem page first!');
      }
    }

    // Background communication
    browser.runtime.sendMessage({
      type: 'HELLO_FROM_CONTENT',
      url: window.location.href
    }).catch(() => {
      console.log('Background script not available');
    });

    // Listen for popup messages
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      if (message.type === 'EXTRACT_CONTEXT') {
        if (LeetCodeContextExtractor.isOnProblemPage()) {
          try {
            const context = await LeetCodeContextExtractor.extractContext();
            sendResponse({ success: true, context });
          } catch (error) {
            sendResponse({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        } else {
          sendResponse({ success: false, error: 'Not on a problem page' });
        }
        return true;
      }
    });

    // Monitor page changes
    const observer = new MutationObserver(() => {
      const problemTitle = document.querySelector('[data-cy="question-title"]');
      if (problemTitle && isOpen) {
        setTimeout(() => {
          addMessage('assistant', `🔄 New problem detected: "${problemTitle.textContent}". Type 'extract' to analyze it!`);
        }, 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
});