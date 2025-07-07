<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { SinglePageScanResult, BatchScanResult } from '$lib/scanner/types.js';
	import type { ConfigProfile } from '$lib/scan/types.js';

	// Import our refactored components
	import UrlInput from '$lib/components/scan/UrlInput.svelte';
	import ConfigPanel from '$lib/components/scan/ConfigPanel.svelte';
	import ProfileManager from '$lib/components/scan/ProfileManager.svelte';

	// Import utilities
	import {
		loadConfigProfiles,
		createConfigProfile,
		deleteConfigProfile,
		loadConfigProfile,
		isBatchResult,
		getAllViolations,
		getSummary
	} from '$lib/scan/utils.js';
	import { exportToCSV, exportToHTML, downloadFile, generateFilename } from '$lib/scan/export.js';
	import { Label } from '$lib/components/ui/label';

	// State variables
	let scanUrl = '';
	let scanUrls: string[] = [''];
	let isMultiUrl = false;
	let isScanning = false;
	let scanProgress = 0;
	let scanResults: SinglePageScanResult | BatchScanResult | null = null;
	let scanError: string | null = null;
	let configProfiles: ConfigProfile[] = [];

	// Configuration state
	let selectedWcagVersion = '2.1';
	let selectedLevel = 'AA';
	let includeScreenshot = true;
	let includeBestPractices = false;

	// Filtering and display state
	let selectedSeverityFilter = 'all';
	let searchTerm = '';
	let violationsPerPage = 10;
	let currentPage = 1;
	let expandedViolations = new Set<string>();

	// Perform scan function
	const performScan = async () => {
		const urlsToScan = isMultiUrl ? scanUrls.filter((url) => url.trim()) : [scanUrl];
		if (!urlsToScan.length || !urlsToScan[0]) return;

		isScanning = true;
		scanProgress = 0;
		scanError = null;
		scanResults = null;

		try {
			// Simulate progress updates
			const progressInterval = setInterval(() => {
				if (scanProgress < 90) {
					scanProgress += 10;
				}
			}, 500);

			let response;

			if (isMultiUrl && urlsToScan.length > 1) {
				// Use batch endpoint for multiple URLs
				response = await fetch('/api/scan/batch', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						urls: urlsToScan,
						wcagVersion: selectedWcagVersion,
						level: selectedLevel,
						includeScreenshot,
						includeBestPractices,
						maxConcurrent: 3
					})
				});
			} else {
				// Use single scan endpoint for single URL
				response = await fetch('/api/scan', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						url: urlsToScan[0],
						wcagVersion: selectedWcagVersion,
						level: selectedLevel,
						includeScreenshot,
						includeBestPractices
					})
				});
			}

			clearInterval(progressInterval);
			scanProgress = 100;

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Scan failed');
			}

			scanResults = await response.json();
		} catch (error) {
			console.error('Scan error:', error);
			scanError = error instanceof Error ? error.message : 'An unknown error occurred';
		} finally {
			isScanning = false;
		}
	};

	// Profile management handlers
	const handleSaveProfile = (event: CustomEvent) => {
		const { name, wcagVersion, level, includeScreenshot, includeBestPractices } = event.detail;
		configProfiles = createConfigProfile(
			configProfiles,
			name,
			wcagVersion,
			level,
			includeScreenshot,
			includeBestPractices
		);
	};

	const handleDeleteProfile = (event: CustomEvent) => {
		const profileId = event.detail;
		configProfiles = deleteConfigProfile(configProfiles, profileId);
	};

	const handleLoadProfile = (event: CustomEvent) => {
		const profileId = event.detail;
		const profile = configProfiles.find((p) => p.id === profileId);
		if (profile) {
			loadConfigProfile(profile, {
				setWcagVersion: (v) => (selectedWcagVersion = v),
				setLevel: (l) => (selectedLevel = l),
				setIncludeScreenshot: (s) => (includeScreenshot = s),
				setIncludeBestPractices: (b) => (includeBestPractices = b)
			});
		}
	};

	// Export handlers
	const exportCSV = () => {
		if (!scanResults) return;
		const csvContent = exportToCSV(scanResults);
		const filename = generateFilename('csv', isBatchResult(scanResults));
		downloadFile(csvContent, filename, 'text/csv');
	};

	const exportHTML = () => {
		if (!scanResults) return;
		const htmlContent = exportToHTML(scanResults);
		const filename = generateFilename('html', isBatchResult(scanResults));
		downloadFile(htmlContent, filename, 'text/html');
	};

	const exportJSON = () => {
		if (!scanResults) return;
		const jsonContent = JSON.stringify(scanResults, null, 2);
		const filename = generateFilename('json', isBatchResult(scanResults));
		downloadFile(jsonContent, filename, 'application/json');
	};

	// Violation filtering and pagination
	const toggleViolationExpansion = (violationId: string) => {
		if (expandedViolations.has(violationId)) {
			expandedViolations.delete(violationId);
		} else {
			expandedViolations.add(violationId);
		}
		expandedViolations = expandedViolations;
	};

	// Load saved data on component mount
	onMount(() => {
		configProfiles = loadConfigProfiles();
	});

	// Computed values
	$: summary = getSummary(scanResults);
	$: allViolations = getAllViolations(scanResults);

	// Filtered violations based on search and severity filter
	$: filteredViolations = allViolations.filter((violation) => {
		const matchesSearch =
			!searchTerm ||
			violation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			violation.description.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesSeverity =
			selectedSeverityFilter === 'all' || violation.impact === selectedSeverityFilter;

		return matchesSearch && matchesSeverity;
	});

	// Paginated violations
	$: paginatedViolations = filteredViolations.slice(
		(currentPage - 1) * violationsPerPage,
		currentPage * violationsPerPage
	);

	$: totalPages = Math.ceil(filteredViolations.length / violationsPerPage);

	// Reset pagination when filters change
	$: if (searchTerm || selectedSeverityFilter) {
		currentPage = 1;
	}
</script>

<div
	class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
>
	<div class="container mx-auto space-y-8 px-4 py-8">
		<!-- Header -->
		<Card class="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
			<CardHeader class="py-12 text-center">
				<CardTitle
					class="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent"
				>
					WCAG Scanner
				</CardTitle>
				<CardDescription class="mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-400">
					Scan your website for accessibility issues and get actionable insights to improve user
					experience for everyone
				</CardDescription>
			</CardHeader>
		</Card>

		<!-- Scan Configuration -->
		<Card class="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
			<CardHeader class="border-b border-slate-200 dark:border-slate-700">
				<CardTitle
					class="flex items-center gap-2 text-2xl font-semibold text-slate-800 dark:text-slate-200"
				>
					<div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
						<svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					Scan Configuration
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-8 p-8">
				<div class="grid gap-8 lg:grid-cols-2">
					<div class="space-y-6">
						<!-- URL Input Section -->
						<UrlInput bind:scanUrl bind:scanUrls bind:isMultiUrl />

						<!-- Configuration Panel -->
						<ConfigPanel
							bind:selectedWcagVersion
							bind:selectedLevel
							bind:includeScreenshot
							bind:includeBestPractices
							{configProfiles}
							on:loadProfile={handleLoadProfile}
						/>
					</div>

					<!-- Profile Manager -->
					<div class="space-y-6">
						<ProfileManager
							{configProfiles}
							{selectedWcagVersion}
							{selectedLevel}
							{includeScreenshot}
							{includeBestPractices}
							on:saveProfile={handleSaveProfile}
							on:deleteProfile={handleDeleteProfile}
							on:loadProfile={handleLoadProfile}
						/>
					</div>
				</div>

				<!-- Scan Button -->
				<div class="flex justify-center pt-6">
					<Button
						size="lg"
						onclick={performScan}
						disabled={isScanning || (!scanUrl && !scanUrls.some((url) => url.trim()))}
						class="bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700"
					>
						{#if isScanning}
							<svg
								class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Scanning...
						{:else}
							🔍 Start WCAG Scan
						{/if}
					</Button>
				</div>
			</CardContent>
		</Card>

		<!-- Progress Bar -->
		{#if isScanning}
			<Card class="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
				<CardContent class="p-6">
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-slate-700 dark:text-slate-300"
								>Scanning Progress</span
							>
							<span class="text-sm text-slate-500 dark:text-slate-400">{scanProgress}%</span>
						</div>
						<Progress value={scanProgress} class="h-2" />
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Error Display -->
		{#if scanError}
			<Card class="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
				<CardContent class="p-6">
					<div class="flex items-center space-x-3">
						<div class="text-red-600 dark:text-red-400">
							<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<h3 class="text-lg font-semibold text-red-800 dark:text-red-200">Scan Error</h3>
							<p class="text-red-700 dark:text-red-300">{scanError}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Results Display -->
		{#if scanResults}
			<Card class="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
				<CardHeader class="border-b border-slate-200 dark:border-slate-700">
					<CardTitle class="text-2xl font-semibold text-slate-800 dark:text-slate-200">
						Scan Results
					</CardTitle>
					<CardDescription class="text-slate-600 dark:text-slate-400">
						{isBatchResult(scanResults)
							? `Batch scan of ${scanResults.results.length} URLs`
							: `Scan of ${scanResults.url}`}
					</CardDescription>
				</CardHeader>
				<CardContent class="p-8">
					<!-- Summary -->
					<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
						<div class="rounded-lg bg-slate-100 p-4 text-center dark:bg-slate-800">
							<div class="text-2xl font-bold text-slate-800 dark:text-slate-200">
								{summary.total}
							</div>
							<div class="text-sm text-slate-600 dark:text-slate-400">Total Issues</div>
						</div>
						<div class="rounded-lg bg-red-100 p-4 text-center dark:bg-red-900/20">
							<div class="text-2xl font-bold text-red-600 dark:text-red-400">
								{summary.critical}
							</div>
							<div class="text-sm text-red-700 dark:text-red-300">Critical</div>
						</div>
						<div class="rounded-lg bg-orange-100 p-4 text-center dark:bg-orange-900/20">
							<div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
								{summary.serious}
							</div>
							<div class="text-sm text-orange-700 dark:text-orange-300">Serious</div>
						</div>
						<div class="rounded-lg bg-yellow-100 p-4 text-center dark:bg-yellow-900/20">
							<div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
								{summary.moderate}
							</div>
							<div class="text-sm text-yellow-700 dark:text-yellow-300">Moderate</div>
						</div>
						<div class="rounded-lg bg-green-100 p-4 text-center dark:bg-green-900/20">
							<div class="text-2xl font-bold text-green-600 dark:text-green-400">
								{summary.minor}
							</div>
							<div class="text-sm text-green-700 dark:text-green-300">Minor</div>
						</div>
					</div>

					<!-- Export Options -->
					<div class="mb-6 flex flex-wrap gap-4">
						<Button variant="outline" onclick={exportCSV}>📊 Export CSV</Button>
						<Button variant="outline" onclick={exportHTML}>📄 Export HTML Report</Button>
						<Button variant="outline" onclick={exportJSON}>📋 Export JSON</Button>
					</div>

					<!-- Filters and Search -->
					{#if allViolations.length > 0}
						<div
							class="mb-6 grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-3 dark:bg-slate-800/50"
						>
							<div class="space-y-2">
								<Label for="search" class="text-sm font-medium">Search Violations</Label>
								<select
									id="search"
									bind:value={searchTerm}
									class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
								>
									<option value="">All Violations</option>
									<option value="color-contrast">Color Contrast</option>
									<option value="missing-alt">Missing Alt Text</option>
									<option value="heading">Heading Structure</option>
									<option value="focus">Focus Management</option>
									<option value="label">Form Labels</option>
									<option value="link">Link Issues</option>
									<option value="image">Image Issues</option>
									<option value="keyboard">Keyboard Navigation</option>
									<option value="aria">ARIA Issues</option>
									<option value="button">Button Issues</option>
									<option value="landmark">Landmark Structure</option>
									<option value="text">Text Issues</option>
								</select>
							</div>

							<div class="space-y-2">
								<Label for="severity-filter" class="text-sm font-medium">Filter by Severity</Label>
								<select
									id="severity-filter"
									bind:value={selectedSeverityFilter}
									class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
								>
									<option value="all">All Severities</option>
									<option value="critical">Critical</option>
									<option value="serious">Serious</option>
									<option value="moderate">Moderate</option>
									<option value="minor">Minor</option>
								</select>
							</div>

							<div class="space-y-2">
								<Label for="per-page" class="text-sm font-medium">Results per Page</Label>
								<select
									id="per-page"
									bind:value={violationsPerPage}
									class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
								>
									<option value={5}>5 per page</option>
									<option value={10}>10 per page</option>
									<option value={25}>25 per page</option>
									<option value={50}>50 per page</option>
								</select>
							</div>
						</div>
					{/if}

					<!-- Violations List -->
					{#if allViolations.length > 0}
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
									Violations
									<span class="text-sm font-normal text-slate-600 dark:text-slate-400">
										({filteredViolations.length} of {allViolations.length})
									</span>
								</h3>
								{#if totalPages > 1}
									<div class="text-sm text-slate-600 dark:text-slate-400">
										Page {currentPage} of {totalPages}
									</div>
								{/if}
							</div>

							{#each paginatedViolations as violation (violation.id)}
								<div
									class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
								>
									<div class="bg-white p-4 dark:bg-slate-900">
										<div class="flex items-start justify-between">
											<div class="flex-1">
												<div class="mb-2 flex items-center gap-3">
													<h4 class="font-semibold text-slate-800 dark:text-slate-200">
														{violation.description}
													</h4>
													<span
														class="rounded-full px-2 py-1 text-xs font-medium {violation.impact ===
														'critical'
															? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
															: violation.impact === 'serious'
																? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
																: violation.impact === 'moderate'
																	? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
																	: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'}"
													>
														{violation.impact}
													</span>
												</div>
												<div class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
													<div>
														Rule: <code
															class="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800"
															>{violation.id}</code
														>
													</div>
													{#if isBatchResult(scanResults)}
														<div>Site: <span class="font-medium">{violation.siteUrl}</span></div>
													{/if}
													{#if violation.elementCount || violation.nodes?.length}
														<div>
															Elements affected: <span class="font-medium"
																>{violation.elementCount || violation.nodes?.length}</span
															>
														</div>
													{/if}
													{#if violation.tags && violation.tags.length > 0}
														<div class="mt-2 flex flex-wrap gap-1">
															{#each violation.tags.slice(0, 4) as tag, index (index)}
																<span
																	class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
																>
																	{tag}
																</span>
															{/each}
															{#if violation.tags.length > 4}
																<span
																	class="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
																>
																	+{violation.tags.length - 4} more
																</span>
															{/if}
														</div>
													{/if}
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => toggleViolationExpansion(violation.id)}
												class="ml-4"
											>
												{#if expandedViolations.has(violation.id)}
													<svg
														class="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M5 15l7-7 7 7"
														></path>
													</svg>
													Hide Details
												{:else}
													<svg
														class="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 9l-7 7-7-7"
														></path>
													</svg>
													Show Details
												{/if}
											</Button>
										</div>
									</div>

									{#if expandedViolations.has(violation.id)}
										<div
											class="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
										>
											{#if violation.nodes && violation.nodes.length > 0}
												<div class="space-y-3">
													<h5 class="font-medium text-slate-800 dark:text-slate-200">
														Affected Elements:
													</h5>
													{#each violation.nodes.slice(0, 3) as node, index (index)}
														<div class="rounded border bg-white p-3 dark:bg-slate-900">
															<div class="mb-2 text-xs text-slate-600 dark:text-slate-400">
																Selector: <code class="rounded bg-slate-100 px-1 dark:bg-slate-800"
																	>{node.target?.join(', ') || 'Unknown'}</code
																>
															</div>
															<pre
																class="max-h-20 overflow-x-auto rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">{node.html}</pre>
														</div>
													{/each}
													{#if violation.nodes.length > 3}
														<p class="text-center text-sm text-slate-600 dark:text-slate-400">
															... and {violation.nodes.length - 3} more elements
														</p>
													{/if}
												</div>
											{/if}
										</div>
									{/if}
								</div>
							{/each}

							<!-- Pagination -->
							{#if totalPages > 1}
								<div class="mt-6 flex items-center justify-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => (currentPage = Math.max(1, currentPage - 1))}
										disabled={currentPage <= 1}
									>
										Previous
									</Button>

									{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										const startPage = Math.max(1, currentPage - 2);
										return startPage + i;
									}).filter((page) => page <= totalPages) as page (page)}
										<Button
											variant={page === currentPage ? 'default' : 'outline'}
											size="sm"
											onclick={() => (currentPage = page)}
										>
											{page}
										</Button>
									{/each}

									<Button
										variant="outline"
										size="sm"
										onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
										disabled={currentPage >= totalPages}
									>
										Next
									</Button>
								</div>
							{/if}
						</div>
					{:else}
						<div class="py-8 text-center">
							<div class="mb-4 text-4xl">🎉</div>
							<h3 class="mb-2 text-xl font-semibold text-green-600 dark:text-green-400">
								No Violations Found!
							</h3>
							<p class="text-slate-600 dark:text-slate-400">
								Your website meets the selected WCAG criteria.
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
