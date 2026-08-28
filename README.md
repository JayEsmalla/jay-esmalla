# Jay Esmalla — Personal Portfolio

A dark editorial-tech portfolio built with React, TypeScript, Tailwind CSS, and Vite. The interface follows the design system documented in `design/DESIGN.md`: near-black surfaces, off-white typography, hairline borders, restrained gold icon accents, and minimal motion.

## Portfolio Structure

- **Home** — complete long-form portfolio with hero, about, selected work, GitHub activity, credentials, testimonials, and contact
- **Projects** — focused project and contribution view
- **Certifications** — verified credential presentation
- **Testimonials** — feedback from users, testers, and collaborators
- **Contact** — social links and email-based contact form

## Hero Portrait

The hero includes a dedicated portrait frame. Add the portfolio photo as:

```text
public/profile.webp
```

The uploaded portrait is stored at `public/profile.webp`. A face-focused crop of the same portrait is used for `public/favicon.png`. If the hero image cannot load, the interface shows a styled `JE` fallback instead of a broken image.

## Design Direction

- Obsidian canvas: `#101010`
- Carbon depth: `#080808`
- Primary type: `#f3f3f3`
- Muted type: `#9c9c9c`
- Structural borders: `#212121`
- Icon accent: `#6f6759`
- Primary CTA: white pill with obsidian text
- Typography: Inter with IBM Plex Mono for metadata
- No drop shadows, neon glow, scanlines, or CRT overlays
- A single personal portrait is permitted in the hero; the rest of the site remains image-light and type-led

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI / shadcn components
- Framer Motion
- TanStack Query
- Vitest

## Development

```bash
npm install
npm run dev
```

Validation commands:

```bash
npm run lint
npm run test
npm run build
```

## Content

Portfolio project, testimonial, certification, social, and GitHub configuration data live primarily in `src/data/portfolio.ts`.
