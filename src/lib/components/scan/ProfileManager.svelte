<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { ConfigProfile } from '$lib/scan/types.js';
	import { createEventDispatcher } from 'svelte';

	export let configProfiles: ConfigProfile[] = [];
	export let selectedWcagVersion: string;
	export let selectedLevel: string;
	export let includeScreenshot: boolean;
	export let includeBestPractices: boolean;

	const dispatch = createEventDispatcher();

	let newProfileName = '';
	let showProfileForm = false;

	const saveProfile = () => {
		if (!newProfileName.trim()) return;

		dispatch('saveProfile', {
			name: newProfileName.trim(),
			wcagVersion: selectedWcagVersion,
			level: selectedLevel,
			includeScreenshot,
			includeBestPractices
		});

		newProfileName = '';
		showProfileForm = false;
	};

	const deleteProfile = (profileId: number) => {
		dispatch('deleteProfile', profileId);
	};

	const loadProfile = (profileId: number) => {
		dispatch('loadProfile', profileId);
	};
</script>

<Card class="border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
	<CardHeader class="pb-4">
		<CardTitle
			class="flex items-center justify-between text-lg font-semibold text-slate-800 dark:text-slate-200"
		>
			Configuration Profiles
			<Button
				size="sm"
				variant="outline"
				onclick={() => (showProfileForm = !showProfileForm)}
				class="text-sm"
			>
				{showProfileForm ? 'Cancel' : 'Save Current'}
			</Button>
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		{#if showProfileForm}
			<div
				class="space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800"
			>
				<Label for="profile-name" class="text-sm font-medium">Profile Name</Label>
				<Input
					id="profile-name"
					bind:value={newProfileName}
					placeholder="e.g., Standard Audit, Client Review"
					class="text-sm"
				/>
				<div class="flex gap-2">
					<Button size="sm" onclick={saveProfile} disabled={!newProfileName.trim()}>
						Save Profile
					</Button>
					<Button size="sm" variant="ghost" onclick={() => (showProfileForm = false)}>
						Cancel
					</Button>
				</div>
			</div>
		{/if}

		{#if configProfiles.length > 0}
			<div class="space-y-2">
				<Label class="text-sm font-medium text-slate-600 dark:text-slate-400">Saved Profiles</Label>
				<div class="space-y-2">
					{#each configProfiles as profile (profile.id)}
						<div
							class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
						>
							<div class="flex-1">
								<div class="font-medium text-slate-800 dark:text-slate-200">{profile.name}</div>
								<div class="text-xs text-slate-500 dark:text-slate-400">
									WCAG {profile.wcagVersion} Level {profile.level}
									{#if profile.includeScreenshot}• Screenshots{/if}
									{#if profile.includeBestPractices}• Best Practices{/if}
								</div>
							</div>
							<div class="flex gap-1">
								<Button
									size="sm"
									variant="ghost"
									onclick={() => loadProfile(profile.id)}
									class="h-auto px-2 py-1 text-xs"
								>
									Load
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onclick={() => deleteProfile(profile.id)}
									class="h-auto px-2 py-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
								>
									Delete
								</Button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="py-6 text-center text-slate-500 dark:text-slate-400">
				<div class="mb-2 text-2xl">⚙️</div>
				<p class="text-sm">No saved profiles yet</p>
				<p class="text-xs">Save your current configuration to reuse it later</p>
			</div>
		{/if}
	</CardContent>
</Card>
