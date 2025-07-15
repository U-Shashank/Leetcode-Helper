export default defineContentScript({
  matches: ['*://leetcode.com/*'],
  main() {
    console.log('Hello from content script on LeetCode! 🎯');
    
    // Create a hello message element
    const helloDiv = document.createElement('div');
    helloDiv.id = 'leetcode-helper-hello';
    helloDiv.textContent = 'Hello from LeetCode Helper! 🚀';
    helloDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    // Add to page
    document.body.appendChild(helloDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      helloDiv.remove();
    }, 3000);
    
    // Send message to background
    browser.runtime.sendMessage({
      type: 'HELLO_FROM_CONTENT',
      url: window.location.href
    }).then(response => {
      console.log('Response from background:', response);
    });
    
    // Add click listener to LeetCode problems
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-cy="question-title"]')) {
        console.log('Problem title clicked!');
      }
    });
    
    // Monitor for problem page changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const problemTitle = document.querySelector('[data-cy="question-title"]');
          if (problemTitle) {
            console.log('Problem detected:', problemTitle.textContent);
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
});