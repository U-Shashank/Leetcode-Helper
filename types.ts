export interface LeetCodeContext {
    problemNumber: string | null;
    title: string | null;
    description: string | null;
    currentCode: string | null;
    // testCases: string[] | null;
    difficulty: string | null;
    // tags: string[] | null;
    url: string;
    // language: string | null;
    timestamp: number;
  }
  
  // export interface TestCase {
  //   input: string;
  //   expectedOutput: string;
  //   isCustom: boolean;
  // }
  
  // export interface CodeEditorInfo {
  //   language: string;
  //   code: string;
  //   cursorPosition?: number;
  // }