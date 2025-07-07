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
</script>

<div class="container mx-auto space-y-8 p-6">
	<!-- Hero Section -->
	<Card>
		<CardHeader class="text-center">
			<CardTitle class="text-4xl font-bold">About WCAG Scanner</CardTitle>
			<CardDescription class="text-xl">
				Learn more about our mission to make the web accessible for everyone
			</CardDescription>
		</CardHeader>
	</Card>

	<!-- Mission Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-3xl">Our Mission</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<CardDescription class="text-lg">
				WCAG Scanner is dedicated to empowering developers and organizations to create accessible
				web experiences. We believe that the internet should be usable by everyone, regardless of
				their abilities or disabilities.
			</CardDescription>
			<CardDescription>
				Our tool leverages the power of axe DevTools to provide comprehensive accessibility
				scanning, helping you identify and fix issues that could prevent users from accessing your
				content.
			</CardDescription>
		</CardContent>
	</Card>

	<!-- What is WCAG Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-3xl">What is WCAG?</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<CardDescription>
				The Web Content Accessibility Guidelines (WCAG) are an international standard developed by
				the World Wide Web Consortium (W3C) to ensure web content is accessible to people with
				disabilities.
			</CardDescription>

			<div class="mt-6 grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							WCAG 2.0
							<Badge variant="outline">Legacy</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							The foundation standard published in 2008, establishing core accessibility principles.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							WCAG 2.1
							<Badge variant="default">Current</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Enhanced in 2018 with mobile accessibility and cognitive disabilities improvements.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							WCAG 2.2
							<Badge variant="secondary">Latest</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Released in 2023, focusing on cognitive accessibility and mobile user experience.
						</CardDescription>
					</CardContent>
				</Card>
			</div>
		</CardContent>
	</Card>

	<!-- Compliance Levels Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-3xl">Compliance Levels</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-6 md:grid-cols-3">
				<Alert class="border-green-200 bg-green-50">
					<AlertTitle class="flex items-center gap-2">
						<Badge class="bg-green-100 text-green-800">Level A</Badge>
						Basic
					</AlertTitle>
					<AlertDescription class="mt-2">
						The minimum level of accessibility. Addresses major barriers but may still have
						significant limitations.
					</AlertDescription>
				</Alert>

				<Alert class="border-blue-200 bg-blue-50">
					<AlertTitle class="flex items-center gap-2">
						<Badge class="bg-blue-100 text-blue-800">Level AA</Badge>
						Standard
					</AlertTitle>
					<AlertDescription class="mt-2">
						The recommended standard for most websites. Required by many accessibility laws and
						regulations.
					</AlertDescription>
				</Alert>

				<Alert class="border-purple-200 bg-purple-50">
					<AlertTitle class="flex items-center gap-2">
						<Badge class="bg-purple-100 text-purple-800">Level AAA</Badge>
						Enhanced
					</AlertTitle>
					<AlertDescription class="mt-2">
						The highest level, providing maximum accessibility. Not recommended as a general policy
						for entire websites.
					</AlertDescription>
				</Alert>
			</div>
		</CardContent>
	</Card>

	<!-- Why Use WCAG Scanner Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-3xl">Why Use WCAG Scanner?</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<Avatar class="mb-4">
							<AvatarFallback class="text-2xl">⚡</AvatarFallback>
						</Avatar>
						<CardTitle>Automated Testing</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Quickly scan multiple pages and identify accessibility issues without manual testing.
							Save time while maintaining high standards.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<Avatar class="mb-4">
							<AvatarFallback class="text-2xl">🎯</AvatarFallback>
						</Avatar>
						<CardTitle>Comprehensive Coverage</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Our scanner checks against multiple WCAG versions and compliance levels, ensuring your
							site meets current standards.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<Avatar class="mb-4">
							<AvatarFallback class="text-2xl">🔧</AvatarFallback>
						</Avatar>
						<CardTitle>Developer-Friendly</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Integrate seamlessly into your development workflow with terminal output, CI/CD
							support, and detailed reporting.
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<Avatar class="mb-4">
							<AvatarFallback class="text-2xl">📊</AvatarFallback>
						</Avatar>
						<CardTitle>Actionable Insights</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Get clear, actionable recommendations for fixing accessibility issues, not just a list
							of problems.
						</CardDescription>
					</CardContent>
				</Card>
			</div>
		</CardContent>
	</Card>

	<!-- Technology Stack Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-3xl">Built With</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card class="text-center">
					<CardHeader>
						<CardTitle class="text-lg">axe DevTools</CardTitle>
						<Badge variant="secondary">Core Engine</Badge>
					</CardHeader>
					<CardContent>
						<CardDescription class="text-sm">
							Industry-leading accessibility testing engine
						</CardDescription>
					</CardContent>
				</Card>

				<Card class="text-center">
					<CardHeader>
						<CardTitle class="text-lg">SvelteKit</CardTitle>
						<Badge variant="outline">Framework</Badge>
					</CardHeader>
					<CardContent>
						<CardDescription class="text-sm">
							Modern web framework for fast, accessible UIs
						</CardDescription>
					</CardContent>
				</Card>

				<Card class="text-center">
					<CardHeader>
						<CardTitle class="text-lg">shadcn/ui</CardTitle>
						<Badge variant="default">Design System</Badge>
					</CardHeader>
					<CardContent>
						<CardDescription class="text-sm">
							Accessible component library with great UX
						</CardDescription>
					</CardContent>
				</Card>

				<Card class="text-center">
					<CardHeader>
						<CardTitle class="text-lg">TypeScript</CardTitle>
						<Badge variant="secondary">Language</Badge>
					</CardHeader>
					<CardContent>
						<CardDescription class="text-sm">Type-safe development for reliability</CardDescription>
					</CardContent>
				</Card>
			</div>
		</CardContent>
	</Card>

	<!-- Legal & Compliance Section -->
	<Card>
		<CardHeader>
			<CardTitle class="text-3xl">Legal Requirements</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<CardDescription>
				Web accessibility isn't just good practice—it's often legally required. Many countries have
				laws mandating digital accessibility:
			</CardDescription>

			<div class="grid gap-4 md:grid-cols-2">
				<Alert>
					<AlertTitle>🇺🇸 United States</AlertTitle>
					<AlertDescription>
						Americans with Disabilities Act (ADA) and Section 508 require federal agencies and many
						businesses to provide accessible digital experiences.
					</AlertDescription>
				</Alert>

				<Alert>
					<AlertTitle>🇪🇺 European Union</AlertTitle>
					<AlertDescription>
						The European Accessibility Act and Web Accessibility Directive mandate accessibility for
						public sector websites and mobile applications.
					</AlertDescription>
				</Alert>

				<Alert>
					<AlertTitle>🇨🇦 Canada</AlertTitle>
					<AlertDescription>
						The Accessible Canada Act (ACA) requires federally regulated organizations to identify
						and remove accessibility barriers.
					</AlertDescription>
				</Alert>

				<Alert>
					<AlertTitle>🌍 Global Standards</AlertTitle>
					<AlertDescription>
						ISO/IEC 40500 adopts WCAG 2.0 as an international standard, with many countries
						implementing similar legislation.
					</AlertDescription>
				</Alert>
			</div>
		</CardContent>
	</Card>

	<!-- CTA Section -->
	<Card class="bg-muted">
		<CardHeader class="text-center">
			<CardTitle class="text-3xl">Ready to Get Started?</CardTitle>
		</CardHeader>
		<CardContent class="space-y-6 text-center">
			<CardDescription class="text-lg">
				Start making your websites more accessible today. Join thousands of developers who trust
				WCAG Scanner to help them build inclusive web experiences.
			</CardDescription>
			<Separator />
			<div class="flex justify-center gap-4">
				<Button size="lg">
					<a href="/scan">Start Scanning</a>
				</Button>
				<Button variant="outline" size="lg">
					<a href="/">Back to Home</a>
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
