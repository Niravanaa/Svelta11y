// Additional types specific to the scan page
import type { SinglePageScanResult, AxeNode } from '$lib/scanner/types.js';

export interface ViolationElement {
	selector: string;
	html: string;
}

export interface ScanViolation {
	id: string;
	description: string;
	impact: string;
	tags: string[];
	nodes: number;
	helpUrl: string;
	elements: ViolationElement[];
}

export interface SavedScan extends SinglePageScanResult {
	id: number;
	name: string;
}

export interface ConfigProfile {
	id: number;
	name: string;
	wcagVersion: string;
	level: string;
	includeScreenshot: boolean;
	includeBestPractices: boolean;
}

export interface ViolationWithSite {
	id: string;
	description: string;
	impact: string;
	tags: string[];
	siteUrl: string;
	pagePath?: string;
	nodeDetails?: Array<{
		target: string[];
		html: string;
	}>;
	elementCount?: number;
	nodes?: AxeNode[];
}
