# Intro screen refinement

Status: implemented locally. Final direction incorporates the request to remove project previews and keep the arrival at the hero classy.

## Final direction: a signature drawn in light

The existing intro uses Jay's name as its focal point, with one fine gold trace and a quiet charcoal canvas. It contains no project imagery, monogram centerpiece, simulated loading counter, or new portfolio section.

- A small chalk point travels along an angular gold line.
- “Jay Esmalla.” reveals through a mask, using the portfolio's existing regular-weight display typography. “Jay” is smoke; “Esmalla.” is chalk.
- The mobile/web role follows with a small, gentle rise.
- The line fades first, then the name and metadata clear.
- The charcoal overlay fades into the hero without sliding panels, zooming, or a background flash. The hero text rises 10px; the portrait and actions follow with small delays.

## Timing

| Time | Moment |
| --- | --- |
| 0–900 ms | Point and gold trace draw the opening structure. |
| 200–1,050 ms | Name reveals and settles. |
| 500–1,100 ms | Role appears beneath the name. |
| 1,150–1,450 ms | Line fades away. |
| 1,450–1,700 ms | Name, role, and surrounding metadata fade. |
| 1,700–2,400 ms | Overlay dissolves while the hero enters with restrained motion. |

## Behavior

- Appears once per tab session on an ordinary homepage entry.
- Direct routes and homepage anchors bypass it.
- Reduced motion bypasses it independently of session storage availability. Enabling reduced motion during playback also dismisses it.
- The visible Skip button is removed at the user's request. Tab and Escape still finish immediately; repeated completion triggers are ignored.
- Underlying content is inert and hidden from assistive technology while the overlay is active. Keyboard focus starts on the intro container, then moves to the main content when the intro finishes.
- Body scrolling is restored on completion or early unmount.
- Timers and event handlers are cleaned up; completion does not depend on an animation event or a network response.

## Implementation

- `src/components/IntroScreen.tsx`: accessible intro and bounded lifecycle.
- `src/lib/intro.ts`: entry policy.
- `src/App.tsx`: interaction isolation, scroll restoration, session persistence, and hero handoff.
- `src/pages/Index.tsx` and `src/components/HeroSection.tsx`: coordinated hero entrance.
- `src/index.css`: intro composition, short CSS animation sequence, and responsive adjustments.

Uses existing React, Framer Motion, typography, CSS, and inline SVG. No extra dependencies or intro image requests.

## Review and verification

- Desktop, 320px and 390px phones, and 844×390 landscape were inspected for layout and clipping. The intro contains no image elements.
- Browser checks confirmed normal completion restores focus, scrolling, and access to the portfolio. A live handoff check confirmed overlapping overlay fade and a small hero translation. Keyboard continuation is covered by the lifecycle tests.
- Production build, targeted ESLint, and TypeScript passed. TypeScript uses `--ignoreDeprecations 5.0` because the existing config specifies `6.0` while the installed compiler is 5.8.
- The build retains its existing main-bundle size advisory. No real-user performance claim is made.
- All 9 intro lifecycle/entry tests and all 10 navigation tests passed. The full suite has 23 passes and 9 failures in existing contact, GitHub, and project tests: current required-field labels, activity-summary wording, case-study imagery, and default project counts differ from those tests' expectations. Those components and tests were not changed during this intro work. Details are recorded in `output/ux/intro-test-results.json`.
- Screenshots: [desktop](../output/ux/intro-desktop.jpg), [mobile](../output/ux/intro-mobile.jpg).
- Local review fixture: `output/ux/intro-review.html` supports replay and paused frames; it is not a portfolio route or production entry.
