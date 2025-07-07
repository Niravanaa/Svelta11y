<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">WCAG Scanner</h3>

  <p align="center">
    A comprehensive web accessibility scanner powered by axe DevTools
    <br />
    <a href="#usage"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#usage">View Demo</a>
    ·
    <a href="https://github.com/your-username/wcag-scanner/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/your-username/wcag-scanner/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

WCAG Scanner is a modern web application designed to help developers and organizations ensure their websites meet Web Content Accessibility Guidelines (WCAG) standards. Built with accessibility and usability in mind, this tool provides comprehensive scanning capabilities to identify and help fix accessibility issues that could prevent users from accessing your content.

**Key Goals:**
- **Empowerment**: Enable developers to create more accessible web experiences
- **Comprehensive Analysis**: Leverage axe DevTools for thorough accessibility testing
- **User-Friendly**: Provide an intuitive interface for both technical and non-technical users
- **Actionable Results**: Deliver clear, actionable reports with remediation guidance

The application supports both single-page and batch scanning modes, making it suitable for everything from quick spot-checks to comprehensive site audits.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Svelte][Svelte.dev]][Svelte-url]
* [![SvelteKit][SvelteKit.dev]][SvelteKit-url]
* [![TypeScript][TypeScript.org]][TypeScript-url]
* [![TailwindCSS][TailwindCSS.com]][TailwindCSS-url]
* [![Vite][Vite.dev]][Vite-url]
* [![Axe][Axe-core]][Axe-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

* Node.js (version 18 or higher)
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your-username/wcag-scanner.git
   ```
2. Navigate to the project directory
   ```sh
   cd wcag-scanner
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Start the development server
   ```sh
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

### Single Page Scanning

1. Enter a URL in the input field
2. Select your preferred WCAG compliance level (A, AA, or AAA)
3. Choose the number of violations to display per page
4. Click "Scan URL" to begin the accessibility analysis
5. Review the detailed results and export reports as needed

### Batch Scanning

1. Switch to "Multiple URLs" mode
2. Enter multiple URLs (one per line)
3. Configure scanning parameters
4. Start the batch scan
5. Download comprehensive reports in multiple formats

### Report Features

- **Detailed Violation Reports**: Clear descriptions of accessibility issues
- **Impact Assessment**: Understanding the severity of each violation
- **Remediation Guidance**: Step-by-step instructions to fix issues
- **Export Options**: HTML, JSON, and CSV report formats
- **WCAG Compliance Mapping**: Direct links to relevant WCAG guidelines

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

- 🔍 **Comprehensive Scanning**: Powered by axe DevTools for thorough accessibility analysis
- 📊 **Multiple Report Formats**: Export results in HTML, JSON, and CSV formats
- 🎯 **WCAG Compliance Levels**: Support for A, AA, and AAA compliance standards
- 🚀 **Batch Processing**: Scan multiple URLs efficiently
- 💡 **Actionable Insights**: Clear remediation guidance for each violation
- 🎨 **Modern UI**: Clean, accessible interface built with Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Fast Performance**: Optimized scanning and reporting pipeline
- 🧪 **Comprehensive Testing**: Full test coverage with Vitest and Playwright
- 🔧 **Developer Tools**: Built-in debugging and development utilities

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Single page accessibility scanning
- [x] Batch URL processing
- [x] Multiple export formats (HTML, JSON, CSV)
- [x] WCAG compliance level selection
- [x] Responsive web interface
- [ ] API endpoint for programmatic access
- [ ] Integration with CI/CD pipelines
- [ ] Advanced filtering and search capabilities
- [ ] Custom rule configuration
- [ ] Historical scan tracking
- [ ] Automated scheduling for regular scans
- [ ] Integration with popular CMSs
- [ ] Chrome extension version
- [ ] Mobile app companion

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure accessibility standards are maintained
- Run the full test suite before submitting

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run all tests
npm run test:unit    # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run linting
npm run format       # Format code
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [axe DevTools](https://www.deque.com/axe/) - The accessibility testing engine that powers our scans
* [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/) - The standard we help websites achieve
* [Svelte](https://svelte.dev/) - The amazing framework that makes this possible
* [Tailwind CSS](https://tailwindcss.com/) - For the beautiful, accessible styling
* [bits-ui](https://www.bits-ui.com/) - For accessible component primitives

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[SvelteKit.dev]: https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white
[SvelteKit-url]: https://kit.svelte.dev/
[TypeScript.org]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[TailwindCSS.com]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[Vite.dev]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[Axe-core]: https://img.shields.io/badge/axe_DevTools-663399?style=for-the-badge&logo=axe&logoColor=white
[Axe-url]: https://www.deque.com/axe/
