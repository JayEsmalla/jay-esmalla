# Theme portrait assets

The website uses `public/profile.webp` in dark mode and `public/white-ver.jpg` in light mode. The light asset is an unchanged, byte-for-byte copy of the user's `output/imagegen/White-version.jpg`: 1254x1254, 37,396 bytes, SHA-256 `757345D2C2A26CCBB135E1F37031DC0B9F96F19D317A22B4DBBB8898A488B0E0`. No generation, recoloring, cropping, or recompression was applied to this supplied file. The original dark file is unchanged.

Both square images use the same reserved portrait frame and object positioning. Both are preloaded and eagerly decoded ahead of interaction. Theme clicks do not start or await an image decode; a cold or failed image retains the selected theme's loading/error placeholder.

## Historical generated variants

The previous generated light variant remains at `public/profile-light.webp` for reference, but the website no longer uses it. Its WebP size is 25,350 bytes at 720x720.

The light portrait was created with the built-in imagegen tool, using the existing photograph as the edit target. Sharp resized the generated square to 720px and encoded it as WebP at quality 88. Natural colors are inferred; this is an edited derivative rather than an original color photograph.

Previous generated source: `C:/Users/mfgui/.codex/generated_images/01a14f56-0527-7c40-997c-2b16e76790e6/exec-bb8d1230-0cb6-4637-aada-69be07938e4e.png`.

Historical workspace asset: `D:/jay-esmalla/public/profile-light.webp`.

## Initial image edit prompt

Use case: identity-preserve. EDIT TARGET: the supplied square portrait photograph of Jay. Create the LIGHT THEME variant of this exact website portrait. Change ONLY these two attributes: restore realistic natural color (natural warm medium skin tone, black hair, natural eyes), and change the black long-sleeved high-neck shirt to clean white fabric with realistic folds and shadows. Preserve identity and exact geometry as strictly as possible: same facial features, same expression, identical head/eye/shoulder/hand positions and scale, exact crossed-arm pose, same hair, same body proportions and silhouette, same camera angle, same light gray plain background, same soft studio lighting, SAME SQUARE CANVAS and crop with no shifts. It will transition directly over the original at identical size, so eyes, face, hands, silhouette, and shirt outline must align precisely. This is a photographic edit, not a new person or illustration. Do not beautify, change hairstyle, re-pose, reframe, add props, jewelry, words, logos or watermarks. Keep the entire background and composition as unchanged as possible. Output a single square portrait.

## Color refinement, October 18, 2026

At the user's request, the built-in imagegen tool applied a restrained color correction to the first light portrait: reduced orange/saturated skin color and added a subtle natural rose-brown lip tone. The original monochrome photograph was supplied as a second reference for identity. Two visual inspections found no obvious change to facial features, expression, pose, or framing; visual inspection does not establish pixel-exact preservation. The shirt and synchronized transition are unchanged.

The previous light WebP is preserved at `output/imagegen/profile-light-before-tone-fix.webp`. The selected corrected WebP is also saved at `output/imagegen/profile-light-tone-corrected.webp`, then copied to the final public asset path. Sharp resized and encoded the generated source at the same 720x720 dimensions and quality 88.

### Exact refinement prompt

Use case: identity-preserve. Perform a very restrained COLOR CORRECTION of IMAGE 1, the current color portrait in a white turtleneck. IMAGE 2, the original monochrome photograph, is a strict identity/geometry reference only. The user explicitly requires NO alterations to his face. Change only color values, never facial structure or geometry. Correct the overly saturated/orange appearance of the facial skin to balanced, neutral, realistic skin color; modestly lower skin chroma without making it gray, washed out, pale, or artificially lightened. Give the lips a subtle natural muted rosy-brown tone so they look less pale; preserve exact lip size, shape, edges, expression and texture, with no makeup or lipstick appearance. Preserve the exact face, eye shapes/positions, nose, jaw, mouth, eyebrows, facial hair, pores, hairstyle, expression, head size and placement, and exact identity. No beautification, smoothing, retouching of features, reshaping, new face, or relighting. Keep everything else in Image 1 unchanged: same square canvas/crop and pixel-relative composition, same white shirt and folds, same crossed arms and hands, same body, background and soft light. Color corrections only; no new objects, text, logos or watermark. Produce one square photograph aligned exactly with Image 1.

## Transition behavior

Both layers remain mounted. The image choice and palette commit together without a click-time image wait. The page and the named `theme-portrait` snapshot share an opacity crossfade: 260ms on desktop or 220ms on phones, with the same easing and start time. Fixed image geometry avoids a position/size animation. Without view-transition support, matching short color/opacity transitions apply; reduced motion switches immediately. A slow or failed asset displays a labelled placeholder in the selected palette. Rapid clicks are ignored while a reveal is active.
