import type { SinglePageScanResult, BatchScanResult } from '$lib/scanner/types.js';
import { isBatchResult } from './utils.js';
import { generateHTMLReport } from './html-report.js';

export const exportToCSV = (results: SinglePageScanResult | BatchScanResult): string => {
	const isBatch = isBatchResult(results);

	// Get all violations with site info
	const allViolations = isBatch
		? results.results.flatMap((result) =>
				result.violations.map((v) => ({ ...v, siteUrl: result.url }))
			)
		: results.violations.map((v) => ({ ...v, siteUrl: results.url }));

	// CSV headers
	const headers = [
		'Site URL',
		'Rule ID',
		'Description',
		'Impact',
		'Element Count',
		'Tags',
		'Page Path'
	];

	// CSV rows
	const rows = allViolations.map((violation) => [
		violation.siteUrl,
		violation.id,
		violation.description.replace(/"/g, '""'), // Escape quotes
		violation.impact,
		violation.elementCount || violation.nodes?.length || 0,
		violation.tags.join('; '),
		violation.pagePath || ''
	]);

	// Combine headers and rows
	const csvContent = [
		headers.join(','),
		...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
	].join('\n');

	return csvContent;
};

export const exportToHTML = (results: SinglePageScanResult | BatchScanResult): string => {
	return generateHTMLReport(results);
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
};

export const generateFilename = (format: 'csv' | 'html' | 'json', isBatch: boolean): string => {
	const timestamp = new Date().toISOString().split('T')[0];
	const type = isBatch ? 'batch' : 'single';
	return `wcag-${type}-report-${timestamp}.${format}`;
};
