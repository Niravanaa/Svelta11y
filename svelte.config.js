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
			// Disable external dependencies splitting for better compatibility
			external: [],
			// Restrict to a single region for Hobby plan
			regions: ['iad1'],
			memory: 1024
		})
	}
};

export default config;
