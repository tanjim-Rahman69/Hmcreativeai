# HM Creative AI – Website

Premium 3D scroll-story website for HM Creative AI. Vite + React + TypeScript, Tailwind CSS v4, React Three Fiber, Framer Motion, Lenis smooth scroll.

**Sections:** Hero (runner + winged logos) → 3D capsule + client-logo marquee → Services gallery (+ detail view per service) → Our Vision → Our Introduction (founder cards) → Contact.

```bash
npm install
npm run dev      # local dev
npm run build    # production build -> dist (type-check + build, must stay error-free)
npm run preview  # serve the production build locally
```

## Deploy (GitHub → Netlify, free)
1. Create a GitHub repo and push:
   ```bash
   git init && git add . && git commit -m "HM Creative AI website"
   git branch -M main
   git remote add origin https://github.com/<you>/hm-creative-ai.git
   git push -u origin main
   ```
2. Netlify → Add new site → Import from GitHub → pick the repo. `netlify.toml` already sets build command, publish dir (`dist`), SPA redirect and asset caching.
3. After the first deploy, open Netlify → Forms: the contact form (`inquiry`) appears there. Set an email notification under Forms → Settings.
4. Optional: set `og:image` in `index.html` to the full URL (`https://<your-domain>/og.jpg`) so link previews work everywhere.

## Content you can edit
- `src/data/site.ts` – phone numbers, email, social links (leave a URL empty to hide its icon), nav items.
- `src/data/services.ts` – the 6 service categories / 22 services (source: the services Excel sheet).
- `src/assets/team/` – founder photos (`himel.*`, `tanjim.*`). Without a photo a monogram is shown.
- `src/assets/clients/` – client logos for the marquee (any `.webp` added here is picked up automatically).
- Never add prices, stats or client claims that are not in the Excel sheet.

## Structure
- `src/App.tsx` – hero, 3D scene (tokens, runner), page composition.
- `src/Capsule3D.tsx` – the real 3D capsule (glass body, crimson cap, drop + landing animation).
- `src/cards.tsx` – services gallery (scroll-linked coverflow). `src/ServiceDetail.tsx` – `#/<service-id>` detail view.
- `src/Vision.tsx`, `src/Team.tsx` (cross-over founder cards), `src/Contact.tsx`, `src/Nav.tsx`, `src/Marquee.tsx`.
- `src/shared.ts` – shared scroll state and helpers. `src/ui.tsx` – reveal/tilt/glass helpers.

## Performance notes
- The 3D scene (`src/Scene3D.tsx`) is a separate lazy chunk: text and background paint first, 3D streams in right after.
- All 3D shaders are compiled once during load (`Warm`), so nothing compiles in the middle of a scroll.
- Weak / touch devices automatically get a lighter 3D scene, and resolution drops by itself if the device can't hold ~40fps.
- Fonts are self-hosted (`@fontsource`), images are compressed webp, `/assets/*` is cached for a year.
- Only the front service card animates; off-screen animations are paused. Users with "reduce motion" get native scrolling.
