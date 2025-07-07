import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Vercel adapter for deployment
		adapter: adapter({
			// Use nodejs runtime for compatibility
			runtime: 'nodejs20.x',
			// Disable external dependencies splitting for Windows
			external: [],
			// Enable ISR (Incremental Static Regeneration) for better caching
			isr: {
				// Cache static pages for 1 hour
				expiration: 3600
			}
		})
	}
};

export default config;
