# AGENTS.md

## Overview
A static, single-page student academic portfolio. It uses plain HTML/CSS/vanilla JS with **no build step, no package.json and no frameworks**. This is intentional: the owner is a student and wants beginner-friendly code they can host on GitHub Pages. Do not introduce bundlers, frameworks or TypeScript.

## Files
- `index.html`: all markup and editable copy. Editable spots are marked with `<!-- EDIT: ... -->` comments. Sections: `#home`, `#about`, `#coa`, `#converter`, `#assignments`, and the footer.
- `style.css`: 16 numbered sections. Design tokens (colours, fonts, radii, shadows) are CSS custom properties in `:root`. Dark mode overrides them under `[data-theme="dark"]` on `<html>`.
- `script.js`: 8 numbered sections. Each feature has its own `initX()` function, all called from a single `DOMContentLoaded` handler at the bottom.
- `images/`: `profile.svg` placeholder, plus `cv.png` (the owner's CV page, cropped from their screenshot).
- `CV.pdf`: the owner's CV (one A4 page generated from `images/cv.png`); "View CV" opens it in a new tab.
- `netlify.toml`: publishes `.`.

## Conventions and decisions
- Student identity lives in the `STUDENT` object at the top of `script.js` and is injected into every `[data-student="name|uid|semester|course|initials"]` element. The HTML also holds the same values as no-JS fallbacks.
- The theme is applied by an inline script in `<head>` before first paint (key `portfolio-theme`).
- Scroll animations: add the `.reveal` class to any element. An IntersectionObserver adds `.is-visible`.
- COA topics use native `<details>/<summary>` for accessible expand/collapse.
- Converter: `validateNumber()` and `convertNumber()` are pure functions. BigInt handles the integer part. Fractions use repeated multiplication (max 12 digits). History is stored in localStorage under `portfolio-conversion-history` (limit 8).
- Assignments: **frontend-only by the owner's request.** Metadata is in localStorage (`portfolio-assignments`) and file blobs are in IndexedDB (`portfolio-files` DB, `files` store). All persistence goes through `AssignmentService` (`list/add/remove/getFileUrl`). To add a backend (e.g. Netlify Functions + Blobs), replace only that object and keep the UI layer unchanged. The UI must never claim that files are uploaded to a server while storage is local; update the `.notice` copy if storage changes.
- When rendering user-provided text, use `textContent` (never inject it through innerHTML).
- Accessibility: there is a skip link, `:focus-visible` rings, `aria-expanded` on the hamburger, `aria-current` on the active nav link, and `prefers-reduced-motion` support. Keep these intact.
