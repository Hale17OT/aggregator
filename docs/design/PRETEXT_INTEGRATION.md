# Pretext evaluation — WP03/WP11/WP12/WP18

Status: bounded Vue experiment implemented and measured on 2026-10-12; no product-layout adoption or performance claim.

Compare normal CSS wrapping with a client-only Vue adapter using `@chenglou/pretext` on long Home card titles. Do not measure or manually place article/bibliography lines. Text stays semantic SSR HTML and visible throughout. CSS is the authoritative fallback; never shrink type or truncate required attribution.

Measure after mount and `document.fonts.ready`; use the same font family/weight/size/spacing/line-height as computed CSS. ResizeObserver invalidates on width changes; content, locale, typography, theme/type preferences and font events invalidate a bounded cache. Do not mutate SSR markup before hydration. Catch import and font failures, disconnect observers on unmount and retain CSS. Inspect documented wrapping limitations before using balanced/custom wrapping.

Record native DOM height, predicted height/error, script duration and layout shift across 320/360/390/768/834/1024/1440/1920, long source titles, 200% type, failed fonts, disabled JS and library-load failure. Repeat after warm-up; report sample count and environment. Keep production use only if an actual layout need benefits without visual/accessibility regression. Optional dependency is not a blocker for Figma or reading.

## Observed first comparison

Implementation: `apps/web/app/pages/lab/pretext.vue`; dev URL `/lab/pretext`. Library 0.0.9, `prepare`/`layout` only; not manual-line APIs. CSS has normal wrapping, `overflow-wrap: break-word`, matching font/spacing and explicit line height. No balanced wrapping. Cache bounded to 32 handles; resize reuses preparation; font events clear both local and library caches. Listener/observer cleanup and post-hydration import included. Failure returns a visible CSS-only layout.

`../engineering/browser-checks.json` contains the exact Chromium version and results: one long title at eight viewports, plus 200% text, blocked fonts, simulated import failure and no JavaScript (12 observations). Measured title content widths 280–720 px; native/predicted heights matched with 0 px error in measured cases. The first 320 px sample took 7.1 ms and later observations roughly 0.4–0.6 ms; these are single-run timings, not a controlled warm/cold benchmark or performance improvement. The measurement never changes the rendered title, so it has no demonstrated layout benefit here.

Decision: keep ordinary CSS in all product layouts. Further adoption requires multiple representative titles, controlled repetitions, actual layout-shift instrumentation, content/locale changes, storage/cache stress and a concrete consumer that benefits. This comparison does not demonstrate Pretext faster than normal CSS, and it does not complete WP18 performance acceptance.
