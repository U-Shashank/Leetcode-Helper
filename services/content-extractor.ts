import { LeetCodeContext } from '@/types';
import { MainWorldInjector } from './main-world-injector';

export class LeetCodeContextExtractor {
  
  /**
   * Extract complete context from current LeetCode page
   */
  public static async extractContext(): Promise<LeetCodeContext> {
    console.log('🔍 Extracting LeetCode context...');
    
    return {
      problemNumber: this.extractProblemNumber(),
      title: this.extractTitle(),
      description: this.extractDescription(),
      currentCode: await this.extractCurrentCode(),
      difficulty: this.extractDifficulty(),
      url: window.location.href,
      timestamp: Date.now()
    };
  }

  /**
   * Extract problem number from URL or page
   */
  private static extractProblemNumber(): string | null {
    try {
      const urlMatch = window.location.pathname.match(/\/problems\/([^/]+)/);
      if (urlMatch) {
        // Try to get numeric ID from the page title
        const titleElement = document.querySelector('[data-cy="question-title"], .text-title-large');
        if (titleElement) {
          const numberMatch = titleElement.textContent?.match(/^(\d+)\./);
          if (numberMatch) {
            return numberMatch[1];
          }
        }
        
        return urlMatch[1]; // Fallback to slug
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting problem number:', error);
      return null;
    }
  }

  /**
   * Extract problem title
   */
  private static extractTitle(): string | null {
    try {
      const selectors = [
        '[data-cy="question-title"]',
        '.text-title-large',
        'h1'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          const title = element.textContent.trim();
          // Remove problem number if present
          return title.replace(/^\d+\.\s*/, '') || title;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting title:', error);
      return null;
    }
  }

  /**
   * Extract problem description
   */
  private static extractDescription(): string | null {
    try {
      const selectors = [
        '[data-track-load="description_content"]',
        '.question-content'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const description = this.cleanDescription(element);
          if (description && description.length > 50) {
            return description;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting description:', error);
      return null;
    }
  }

  /**
   * Extract current code from editor
   */
  private static async extractCurrentCode(): Promise<string | null> {
    try {
      console.log('🔍 Extracting code...');
      
      // Method 1: MainWorldInjector (primary)
      const monacoResult = await MainWorldInjector.getMonacoCode();
      if (monacoResult) {
        console.log('✅ Got code from MainWorldInjector:', monacoResult.length, 'chars');
        return monacoResult;
      }
      
      // Method 2: Direct Monaco API
      if ((window as any).monaco?.editor) {
        const editors = (window as any).monaco.editor.getEditors();
        if (editors?.length > 0) {
          const code = editors[0].getValue();
          console.log('✅ Got code from Monaco API:', code.length, 'chars');
          return code;
        }
      }
      
      // Method 3: Monaco textarea fallback
      const monacoContainer = document.querySelector('.monaco-editor');
      if (monacoContainer) {
        const textarea = monacoContainer.querySelector('textarea') as HTMLTextAreaElement;
        if (textarea?.value?.trim()) {
          console.log('✅ Got code from Monaco textarea:', textarea.value.length, 'chars');
          return textarea.value;
        }
      }

      console.log('❌ Could not extract code');
      return null;
    } catch (error) {
      console.error('Error extracting current code:', error);
      return null;
    }
  }

  /**
   * Extract difficulty level
   */
  private static extractDifficulty(): string | null {
    try {
      // Look for difficulty text
      const difficultyElement = document.querySelector('[class*="difficulty"]');
      if (difficultyElement?.textContent) {
        const text = difficultyElement.textContent.trim().toLowerCase();
        if (['easy', 'medium', 'hard'].includes(text)) {
          return text.charAt(0).toUpperCase() + text.slice(1);
        }
      }

      // Look for colored indicators
      const indicators = document.querySelectorAll('[class*="text-"]');
      for (const indicator of indicators) {
        const className = indicator.className;
        if (className.includes('text-green')) return 'Easy';
        if (className.includes('text-yellow') || className.includes('text-orange')) return 'Medium';
        if (className.includes('text-red')) return 'Hard';
      }

      return null;
    } catch (error) {
      console.error('Error extracting difficulty:', error);
      return null;
    }
  }

  /**
   * Clean and format description text
   */
  private static cleanDescription(element: Element): string {
    const clone = element.cloneNode(true) as Element;
    
    // Remove script and style elements
    clone.querySelectorAll('script, style').forEach(el => el.remove());
    
    // Get text content and clean it up
    let text = clone.textContent || '';
    text = text.replace(/\s+/g, ' ').trim();
    
    // Limit description length
    if (text.length > 2000) {
      text = text.substring(0, 2000) + '...';
    }
    
    return text;
  }

  /**
   * Check if we're on a problem page
   */
  public static isOnProblemPage(): boolean {
    return window.location.pathname.includes('/problems/') && 
           !window.location.pathname.includes('/problemset/');
  }
}