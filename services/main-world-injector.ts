/**
 * Service to inject scripts into the main world to access page APIs
 */
export class MainWorldInjector {
  
    /**
     * Get code from Monaco Editor using main world injection
     */
    public static async getMonacoCode(): Promise<string | null> {
      return new Promise((resolve) => {
        const eventName = `leetcode-monaco-${Date.now()}`;
        const timeout = setTimeout(() => {
          document.removeEventListener(eventName, handler as EventListener);
          resolve(null);
        }, 2000);
        
        const handler = (event: CustomEvent) => {
          clearTimeout(timeout);
          document.removeEventListener(eventName, handler as EventListener);
          resolve(event.detail.code || null);
        };
        
        document.addEventListener(eventName, handler as EventListener);
        
        // Inject the script
        const script = document.createElement('script');
        script.textContent = `
          (function() {
            try {
              let code = null;
              let language = 'unknown';
              
              // Method 1: Try Monaco Editor API
              if (window.monaco && window.monaco.editor) {
                const editors = window.monaco.editor.getEditors();
                if (editors && editors.length > 0) {
                  const editor = editors[0];
                  code = editor.getValue();
                  
                  // Try to get language
                  const model = editor.getModel();
                  if (model) {
                    language = model.getLanguageId();
                  }
                  
                  console.log('Main world: Got code from Monaco editor:', code.length, 'chars, language:', language);
                }
              }
              
              // Method 2: Try Monaco models directly
              if (!code && window.monaco && window.monaco.editor) {
                const models = window.monaco.editor.getModels();
                if (models && models.length > 0) {
                  const model = models[0];
                  code = model.getValue();
                  language = model.getLanguageId();
                  console.log('Main world: Got code from Monaco model:', code.length, 'chars, language:', language);
                }
              }
              
              // Method 3: Try to find editor instance in DOM
              if (!code) {
                const editorElements = document.querySelectorAll('.monaco-editor');
                for (const element of editorElements) {
                  if (element._editor) {
                    code = element._editor.getValue();
                    console.log('Main world: Got code from DOM editor instance:', code.length, 'chars');
                    break;
                  }
                }
              }
              
              // Dispatch result
              document.dispatchEvent(new CustomEvent('${eventName}', {
                detail: { 
                  code: code,
                  language: language,
                  success: !!code
                }
              }));
              
            } catch (error) {
              console.error('Main world Monaco extraction error:', error);
              document.dispatchEvent(new CustomEvent('${eventName}', {
                detail: { 
                  code: null,
                  error: error.message,
                  success: false
                }
              }));
            }
          })();
        `;
        
        document.head.appendChild(script);
        document.head.removeChild(script);
      });
    }
    
    /**
     * Get test results from main world
     */
    public static async getTestResults(): Promise<any> {
      return new Promise((resolve) => {
        const eventName = `leetcode-tests-${Date.now()}`;
        const timeout = setTimeout(() => {
          document.removeEventListener(eventName, handler as EventListener);
          resolve(null);
        }, 2000);
        
        const handler = (event: CustomEvent) => {
          clearTimeout(timeout);
          document.removeEventListener(eventName, handler as EventListener);
          resolve(event.detail);
        };
        
        document.addEventListener(eventName, handler as EventListener);
        
        const script = document.createElement('script');
        script.textContent = `
          (function() {
            try {
              let testData = null;
              
              // Look for test data in various global objects
              if (window.__APOLLO_STATE__) {
                // Apollo GraphQL state might contain test data
                testData = window.__APOLLO_STATE__;
              }
              
              if (window.__INITIAL_STATE__) {
                testData = window.__INITIAL_STATE__;
              }
              
              // Look for React props that might contain test data
              const testElements = document.querySelectorAll('[data-testid], [data-cy]');
              const reactData = [];
              
              testElements.forEach(el => {
                if (el._reactInternalInstance || el.__reactInternalInstance) {
                  const instance = el._reactInternalInstance || el.__reactInternalInstance;
                  if (instance.memoizedProps) {
                    reactData.push(instance.memoizedProps);
                  }
                }
              });
              
              document.dispatchEvent(new CustomEvent('${eventName}', {
                detail: { 
                  testData: testData,
                  reactData: reactData,
                  success: true
                }
              }));
              
            } catch (error) {
              console.error('Main world test extraction error:', error);
              document.dispatchEvent(new CustomEvent('${eventName}', {
                detail: { 
                  error: error.message,
                  success: false
                }
              }));
            }
          })();
        `;
        
        document.head.appendChild(script);
        document.head.removeChild(script);
      });
    }
    
    /**
     * Execute custom JavaScript in main world
     */
    public static async executeInMainWorld(jsCode: string): Promise<any> {
      return new Promise((resolve) => {
        const eventName = `leetcode-custom-${Date.now()}`;
        const timeout = setTimeout(() => {
          document.removeEventListener(eventName, handler as EventListener);
          resolve(null);
        }, 5000);
        
        const handler = (event: CustomEvent) => {
          clearTimeout(timeout);
          document.removeEventListener(eventName, handler as EventListener);
          resolve(event.detail);
        };
        
        document.addEventListener(eventName, handler as EventListener);
        
        const script = document.createElement('script');
        script.textContent = `
          (function() {
            try {
              const result = (function() {
                ${jsCode}
              })();
              
              document.dispatchEvent(new CustomEvent('${eventName}', {
                detail: { 
                  result: result,
                  success: true
                }
              }));
              
            } catch (error) {
              console.error('Main world custom script error:', error);
              document.dispatchEvent(new CustomEvent('${eventName}', {
                detail: { 
                  error: error.message,
                  success: false
                }
              }));
            }
          })();
        `;
        
        document.head.appendChild(script);
        document.head.removeChild(script);
      });
    }
  }