# Scamify

> \*\*"Scam big corporations and enjoy our music for free!"\*\*

Welcome to **Scamify**, a community-driven, 100% free web-based music platform proudly built under the **FocuxHub** umbrella.

\---

## About The Project

Scamify is a lightweight, decentralized-style music sharing platform designed to give power back to artists and listeners. By leveraging modern web standards and zero-cost infrastructure, we provide a seamless music discovery and streaming experience without corporate tracking, annoying ads, or paid subscriptions.

\---

## Architecture \& Tech Stack

Scamify v1 is built with a minimalist, high-performance approach:

* **Frontend:** Clean and modern UI (HTML/CSS) crafted for speed and simplicity.
* **Core Logic:** Pure JavaScript handling client-side interactions and routing.
* **Storage \& Hosting:**

  * Static frontend assets hosted via high-speed global infrastructure.
  * Audio tracks hosted directly via GitHub repositories (up to 20 MB per file) using the GitHub API to maintain zero operating costs.
* **Offline Playback:** Uses browser-native **IndexedDB** to securely cache downloaded songs for offline listening.

\---

## Project Structure

* **Discover:** Home page featuring music discovery, search filters, and curated track recommendations.
* **Upload:** Direct upload interface that pushes tracks (up to 20 MB) straight to the project repository via API.
* **Downloads:** Local offline storage management powered by IndexedDB.

\---

## License

This project is open-source and released under the **Genius License** (non-commercial, attribution-based, share-alike, and transparent code access).

