# Changelog

All notable changes to the **Cloud-Backed Portfolio** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-08-14

### Added
* **Expanded Portfolio Showcase**: Added a second project card to the Projects page (`projects.html`) featuring modal details and architecture breakdowns.

---

## [1.1.0] - 2026-08-10

### Changed
* **Visitor Counter Logic**: Upgraded the `GetResumeCounter` Azure Function to log unique visitors by IP address.

### Added
* **IP Deduplication & 24-Hour TTL**: Implemented rate-limiting logic so each unique IP address is counted only once every 24 hours to prevent counter inflation and spam requests.

---

## [1.0.0] - 2026-08-01

### Added
* **Initial Release**: Launched the initial version of the Cloud-Backed Portfolio site.
* **Frontend UI**: Responsive static site built using HTML5, JavaScript, and Tailwind CSS hosted on GitHub Pages.
* **Dark / Light Mode**: Added a persistent theme toggle with `localStorage` memory and OS theme preference auto-detection across `index.html`, `projects.html`, and `resume.html`.
* **Serverless Backend**: Built an asynchronous HTTP trigger API in Python 3.11 (Azure Functions v2 programming model).
* **Database Integration**: Integrated Azure Cosmos DB (NoSQL API) for persistent visitor counts.
* **Infrastructure as Code (IaC)**: Provisioned cloud resources using HashiCorp Terraform.
* **CI/CD Automation**: Configured GitHub Actions workflows for automated build, test, and deployment of both frontend and backend code.