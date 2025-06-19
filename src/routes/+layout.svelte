<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import '../app.css';
</script>

<div class="flex min-h-screen flex-col bg-gray-50 text-gray-900">
	<header class="shadow">
		<div class="container mx-auto flex items-center justify-between px-4 py-4">
			<h1 class="text-2xl font-bold tracking-tight">WCAG Scanner</h1>
			<nav class="space-x-2">
				<Button variant="default">
					<a href="/">Home</a>
				</Button>
				<Button variant="default">
					<a href="/about">About</a>
				</Button>
				<Button variant="default">
					<a href="/scan">Scan</a>
				</Button>
			</nav>
		</div>
	</header>

	<main class="container mx-auto flex-1 px-4 py-8">
		<slot />
	</main>

	<footer class="mt-8 border-t py-4 shadow-lg">
		<div class="container mx-auto px-4 text-center text-sm">
			&copy; {new Date().getFullYear()} WCAG Scanner. All rights reserved.
		</div>
	</footer>
</div>
