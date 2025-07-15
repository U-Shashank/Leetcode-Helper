export default definePopup(() => {
  console.log('Hello from popup script! 🎉');
  
  // DOM elements
  const statusMessage = document.getElementById('status-message') as HTMLElement;
  const testButton = document.getElementById('test-button') as HTMLButtonElement;
  const toggleButton = document.getElementById('toggle-helper') as HTMLButtonElement;
  const currentUrl = document.getElementById('current-url') as HTMLElement;
  const problemCount = document.getElementById('problem-count') as HTMLElement;
  
  // Initialize popup
  async function initializePopup() {
    try {
      // Get current tab
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url?.includes('leetcode.com')) {
        statusMessage.textContent = '✅ LeetCode detected!';
        statusMessage.style.color = '#4CAF50';
        currentUrl.textContent = tab.url;
      } else {
        statusMessage.textContent = '❌ Not on LeetCode';
        statusMessage.style.color = '#f44336';
        currentUrl.textContent = tab.url || 'No URL';
      }
      
      // Load stored data
      const result = await browser.storage.local.get(['problemCount', 'helperEnabled']);
      problemCount.textContent = `Problems solved: ${result.problemCount || 0}`;
      
      // Update toggle button
      toggleButton.textContent = result.helperEnabled !== false ? 'Disable Helper' : 'Enable Helper';
      
    } catch (error) {
      console.error('Error initializing popup:', error);
      statusMessage.textContent = '❌ Error loading';
      statusMessage.style.color = '#f44336';
    }
  }
  
  // Test button functionality
  testButton.addEventListener('click', async () => {
    console.log('Test button clicked!');
    testButton.textContent = 'Testing...';
    testButton.disabled = true;
    
    try {
      // Send message to background
      const response = await browser.runtime.sendMessage({
        type: 'TEST_CONNECTION',
        timestamp: Date.now()
      });
      
      console.log('Test response:', response);
      
      // Send message to content script
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab.id && tab.url?.includes('leetcode.com')) {
        await browser.tabs.sendMessage(tab.id, {
          type: 'POPUP_TEST',
          message: 'Hello from popup!'
        });
      }
      
      testButton.textContent = '✅ Success!';
      setTimeout(() => {
        testButton.textContent = 'Test Connection';
        testButton.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Test failed:', error);
      testButton.textContent = '❌ Failed';
      setTimeout(() => {
        testButton.textContent = 'Test Connection';
        testButton.disabled = false;
      }, 2000);
    }
  });
  
  // Toggle helper functionality
  toggleButton.addEventListener('click', async () => {
    try {
      const result = await browser.storage.local.get(['helperEnabled']);
      const newState = !(result.helperEnabled !== false);
      
      await browser.storage.local.set({ helperEnabled: newState });
      toggleButton.textContent = newState ? 'Disable Helper' : 'Enable Helper';
      
      console.log('Helper toggled:', newState);
      
    } catch (error) {
      console.error('Error toggling helper:', error);
    }
  });
  
  // Initialize on load
  initializePopup();
});

function definePopup(arg0: () => void) {
  // Execute the popup initialization function when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arg0);
  } else {
    // DOM is already ready, execute immediately
    arg0();
  }
}
