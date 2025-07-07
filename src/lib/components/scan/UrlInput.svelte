<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';

	export let scanUrl = '';
	export let scanUrls: string[] = [''];
	export let isMultiUrl = false;

	let previousIsMultiUrl = isMultiUrl;

	// Reactive statement to handle URL mode changes
	$: if (isMultiUrl !== previousIsMultiUrl) {
		if (isMultiUrl) {
			// When switching to multi URL, populate first field with single URL
			if (scanUrl) {
				scanUrls = [scanUrl, ...scanUrls.slice(1)];
			}
		} else {
			// When switching to single URL, use the first URL
			scanUrl = scanUrls[0] || '';
		}
		previousIsMultiUrl = isMultiUrl;
	}

	// Ensure scanUrls updates propagate to scanUrl when in single mode
	$: if (!isMultiUrl && scanUrls.length > 0) {
		scanUrl = scanUrls[0];
	}

	const addUrlField = () => {
		scanUrls = [...scanUrls, ''];
	};

	const removeUrlField = (index: number) => {
		if (scanUrls.length > 1) {
			scanUrls = scanUrls.filter((_, i) => i !== index);
		}
	};
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<Label for="url-input" class="text-lg font-semibold text-slate-700 dark:text-slate-300">
			{isMultiUrl ? 'Website URLs to Scan' : 'Website URL to Scan'}
		</Label>
		<div class="flex items-center space-x-2">
			<Checkbox bind:checked={isMultiUrl} id="multi-url-toggle" />
			<Label for="multi-url-toggle" class="text-sm text-slate-600 dark:text-slate-400">
				Scan multiple URLs
			</Label>
		</div>
	</div>

	{#if isMultiUrl}
		<div class="space-y-3">
			{#each scanUrls as url, index (index)}
				<div class="flex gap-2">
					<Input
						value={url}
						oninput={(e) => {
							const target = e.target as HTMLInputElement;
							scanUrls[index] = target.value;
							scanUrls = [...scanUrls]; // Trigger reactivity
						}}
						placeholder="https://example.com"
						class="flex-1 border-slate-300 focus:border-blue-500 dark:border-slate-600 dark:focus:border-blue-400"
					/>
					{#if scanUrls.length > 1}
						<Button
							variant="outline"
							size="sm"
							onclick={() => removeUrlField(index)}
							class="px-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
						>
							Remove
						</Button>
					{/if}
				</div>
			{/each}
			<Button
				variant="outline"
				size="sm"
				onclick={addUrlField}
				class="w-full border-dashed border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-400 dark:hover:text-blue-400"
			>
				+ Add Another URL
			</Button>
		</div>
	{:else}
		<Input
			bind:value={scanUrl}
			id="url-input"
			placeholder="https://example.com"
			class="w-full rounded-lg border-slate-300 py-3 text-lg focus:border-blue-500 dark:border-slate-600 dark:focus:border-blue-400"
		/>
	{/if}
</div>
