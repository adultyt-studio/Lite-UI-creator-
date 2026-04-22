<div align="center">

# â¨ Ultra-Light Glasmorphism UI Studio

[![Status](https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge&color=8B5CF6)](https://github.com/adultyt-studio/ultra-light-glasmorphism-ui-studio)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge&color=EC4899)](https://opensource.org/licenses/MIT)
[![Mobile Optimized](https://img.shields.io/badge/Platform-Mobile_First-blue.svg?style=for-the-badge&color=14B8A6)]()

> **Design stunning glassmorphic UIs offline on mobile â€” export to Godot, web, PSD & more.**
> 
> *By Ganesh Ravindra Ghongade ([@adultyt-studio](https://github.com/adultyt-studio))*

<br/>

</div>

## â¨¨ Overview

**Ultra-Light Glasmorphism UI Studio** is an offline-first, mobile-optimized PWA UI design app created for indie developers and designers. Crafted with premium glassmorphism aesthetics, it allows you to dynamically build, tweak, and export production-ready UI components flawlessly.

Built specifically to fit in your pocket (< 10MB) while offering a robust desktop-class infinite canvas experience, this tool allows you to export your UI states natively to Godot, static HTML/CSS, or save it locally as JSON.

## â¨¨ Features

### ð¨ Premium Glassmorphic Identity
*   **Frosted Glass Cards:** Fully adjustable `backdrop-filter` capabilities.
*   **Neon & Accents:** Vibrant gradients (purple/teal/pink) with dynamic box-shadow inset glow configuration.
*   **Responsive:** Fully mobile-first with wide touch targets and a highly reactive infinite canvas workspace. 

### â¡ Offline & PWA Architecture
*   **100% Offline Capable:** Runs smoothly without an internet connection using Service Workers.
*   **Local Project Storage:** State-driven project auto-saving using IndexedDB. No work is ever lost.
*   **Mobile Workspace:** Touch-optimized panning, scroll-zooming, and dragging mechanics powered by Framer Motion. 

### ð ï¸ Dynamic Element Editor
*   **Infinite Pan & Zoom:** Scroll seamlessly across a responsive multi-device canvas space.
*   **Parametric Tuning:** Control position, width, height, corner radius, blur depth, border opacity, surface color, and typographic hierarchy directly from the properties sidebar.
*   **Layer Management:** Instantly shift, reorder, group, or delete elements with a comprehensive layer stack. 

### ð¤ Multi-Engine Export Support
*   **Godot Scene Format (`.tscn`):** Translates visual glass properties directly to native Godot 4 Panel, Label, and Container nodes.
*   **Static Web (HTML/CSS):** Exports semantic offline-ready HTML enriched with precise CSS variables mapping exactly to your design intent.
*   **JSON Project Matrix:** Shareable stringified JSON data for versioning or team portability.

## ð ï¸ Tech Stack

The studio was constructed using a meticulously tuned, modern development stack focused strictly on performance footprint and visual fluidity.

*   **Framework:** Vite + React 19 + TypeScript
*   **Styling Engine:** Tailwind CSS v4 (Leveraging native CSS variable bindings and custom themes)
*   **State Management:** Zustand (Deeply tied to a local Dexie.js database schema)
*   **Animations:** Framer Motion
*   **UI Components:** Custom mapped SVG Lucide React Icons

## ð Zero-Config Deployment

The architecture uses a strict statically exportable boundary. Deploy instantly to any static host (Vercel, Netlify, GitHub Pages).

```bash
# Export exactly as-is to Vercel
npm run build && npx vercel --prod
```

## ð License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with â¤ï¸ by <a href="https://github.com/adultyt-studio">adultyt-studio</a></p>
</div>
