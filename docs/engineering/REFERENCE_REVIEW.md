# Reviewed references — 12 October 2026

Pinned upstream revisions and declared licenses: `reference-revisions.json`. `scripts/review-references.mjs` stores source documents under ignored `.cache/references/`; it downloads text only and executes no upstream scripts. Repository-specific installation/framework directives are reference material and do not override the specification.

| Reference | Selected use / disposition |
|---|---|
| [AutoAnimate](https://github.com/formkit/auto-animate) | MIT; reviewed README/package and Vue compatibility. Reserved for small bookmark/chip/checklist insertions. Not installed yet because this increment has no changing lists. Never own article layout or share layout ownership with Motion. |
| [Motion for Vue](https://github.com/motiondivision/motion-vue) | MIT; package `motion-v`, supports Vue presence/layout. Reserved for deliberate evidence panel interactions. Current reader uses zero-motion semantic anchors, so adding runtime weight has no present benefit. |
| [Emil design engineering](https://github.com/emilkowalski/skills) | MIT; reviewed interaction frequency, restrained keyboard feedback and interruption guidance. Applied to no-motion reader anchors and clear states; not installed globally. |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | MIT; reviewed hierarchy/contrast and layout guidance. Rejected GSAP/React, forced randomization, text shrinking and scroll-driven marketing defaults: incompatible with this editorial/Vue brief. |
| [img2threejs](https://github.com/img2threejs/img2threejs) | Apache-2.0; optional procedural 3D reference only. No reader dependency or experiment in this checkpoint. |
| [Impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 declared upstream; Read/Operate distinction, brief precedence and bounded visual critique used as reference. No downloaded launcher executed; no command-run claim. |
| [Pretext](https://github.com/chenglou/pretext) | MIT; 0.0.9 installed only for isolated comparison route. Reviewed prepare/layout/cache and CSS wrapping caveats. Ordinary CSS retained for all product layouts. |

Compatibility checked against Nuxt official Context7 docs and npm package engines. Nuxt 4.6.1 requires Node ^22.22.3 or compatible newer lines; system Node 22.18.0 was insufficient. A local 22.22.3 archive from nodejs.org was verified against that release's SHASUMS256.txt. Express 5.3.0 requires Node >=18. Vue 3.5.43, TypeScript 6.0.3 and Zod 4.6.6 are lockfile-pinned and pass current type/build checks.

Newsreader and Manrope are available in Figma. Web uses local `@fontsource-variable/newsreader` and `@fontsource-variable/manrope` 5.3.0 (OFL-1.1 metadata; license files remain in the installed packages). No font files were put in the Figma handoff. IBM Plex Mono is available but not needed on the public article. No third-party publisher imagery or icons were acquired.

Nuxt DevTools is disabled. The simple-git and argv-parser overrides remove the critical advisory chain; their major-version compatibility is only exercised by local type/build checks, not DevTools behavior. Remaining upstream high findings are recorded in VERIFICATION.md. Do not force downgrade the framework to satisfy an automated suggestion.
