# Contributions, theme-linked portrait, and mobile refinement

Status: implemented locally, October 18, 2026. The original investigation and plan are retained below.

## Follow-up: supplied White-version photo and synchronized fade

- Light mode now uses `public/white-ver.jpg`, copied byte-for-byte from the user's `output/imagegen/White-version.jpg` (37,396 bytes). The supplied photo was not generated or edited. The former generated light variant remains as historical output.
- Replaced the 500ms circular wipe with a 260ms desktop / 220ms phone opacity crossfade. The page and the explicitly named portrait snapshot use the same easing, document timeline, and start time. The portrait's frame remains fixed.
- Removed the image-preparation helper and its click-time decode/readiness waits. Both small portrait assets preload and decode on load before interaction. Cold or failed loading uses the existing theme-specific placeholder without delaying the switch.
- Regression checks cover the exact uploaded asset URL, no repeated decode on theme clicks, an immediate theme change during slow loading, synchronized root/portrait animation timing, offscreen or absent portraits, reduced motion, unsupported browsers, failed snapshots, and rapid clicks.
- Follow-up validation passed: 23 theme tests, 6 portrait tests, application TypeScript, changed-file ESLint, production build, and whitespace checks. Upload, public copy, and built copy have identical SHA-256 hashes.
- Real browser samples confirmed matching page/portrait opacity throughout the mobile fade (0.31485, 0.903133, 0.984631, then 1), and matching desktop samples. Rapid switching left one visible matching portrait, the same 195x260px mobile frame, and no console errors. These observations establish synchronization, not a universal device frame-rate guarantee.
- Follow-up evidence: [desktop](../output/ux/white-ver-desktop.jpg), [mobile](../output/ux/white-ver-mobile.jpg), and [transition samples](../output/ux/white-ver-transition-validation.json). The local preview was rebuilt and refreshed; deployment remains pending.

## Implementation and verification

- Production activity now uses the existing public feed directly, retaining the Vite development proxy. The production build contains no `/api/github-contributions` request. Real activity loaded in the browser, with a public-only label and a dated calendar summary; no console errors were observed.
- Removed the portrait button, hover/pinned state, anime reveal and labels, portrait cursor mode, and the three unused anime asset copies. The existing dark portrait remains unchanged. Light mode uses the new natural-color, white-shirt portrait.
- Both 720px portrait frames stay mounted. The target is decoded before the page snapshot, and `flushSync` commits the image selection and root palette together. The portrait shares the desktop iris or the 220ms mobile fade. Decode waits and the readiness frame have bounded fallbacks; reduced motion and unsupported view-transition browsers remain usable.
- Mobile header height stays fixed at 72px plus its border. Continuous progress uses a motion value with frame batching; a React Profiler regression confirms continuous scrolling does not rerender navigation after crossing the threshold. Mobile project filtering skips layout geometry animation and uses short opacity feedback.
- At 390px, portrait height changed from 466.67px to 260px. The original header changed from 72.67px to 62.67px on scroll; the revised header remained 72.67px at a nonzero scroll position. These are layout measurements, not a frame-rate benchmark.
- Browser checks found no page-level overflow at 320, 375, 390, 768, 1024, and 1440px. Confirmed light-theme reload, both portrait variants decoded at 720x720, theme/portrait agreement, mobile navigation closure, filtering, and a short landscape case-study dialog. Automated coverage checks failure/loading/reduced-motion/rapid-click behavior and dialog focus return.
- All 60 task-related tests passed. Full suite: 92 passed, 5 failed. The failures predate this change: four contact cases expect exact labels without the existing asterisks; one case-study test expects imagery and a full-size link absent from HEAD's dialog. The affected contact source/tests are unchanged, and this patch leaves the dialog body unchanged.
- Production build, application TypeScript check (`--ignoreDeprecations 5.0` overrides the repository's pre-existing incompatible setting), changed-file ESLint, and whitespace checks passed. The existing main-bundle size advisory remains. No commit or deployment was made.
- Evidence: [mobile before](../output/ux/theme-portrait-mobile-before.jpg), [mobile dark](../output/ux/theme-portrait-mobile-dark.jpg), [mobile light](../output/ux/theme-portrait-mobile-light.jpg), [desktop light](../output/ux/theme-portrait-desktop-light.jpg), [desktop dark](../output/ux/theme-portrait-desktop-dark.jpg), [layout measurements](../output/ux/theme-portrait-validation.json), and [portrait edit provenance and prompt](../docs/portrait-themes.md).

## Intended result

The GitHub activity section uses a data source supported by the deployed host. One theme button changes the page palette and Jay's portrait together. The portrait has no hover, click, or alternate-character toggle. Mobile scrolling and common interactions feel responsive, with a balanced hero layout.

| Theme | Page treatment | Portrait |
| --- | --- | --- |
| Dark | Existing near-black editorial palette and light text | Existing monochrome portrait, black shirt |
| Light | Existing warm off-white palette, dark text, coordinated borders and surfaces | Natural color portrait, white shirt, same face, pose, and crop |

Interpretation: the requested colored portrait and white shirt belong to light mode; switching back restores dark mode and the black-shirt portrait. Keep the existing saved theme preference and default dark mode.

## Findings and remaining uncertainty

### Contributions 404

- `.github/workflows/deploy.yml:33-53` builds Vite and publishes only `dist` to GitHub Pages.
- `src/components/GitHubSection.tsx:126-177` requests `/api/github-contributions` first in production and falls back to the existing public contribution feed after failure.
- `api/github-contributions.ts:1-10,155-246` implements that route as a Vercel function. It is not included as an executable endpoint in the Pages deployment. `vercel.json` does not configure GitHub Pages.
- A missing token does not account for this particular 404: the handler already returns public data when `GITHUB_TOKEN` is absent, or 502 if that upstream fails. The configured Cloudflare Worker currently handles visitors rather than contributions.
- This deployment mismatch explains the screenshot if it was taken on the Pages site. The screenshot does not identify its origin or show whether the fallback succeeded. Attempts to read `jayesmalla.tech` through the web tool were unsuccessful, so the live host and response still need confirmation.

GitHub describes Pages as static hosting; Vercel documents its own function runtime for root `api/` sources. See [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) and [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js).

### Portrait and theme

- `src/components/Portrait.tsx:12-36,65-95` owns separate hover/pinned state, alternate anime imagery, button semantics, and ALTER EGO/BACK labels.
- `src/components/ThemeSwitch.tsx:7-15` already uses `resolvedTheme`; `src/components/ThemeProvider.tsx:17-20` persists the preference. Reuse this state rather than adding another image preference.
- Visual inspection confirms `public/profile.webp` is already monochrome with a black shirt. CSS cannot recover the missing natural color or change the clothing to white. No suitable light portrait was found among the current assets.

### Mobile

These are inspection findings and profiling candidates, not measured causes of jank:

- `src/components/Navbar.tsx:49-60` updates React scroll progress continuously; lines 119-126 combine a sticky blurred header with a 72-to-62px height transition.
- `src/components/ProjectsSection.tsx:170-180` enables grid/card layout animations on phones.
- `src/lib/theme.ts:29-32` runs a 500ms circular reveal across the page regardless of viewport size.
- The full-width portrait's fixed 3:4 frame can be roughly 467px tall at a 390px viewport, making the mobile hero disproportionately long.
- Reduced-motion support, responsive project images, touch-disabled custom cursor, and viewport-aware dialog scrolling already exist. Build on those safeguards.
- Stored screenshots in `output/ux` predate current hero changes. Capture a fresh baseline before comparing results.

## Implementation order

### 1. Make contributions match the deployment

1. Confirm the failing request's origin and current production network behavior.
2. For the configured GitHub Pages deployment, fetch the existing public contribution service directly. Preserve the Vite proxy for development. Remove the automatic attempt to call the absent same-origin endpoint in this deployment.
3. Retain chronological normalization, year selection, the timeout, cancellation on selection/unmount, loading state, and the GitHub link when activity is unavailable. Do not fabricate contribution data.
4. Keep authenticated server mode only for a deliberately configured, hosted endpoint. No new backend or hosting migration is needed for the requested public activity scope; tokens remain server-side if that mode is used.
5. Extend focused coverage for production source selection, failed/invalid data, year changes, and ordering. Update the existing summary assertions that use obsolete wording.

Done when a production build makes no request to the absent route, renders real activity, and handles service failure without trapping the section in loading state.

### 2. Replace portrait interaction with theme-driven imagery

1. Create a light variant from `public/profile.webp` using a reference-preserving image edit: natural skin/hair color, white version of the shirt, same identity, expression, pose, framing, and background. Inspect the result before integrating it; inferred color cannot be guaranteed to match an unavailable original color photo.
2. Export an optimized WebP with dimensions and crop aligned to the existing portrait. Give it a clear asset name such as `profile-light.webp`.
3. Replace the portrait button with a noninteractive figure. Delete hover/pinned mode state, anime reveal, toggle labels, `aria-pressed`, and its interactive cursor hook. Remove portrait-specific cursor styling/logic if unused. Delete alternate anime asset files only after verifying no remaining references; retain the real portrait used elsewhere.
4. Derive the displayed portrait from the resolved page theme. Keep one accessible portrait description and the permanent name/details caption.
5. Decode the alternate portrait before revealing it, reserve the frame's dimensions, and coordinate the image with the existing theme transition. Handle cold loading, saved light-theme reload, rapid theme clicks, and image failure without a blank frame or a persistent mismatched portrait.
6. Audit the portrait caption, surfaces, borders, buttons, and activity colors in both modes so the entire composition changes coherently.

Done when the only control is the theme button; light mode consistently shows color and a white shirt, dark mode shows monochrome and a black shirt, and touching/hovering the portrait does nothing.

### 3. Refine mobile layout and measured smoothness

1. Capture production-build screenshots and performance recordings of scrolling, menu open/close, theme switching, project filtering, and case-study dialogs. Repeat comparable runs with mobile CPU/network throttling to establish the actual bottlenecks.
2. Keep the mobile header height stable and move continuous progress updates out of navbar React renders, using a motion value or a transform updated at most once per animation frame.
3. Give the portrait a bounded mobile size, starting around 220-260px tall on typical phones and adjusting from screenshots. Keep face/caption legible and avoid a large empty or image-heavy gap before selected work.
4. If traces show costly mobile theme or project layout effects, replace them with shorter opacity/transform transitions. Avoid stacking a portrait wipe over a full-page reveal. Retain immediate changes for reduced motion.
5. Adjust mobile spacing, text wrapping, and touch targets where the baseline demonstrates a problem. Keep intentional chart scrolling inside its own container and make its affordance clear.
6. Compare recordings and screenshots after the changes. Optimize additional components only when evidence ties them to an unresolved task-related problem.

Done when the header causes no scroll-induced height jump, the portrait is proportionate, key touch interactions respond without avoidable animation stalls, and measured recordings show the targeted work has been removed or reduced. Report observed performance rather than promise a frame rate without device evidence.

## Verification and delivery

- Check 320, 375, 390, and 768px widths, phone landscape, plus a desktop regression view. Verify both themes, menu, anchors, Back navigation, project filters, and modal scrolling/focus. Require no unintended page-level horizontal overflow.
- Check portrait loading and failure, light-theme reload, rapid switching, reduced motion, keyboard access, readable contrast, and the absence of a portrait toggle from the accessibility tree.
- Verify contributions against a production build and then the deployed Pages site. Include service failure, timeout, year selection, and out-of-order data. A passing Vite dev session alone is insufficient.
- Run the relevant GitHub activity, portrait, theme, motion, and navigation tests; lint changed files and build. Fix regressions introduced by this work and report any independent pre-existing failures.
- Deliver before/after mobile and desktop screenshots, a short performance comparison, and the contribution network result. Keep this work within the existing pages and interactions.

Local implementation and the checks above are complete. Deployment verification and a controlled mobile-device frame-time/Core Web Vitals benchmark remain separate follow-up work; no frame-rate improvement is claimed from the layout measurements alone.
