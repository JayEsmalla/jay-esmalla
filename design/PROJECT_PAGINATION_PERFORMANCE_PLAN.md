# Project pagination and portfolio performance

Status: proposed plan, October 18, 2026. This request changes the plan only; product implementation has not started. Earlier local work remains intact.

## Outcome and order

First add complete, accessible pagination to the Projects collection. Then optimize measured loading and interaction costs across mobile and desktop, preserving every existing feature and the current visual direction.

Treat smoothness as observable performance on documented devices and test conditions: responsive input, stable layout, and consistent animation frames. Retain the intro, custom cursor, motion, theme-linked portrait, filters, case studies, GitHub activity, live visitors, résumé, credentials, contact form, and navigation. A universal zero-lag claim across all devices or networks is not an acceptance test.

## 1. Add Projects pagination

### Default behavior

- Paginate `/projects` at **six cards per page**, using the same page size on phones and desktop. The current seven items produce six on page 1 and ComLab V3 on page 2. Avoid viewport-dependent page counts so shared URLs and history remain predictable.
- Keep the homepage's six selected cards and View All link. Its filters continue working locally.
- Apply All / Mobile / Web filtering before slicing the collection. Preserve the existing Mobile rule (`mobile` or `flutter`), featured ordering, global project numbers, descriptions, links, and case-study content.
- Changing a collection filter resets to page 1. Hide pagination when the result has one page. Handle empty results without an empty active page.
- Add Previous, numbered pages, and Next under the collection, with compact mobile spacing and 44px controls. Reuse the existing pagination structure and styles with SPA router navigation; its current primitive renders plain anchors and must not accidentally reload the site. Boundary controls must actually be inactive, and the current page uses `aria-current="page"`.

### URL, history, and focus

- Use collection URL search state: `/projects?page=2`, `/projects?filter=web`. Omit default All and page 1, preserve unrelated parameters, and retain existing hashes. Do not add a page-size selector or a backend pagination service.
- Real selections push browser history. Normalize invalid filters, noninteger/zero/negative pages, and oversized pages with replacement rather than adding spurious history entries. Clamp pages after filtering and after collection changes.
- Reload, direct links, shared URLs, Back, and Forward restore the selected page/filter. Keep page transitions keyed by pathname so pagination does not replay route entrances or remount GitHub activity and the shell.
- Extend the status to “Showing 1–6 of 7 projects · Page 1 of 2,” announced politely. Page navigation focuses the results heading/status and aligns the grid beneath the header; filter clicks retain filter-control focus and announce the new result.
- Keep one scroll/focus owner. `ScrollToHash` currently reruns for a changed `location.key` and sends query-only navigation to page top. Add a narrow collection-query policy there, preserving saved Back/Forward reading positions. Do not introduce a second effect racing that policy.
- Changing page/filter through history closes an open case study if its source card disappears. Return focus to a connected originating trigger, or the results heading when that card is no longer mounted.
- Use one brief opacity transition for page changes, without measuring every departing/entering card or replaying a stagger. Retain desktop hover feedback and reduced-motion handling. Settle the shorter final page before its scroll/focus adjustment.

### Pagination acceptance

- All seven projects remain reachable exactly once across the two All pages; global numbering remains stable. Mobile currently has two results and Web five, each on one page.
- Test page/filter composition, first/last boundaries, bad URLs, direct load, reload, Back/Forward, rapid changes, and changing data size. Use a small larger fixture to exercise additional page numbers without adding fictional projects to the portfolio.
- Verify keyboard operation, visible focus, live status, case-study focus trap/return, both themes, reduced motion, mobile/landscape, and all source/live links.
- Confirm pagination leaves the shell and GitHub section mounted, does not refetch GitHub on each page, and introduces no duplicate scroll jumps.

## 2. Establish the performance baseline

Capture a production build before pagination and another after pagination, then use the latter as the optimization baseline. This separates the new feature's costs from subsequent performance gains.

- Cover Home, Projects, Credentials, and Contact. Separate first-visit intro behavior from repeat visits; test both cold and warm caches and light/dark themes.
- Use a consistent desktop viewport and midrange-phone CPU/network profile. Check 320, 390, 768, and 1440px layouts plus short landscape. Use real Android/iOS hardware where available; otherwise clearly label emulation and follow-up device checks.
- Repeat the same journeys at least three times and compare median results: full-page scroll; theme/portrait switch; project filter/page/dialog; menu and anchors; route/Back; GitHub years; contact typing, validation, and controlled recovery. Do not send a real contact message to measure the form.
- Record network requests and transferred/parsed JavaScript, long tasks and their owning functions, React commits, layout shifts, and animation-frame traces. Existing browser automation's read-only DOM scope does not expose Performance APIs; use supported DevTools/Lighthouse trace tooling for frame-time claims and keep DOM opacity samples as synchronization evidence only.
- Existing built entry is **522,508 bytes raw / 170,634 bytes gzip** and CSS **96,249 / 17,073 bytes**. These are static artifact measurements, not a full initial-network total or a device performance score. Rebuild and capture the complete waterfall before setting final bundle budgets.

## 3. Optimize in evidence order

| Priority | Confirmed evidence | Planned change | Behavior to retain |
| --- | --- | --- | --- |
| 1 | App mounts React Query, TooltipProvider, Radix Toaster, and Sonner; audit found no feature-level consumers | Recheck reachable usage and remove unused startup mounts/imports; measure actual bundle savings | Existing inline contact messages and every active tooltip/notification behavior |
| 2 | GitHub year selection downloads the same complete feed each time | Share/deduplicate raw data, filter years locally, and use bounded cache freshness with safe refresh/cancellation | Accurate totals/date ranges, years, loading, timeout, failure, profile link, public-only label |
| 3 | The 900ms count-up updates parent state each frame, reconciling the calendar subtree | Isolate animated number updates so the calendar remains stable; honor reduced motion | Same visible count-up and calendar content |
| 4 | Navbar's subtree observer keeps rediscovering IDs after finding all sections | Disconnect discovery when complete and reinstate safely on relevant route/remount changes | Active-section highlighting and lazy-anchor discovery |
| 5 | Below-fold lazy components all render immediately, so all imports/mounts start immediately | If traces show contention, defer lower-section or dialog-only work until near view/idle or intent | Direct hashes, Back restoration, focus, instant access, and reserved layout |
| 6 | Blur, desktop header resizing, cursor lookup, font loading, and CSS coverage may have cost | Optimize only trace-proven hot paths; adjust scheduling/compositing or resource delivery | Existing visuals, readable fonts, cursor feedback, touch and keyboard support |

For data caching, use one small shared data boundary; do not remove an unused query provider and then add a new framework for the same work. Preserve existing data freshness expectations through explicit refresh behavior rather than hiding stale data for a higher score.

If lower sections are deferred, retain stable section anchors, mount the target immediately for hash navigation, reserve suitable heights, and account for asynchronous growth in scroll restoration. Keep the current loading boundary if those guarantees cannot be met with a measurable gain.

### Existing work to preserve

- The supplied `white-ver.jpg` stays byte-identical, with the original dark portrait. Both portraits total only 46,384 bytes; keep eager decoding and their synchronized 220/260ms fade without restoring click-time waits.
- Navbar progress already uses a motion value and frame batching; mobile header height is stable. Preserve those improvements.
- Project and credential previews already have responsive WebP sources, lazy loading, async decoding, and reserved frames. Retain originals and existing full-size links.
- Visitor tracking already pauses when hidden and has timeout, backoff, and cleanup. Preserve production-only tracking and 15-second visible-page accuracy.
- Cursor already uses transforms and stops its animation loop when settled; retain its touch/reduced-motion behavior.
- Keep the homepage intro and section/page transitions, refining expensive implementation rather than turning animations off globally.
- Large original images and the 14MB video are present in `public`, but the video is not currently a startup request. Treat bytes actually requested as the performance evidence; deleting dormant assets is not a measured runtime improvement.

## 4. Prove feature parity and performance

| Area | Required regression proof |
| --- | --- |
| Projects | Homepage selection, collection pagination/filter URLs, every card/link, dialogs, focus restoration |
| Theme | Exact white photo, matching portrait/page timing, saved theme, rapid clicks, offscreen portrait, unsupported browsers, reduced motion |
| Navigation | Intro/skip, direct routes, hashes, menu/Escape, active section, Back/Forward reading positions |
| Services | GitHub years/counts/error/timeout, visitor counts and cadence, contact draft/validation/retry/timeout/email fallback |
| Content | All project details, credentials/full-size images, résumé access, metadata, external links |
| Accessibility | Keyboard, announcements, visible focus, contrast, touch targets, no unintended overflow or motion regressions |

Use [Core Web Vitals](https://web.dev/articles/vitals) as goals: LCP at most 2.5 seconds, INP at most 200ms, and CLS at most 0.1. These are field thresholds assessed at the 75th percentile separately for mobile and desktop; lab measurements guide development and do not certify field results. Lighthouse loading runs use TBT as an interactivity proxy, not an INP pass.

Inspect application-attributable [long tasks](https://web.dev/articles/optimize-long-tasks) and dropped-frame bursts during the actual journeys. For 60Hz devices, aim for consistent frames near the 16.7ms display interval; report device, conditions, and observed trace results rather than a universal frame-rate promise.

Completion requires all feature checks passing, no new accessibility/visual/navigation regressions, and repeatable improvements to the identified bottlenecks. Do not accept a smaller bundle that makes another journey slower. Stop extending scope when additional changes have no material evidence of benefit.

Run targeted pagination, navigation, theme, motion, GitHub, contact, and visitor coverage; changed-file lint; TypeScript; and production build. Record existing test drift separately before implementation: prior checks found contact-label and dialog-imagery expectations inconsistent with unchanged product behavior. Update relevant stale assertions without restoring previously removed product features.

Deliver before/after screenshots, a comparable measurements table, trace/bundle evidence, final check results, and remaining device/field limitations. Deployment validation follows the existing GitHub Pages workflow when deployment is authorized.

## Evidence locations

- `src/components/ProjectsSection.tsx:121-135,168-180,209,242`: collection selection, card motion, and dialog focus.
- `src/pages/Projects.tsx:11`, `src/pages/Index.tsx:26-30`: full collection vs homepage and eager mounting of lazy sections.
- `src/components/ui/pagination.tsx:34`, `src/App.tsx:36-121`, `src/components/PageTransition.tsx:37-43`: reusable UI, query navigation, and route identity.
- `src/App.tsx:1-4,22,172-175`: startup providers and toaster mounts.
- `src/components/GitHubSection.tsx:107-181,280-296`: repeated full-feed requests and parent count-up updates.
- `src/components/Navbar.tsx:49-110`: existing scroll optimization and persistent discovery observer.
- `src/lib/theme.ts:19-47`, `src/components/Portrait.tsx:6,37-47`, `index.html:10-11`: existing synchronized fade and portrait loading.
- `src/lib/visitors.ts:35-92`, `src/components/FocusCursor.tsx:24-88`: visibility-aware background work and cursor scheduling.
