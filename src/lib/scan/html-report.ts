import type { SinglePageScanResult, BatchScanResult } from '$lib/scanner/types.js';
import { isBatchResult } from './utils.js';

export const generateHTMLReport = (results: SinglePageScanResult | BatchScanResult): string => {
	const isBatch = isBatchResult(results);

	// Normalize summary structure
	const summary = isBatch
		? {
				total: results.summary.totalViolations,
				critical: results.summary.criticalViolations,
				serious: results.summary.seriousViolations,
				moderate: results.summary.moderateViolations,
				minor: results.summary.minorViolations
			}
		: results.summary;

	// Get all violations with site info
	const allViolations = isBatch
		? results.results.flatMap((result) =>
				result.violations.map((v) => ({ ...v, siteUrl: result.url }))
			)
		: results.violations.map((v) => ({ ...v, siteUrl: results.url }));

	// Get all logs
	const allLogs = isBatch ? results.logs || [] : results.logs || [];

	// Get all sites for filtering
	const allSites = isBatch ? results.results.map((r) => r.url) : [results.url];

	// Get screenshots
	const screenshots = isBatch
		? results.results.filter((r) => r.screenshot).map((r) => ({ url: r.url, data: r.screenshot! }))
		: results.screenshot
			? [{ url: results.url, data: results.screenshot }]
			: [];

	const reportTitle = isBatch ? 'Batch Scan' : results.url;
	const scanDescription = isBatch
		? `Batch scan of ${allSites.length} URLs`
		: `Scan of ${results.url}`;

	// Build HTML report using string concatenation to avoid template literal issues
	let html = '<!DOCTYPE html>\n';
	html += '<html lang="en">\n';
	html += '<head>\n';
	html += '  <meta charset="UTF-8">\n';
	html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
	html += '  <title>WCAG Scanner Report - ' + reportTitle + '</title>\n';
	html += '  <style>\n';
	html += '    body { font-family: Arial, sans-serif; margin: 2rem; }\n';
	html += '    .header { text-align: center; margin-bottom: 2rem; }\n';
	html +=
		'    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }\n';
	html +=
		'    .summary-card { background: #f9f9f9; padding: 1rem; border-radius: 8px; text-align: center; }\n';
	html += '    .summary-number { font-size: 2rem; font-weight: bold; }\n';
	html +=
		'    .violation { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }\n';
	html += '    .violation-title { font-weight: bold; margin-bottom: 0.5rem; }\n';
	html += '    .violation-meta { color: #666; font-size: 0.9rem; }\n';
	html += '    .critical { border-left: 4px solid #dc2626; }\n';
	html += '    .serious { border-left: 4px solid #ea580c; }\n';
	html += '    .moderate { border-left: 4px solid #ca8a04; }\n';
	html += '    .minor { border-left: 4px solid #65a30d; }\n';
	html += '    .logs { margin-top: 2rem; }\n';
	html +=
		'    .log-container { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 8px; font-family: monospace; max-height: 400px; overflow-y: auto; }\n';
	html += '    .screenshots { margin-top: 2rem; }\n';
	html +=
		'    .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }\n';
	html +=
		'    .screenshot-item { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }\n';
	html += '    .screenshot-header { padding: 1rem; background: #f9f9f9; font-weight: bold; }\n';
	html += '    .screenshot-img { width: 100%; height: auto; }\n';
	html += '  </style>\n';
	html += '</head>\n';
	html += '<body>\n';

	// Header
	html += '  <div class="header">\n';
	html += '    <h1>🔍 WCAG Scanner Report</h1>\n';
	html += '    <p>' + scanDescription + '</p>\n';
	html += '    <p>Scanned: ' + new Date(results.timestamp).toLocaleString() + '</p>\n';
	html += '  </div>\n';

	// Summary
	html += '  <div class="summary">\n';
	html += '    <div class="summary-card">\n';
	html += '      <div class="summary-number">' + summary.total + '</div>\n';
	html += '      <div>Total Issues</div>\n';
	html += '    </div>\n';
	html += '    <div class="summary-card">\n';
	html += '      <div class="summary-number">' + (summary.critical || 0) + '</div>\n';
	html += '      <div>Critical</div>\n';
	html += '    </div>\n';
	html += '    <div class="summary-card">\n';
	html += '      <div class="summary-number">' + (summary.serious || 0) + '</div>\n';
	html += '      <div>Serious</div>\n';
	html += '    </div>\n';
	html += '    <div class="summary-card">\n';
	html += '      <div class="summary-number">' + (summary.moderate || 0) + '</div>\n';
	html += '      <div>Moderate</div>\n';
	html += '    </div>\n';
	html += '    <div class="summary-card">\n';
	html += '      <div class="summary-number">' + (summary.minor || 0) + '</div>\n';
	html += '      <div>Minor</div>\n';
	html += '    </div>\n';
	html += '  </div>\n';

	// Violations
	html += '  <div class="violations">\n';
	allViolations.forEach((violation) => {
		html += '    <div class="violation ' + violation.impact + '">\n';
		html += '      <div class="violation-title">' + violation.description + '</div>\n';
		html += '      <div class="violation-meta">\n';
		html += '        Rule: ' + violation.id + ' | ';
		html += '        Impact: ' + violation.impact + ' | ';
		html += '        Elements: ' + (violation.elementCount || violation.nodes?.length || 0);
		if (allSites.length > 1) {
			html += ' | Site: ' + violation.siteUrl;
		}
		html += '\n      </div>\n';
		html += '    </div>\n';
	});
	html += '  </div>\n';

	// Logs
	if (allLogs.length > 0) {
		html += '  <div class="logs">\n';
		html += '    <h2>Console Logs</h2>\n';
		html += '    <div class="log-container">\n';
		allLogs.forEach((log) => {
			html +=
				'      <div>[' +
				new Date(log.timestamp).toLocaleTimeString() +
				'] ' +
				log.level.toUpperCase() +
				': ' +
				log.message +
				'</div>\n';
		});
		html += '    </div>\n';
		html += '  </div>\n';
	}

	// Screenshots
	if (screenshots.length > 0) {
		html += '  <div class="screenshots">\n';
		html += '    <h2>Screenshots</h2>\n';
		html += '    <div class="screenshot-grid">\n';
		screenshots.forEach((screenshot) => {
			html += '      <div class="screenshot-item">\n';
			html += '        <div class="screenshot-header">' + screenshot.url + '</div>\n';
			html +=
				'        <img src="data:image/png;base64,' +
				screenshot.data +
				'" alt="Screenshot" class="screenshot-img" />\n';
			html += '      </div>\n';
		});
		html += '    </div>\n';
		html += '  </div>\n';
	}

	html += '</body>\n';
	html += '</html>';

	return html;
};
