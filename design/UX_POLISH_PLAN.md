# Portfolio UX refinement plan

Status: implemented locally, October 16, 2026. The existing sections were refined following user approval. No new page or section was added.

## Implementation and verification

- Featured Aralytics and LakBai, with responsive artwork and full-size image links inside existing case studies. Aralytics now uses the owner-confirmed TypeScript, PostgreSQL, CSS, and JavaScript stack and Solo Full-Stack Developer role.
- Follow-up refinement: compact project cards use 160–176px previews, concise summaries, and three-column desktop browsing on the existing Projects page. The homepage's single View All link opens that page instead of expanding the homepage list.
- Added the supplied database, Innovathon, and Start in DavNor certificate images to the existing credentials section. Image links open the full-size originals; GridPulse recognition is explicitly attributed to the team. Removed credential verification/copy controls and GitHub's day inspector at the user's request.
- Condensed the mobile hero and About section; made the portrait toggle consistent across input methods.
- Repaired lazy anchor navigation, repeated destination links, Back restoration, mobile-menu closure, keyboard focus, and reduced-motion handling.
- Improved visible form labels, validation, timeout/retry recovery, and direct email fallback. Live browser data exposed out-of-order calendar years; chronological normalization now handles both API sources.
- Replaced missing asset references with the authorized JE SVG icon and current portrait sharing image. Existing-page metadata updates on navigation. Testimonials retain their existing attribution because no additional approved context was provided.
- Six 800px WebP previews total 147,750 bytes versus 5,205,060 bytes for the original assets: approximately 97% smaller. 480px and 1200px variants support other displays; the original images remain available.
- All 23 current regression tests passed after removing the two obsolete credential-copy tests. Targeted ESLint passed. Production build passed. TypeScript passed using `--ignoreDeprecations 5.0`; the repository's pre-existing `6.0` setting is incompatible with its installed TypeScript 5.8 compiler and was not changed.
- Browser checks confirmed no horizontal overflow at 320, 375, 390, 768, 1024, and 1440 CSS pixels. Checked mobile menu selection, anchor focus, Mobile filtering, case-study imagery, Escape/focus return, short landscape dialog scrolling, empty-form validation, and corrected live GitHub dates. Contact delivery was mocked in tests; no real message was sent.
- Screenshots: [desktop](../output/ux/desktop-home.jpg), [mobile](../output/ux/mobile-home.jpg).
- Follow-up browser checks: credential images loaded with no verification controls; mobile filtering and case-study focus return worked; the homepage View All link reached all six projects. No overflow was observed in the credential layout at 320, 390, 768, and 1440 CSS pixels. Screenshots: [credentials](../output/ux/credentials-updated.jpg), [compact projects](../output/ux/projects-compact.jpg).
- Scope of measurements: preview byte sizes are measured; live Core Web Vitals and a controlled before/after loading-time benchmark were not measured. A full 200% browser zoom and screen-reader audit remain additional checks. The build still reports its existing main-bundle size advisory (about 503 KB uncompressed). Route-specific metadata is client-side; crawlers without JavaScript may use homepage metadata.

## Goal and scope

Give recruiters and freelance clients equal priority. Visitors should quickly understand Jay's capabilities, inspect relevant work, and either access the CV or start a conversation.

Refine the existing Hero, Projects, About, GitHub, Certifications, Testimonials, Contact, navigation, footer, and case-study dialogs. Keep the dark editorial direction established in DESIGN.md, with improvements to readability, hierarchy, and interaction quality. The user's supplied project imagery remains central to the work presentation.

No new section, slide, page, gallery, or floating interface is proposed for this pass. Any such addition must be described to the user and approved before implementation. Adding an image to an existing case-study dialog is an enhancement to that existing area.

## Audit basis

Source and asset inspection, including two independent read-only audits. The local browser preview could not connect, so mobile layout, real keyboard behavior, and performance measurements remain validation tasks. Findings about implementation are confirmed from code; their practical severity must be checked in the browser.

## 1. Repair interaction reliability

Priority: highest. Complete before visual refinement.

- Make hash navigation wait for its destination instead of searching once after 220 ms. Lazy-loaded sections may not exist at that point. Honor reduced-motion preferences and place keyboard focus appropriately.
- Establish a consistent navigation convention: homepage navigation moves to existing sections; the full Projects page remains an explicit destination. Preserve useful browser Back positions.
- Close the mobile menu after every link selection, including the current destination. Add Escape handling, an associated navigation region, and predictable focus behavior.
- Restore keyboard focus to the originating project button when a case study closes. Enlarge its close target and verify scrolling on short phone screens.
- Add a keyboard skip link and consistent visible focus. Connect Framer Motion and programmatic scrolling to reduced-motion preferences.

Evidence: src/App.tsx:21-38; src/pages/Index.tsx:6-10; src/components/Navbar.tsx:23,154-202; src/components/ProjectsSection.tsx:192,238; src/components/ui/dialog.tsx:45; src/components/PageLayout.tsx:5-9.

Acceptance: all navigation and modal actions work by keyboard and touch; selecting the current mobile-menu link closes it; slow-loading anchor destinations are reached; closing a modal returns focus; Back returns visitors to a useful place.

## 2. Make project browsing the strongest part of the portfolio

Priority: highest.

- Deliberately feature Aralytics and LakBai alongside two complementary projects, provisionally PRISM and Thryfto. Keep all six available through the existing project list and filters.
- Use compact, uncropped card artwork with detailed inspection available in the existing case-study dialog.
- Show each project's supplied image at a useful reading size inside its existing case-study dialog. Arrange the existing text around the problem, Jay's contribution, implemented work, and supported outcome.
- Make filter selection and the number of visible results easy to understand. Distinguish descriptive platform labels from actual technologies.
- Confirm Aralytics' stack, individual responsibilities, and current project status before expanding claims. Copy added in the previous task was based on supplied imagery, not a repository audit. Add outcome metrics only when evidence is provided.

Evidence: src/components/ProjectsSection.tsx:35-49,112-121,238-293; src/data/portfolio.ts:108-140.

Acceptance: visitors find relevant mobile/web work quickly, inspect imagery without cropping, and understand what Jay contributed. Filters and navigation to the full collection remain clear after opening and closing case studies.

## 3. Sharpen the first impression and shorten the reading path

Priority: high.

- Keep View Work as the primary hero action. Give CV and Contact clear secondary emphasis for the two audiences.
- Refine the introduction and availability wording around the roles and engagements Jay actually wants. Retain a concise statement of capabilities.
- Reduce portrait height and repeated information where needed on small screens so project content arrives sooner.
- Condense duplicate profile facts in About. Shorten the focus-area descriptions and reduce the equal emphasis placed on every toolkit item; connect demonstrated strengths to existing projects where practical.
- Apply a consistent spacing and type scale. Increase readability of small metadata and improve control boundaries where contrast checks show a problem.
- Make the portrait interaction use one explicit state for its image, label, and keyboard/touch behavior. Hover currently changes the image independently of the label.

Evidence: src/components/HeroSection.tsx:7-50,99-137; src/components/AboutSection.tsx:48-55,124-264; src/index.css:93-156.

Acceptance: a new visitor can identify Jay's role, inspect work, and locate CV/Contact without deciphering decorative labels; the mobile hero and About section use space intentionally; controls remain usable at 200% zoom.

## 4. Make contact and trust details easier to use

Priority: high.

- Give contact inputs persistent visible labels and clear required/optional hints. Explain message requirements before submission.
- Add useful inline validation, a bounded sending state, retry handling, and a clickable email fallback while preserving typed content after failure.
- Keep the existing success announcement. Test submissions with a mock service, without sending real messages during validation.
- Enrich testimonials only with approved role/project context. Abbreviated names are not evidence that a quote is invalid; respect the author's privacy.
- Show the supplied credentials as image cards with accurate certification, participation, and team recognition labels. Keep verification/copy controls removed per the user's follow-up.
- Make the footer email actionable.
- Clarify GitHub's trailing-twelve-month label, expose horizontal scrolling where needed, and provide touch/keyboard access and a friendly unavailable state.

Evidence: src/components/ContactSection.tsx:39-52,109-123; src/data/portfolio.ts:32-37,143-164; src/components/Footer.tsx:10; src/components/GitHubSection.tsx:16,44,153,234.

Acceptance: form requirements remain visible while typing; failures preserve the message and offer a usable next step; credential images and contact details are accessible; GitHub failures do not interrupt the portfolio journey.

## 5. Optimize loading and sharing

Priority: medium to high; measure before and after.

- Create appropriately sized WebP/AVIF image variants and responsive sources. Aralytics and LakBai PNGs together are approximately 3.06 MB before optimization. Keep originals available for detailed inspection.
- Reserve stable media dimensions, prioritize the initial portrait appropriately, and lazy-load lower-page imagery.
- Inspect the production bundle and font loading; change only dependencies or loading behavior supported by measurements.
- Resolve the missing favicon and social-preview image references. Both assets are currently deleted in the working tree while index.html still references them; confirm whether to restore or replace them before implementing that change.
- Verify titles/descriptions for existing pages, CV download, direct route loading, and shared-link previews.
- The Aralytics video is not currently referenced by the project components. Do not attribute initial-load cost to it or add a video player as part of this pass.

Acceptance: compare production-build mobile performance under documented conditions. Target LCP <= 2.5 s, INP <= 200 ms, and CLS <= 0.1 at the 75th percentile when field data is available. Lab measurements guide optimization but do not establish real-user INP or guarantee field performance.

## Validation and completion

1. Establish desktop and mobile screenshots plus a production performance baseline before implementation.
2. Validate 320, 375, 390, 768, 1024, and 1440px widths, short landscape screens, and 200% zoom. No page-level horizontal overflow; intentionally scrollable content has an affordance.
3. Complete both journeys: recruiter -> relevant project -> case study -> CV; client -> relevant project -> evidence -> contact.
4. Check keyboard navigation, visible focus, Escape, focus return, screen-reader labels, contrast, and reduced motion. Aim for 44px primary touch controls and verify WCAG 2.2 AA target-size requirements and exceptions.
5. Test slow loading, image failure, GitHub failure, invalid form input, and contact-service timeout with controlled responses.
6. Run focused regression tests, lint changed files, and build. Repeat checks when changes or failures justify it.
7. Present before/after screenshots, measured results, and remaining limitations for review. Stop when the existing-area scope and acceptance conditions are satisfied.

## Reference standards

- [Google: Core Web Vitals and measurement limits](https://web.dev/articles/vitals)
- [W3C: WCAG 2.2 minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

