export default defineBackground(() => {
  console.log('Hello from background script! 🚀');
  
  // Listen for extension installation
  browser.runtime.onInstalled.addListener(() => {
    console.log('LeetCode Helper extension installed!');
  });
  
  // Listen for messages from content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
    if (message.type === 'HELLO_FROM_CONTENT') {
      sendResponse({ 
        type: 'HELLO_FROM_BACKGROUND',
        message: 'Hello from background! 👋'
      });
    }
  });
  
  // Listen for tab updates to detect LeetCode
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('leetcode.com')) {
      console.log('LeetCode page detected:', tab.url);
    }
  });
});