// WCAG Scanner Library - Main exports

export * from './types.js';
export * from './api.js';

// Re-export the main scanner class and convenience functions
export { WCAGScanner, scanUrl, scanUrls } from './api.js';
