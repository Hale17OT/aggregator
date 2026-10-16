# The Aggregator — short-form viewer analysis

Research date: 16 October 2026. Scope: TikTok, YouTube Shorts, Instagram Reels; desktop web versus phone viewing; continuation of the existing Vue/Nuxt and Flutter applications.

## 1. What was and was not inspected

This analysis combines publicly published interface screenshots, official product announcements/help, and a supplied implementation checkpoint. It is NOT a claim of using authenticated live feeds, the user's running local site, or the delivered APK. Connected-browser access failed; public live feed URLs did not expose an inspectable authenticated player. Some official image endpoints could not be rendered. Where published screenshots are older or show an advertisement, they establish only their visible composition, not today's universal button order or every gesture. App experiments, device, account and entry route can change the interface.

Visually inspected examples include: the desktop Shorts screenshot in R03; the mobile Shorts screenshots in R04; TikTok's desktop launch images reproduced in R06; and the actual Reels mobile/desktop images in R08. R01/R02 supply current first-party Shorts changes; R05/R07 supply first-party TikTok context; R09 supplies first-party Instagram feed context. The Reels advertising call-to-action in one R08 image is NOT a recommended organic-feed control. Nothing from these publishers is licensed as an Aggregator product asset by this brief.

The current Aggregator attachment is a written checkpoint, not screenshots of the rejected interface. It establishes implementation and unresolved gates. The next Codex task must inspect the actual built web pages and main Flutter APK before attributing a particular visual defect to a component.

## 2. The fundamental distinction

The earlier direction overemphasized “a video with custom controls” and preservation of the full newspaper shell. A short-form feed is a *viewing surface*: the video establishes the layout, a small action rail belongs to the current item, and metadata is compact and close to the picture. A conventional video page starts with a page heading, a media box, a transport row and panels below it. Changing the row's words into icons does not change that hierarchy.

For The Aggregator, keep newspaper branding on Home and articles. Give Clips a compact, immersive route-specific shell. Brand continuity means shared identity and typography; it does not require the full newspaper masthead and paper margins above every phone video.

## 3. YouTube Shorts

### Desktop — visible composition

The inspected desktop reference has a single tall portrait player in a large workspace. Its right-side actions are stacked vertically beside the video, not distributed across a toolbar under it. Navigation to another short is separate from seeking inside the current short. Small play/sound affordances sit at the picture edge. Identity and the short description are close to the lower picture region. The surrounding desktop application remains separate from the player. [R03]

This reference includes an older thumbs-up/dislike arrangement. Do NOT copy that arrangement as an assertion about October 2026. YouTube's June 2026 announcement says a heart replaces thumbs-up, dislike is retired in favour of more explicit feed controls, and the update is rolling out over time. [R01]

### Phone — documented and visible pattern

The phone examples devote most of the viewing surface to the video. The action column overlays the right side; identity and concise descriptive text occupy the lower left; app navigation occupies the bottom edge. The main frame is not surrounded by a paper card and a stack of transport buttons. [R04]

YouTube's current documented direction is explicitly to reduce title/icon clutter. Its June update also introduces Clear Screen, adjustable speed and a pause-then-mute interaction. Treat these as documented changes, not proof of a uniform rollout on every device. [R01, R02]

**Use for The Aggregator:** centred desktop portrait composition, right-side item actions, separate up/down navigation, very compact playback affordances and secondary settings. Do not copy engagement counters or pretend Save is a Like.

## 4. TikTok

### Desktop — visible composition and official direction

The launch images show left-side site navigation, a tall dominant video and a narrow action column immediately to its right. The creator/description text stays near the lower picture edge. The product announcement describes a modular desktop layout with repositioned navigation and reduced distraction; it also describes a separate floating-player feature. A floating player is not needed for this correction. [R05, R06]

An expanded post/comment view, an Explore grid and the primary vertical feed are different states. Do not combine all of their panels into a permanent two-column dashboard and call it the feed.

### Phone — reference pattern and limits

The comparison image shows an edge-to-edge-feeling vertical viewing canvas, controls over the right of the picture, and identifying text near its lower edge. A compact feed selector and navigation frame the content instead of a large page heading. The image is a published comparison, not a fresh capture of the user's account. [R04]

TikTok officially documents the feed as a discovery surface and describes topic/favourite/feedback controls, but those facts do not establish an exact current pixel layout or one universal tap gesture. [R07]

**Use for The Aggregator:** a settled one-item-at-a-time phone page, swipe-led navigation, concise overlays and properly resolved gesture conflicts. Do not import shop, creation, live, music discovery, social counters, reposting or an engagement-ranking system.

## 5. Instagram Reels

### Desktop — visible composition

The inspected browser image shows a narrow portrait video with generous surrounding space; an engagement/action column sits just outside the right edge, and a short identity/description treatment stays at the bottom of the picture. A centre play mark is visible in its paused state. That is notably different from a 16:9 player with a wide command panel below it. [R08]

The image is a cropped published browser example; it does not establish exact current outer navigation widths. Do not present it as a measurement of a live 2026 session.

### Phone — visible composition and variations

The inspected phone examples place the video beneath small top-edge controls and above compact bottom navigation. White line icons and text sit over the lower/right part of the video. One example is an ad, so its red shopping call-to-action must not be mistaken for normal Reels transport. Another visibly shows a transient mute glyph over the picture. [R08]

Meta's official 2025 update places Reels/Friends switching at the top of Reels. That demonstrates why the social app has top feed controls, not why The Aggregator should invent a Friends feature. [R09]

Published accounts describe different tap/hold pause behaviour across versions. No universal Instagram gesture was independently verified here. The Aggregator should choose and test a consistent contract rather than inherit an uncertain combination of tap-to-mute, tap-to-pause, hold-to-pause and double-tap-to-like.

**Use for The Aggregator:** immersive mobile canvas, light overlay icons, compact metadata and contextual sheets. On desktop, an optional details panel may appear on request; it is not the default layout.

## 6. Why a controls-only reskin will fail again

These are design hypotheses to verify against the actual application, not claims from unseen screenshots:

- The full newspaper masthead plus a second Clips title may spend too much of the phone viewport on page chrome.
- Fitting video only after measuring several toolbar rows can turn it into a thumbnail.
- “Video + rail + panel” centred together leaves the actual portrait off-centre.
- Scrolling a column of controls is not a normal short-form default; less-used actions belong in a menu or sheet.
- Repeating metadata and controls above, over and below the video creates a form/dashboard rather than a feed.
- Reusing a long-form video transport strip for Clips ignores the difference between next-item navigation and current-item seeking.
- Requiring full height AND full width for a 9:16 asset on a taller phone implies cropping or distortion. The news footage, captions and source graphics must not be sacrificed to hide that geometry.

## 7. Selected Aggregator design — our decisions, not platform measurements

### Desktop Clips

Use a compact publication/navigation bar and a large media workspace. With no detail panel open, centre the video itself on that workspace's centreline. Keep the action rail to its right with a balancing reserved left gutter. The portrait fits both width and height. Do not add a permanent heading, toolbar and metadata stack above/below it.

The default rail contains Save, Sources, Share and More. Read full story is a compact link associated with the lower-left metadata. No fabricated likes/comments/views. More contains supported speed/caption/detail/feedback functions rather than exposing them all at once. Up/down next-item arrows sit farther to the side and do not masquerade as skip-within-video controls.

### Phone Clips, mobile web and Flutter

Use an immersive dark media canvas, small top controls and the existing compact bottom destinations. Remove the large newspaper masthead on this route only. Media extends behind lightweight overlays, but essential image content remains contained, with neutral matte space where needed. Keep the picture centred; use extra safe matte space for controls when available.

The right rail uses 24–28px original glyphs inside at least 44 CSS-pixel / 48 logical-pixel targets, without full-width labelled buttons or heavy raised frames. Short captions under unfamiliar actions can remain. Lower-left metadata is limited to a compact publication/topic line, a two-line title and Read story. Overflow opens a details sheet rather than enlarging the feed page.

These dimensions are proposed design tokens. They are not claimed measurements of TikTok, Instagram or YouTube.

### Playback and state contract

A deliberate first Play starts the session and transfers sound ownership from Radio/Newsroom. Subsequent intentional swipes may start the next settled clip under that current playback intent. A manually paused clip, a restored deep link, backgrounded app, dismissed sheet, or failed play request must not spontaneously restart.

Single tap in unobstructed picture space toggles pause/play. A pause shows one centre play affordance. Swiping, scrubbing, rail actions, caption selection and scrolling a sheet do not also trigger that tap. Mute has its own explicit control. Double tap does not secretly Save or invent a Like. A thin progress line becomes a larger accessible scrub target on interaction. End-of-item offers replay/next; the finite feed still ends honestly.

The reading/source experience is not deleted to achieve immersion. Sources opens a reader-friendly sheet/panel with full links and transcript. Public clip detail retains a server-rendered source fallback. Returning is paused at the same eligible clip and position. Captions remain separate from two-line marketing/description text and must not overlap the action rail or burned-in news graphics.

## 8. Continue from the actual Flutter checkpoint

The 16 October attachment reports a native Flutter application, 24-story API, 23 programme catalogue and 93 unchanged original asset files. Captured-mail approval plus a one-use S256 handoff, platform credential storage and migration 0012 already exist. Preserve them.

The stable prior main APK is `output/flutter-closeout/aggregator-local-demo.apk`, SHA256 `48806fb446eaa6ae8f0bdbf5b8ba99a2db62d3a56185871e0caa88fb14fc23c0`. This is a baseline artifact, not the identity of the future corrected app. Preserve it; produce a new named artifact and hash.

Web's 7ms callback gate and Flutter's emulator profile raster gate remain failed in the checkpoint. Instrumentation runs were not identical to the final main APK. Neither condition may be converted into a pass by styling changes or relabelling emulator results as physical-device tests. Flutter recommends physical-device profile measurements for representative performance. [R10]

## 9. Research references

R01 — YouTube, 25 June 2026, “How we're updating the YouTube Shorts experience”: https://blog.youtube/news-and-events/youtube-shorts-experience-updates-features/

R02 — YouTube, 13 August 2026, “5 design principles we use to put creators center stage”: https://blog.youtube/inside-youtube/design-principles-use-put-creators-center-stage/

R03 — EComposer, published desktop Shorts screenshot (older icon configuration; visual reference only): https://ecomposer.io/blogs/review/tiktok-alternatives

R04 — Published visual examples, not live account inspection: https://ppc.land/youtube-brings-gemini-omni-and-personal-avatars-to-shorts-at-google-i-o/ and https://www.web-media.com.ar/nuestro-blog/actualidad/contratar-contenidos-ugc-la-clave-para-impulsar-tu-estrategia-digital.html

R05 — TikTok, 27 February 2025, desktop redesign announcement: https://newsroom.tiktok.com/en-us/new-features-bring-tiktok-magic-to-desktop

R06 — Reproduction of TikTok's desktop launch visuals: https://www.socialmediatoday.com/news/tiktok-refreshed-desktop-app/741178/

R07 — TikTok, 3 June 2025, feed controls: https://newsroom.tiktok.com/en-us/more-ways-to-discover-new-content-and-creators-you-love

R08 — Published Reels screenshots, desktop and mobile including advertising-specific examples: https://zeely.ai/blog/how-to-pause-reels-on-instagram-in-2026/ ; exact browser image: https://zeely.ai/blog/wp-content/uploads/2026/02/how-to-pause-from-web-1024x635-optimized.jpg ; mobile example: https://zeely.ai/blog/wp-content/uploads/2026/02/reels-mutes-1024x635-optimized.jpg

R09 — Meta, 6 August 2025, Reels/Friends/reposts: https://about.fb.com/news/2025/08/new-instagram-features-help-you-connect/

R10 — Flutter performance guidance: https://docs.flutter.dev/perf/ui-performance

R11 — Flutter PageView: https://api.flutter.dev/flutter/widgets/PageView-class.html

R12 — HTML media play promise and rejection: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play

R13 — WAI button semantics: https://www.w3.org/WAI/ARIA/apg/patterns/button/

R14 — Intersection Observer: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

Research screenshots are reference evidence, not product assets or an image-generation instruction. No fonts or third-party media files are included in this pack.
