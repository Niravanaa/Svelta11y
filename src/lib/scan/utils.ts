import type { SinglePageScanResult, BatchScanResult } from '$lib/scanner/types.js';
import type { ConfigProfile, SavedScan, ViolationWithSite } from './types.js';

// Type guards
export const isBatchResult = (
	results: SinglePageScanResult | BatchScanResult
): results is BatchScanResult => {
	return 'results' in results && Array.isArray(results.results);
};

// Result processing helpers
export const getScreenshots = (results: SinglePageScanResult | BatchScanResult | null) => {
	if (!results) return [];

	if (isBatchResult(results)) {
		return results.results
			.filter((result) => result.screenshot)
			.map((result) => ({ url: result.url, data: result.screenshot! }));
	} else {
		return results.screenshot ? [{ url: results.url, data: results.screenshot }] : [];
	}
};

export const getCurrentResult = (results: SinglePageScanResult | BatchScanResult | null) => {
	if (!results) return null;

	if (isBatchResult(results)) {
		// For batch results, return the first result for now
		// TODO: Implement proper multi-result display
		return results.results[0] || null;
	} else {
		return results;
	}
};

export const getSummary = (results: SinglePageScanResult | BatchScanResult | null) => {
	if (!results) return { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 };

	if (isBatchResult(results)) {
		// For batch results, normalize the summary to match single result format
		return {
			total: results.summary.totalViolations,
			critical: results.summary.criticalViolations,
			serious: results.summary.seriousViolations,
			moderate: results.summary.moderateViolations,
			minor: results.summary.minorViolations
		};
	} else {
		// For single results, return the existing summary or calculate from violations
		if (results.summary) {
			return results.summary;
		} else {
			// Fallback: calculate summary from violations
			const violations = results.violations || [];
			return {
				total: violations.length,
				critical: violations.filter((v) => v.impact === 'critical').length,
				serious: violations.filter((v) => v.impact === 'serious').length,
				moderate: violations.filter((v) => v.impact === 'moderate').length,
				minor: violations.filter((v) => v.impact === 'minor').length
			};
		}
	}
};

export const getAllViolations = (
	results: SinglePageScanResult | BatchScanResult | null
): ViolationWithSite[] => {
	if (!results) return [];

	if (isBatchResult(results)) {
		// For batch results, flatten all violations and add site information
		return results.results.flatMap((result) =>
			(result.violations || []).map((violation) => ({
				...violation,
				siteUrl: result.url // Add site URL for filtering
			}))
		);
	} else {
		// For single results, add site information to each violation
		return (results.violations || []).map((violation) => ({
			...violation,
			siteUrl: results.url
		}));
	}
};

export const getAllSites = (results: SinglePageScanResult | BatchScanResult | null): string[] => {
	if (!results) return [];

	if (isBatchResult(results)) {
		return results.results.map((result) => result.url);
	} else {
		return [results.url];
	}
};

export const getAllLogs = (results: SinglePageScanResult | BatchScanResult | null) => {
	if (!results) return [];

	if (isBatchResult(results)) {
		// For batch results, combine logs from all results
		return results.logs || [];
	} else {
		return results.logs || [];
	}
};

// Configuration profile management
export const loadConfigProfiles = (): ConfigProfile[] => {
	if (typeof window === 'undefined') return [];
	const saved = localStorage.getItem('wcag-scanner-profiles');
	return saved ? JSON.parse(saved) : [];
};

export const saveConfigProfiles = (profiles: ConfigProfile[]) => {
	if (typeof window === 'undefined') return;
	localStorage.setItem('wcag-scanner-profiles', JSON.stringify(profiles));
};

export const createConfigProfile = (
	profiles: ConfigProfile[],
	name: string,
	wcagVersion: string,
	level: string,
	includeScreenshot: boolean,
	includeBestPractices: boolean
): ConfigProfile[] => {
	const newProfile: ConfigProfile = {
		id: Date.now(),
		name: name.trim(),
		wcagVersion,
		level,
		includeScreenshot,
		includeBestPractices
	};

	const updatedProfiles = [...profiles, newProfile];
	saveConfigProfiles(updatedProfiles);
	return updatedProfiles;
};

export const deleteConfigProfile = (
	profiles: ConfigProfile[],
	profileId: number
): ConfigProfile[] => {
	const updatedProfiles = profiles.filter((p) => p.id !== profileId);
	saveConfigProfiles(updatedProfiles);
	return updatedProfiles;
};

export const loadConfigProfile = (
	profile: ConfigProfile,
	setters: {
		setWcagVersion: (version: string) => void;
		setLevel: (level: string) => void;
		setIncludeScreenshot: (include: boolean) => void;
		setIncludeBestPractices: (include: boolean) => void;
	}
) => {
	setters.setWcagVersion(profile.wcagVersion);
	setters.setLevel(profile.level);
	setters.setIncludeScreenshot(profile.includeScreenshot);
	setters.setIncludeBestPractices(profile.includeBestPractices);
};

// Saved scans management
export const loadSavedScans = (): SavedScan[] => {
	if (typeof window === 'undefined') return [];
	const saved = localStorage.getItem('wcag-scanner-saved');
	return saved ? JSON.parse(saved) : [];
};

export const saveScanResult = (
	savedScans: SavedScan[],
	results: SinglePageScanResult,
	name: string
): SavedScan[] => {
	const savedScan: SavedScan = {
		...results,
		id: Date.now(),
		name: name.trim()
	};

	const updatedScans = [...savedScans, savedScan];
	if (typeof window !== 'undefined') {
		localStorage.setItem('wcag-scanner-saved', JSON.stringify(updatedScans));
	}
	return updatedScans;
};

export const deleteSavedScan = (savedScans: SavedScan[], scanId: number): SavedScan[] => {
	const updatedScans = savedScans.filter((scan) => scan.id !== scanId);
	if (typeof window !== 'undefined') {
		localStorage.setItem('wcag-scanner-saved', JSON.stringify(updatedScans));
	}
	return updatedScans;
};

// Utility functions
export const getSeverityColor = (impact: string) => {
	switch (impact?.toLowerCase()) {
		case 'critical':
			return 'destructive';
		case 'serious':
			return 'destructive';
		case 'moderate':
			return 'default';
		case 'minor':
			return 'secondary';
		default:
			return 'outline';
	}
};

export const formatTimestamp = (isoString: string) => {
	const date = new Date(isoString);
	return date.toLocaleTimeString();
};

export const getLevelClass = (level: string) => {
	switch (level) {
		case 'error':
			return 'text-red-400';
		case 'warn':
			return 'text-yellow-400';
		case 'info':
			return 'text-cyan-400';
		default:
			return 'text-purple-400';
	}
};
