// Type definitions for WCAG Scanner

export interface LogEntry {
	timestamp: string;
	level: 'info' | 'error' | 'warn' | 'debug';
	message: string;
	details?: unknown;
}

export interface AxeNode {
	html: string;
	target: string[];
	any?: unknown[];
	all?: unknown[];
	none?: unknown[];
}

export interface AxeViolation {
	id: string;
	description: string;
	impact: string;
	tags: string[];
	nodes: AxeNode[];
	helpUrl?: string;
}

export interface AxeResults {
	violations: AxeViolation[];
	passes: unknown[];
	incomplete: unknown[];
	inapplicable: unknown[];
}

export interface ViolationNode {
	html: string;
	target: string[];
	elementLocation: string;
}

export interface Violation {
	id: string;
	description: string;
	impact: string;
	tags: string[];
	pagePath?: string;
	nodeDetails?: ViolationNode[];
	elementCount?: number;
	nodes?: AxeNode[];
}

export interface ViolationSummary {
	id: string;
	count: number;
	severity: string;
}

export interface ScanResults {
	violations: Violation[];
	violationSummary: ViolationSummary[];
}

export interface ScanOptions {
	url: string;
	wcagVersion?: '2.0' | '2.1' | '2.2';
	level?: 'A' | 'AA' | 'AAA';
	includeScreenshot?: boolean;
	includeBestPractices?: boolean;
	waitTime?: number;
	timeout?: number;
}

export interface SinglePageScanResult {
	url: string;
	timestamp: string;
	wcagVersion: string;
	level: string;
	summary: {
		total: number;
		critical: number;
		serious: number;
		moderate: number;
		minor: number;
	};
	violations: Violation[];
	screenshot?: string; // base64 encoded screenshot
	logs?: LogEntry[];
}

export interface BatchScanOptions {
	urls: string[];
	wcagVersion?: '2.0' | '2.1' | '2.2';
	level?: 'A' | 'AA' | 'AAA';
	includeScreenshot?: boolean;
	includeBestPractices?: boolean;
	waitTime?: number;
	timeout?: number;
	maxConcurrent?: number;
}

export interface BatchScanResult {
	timestamp: string;
	wcagVersion: string;
	level: string;
	results: SinglePageScanResult[];
	summary: {
		totalPages: number;
		totalViolations: number;
		criticalViolations: number;
		seriousViolations: number;
		moderateViolations: number;
		minorViolations: number;
	};
	logs?: LogEntry[];
}

// Extend window interface for axe
declare global {
	interface Window {
		axe: {
			run(options?: unknown): Promise<AxeResults>;
		};
	}
}
