<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import '../app.css';
</script>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
	<!-- Header -->
	<header class="p-4 shadow">
		<div class="container mx-auto flex items-center justify-between">
			<h1 class="text-2xl font-bold tracking-tight">WCAG Scanner</h1>
			<nav class="space-x-2">
				<Button variant={$page.url.pathname === '/' ? 'default' : 'outline'}>
					<a href="/">Home</a>
				</Button>
				<Button variant={$page.url.pathname === '/about' ? 'default' : 'outline'}>
					<a href="/about">About</a>
				</Button>
				<Button variant={$page.url.pathname === '/scan' ? 'default' : 'outline'}>
					<a href="/scan">Scan</a>
				</Button>
			</nav>
		</div>
	</header>

	<!-- Main -->
	<main class="space-y-4 p-4">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="border-t p-4 shadow-lg">
		<div class="container mx-auto text-center text-sm">
			&copy; {new Date().getFullYear()} WCAG Scanner. All rights reserved.
		</div>
	</footer>
</div>
