# The Aggregator · compact editorial identity

16 October 2026 · implemented candidate; owner visual acceptance pending.

The chosen **open-bowl A** is an original vector redrawing inspired by the actual UnifrakturMaguntia capital A used in the Home masthead. It retains the open curled bowl, diagonal return, broad foot and tall right blackletter stroke. The inner curl is shorter, the silhouette is less intricate, and the rising terminal remains pointed. The Home masthead itself is unchanged.

Three directions were compared at large size and 16/32/48 pixels: faithful masthead silhouette, simplified open bowl, and blunt terminal. The second preserves more publication character than the blunt terminal while eliminating the source glyph's fine curl. The final launcher composition shifts the mark three source units left to center its visible bounds. Square, circular, inverse, splash and link-preview renders were inspected locally. These are design/mockup inspections, not owner acceptance or physical-device verification.

## Palette and usage

| Token | Value | Usage |
|---|---|---|
| Paper gold | `#D8B963` | Launcher and brand presentation background |
| Ink | `#18201E` | Primary mark, text on gold/cream |
| Cream | `#F6F3ED` | Alternate editorial surface |
| Supporting neutral | `#626C65` | Secondary text on cream only |

Gold is confined to brand surfaces; it does not replace existing publication theme or control tokens. Use the ink transparent mark on light surfaces and gold inverse mark on dark surfaces. Never recolor source photographs or player media.

Keep at least one right-stem width of clear space around the standalone mark. The app icon includes built-in safe space; do not add corner rounding to source PNGs. The OS owns cropping. Use the tiny silhouette for 16–48px favicons; use the main mark from 48px upwards. Minimum wordmark lockup width is 240 CSS pixels; below this use the standalone mark and an accessible product name. All supplied wordmark SVG letters are outlines, so no client font download is needed for the artwork. The existing font's OFL notice accompanies web exports.

## Assets and wiring

- `apps/web/public/brand/`: transparent main/inverse/tiny SVGs, outlined wordmark, square SVG and 16–1024px PNGs, ICO, splash SVG, 1200×630 PNG/SVG preview. The PNG preview is the actual linked Open Graph asset. The SVG is an editable alternate without the small tagline.
- `apps/web/nuxt.config.ts`: favicon, Apple touch icon, Safari mask icon and preview metadata. Local relative preview URLs are deliberately not a claim of externally crawled delivery. A future authorized deployment must supply its canonical absolute URL and crawler verification; no public deployment was performed.
- `apps/web/app/components/BrandLoading.vue`: static, decorative compact loading mark used by Home's existing pending status. The readable live status is retained, and no blocking splash, timer or motion is added.
- `apps/mobile/assets/brand/` and `pubspec.yaml`: reusable SVG/transparent PNG assets. No programme files are copied into the APK.
- Android existing manifest now points at `@mipmap/ic_launcher`, with original legacy PNG densities and an adaptive gold-background/vector-foreground icon. Existing Android 12 splash and pre-12 launch background use the new mark.
- iOS existing AppIcon slots and LaunchImage slots are replaced at their declared sizes; LaunchScreen uses gold. This is source/configuration only until an actual iOS build/device check.

Motion guidance: the stationary mark is sufficient. If a future loading fade is added, keep it below 150ms, do not loop/rotate the mark, honor reduced motion, and never impose a minimum loading time. No heavy animation was introduced here.

## Reproduction and evidence

`python scripts/build-brand-assets.py` generates deterministic local artwork with installed Pillow/fontTools. `python scripts/install-brand-assets.py` regenerates and copies those exports into existing asset slots. Neither command downloads assets, changes content data, starts a service or performs a build.

Evidence is under `output/targeted-closeout-20261016/brand/`: `masthead-a-study.png`, `directions-comparison.png`, `usage-surfaces.png`, `splash-preview.png`, `social-preview.png`, and the complete exported assets. Tiny comparisons are displayed at actual pixels; full-size masters are also supplied. The design loop is an agent self-review, not an independent designer or owner sign-off. Final platform build/capture checks belong to the parent targeted closeout and must be reported separately.


Targeted closeout: actual Android launcher and splash inspected in evidence/brand-installed. Captures are from first targeted candidate; unchanged asset sources fingerprinted in r2. ready.png is a splash capture, not a ready reader. iOS build and owner acceptance remain pending.
