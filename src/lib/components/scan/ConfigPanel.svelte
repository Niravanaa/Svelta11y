<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { ConfigProfile } from '$lib/scan/types.js';

	export let selectedWcagVersion = '2.1';
	export let selectedLevel = 'AA';
	export let includeScreenshot = true;
	export let includeBestPractices = false;
	export let configProfiles: ConfigProfile[] = [];

	const wcagVersions = [
		{ value: '2.0', label: 'WCAG 2.0' },
		{ value: '2.1', label: 'WCAG 2.1' },
		{ value: '2.2', label: 'WCAG 2.2' }
	];

	const wcagLevels = [
		{ value: 'A', label: 'Level A' },
		{ value: 'AA', label: 'Level AA' },
		{ value: 'AAA', label: 'Level AAA' }
	];

	// Events
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const loadProfile = (profileId: string) => {
		dispatch('loadProfile', parseInt(profileId));
	};

	// Select handlers
	const handleProfileLoad = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		if (target.value) {
			loadProfile(target.value);
			target.value = ''; // Reset selection
		}
	};
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="space-y-4">
		<div class="space-y-2">
			<Label for="wcag-version" class="text-base font-medium text-slate-700 dark:text-slate-300">
				WCAG Version
			</Label>
			<select
				id="wcag-version"
				bind:value={selectedWcagVersion}
				class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
			>
				{#each wcagVersions as version (version.value)}
					<option value={version.value}>{version.label}</option>
				{/each}
			</select>
		</div>

		<div class="space-y-2">
			<Label for="wcag-level" class="text-base font-medium text-slate-700 dark:text-slate-300">
				Conformance Level
			</Label>
			<select
				id="wcag-level"
				bind:value={selectedLevel}
				class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
			>
				{#each wcagLevels as level (level.value)}
					<option value={level.value}>{level.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="space-y-4">
		<div class="space-y-3">
			<Label class="text-base font-medium text-slate-700 dark:text-slate-300">
				Additional Options
			</Label>

			<div class="flex items-center space-x-2">
				<Checkbox bind:checked={includeScreenshot} id="include-screenshot" />
				<Label for="include-screenshot" class="text-sm text-slate-600 dark:text-slate-400">
					Include screenshots in results
				</Label>
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox bind:checked={includeBestPractices} id="include-best-practices" />
				<Label for="include-best-practices" class="text-sm text-slate-600 dark:text-slate-400">
					Include best practice violations
				</Label>
			</div>
		</div>

		{#if configProfiles.length > 0}
			<div class="space-y-2">
				<Label
					for="profile-select"
					class="text-base font-medium text-slate-700 dark:text-slate-300"
				>
					Load Saved Configuration
				</Label>
				<select
					id="profile-select"
					on:change={handleProfileLoad}
					class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
				>
					<option value="">Select a saved configuration</option>
					{#each configProfiles as profile (profile.id)}
						<option value={profile.id.toString()}>{profile.name}</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>
</div>

<div
	class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
>
	<div class="flex items-start space-x-3">
		<div class="mt-0.5 text-blue-600 dark:text-blue-400">
			<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
		<div class="text-sm text-blue-800 dark:text-blue-200">
			<strong>Configuration Guide:</strong><br />
			• <strong>WCAG 2.1 Level AA</strong> is recommended for most websites<br />
			• <strong>Screenshots</strong> help visualize issues but increase scan time<br />
			• <strong>Best practices</strong> include additional recommendations beyond WCAG requirements
		</div>
	</div>
</div>
