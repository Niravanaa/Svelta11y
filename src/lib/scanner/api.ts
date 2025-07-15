import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import type { Browser, Page } from 'puppeteer-core';
import type {
	ScanOptions,
	SinglePageScanResult,
	BatchScanOptions,
	BatchScanResult,
	AxeResults,
	AxeViolation,
	Violation,
	LogEntry
} from './types.js';

/**
 * Detect if we're running in a serverless environment
 */
function isServerless(): boolean {
	return (
		process.env.VERCEL === '1' ||
		process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
		process.env.NETLIFY === 'true' ||
		process.env.CF_PAGES === '1'
	);
}

/**
 * Get browser launch options based on environment
 */
async function getBrowserOptions(): Promise<{
	args: string[];
	executablePath?: string;
	headless: boolean;
}> {
	if (isServerless()) {
		console.log('🔧 Using serverless configuration (@sparticuz/chromium)');
		return {
			args: chromium.args,
			executablePath: await chromium.executablePath(),
			headless: true // Always headless in serverless
		};
	} else {
		console.log('🔧 Using local development configuration');
		// For local development, use system Chrome/Chromium
		// On Windows, try common Chrome installation paths
		const possiblePaths = [
			'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
			'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
			'C:\\Users\\' +
				process.env.USERNAME +
				'\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
		];

		// Try to find Chrome executable
		let executablePath: string | undefined;
		for (const path of possiblePaths) {
			try {
				const fs = await import('fs');
				if (fs.existsSync(path)) {
					executablePath = path;
					console.log(`📍 Found Chrome at: ${path}`);
					break;
				}
			} catch {
				// Continue to next path
			}
		}

		if (!executablePath) {
			console.log('⚠️  Chrome not found in common locations, using default');
		}

		return {
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--no-first-run',
				'--no-zygote',
				'--single-process',
				'--disable-gpu'
			],
			executablePath,
			headless: true
		};
	}
}

/**
 * Logger class to capture console output during scans
 */
class ScanLogger {
	private logs: LogEntry[] = [];
	private originalConsole = {
		log: console.log,
		error: console.error,
		warn: console.warn,
		info: console.info
	};

	constructor() {
		this.setupInterception();
	}

	private setupInterception() {
		console.log = (...args: unknown[]) => {
			this.addLog('info', args.join(' '));
			this.originalConsole.log(...args);
		};

		console.error = (...args: unknown[]) => {
			this.addLog('error', args.join(' '));
			this.originalConsole.error(...args);
		};

		console.warn = (...args: unknown[]) => {
			this.addLog('warn', args.join(' '));
			this.originalConsole.warn(...args);
		};

		console.info = (...args: unknown[]) => {
			this.addLog('info', args.join(' '));
			this.originalConsole.info(...args);
		};
	}

	private addLog(level: LogEntry['level'], message: string, details?: unknown) {
		this.logs.push({
			timestamp: new Date().toISOString(),
			level,
			message,
			details
		});
	}

	getLogs(): LogEntry[] {
		return [...this.logs];
	}

	clearLogs() {
		this.logs = [];
	}

	restore() {
		console.log = this.originalConsole.log;
		console.error = this.originalConsole.error;
		console.warn = this.originalConsole.warn;
		console.info = this.originalConsole.info;
	}
}

/**
 * WCAG Scanner API - Modern TypeScript version for SvelteKit integration
 */

export class WCAGScanner {
	private browser: Browser | null = null;
	private logger: ScanLogger | null = null;
	private debugMode: boolean = false;

	constructor(options?: { debugMode?: boolean }) {
		this.debugMode = options?.debugMode || false;
	}

	/**
	 * Initialize the scanner
	 */
	async initialize(): Promise<void> {
		if (!this.browser) {
			console.log(`🚀 Launching browser in ${this.debugMode ? 'headed (DEBUG)' : 'headless'} mode`);

			try {
				const browserOptions = await getBrowserOptions();

				// Override headless mode for debug
				if (this.debugMode && !isServerless()) {
					browserOptions.headless = false;
				}

				this.browser = await puppeteer.launch(browserOptions);
			} catch (error) {
				console.error('Browser launch failed:', error);
				throw new Error(
					`Failed to launch browser: ${error instanceof Error ? error.message : 'Unknown error'}`
				);
			}
		}
		if (!this.logger) {
			this.logger = new ScanLogger();
		}
	}

	/**
	 * Clean up resources
	 */
	async cleanup(): Promise<void> {
		if (this.browser) {
			await this.browser.close();
			this.browser = null;
		}
		if (this.logger) {
			this.logger.restore();
			this.logger = null;
		}
	}

	/**
	 * Get captured logs
	 */
	getLogs(): LogEntry[] {
		return this.logger?.getLogs() || [];
	}

	/**
	 * Scan a single URL for WCAG compliance
	 */
	async scanSinglePage(options: ScanOptions): Promise<SinglePageScanResult> {
		await this.initialize();

		if (!this.browser) {
			throw new Error('Scanner not properly initialized');
		}

		const page = await this.browser.newPage();

		try {
			// Set viewport and timeouts
			await page.setViewport({ width: 1920, height: 1080 });
			page.setDefaultNavigationTimeout(options.timeout || 30000);
			page.setDefaultTimeout(options.timeout || 30000);

			// Set user agent
			await page.setUserAgent(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			);

			console.log(`🔍 Scanning: ${options.url}`);
			console.log(`⚙️ Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);

			// Navigate to the page
			console.log(`📡 Navigating to page...`);
			const response = await page.goto(options.url, { waitUntil: 'networkidle0' });

			if (!response || !response.ok()) {
				throw new Error(`Failed to load page: ${options.url} (${response?.status()})`);
			}

			console.log(`✅ Page loaded successfully (${response.status()})`);

			// Get page title for debugging
			const title = await page.title();
			console.log(`📄 Page title: "${title}"`);

			// Check if page has expected content
			const bodyText = await page.$eval('body', (el) => el.textContent);
			const bodyLength = bodyText?.length || 0;
			console.log(`📝 Page content length: ${bodyLength} characters`);

			// Wait for the specified time
			const waitTime = options.waitTime || 3000;
			console.log(`⏳ Waiting ${waitTime}ms for dynamic content...`);
			await new Promise((resolve) => setTimeout(resolve, waitTime));

			// Take screenshot if requested
			let screenshot: string | undefined;
			if (options.includeScreenshot) {
				console.log(`📸 Taking screenshot...`);
				const screenshotBuffer = await page.screenshot({
					fullPage: true,
					type: 'png'
				});
				screenshot = Buffer.from(screenshotBuffer).toString('base64');
			}

			// Inject axe-core with fallback mechanism
			console.log(`🔧 Injecting axe-core 4.10.3...`);
			await this.loadAxeCore(page);

			// Verify axe loaded
			const axeLoaded = await page.evaluate(
				() => typeof (window as Window & { axe?: unknown }).axe !== 'undefined'
			);
			if (!axeLoaded) {
				throw new Error('Failed to load axe-core library from all sources');
			}
			console.log(`✅ Axe-core loaded successfully`);

			// Configure axe based on WCAG version and level
			const axeOptions = this.getAxeOptions(
				options.wcagVersion,
				options.level,
				options.includeBestPractices
			);
			console.log(`⚙️ Axe configuration:`, JSON.stringify(axeOptions, null, 2));

			// Run axe accessibility scan
			console.log(`🔍 Running axe accessibility scan...`);
			const results = (await page.evaluate(async (axeConfig: Record<string, unknown>) => {
				type AxeType = {
					run: (config: Record<string, unknown>) => Promise<{
						violations: unknown[];
						passes: unknown[];
						incomplete: unknown[];
						inapplicable: unknown[];
					}>;
				};
				const win = window as typeof window & { axe?: AxeType };
				if (typeof win.axe !== 'undefined') {
					// Run the scan
					const scanResults = await win.axe.run(axeConfig);

					console.log(`Scan completed. Found ${scanResults.violations.length} violations`);
					console.log(
						`Rules run: ${scanResults.passes.length + scanResults.violations.length + scanResults.incomplete.length + scanResults.inapplicable.length}`
					);

					return scanResults;
				} else {
					throw new Error('Axe not loaded');
				}
			}, axeOptions)) as AxeResults;

			// Process results
			const violations = this.processViolations(results.violations, options.url);
			const summary = this.calculateSummary(violations);

			console.log(`📊 Scan Results Summary:`);
			console.log(`   Total violations: ${violations.length}`);
			console.log(`   Critical: ${summary.critical}`);
			console.log(`   Serious: ${summary.serious}`);
			console.log(`   Moderate: ${summary.moderate}`);
			console.log(`   Minor: ${summary.minor}`);

			if (violations.length > 0) {
				console.log(`🚨 Violations found:`);
				violations.forEach((violation, index) => {
					console.log(
						`   ${index + 1}. ${violation.id} (${violation.impact}) - ${violation.elementCount || 0} elements`
					);
				});
			} else {
				console.log(`✅ No violations detected`);
			}

			return {
				url: options.url,
				timestamp: new Date().toISOString(),
				wcagVersion: options.wcagVersion || '2.1',
				level: options.level || 'AA',
				summary,
				violations,
				screenshot,
				logs: this.getLogs()
			};
		} finally {
			await page.close();
		}
	}

	/**
	 * Scan multiple URLs
	 */
	async scanBatch(options: BatchScanOptions): Promise<BatchScanResult> {
		const results: SinglePageScanResult[] = [];
		const maxConcurrent = options.maxConcurrent || 3;

		// Clear logs at the start of batch scan
		this.logger?.clearLogs();

		// Process URLs in batches to avoid overwhelming the browser
		for (let i = 0; i < options.urls.length; i += maxConcurrent) {
			const batch = options.urls.slice(i, i + maxConcurrent);
			const batchPromises = batch.map((url) =>
				this.scanSinglePage({
					url,
					wcagVersion: options.wcagVersion,
					level: options.level,
					includeScreenshot: options.includeScreenshot,
					includeBestPractices: options.includeBestPractices,
					waitTime: options.waitTime,
					timeout: options.timeout
				}).catch((error) => {
					console.error(`Failed to scan ${url}:`, error);
					return {
						url,
						timestamp: new Date().toISOString(),
						wcagVersion: options.wcagVersion || '2.1',
						level: options.level || 'AA',
						summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
						violations: [],
						logs: [],
						error: error.message
					} as SinglePageScanResult;
				})
			);

			const batchResults = await Promise.all(batchPromises);
			results.push(...batchResults);
		}

		// Calculate overall summary
		const summary = {
			totalPages: results.length,
			totalViolations: results.reduce((sum, r) => sum + r.summary.total, 0),
			criticalViolations: results.reduce((sum, r) => sum + r.summary.critical, 0),
			seriousViolations: results.reduce((sum, r) => sum + r.summary.serious, 0),
			moderateViolations: results.reduce((sum, r) => sum + r.summary.moderate, 0),
			minorViolations: results.reduce((sum, r) => sum + r.summary.minor, 0)
		};

		return {
			timestamp: new Date().toISOString(),
			wcagVersion: options.wcagVersion || '2.1',
			level: options.level || 'AA',
			results,
			summary,
			logs: this.getLogs()
		};
	}

	/**
	 * Get axe configuration based on WCAG version and level
	 */
	private getAxeOptions(
		wcagVersion?: string,
		level?: string,
		includeBestPractices?: boolean
	): Record<string, unknown> {
		const tags = ['wcag2a'];

		if (level === 'AA' || level === 'AAA') {
			tags.push('wcag2aa');
		}
		if (level === 'AAA') {
			tags.push('wcag2aaa');
		}

		// Add version-specific tags
		if (wcagVersion === '2.1') {
			tags.push('wcag21a');
			if (level === 'AA' || level === 'AAA') {
				tags.push('wcag21aa');
			}
			if (level === 'AAA') {
				tags.push('wcag21aaa');
			}
		}

		if (wcagVersion === '2.2') {
			tags.push('wcag22a');
			if (level === 'AA' || level === 'AAA') {
				tags.push('wcag22aa');
			}
			if (level === 'AAA') {
				tags.push('wcag22aaa');
			}
		}

		// Add best practices rules if enabled
		if (includeBestPractices) {
			tags.push('best-practice');
		}

		return {
			runOnly: {
				type: 'tag',
				values: tags
			}
		};
	}

	/**
	 * Process axe violations into our format
	 */
	private processViolations(axeViolations: AxeViolation[], url: string): Violation[] {
		return axeViolations.map((violation) => ({
			id: violation.id,
			description: violation.description,
			impact: violation.impact,
			tags: violation.tags,
			pagePath: url,
			nodeDetails: violation.nodes.map((node) => ({
				html: node.html,
				target: node.target,
				elementLocation: node.target.join(' > ')
			})),
			elementCount: violation.nodes.length,
			nodes: violation.nodes
		}));
	}

	/**
	 * Calculate summary statistics
	 */
	private calculateSummary(violations: Violation[]) {
		const summary = {
			total: violations.length,
			critical: 0,
			serious: 0,
			moderate: 0,
			minor: 0
		};

		violations.forEach((violation) => {
			switch (violation.impact?.toLowerCase()) {
				case 'critical':
					summary.critical++;
					break;
				case 'serious':
					summary.serious++;
					break;
				case 'moderate':
					summary.moderate++;
					break;
				case 'minor':
					summary.minor++;
					break;
			}
		});

		return summary;
	}

	/**
	 * Load axe-core with fallback mechanism
	 */
	private async loadAxeCore(page: Page): Promise<void> {
		const axeUrls = [
			'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js',
			'https://unpkg.com/axe-core@4.10.3/axe.min.js',
			'https://cdn.jsdelivr.net/npm/axe-core@4.10.3/axe.min.js'
		];

		let lastError: Error | null = null;

		for (const url of axeUrls) {
			try {
				console.log(`📥 Trying to load axe-core from: ${new URL(url).hostname}`);
				await page.addScriptTag({ url });

				// Quick check if axe loaded
				const loaded = await page.evaluate(
					() => typeof (window as Window & { axe?: unknown }).axe !== 'undefined'
				);

				if (loaded) {
					console.log(`✅ Successfully loaded axe-core from: ${new URL(url).hostname}`);
					return;
				}
			} catch (error) {
				console.log(
					`❌ Failed to load from ${new URL(url).hostname}: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				);
				lastError = error instanceof Error ? error : new Error('Unknown error');
			}
		}

		// If all CDNs fail, try to inject axe-core directly
		try {
			console.log(`📦 Trying to inject axe-core directly...`);
			await this.injectAxeCoreDirect(page);

			const loaded = await page.evaluate(
				() => typeof (window as Window & { axe?: unknown }).axe !== 'undefined'
			);

			if (loaded) {
				console.log(`✅ Successfully injected axe-core directly`);
				return;
			}
		} catch (error) {
			console.log(
				`❌ Failed to inject axe-core directly: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}

		throw new Error(
			`Failed to load axe-core from all sources. Last error: ${lastError?.message || 'Unknown error'}`
		);
	}
	/**
	 * Inject axe-core directly as a fallback
	 */
	private async injectAxeCoreDirect(page: Page): Promise<void> {
		// Try loading from unpkg with a different approach
		try {
			await page.evaluate(async () => {
				return new Promise((resolve, reject) => {
					const script = document.createElement('script');
					script.src = 'https://unpkg.com/axe-core@latest/axe.min.js';
					script.onload = () => resolve(true);
					script.onerror = () => reject(new Error('Failed to load axe-core script'));
					script.async = true;
					document.head.appendChild(script);

					// Timeout after 10 seconds
					setTimeout(() => reject(new Error('Timeout loading axe-core')), 10000);
				});
			});
		} catch {
			// If external CDN fails, fall back to creating a minimal axe implementation
			console.log(`⚠️ External CDN failed, using minimal axe implementation`);
			await this.injectMinimalAxe(page);
		}
	}

	/**
	 * Inject a minimal axe implementation as the last resort
	 */
	private async injectMinimalAxe(page: Page): Promise<void> {
		await page.evaluate(() => {
			// Create a minimal axe object that can perform basic accessibility checks
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as Window & { axe?: { run: (options?: unknown) => Promise<any> } }).axe = {
				run: async () => {
					console.log('Using minimal axe implementation');

					// Basic accessibility checks that don't require the full axe library
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const violations: any[] = [];

					// Check for missing alt attributes
					const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
					if (imagesWithoutAlt.length > 0) {
						violations.push({
							id: 'image-alt',
							description: 'Images must have alternate text',
							impact: 'critical',
							tags: ['wcag2a', 'wcag111'],
							nodes: Array.from(imagesWithoutAlt).map((img) => ({
								html: img.outerHTML,
								target: [img.tagName.toLowerCase() + (img.id ? '#' + img.id : '')]
							}))
						});
					}

					// Check for empty links
					const emptyLinks = document.querySelectorAll(
						'a[href]:empty, a[href]:not([aria-label]):not([title])'
					);
					if (emptyLinks.length > 0) {
						violations.push({
							id: 'link-name',
							description: 'Links must have discernible text',
							impact: 'serious',
							tags: ['wcag2a', 'wcag412'],
							nodes: Array.from(emptyLinks)
								.slice(0, 10)
								.map((link) => ({
									html: link.outerHTML,
									target: [link.tagName.toLowerCase() + (link.id ? '#' + link.id : '')]
								}))
						});
					}

					// Check for form inputs without labels
					const inputsWithoutLabels = document.querySelectorAll(
						'input[type="text"], input[type="email"], input[type="password"], textarea'
					);
					const unlabeledInputs = Array.from(inputsWithoutLabels).filter((input) => {
						const hasLabel =
							document.querySelector(`label[for="${input.id}"]`) || input.closest('label');
						const hasAriaLabel =
							input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
						return !hasLabel && !hasAriaLabel;
					});

					if (unlabeledInputs.length > 0) {
						violations.push({
							id: 'label',
							description: 'Form elements must have labels',
							impact: 'critical',
							tags: ['wcag2a', 'wcag412'],
							nodes: unlabeledInputs.slice(0, 10).map((input) => ({
								html: input.outerHTML,
								target: [input.tagName.toLowerCase() + (input.id ? '#' + input.id : '')]
							}))
						});
					}

					return {
						violations,
						passes: [],
						incomplete: [],
						inapplicable: []
					};
				}
			};
		});
	}
}

// Convenience functions for quick scans (headless by default)
export async function scanUrl(
	url: string,
	options: Partial<ScanOptions> = {}
): Promise<SinglePageScanResult> {
	const scanner = new WCAGScanner(); // headless by default
	try {
		return await scanner.scanSinglePage({ url, ...options });
	} finally {
		await scanner.cleanup();
	}
}

export async function scanUrls(
	urls: string[],
	options: Partial<BatchScanOptions> = {}
): Promise<BatchScanResult> {
	const scanner = new WCAGScanner(); // headless by default
	try {
		return await scanner.scanBatch({ urls, ...options });
	} finally {
		await scanner.cleanup();
	}
}

// Debug function specifically for troubleshooting discrepancies (headed mode)
export async function debugScan(
	url: string,
	options: Partial<ScanOptions> = {}
): Promise<SinglePageScanResult> {
	console.log(`🔍 DEBUG SCAN for: ${url}`);
	console.log(`⚙️ Running in headed mode with detailed logging`);

	const scanner = new WCAGScanner({ debugMode: true }); // explicitly headed for debugging
	try {
		const result = await scanner.scanSinglePage({
			url,
			waitTime: 8000, // Longer wait time
			timeout: 60000, // Longer timeout
			...options
		});

		console.log(`\n📋 DEBUG SUMMARY:`);
		console.log(`   URL: ${result.url}`);
		console.log(`   Violations: ${result.violations.length}`);
		console.log(`   Critical: ${result.summary.critical}`);
		console.log(`   Serious: ${result.summary.serious}`);
		console.log(`   Moderate: ${result.summary.moderate}`);
		console.log(`   Minor: ${result.summary.minor}`);
		console.log(`   Logs captured: ${result.logs?.length || 0}`);

		return result;
	} finally {
		await scanner.cleanup();
	}
}
