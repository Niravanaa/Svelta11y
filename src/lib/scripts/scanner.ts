import { chromium } from 'playwright';
import type { Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';

// Import types from our centralized types module
import type {
	AxeResults,
	AxeViolation,
	AxeNode,
	Violation,
	ViolationSummary,
	ScanResults,
	LogEntry
} from '../scanner/types.js';

// Logger class to capture all console output
class Logger {
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

// Type definitions for legacy scanner config
interface Credentials {
	loginUrl: string;
	usernameSelector: string;
	passwordSelector: string;
	email: string;
	password: string;
	waitForLoginTimeout: number;
}

interface Website {
	name: string;
	rootUrl: string;
	credentials: Credentials;
	securedUrls: string[];
	anonymousUrls: string[];
}

interface Config {
	websites: Website[];
	violationLink: string;
	debugMode: boolean;
	includeBestPractices?: boolean;
}

interface WebsiteData {
	name: string;
	rootUrl: string;
	violationSummary: ViolationSummary[];
	overallViolations: Violation[];
	pagesScanned: string[];
}

interface SummaryData {
	websites: WebsiteData[];
	executionDate: string;
	violationLink: string;
	logs: LogEntry[];
}

// Function to read configuration from a JSON file
const readConfig = (filePath: string): Config => {
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	} catch (error) {
		console.error(`Error reading config file ${filePath}:`, error);
		throw error;
	}
};

// Function to log in to the website
const login = async (page: Page, credentials: Credentials, rootUrl: string): Promise<void> => {
	const loginUrl = `${rootUrl}${credentials.loginUrl}`;
	console.log(`Logging in to: ${loginUrl}`);

	try {
		await page.goto(loginUrl);

		await page.waitForSelector(credentials.usernameSelector, {
			timeout: credentials.waitForLoginTimeout
		});

		await page.fill(credentials.usernameSelector, credentials.email);
		await page.fill(credentials.passwordSelector, credentials.password);
		await page.click('button[type="submit"]');

		try {
			await page.waitForNavigation({ waitUntil: 'networkidle' });
			console.log('Login successful');
		} catch (error) {
			console.error('Navigation timeout or failed after clicking submit button:', error);
		}
	} catch (error) {
		console.error(`Login failed for ${loginUrl}:`, error);
		throw error;
	}
};

// Function to scan a given set of URLs
const scanUrls = async (
	page: Page,
	urls: string[],
	rootUrl: string,
	isSecured: boolean = false,
	includeBestPractices: boolean = false
): Promise<ScanResults> => {
	const violations: Violation[] = [];
	const violationSummary: ViolationSummary[] = [];

	for (const pagePath of urls) {
		const pageUrl = `${rootUrl}${pagePath}`;
		try {
			console.log(`Scanning ${isSecured ? 'secured' : 'anonymous'}: ${pageUrl}`);

			const response = await page.goto(pageUrl, { waitUntil: 'networkidle' });

			if (!response || !response.ok()) {
				const errorViolation: ViolationSummary = {
					id: 'page-not-found',
					count: 1,
					severity: 'Critical'
				};
				violationSummary.push(errorViolation);
				throw new Error(`Page not found or failed to load: ${pageUrl}`);
			}

			// Add a 3 second delay before running axe on each page
			await new Promise((resolve) => setTimeout(resolve, 3000));

			// Inject axe-core
			await page.addScriptTag({
				url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.3/axe.min.js'
			});

			// Run axe accessibility scan
			const results = await page.evaluate(async (includeBestPractices): Promise<AxeResults> => {
				if (typeof window.axe !== 'undefined') {
					const axeConfig: Record<string, unknown> = {};

					// Configure axe to include best practices if enabled
					if (includeBestPractices) {
						axeConfig.runOnly = {
							type: 'tag',
							values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
						};
					}

					return await window.axe.run(axeConfig);
				} else {
					throw new Error('Axe not loaded');
				}
			}, includeBestPractices);

			if (results && results.violations) {
				// Process violations
				results.violations.forEach((v: AxeViolation) => {
					const violation = v as Violation;
					violation.pagePath = pagePath;
					violation.nodeDetails = v.nodes.map((node: AxeNode) => ({
						html: node.html,
						target: node.target,
						elementLocation: node.target.join(' > ')
					}));
					violation.elementCount = v.nodes.length;
				});

				violations.push(...(results.violations as Violation[]));

				// Update violation summary
				results.violations.forEach((violation: AxeViolation) => {
					const severity = violation.impact || 'unknown';
					const existingViolation = violationSummary.find((v) => v.id === violation.id);

					if (existingViolation) {
						existingViolation.count += violation.nodes.length;
					} else {
						violationSummary.push({
							id: violation.id,
							count: violation.nodes.length,
							severity
						});
					}
				});
			}
		} catch (error) {
			console.error(`Failed to scan ${pageUrl}:`, error);

			const errorViolation: Violation = {
				pagePath: pagePath,
				id: 'page-not-found',
				description: `Error scanning ${pageUrl}: ${(error as Error).message}`,
				impact: 'Critical',
				tags: ['error'],
				nodeDetails: []
			};
			violations.push(errorViolation);
		}
	}

	return { violations, violationSummary };
};

// Function to sort violations by severity
const sortBySeverity = (violations: ViolationSummary[]): ViolationSummary[] => {
	const severityOrder: Record<string, number> = {
		critical: 1,
		serious: 2,
		moderate: 3,
		minor: 4,
		'': 5,
		unknown: 6
	};

	return violations.sort((a, b) => {
		const severityA = severityOrder[a.severity.toLowerCase()] || 6;
		const severityB = severityOrder[b.severity.toLowerCase()] || 6;
		return severityA - severityB;
	});
};

// Function to sort overall violations
const sortOverallViolations = (violations: Violation[]): Violation[] => {
	const severityOrder: Record<string, number> = {
		critical: 1,
		serious: 2,
		moderate: 3,
		minor: 4,
		'': 5,
		unknown: 6
	};

	return violations.sort((a, b) => {
		// First sort by page path
		if (a.pagePath && b.pagePath) {
			if (a.pagePath < b.pagePath) return -1;
			if (a.pagePath > b.pagePath) return 1;
		}

		// Then sort by severity
		const severityA = severityOrder[a.impact?.toLowerCase() || 'unknown'] || 6;
		const severityB = severityOrder[b.impact?.toLowerCase() || 'unknown'] || 6;
		return severityA - severityB;
	});
};

// Function to generate HTML report
const generateReport = (summaryData: SummaryData, templatePath: string): string => {
	try {
		const template = fs.readFileSync(templatePath, 'utf8');
		return ejs.render(template, summaryData);
	} catch (error) {
		console.error('Error generating report:', error);
		// Fallback to a simple HTML report
		return generateFallbackReport(summaryData);
	}
};

// Fallback report generator
const generateFallbackReport = (summaryData: SummaryData): string => {
	const formatTimestamp = (isoString: string) => {
		const date = new Date(isoString);
		return date.toLocaleTimeString();
	};

	const getLevelClass = (level: string) => {
		switch (level) {
			case 'error':
				return 'log-error';
			case 'warn':
				return 'log-warn';
			case 'info':
				return 'log-info';
			default:
				return 'log-debug';
		}
	};

	return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Accessibility Scan Report</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                * { box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: #f8fafc; 
                    color: #1e293b;
                    line-height: 1.6;
                }
                .container { max-width: 1200px; margin: 0 auto; }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 2rem; 
                    border-radius: 12px; 
                    margin-bottom: 2rem; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .header h1 { margin: 0 0 0.5rem 0; font-size: 2.5rem; font-weight: 700; }
                .header p { margin: 0; opacity: 0.9; font-size: 1.1rem; }
                
                .tabs {
                    display: flex;
                    background: white;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .tab {
                    flex: 1;
                    padding: 1rem 2rem;
                    cursor: pointer;
                    border: none;
                    background: #f1f5f9;
                    transition: all 0.2s;
                    font-size: 1rem;
                    font-weight: 600;
                }
                .tab.active { background: #3b82f6; color: white; }
                .tab:hover:not(.active) { background: #e2e8f0; }
                
                .tab-content { display: none; }
                .tab-content.active { display: block; }
                
                .summary-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    text-align: center;
                }
                .stat-number { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
                .stat-label { color: #64748b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
                .stat-critical { color: #dc2626; }
                .stat-serious { color: #ea580c; }
                .stat-moderate { color: #ca8a04; }
                .stat-minor { color: #65a30d; }
                
                .website { 
                    background: white; 
                    margin: 1.5rem 0; 
                    border-radius: 12px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .website-header {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                .website-content { padding: 1.5rem; }
                .website h2 { margin: 0 0 0.5rem 0; color: #1e293b; }
                .website-meta { color: #64748b; font-size: 0.9rem; }
                
                .violation { 
                    margin: 1rem 0; 
                    padding: 1rem; 
                    border-left: 4px solid #dc2626; 
                    background: #fef2f2; 
                    border-radius: 0 8px 8px 0;
                }
                .violation.critical { border-color: #dc2626; background: #fef2f2; }
                .violation.serious { border-color: #ea580c; background: #fff7ed; }
                .violation.moderate { border-color: #ca8a04; background: #fffbeb; }
                .violation.minor { border-color: #65a30d; background: #f0fdf4; }
                
                .logs-container {
                    background: #1e293b;
                    border-radius: 8px;
                    padding: 1rem;
                    font-family: 'Courier New', Monaco, monospace;
                    font-size: 0.875rem;
                    max-height: 600px;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                }
                .log-entry {
                    padding: 0.25rem 0;
                    border-bottom: 1px solid #334155;
                    word-wrap: break-word;
                }
                .log-entry:last-child { border-bottom: none; }
                .log-timestamp { color: #64748b; margin-right: 0.5rem; }
                .log-info { color: #22d3ee; }
                .log-error { color: #f87171; }
                .log-warn { color: #fbbf24; }
                .log-debug { color: #a78bfa; }
                
                .no-violations {
                    text-align: center;
                    padding: 3rem;
                    color: #16a34a;
                    font-size: 1.2rem;
                }
                .no-violations::before {
                    content: "✅";
                    display: block;
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Accessibility Scan Report</h1>
                    <p>Generated: ${summaryData.executionDate}</p>
                </div>

                <div class="tabs">
                    <button class="tab active" onclick="showTab('summary')">Summary</button>
                    <button class="tab" onclick="showTab('logs')">Terminal Logs</button>
                </div>

                <div id="summary" class="tab-content active">
                    ${
											summaryData.websites.length === 0
												? '<div class="no-violations">No websites were scanned</div>'
												: summaryData.websites
														.map((website) => {
															const totalViolations = website.overallViolations.length;
															const criticalCount = website.violationSummary
																.filter((v) => v.severity.toLowerCase() === 'critical')
																.reduce((sum, v) => sum + v.count, 0);
															const seriousCount = website.violationSummary
																.filter((v) => v.severity.toLowerCase() === 'serious')
																.reduce((sum, v) => sum + v.count, 0);
															const moderateCount = website.violationSummary
																.filter((v) => v.severity.toLowerCase() === 'moderate')
																.reduce((sum, v) => sum + v.count, 0);
															const minorCount = website.violationSummary
																.filter((v) => v.severity.toLowerCase() === 'minor')
																.reduce((sum, v) => sum + v.count, 0);

															return `
                                <div class="website">
                                    <div class="website-header">
                                        <h2>${website.name}</h2>
                                        <div class="website-meta">
                                            <strong>URL:</strong> ${website.rootUrl} | 
                                            <strong>Pages Scanned:</strong> ${website.pagesScanned.length} | 
                                            <strong>Total Violations:</strong> ${totalViolations}
                                        </div>
                                    </div>
                                    <div class="website-content">
                                        ${
																					totalViolations > 0
																						? `
                                            <div class="summary-stats">
                                                <div class="stat-card">
                                                    <div class="stat-number stat-critical">${criticalCount}</div>
                                                    <div class="stat-label">Critical</div>
                                                </div>
                                                <div class="stat-card">
                                                    <div class="stat-number stat-serious">${seriousCount}</div>
                                                    <div class="stat-label">Serious</div>
                                                </div>
                                                <div class="stat-card">
                                                    <div class="stat-number stat-moderate">${moderateCount}</div>
                                                    <div class="stat-label">Moderate</div>
                                                </div>
                                                <div class="stat-card">
                                                    <div class="stat-number stat-minor">${minorCount}</div>
                                                    <div class="stat-label">Minor</div>
                                                </div>
                                            </div>
                                            <h3>Violations Summary:</h3>
                                            ${website.violationSummary
																							.map(
																								(v) => `
                                                <div class="violation ${v.severity.toLowerCase()}">
                                                    <strong>${v.id}</strong> - ${v.count} instances (${v.severity})
                                                </div>
                                            `
																							)
																							.join('')}
                                        `
																						: '<div class="no-violations">No accessibility violations found!</div>'
																				}
                                    </div>
                                </div>
                            `;
														})
														.join('')
										}
                </div>

                <div id="logs" class="tab-content">
                    <div class="logs-container">
                        ${
													summaryData.logs.length === 0
														? '<div style="color: #64748b; text-align: center; padding: 2rem;">No logs available</div>'
														: summaryData.logs
																.map(
																	(log) => `
                                <div class="log-entry">
                                    <span class="log-timestamp">[${formatTimestamp(log.timestamp)}]</span>
                                    <span class="${getLevelClass(log.level)}">${log.message}</span>
                                </div>
                            `
																)
																.join('')
												}
                    </div>
                </div>
            </div>

            <script>
                function showTab(tabName) {
                    // Hide all tab contents
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // Remove active class from all tabs
                    document.querySelectorAll('.tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Show selected tab content
                    document.getElementById(tabName).classList.add('active');
                    
                    // Add active class to clicked tab
                    event.target.classList.add('active');
                }
            </script>
        </body>
        </html>
    `;
};

// Main function to run the accessibility scan
export const runAccessibilityScan = async (configPath: string = 'config.json'): Promise<void> => {
	let browser: Browser | null = null;
	const logger = new Logger();

	try {
		console.log('Starting WCAG Scanner...');

		const config = readConfig(configPath);
		const { websites, violationLink, debugMode } = config;

		// Launch browser
		browser = await chromium.launch({
			headless: !debugMode
		});

		const context: BrowserContext = await browser.newContext();
		const page: Page = await context.newPage();

		// Set viewport and timeouts
		await page.setViewportSize({ width: 1920, height: 1080 });
		page.setDefaultNavigationTimeout(300000);
		page.setDefaultTimeout(300000);

		const allWebsitesData: WebsiteData[] = [];

		// Process each website
		for (const website of websites) {
			console.log(`\n--- Starting scan for: ${website.name} ---`);
			const { credentials, securedUrls, anonymousUrls, rootUrl } = website;

			// Create a list of all URLs to be scanned
			const allUrls = Array.from(new Set([...anonymousUrls, ...securedUrls]));
			const pagesScanned = new Set(allUrls.map((pagePath) => `${rootUrl}${pagePath}`));

			// Scan anonymous URLs first
			console.log('Scanning anonymous URLs...');
			const anonymousResults = await scanUrls(
				page,
				anonymousUrls,
				rootUrl,
				false,
				config.includeBestPractices || false
			);
			let overallViolations = anonymousResults.violations;
			let violationSummary = anonymousResults.violationSummary;

			// Scan secured URLs if credentials are provided
			if (securedUrls.length > 0 && credentials) {
				console.log('Scanning secured URLs...');
				await login(page, credentials, rootUrl);

				const securedResults = await scanUrls(
					page,
					securedUrls,
					rootUrl,
					true,
					config.includeBestPractices || false
				);
				overallViolations = overallViolations.concat(securedResults.violations);

				// Merge violation summaries
				securedResults.violationSummary.forEach((summary) => {
					const existingViolation = violationSummary.find((v) => v.id === summary.id);
					if (existingViolation) {
						existingViolation.count += summary.count;
					} else {
						violationSummary.push(summary);
					}
				});
			}

			// Sort results
			violationSummary = sortBySeverity(violationSummary);
			overallViolations = sortOverallViolations(overallViolations);

			allWebsitesData.push({
				name: website.name,
				rootUrl,
				violationSummary,
				overallViolations,
				pagesScanned: Array.from(pagesScanned)
			});

			console.log(
				`Completed scan for ${website.name}: ${overallViolations.length} violations found`
			);
		}

		// Generate report
		console.log('\nGenerating accessibility report...');
		const executionDate = new Date().toLocaleString();
		const summaryData: SummaryData = {
			websites: allWebsitesData,
			executionDate,
			violationLink: violationLink || '',
			logs: logger.getLogs()
		};

		const templatePath = path.join(__dirname, '../scripts/report-template.ejs');
		const reportHTML = generateReport(summaryData, templatePath);

		const reportPath = 'accessibility-report.html';
		fs.writeFileSync(reportPath, reportHTML);
		console.log(`Accessibility report generated: ${reportPath}`);

		// Calculate total violations
		const totalViolations = allWebsitesData.reduce(
			(sum, website) => sum + website.overallViolations.length,
			0
		);

		if (totalViolations > 0) {
			console.error(`\n❌ Total Accessibility Violations Found: ${totalViolations}`);

			// Show summary by website
			allWebsitesData.forEach((website) => {
				if (website.overallViolations.length > 0) {
					console.error(`   ${website.name}: ${website.overallViolations.length} violations`);
				}
			});

			if (!debugMode) {
				logger.restore();
				await browser?.close();
				process.exit(1);
			}
		} else {
			console.log('\n✅ No accessibility violations found across all websites.');
		}

		// Handle debug mode
		if (debugMode) {
			console.log('\n--- Debug Mode ---');
			console.log('Press any key to close the browser and finish the script...');

			process.stdin.setRawMode(true);
			process.stdin.resume();
			process.stdin.on('data', async () => {
				logger.restore();
				await browser?.close();
				process.exit(totalViolations > 0 ? 1 : 0);
			});
		} else {
			logger.restore();
			await browser?.close();
		}
	} catch (error) {
		console.error('Error running accessibility scan:', error);
		logger.restore();
		await browser?.close();
		process.exit(1);
	}
};

// Run the scanner if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runAccessibilityScan().catch(console.error);
}
