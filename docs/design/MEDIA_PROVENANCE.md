# Original fictional media — 12 October 2026

The user authorized original fictional assets for this design pass. These are contextual illustrations, not real reporting or supporting evidence. Explicit fixture display permission is recorded for local demonstration only; this does not approve publisher material or live publication.

## Lead illustration

Built-in image-generation mode (`image_gen.imagegen`), one generation, no external publisher photography. Final asset: `apps/web/public/media/alderwick-shuttle.png`, 1536×1024. Original output retained at `C:/Users/Hallelujah Abdissa/.codex/generated_images/01a1307e-a996-7960-bc24-78be0cea1786/exec-e0c0629f-03c4-41d9-be00-17814656ebc6.png`.

Full prompt:

> Create one original fictional editorial photograph, landscape 3:2. A modest dark forest-green electric community shuttle paused outside a warm stone public library beside a quiet riverside in the entirely invented town of Alderwick, early evening autumn light, library windows glowing, wet pavement reflecting amber light, empty foreground with benches and bicycle stands, bridge and trees in middle distance. Strong documentary composition with shuttle at center right, complete vehicle and enough surrounding environment; natural muted colors, realistic architectural detail, quiet observational journalism aesthetic. No logos, no readable signage, no identifiable people, no dramatic emergency or real location. This is a clearly disclosed synthetic contextual illustration for fictional mock reporting, never evidence. No text or layout overlays.

Explicit editorial selection: communicates the central shuttle/library subject calmly, preserves the complete vehicle and setting, and works at 3:2 without a dramatic or misleading crop. Focal point x62%, y53%; role illustration. Caption and credit disclose synthesis immediately below the article image; Home discloses fictional illustration. Original-asset link points to the locally hosted PNG.

`docs/design/fixtures/alderwick-shuttle-figma.jpg` is a JPEG transport copy of the same asset, re-encoded through a browser screenshot at original dimensions and quality 75 for bridge transfer. No compositional edits. Figma image hash `e7266635020419428bb60c866286e700f241b76f`.

## Inline schematic and video

`scripts/make-editorial-media.mjs` authors the original route SVG, then records a silent canvas traversal to WebM and supplies English WebVTT captions. It reads no publisher media. Files: `alderwick-route.svg` (1200×700), `alderwick-route.webm` (~4.3 seconds), and `route-captions.vtt`, all in `apps/web/public/media/`.

The map is schematic and not to scale. The video is a local illustration, explicitly distinct from the fictional source-4 publisher transcript. It has native controls, captions, no autoplay, and a downloadable original. Static diagram and accompanying text keep the route understandable without playback.

All four current assets are hashed in [media-hashes.json](media-hashes.json). No asset contributes to evidence eligibility.

