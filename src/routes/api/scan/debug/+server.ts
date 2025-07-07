import { json } from '@sveltejs/kit';
import { debugScan } from '../../../../lib/scanner/api.js';

export const POST = async ({ request }: { request: Request }) => {
	try {
		const {
			url,
			wcagVersion = '2.1',
			level = 'AA',
			includeBestPractices = false,
			waitTime = 8000,
			timeout = 60000
		} = await request.json();

		if (!url) {
			return json({ error: 'URL is required' }, { status: 400 });
		}

		console.log(`🔍 Debug scan requested for: ${url}`);

		const result = await debugScan(url, {
			wcagVersion,
			level,
			includeBestPractices,
			waitTime,
			timeout,
			includeScreenshot: false
		});

		return json(result);
	} catch (error) {
		console.error('Debug scan failed:', error);
		return json(
			{ error: 'Scan failed', details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
};
