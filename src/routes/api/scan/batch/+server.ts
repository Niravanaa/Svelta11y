import { json } from '@sveltejs/kit';
import { scanUrls } from '$lib/scanner/index.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const {
			urls,
			wcagVersion = '2.1',
			level = 'AA',
			includeScreenshot = false,
			includeBestPractices = false,
			maxConcurrent = 3
		} = await request.json();

		if (!urls || !Array.isArray(urls) || urls.length === 0) {
			return json({ error: 'URLs array is required and must not be empty' }, { status: 400 });
		}

		if (urls.length > 50) {
			return json({ error: 'Maximum 50 URLs allowed per batch' }, { status: 400 });
		}

		// Validate URL formats
		for (const url of urls) {
			try {
				new URL(url);
			} catch {
				return json({ error: `Invalid URL format: ${url}` }, { status: 400 });
			}
		}

		// Perform the batch scan
		const result = await scanUrls(urls, {
			wcagVersion: wcagVersion as '2.0' | '2.1' | '2.2',
			level: level as 'A' | 'AA' | 'AAA',
			includeScreenshot,
			includeBestPractices,
			timeout: 30000,
			waitTime: 3000,
			maxConcurrent: Math.min(maxConcurrent, 5) // Cap at 5 concurrent scans
		});

		return json(result);
	} catch (error) {
		console.error('Batch scan error:', error);
		return json(
			{ error: 'Failed to scan URLs', details: (error as Error).message },
			{ status: 500 }
		);
	}
};
