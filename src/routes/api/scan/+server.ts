import { json } from '@sveltejs/kit';
import { scanUrl } from '$lib/scanner/index.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const {
			url,
			wcagVersion = '2.1',
			level = 'AA',
			includeScreenshot = false,
			includeBestPractices = false
		} = await request.json();

		if (!url) {
			return json({ error: 'URL is required' }, { status: 400 });
		}

		// Validate URL format
		try {
			new URL(url);
		} catch {
			return json({ error: 'Invalid URL format' }, { status: 400 });
		}

		// Perform the scan
		const result = await scanUrl(url, {
			wcagVersion: wcagVersion as '2.0' | '2.1' | '2.2',
			level: level as 'A' | 'AA' | 'AAA',
			includeScreenshot,
			includeBestPractices,
			timeout: 30000,
			waitTime: 3000
		});

		return json(result);
	} catch (error) {
		console.error('Scan error:', error);
		return json(
			{ error: 'Failed to scan URL', details: (error as Error).message },
			{ status: 500 }
		);
	}
};
