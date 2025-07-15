import { defineConfig } from 'wxt';

export default defineConfig({
  // Extension metadata
  manifest: {
    name: 'LeetCode Helper',
    description: 'A helper extension for LeetCode',
    version: '1.0.0',
    permissions: ['activeTab', 'storage'],
    // host_permissions: ['*://leetcode.com/*'],
  },
  
  // Development settings
//   dev: {
//     reloadOnPropsChange: true,
//   },
  
  // Build targets
  runner: {
    disabled: false,
    chromiumArgs: ['--disable-extensions-except=dist/chrome-mv3'],
    firefoxArgs: ['--devtools'],
  },
});