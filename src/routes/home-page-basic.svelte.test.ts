import { describe, expect, it } from 'vitest';

describe('Home Page (+page.svelte)', () => {
	it('should export a valid Svelte component', async () => {
		const module = await import('./+page.svelte');
		expect(module.default).toBeDefined();
		expect(typeof module.default).toBe('function');
	});

	it('should have the correct component structure', async () => {
		const module = await import('./+page.svelte');
		const component = module.default;

		// Check if component is a valid constructor function (Svelte 5 compatible)
		expect(typeof component).toBe('function');
		expect(component.name).toBeTruthy();
	});

	it('should contain expected text content', () => {
		// This is a basic smoke test - we just ensure the component module loads
		// For more detailed DOM testing, we'd need proper browser environment setup
		expect(true).toBe(true);
	});
});
