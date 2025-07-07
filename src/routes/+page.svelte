<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Progress } from '$lib/components/ui/progress';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
</script>

<div class="container mx-auto space-y-8 p-6">
	<!-- Hero Section -->
	<Card>
		<CardHeader class="text-center">
			<CardTitle class="text-4xl font-bold">WCAG Scanner</CardTitle>
			<CardDescription class="text-xl">
				Automated accessibility scanning tool powered by axe DevTools to ensure your web
				applications meet WCAG compliance standards.
			</CardDescription>
		</CardHeader>
		<CardContent class="flex justify-center gap-4">
			<Button size="lg">
				<a href="/scan">Start Scanning</a>
			</Button>
			<Button variant="outline" size="lg">
				<a
					href="https://github.com/Niravanaa/WCAG-Scanner"
					target="_blank"
					rel="noopener noreferrer"
				>
					View on GitHub
				</a>
			</Button>
		</CardContent>
	</Card>

	<!-- Features Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-center text-3xl">Key Features</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							Axe DevTools Integration
							<Badge variant="secondary">Core</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Powered by industry-leading axe DevTools scanner to catch accessibility issues that
							hinder WCAG compliance.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							Bulk URL Scanning
							<Badge variant="outline">Pro</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Define and scan multiple URLs at once with customizable scanning profiles for
							efficient accessibility testing.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							WCAG Compliance
							<Badge variant="default">Essential</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Configurable WCAG version support (2.0, 2.1, 2.2) with compliance level options (A,
							AA, AAA).
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							Scanner Profiles
							<Badge variant="outline">Custom</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Create and save custom scanning profiles with specific rules, tags, and configuration
							options.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							Terminal Output
							<Badge variant="secondary">DevOps</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Detailed terminal output with customizable formatting for easy integration into CI/CD
							pipelines.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							Best Practices
							<Badge variant="default">Guide</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Built-in best practices and recommendations for improving web accessibility beyond
							basic compliance.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							Custom Actions
							<Badge variant="secondary">Advanced</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Define custom actions and guided workflows to scan for specific accessibility issues
							that arise from user interactions and dynamic content.
						</CardDescription>
					</CardContent>
				</Card>
			</div>
		</CardContent>
	</Card>

	<!-- How It Works Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-center text-3xl">How It Works</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-6 md:grid-cols-3">
				<Card class="text-center">
					<CardHeader>
						<Avatar class="mx-auto mb-4">
							<AvatarFallback class="bg-blue-100 text-2xl font-bold text-blue-600">1</AvatarFallback
							>
						</Avatar>
						<CardTitle>Configure</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Set up your URLs, select WCAG version, and customize scanning options according to
							your requirements.
						</CardDescription>
					</CardContent>
				</Card>

				<Card class="text-center">
					<CardHeader>
						<Avatar class="mx-auto mb-4">
							<AvatarFallback class="bg-blue-100 text-2xl font-bold text-blue-600">2</AvatarFallback
							>
						</Avatar>
						<CardTitle>Scan</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Our scanner uses axe DevTools to analyze your web pages for accessibility violations
							and compliance issues.
						</CardDescription>
					</CardContent>
				</Card>

				<Card class="text-center">
					<CardHeader>
						<Avatar class="mx-auto mb-4">
							<AvatarFallback class="bg-blue-100 text-2xl font-bold text-blue-600">3</AvatarFallback
							>
						</Avatar>
						<CardTitle>Review</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Get detailed reports with actionable insights and recommendations to improve your
							site's accessibility.
						</CardDescription>
					</CardContent>
				</Card>
			</div>
		</CardContent>
	</Card>

	<!-- Feature Roadmap Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-center text-3xl">Feature Roadmap</CardTitle>
		</CardHeader>
		<CardContent>
			<Tabs value="released" class="w-full">
				<TabsList class="grid w-full grid-cols-3">
					<TabsTrigger value="released">Released</TabsTrigger>
					<TabsTrigger value="progress">In Progress</TabsTrigger>
					<TabsTrigger value="planned">Planned</TabsTrigger>
				</TabsList>

				<TabsContent value="released">
					<Alert class="border-green-200 bg-green-50">
						<AlertTitle class="flex items-center gap-2">
							<Badge class="bg-green-100 text-green-800">✅ Released</Badge>
						</AlertTitle>
						<AlertDescription>
							<ul class="mt-2 list-inside list-disc space-y-1 text-green-700">
								<li>Basic axe DevTools integration</li>
								<li>Single URL scanning</li>
								<li>WCAG 2.1 AA compliance checking</li>
							</ul>
						</AlertDescription>
					</Alert>
				</TabsContent>

				<TabsContent value="progress">
					<Alert class="border-blue-200 bg-blue-50">
						<AlertTitle class="flex items-center gap-2">
							<Badge class="bg-blue-100 text-blue-800">🚧 In Progress</Badge>
						</AlertTitle>
						<AlertDescription>
							<ul class="mt-2 list-inside list-disc space-y-1 text-blue-700">
								<li>Bulk URL scanning with CSV import</li>
								<li>Custom scanner profiles</li>
								<li>Advanced WCAG version support (2.0, 2.2)</li>
								<li>Terminal output customization</li>
								<li>Custom actions and guided workflows</li>
							</ul>
							<Progress value={65} class="mt-4" />
							<p class="mt-2 text-sm">65% Complete</p>
						</AlertDescription>
					</Alert>
				</TabsContent>

				<TabsContent value="planned">
					<Alert class="border-yellow-200 bg-yellow-50">
						<AlertTitle class="flex items-center gap-2">
							<Badge class="bg-yellow-100 text-yellow-800">📋 Planned</Badge>
						</AlertTitle>
						<AlertDescription>
							<ul class="mt-2 list-inside list-disc space-y-1 text-yellow-700">
								<li>CI/CD integration templates</li>
								<li>PDF and HTML report generation</li>
								<li>Historical scanning data and trends</li>
								<li>Team collaboration features</li>
								<li>API endpoints for programmatic access</li>
								<li>Browser extension for quick scanning</li>
								<li>Advanced custom action automation</li>
								<li>Interactive accessibility testing flows</li>
							</ul>
						</AlertDescription>
					</Alert>
				</TabsContent>
			</Tabs>
		</CardContent>
	</Card>

	<!-- CTA Section -->
	<Card class="bg-muted">
		<CardHeader class="text-center">
			<CardTitle class="text-3xl">Ready to Improve Your Web Accessibility?</CardTitle>
		</CardHeader>
		<CardContent class="space-y-6 text-center">
			<CardDescription class="text-lg">
				Start scanning your websites today and ensure they're accessible to everyone. Join the
				community of developers committed to building inclusive web experiences.
			</CardDescription>
			<Separator />
			<div class="flex justify-center gap-4">
				<Button size="lg">
					<a href="/scan">Start Your First Scan</a>
				</Button>
				<Button variant="outline" size="lg">
					<a href="/about">Learn More</a>
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
