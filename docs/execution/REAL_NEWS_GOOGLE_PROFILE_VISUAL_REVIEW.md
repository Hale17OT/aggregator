# Independent saved-capture visual review — 17 October 2026

**Assessment: visually coherent partial delivery; not owner acceptance or a complete accessibility review.** I read `REAL_NEWS_GOOGLE_PROFILE_DELIVERY.md` and inspected only these four saved captures under `output/real-news-google-profile-20261017/`:

- `web-home-final.png` — desktop, dark theme; predates the documented Member → Profile header-label change.
- `native-home-final-r4.png` — native Home, light theme.
- `native-profile-final-r4.png` — native Profile, light theme, fictional captured-mail member.
- `native-article-final-r4.png` — native publisher-report detail, light theme.

No live browser or emulator was accessed or captured. The owner’s pending Google login was left untouched. The images were displayed scaled down by the image viewer, so this review does not establish physical text sizes, touch-target dimensions or contrast ratios.

## What the captures support

The centered blackletter Home mastheads, restrained forest/paper palette, serif headlines and thin newspaper rules remain recognizably related across web and native. Native text wraps within the visible content area without obvious horizontal clipping in these captures. Selected Editorial/Home states are visually distinguishable; the native article’s author, NASA attribution, original-report action and transformation/rights disclosures are visible. Its text-only presentation is consistent with the explicit omission of imagery and audiovisual rights; an unrelated illustration or Watch action should not be added merely to fill space.

Profile presents the editable display name, save action, connected method, local captured-mail assurance, interests, preferences and active-session action in a readable sequence. Its explicit warning that local captured-mail ownership cannot link a real Google account avoids implying provider verification.

## Concrete defects and review concerns

1. **Machine-formatted dates leak into reader-facing copy.** Web Home exposes an edition cutoff with milliseconds and `Z`; native Profile exposes a long ISO timestamp with fractional seconds and numeric offset. These are visually noisy compared with the surrounding editorial typography. Human-readable dates and clearly named time zones would be easier to scan; exact machine values can remain in structured data.
2. **Web source-count grammar is visibly wrong:** the Latest updates cards say “1 sources.” This needs singular/plural handling. A single publisher report is legitimate in this view; this observation is not a request to imply a multi-source synthesis threshold was met.
3. **Discovery controls consume substantial opening space.** On desktop, the first lead headline starts roughly three-fifths down the captured viewport after masthead, search, filters and edition metadata. Native Home likewise prioritizes several control rows before the first headline, and its long summary leaves only one story visible. The hierarchy remains understandable, but browsing feels more form-led and less compact than a newspaper opening. This is a review concern, not authorization to redesign accepted controls.
4. **Secondary text and actions look comparatively faint.** Native timestamps, assurance text, navigation labels and green text actions use thin strokes; desktop metadata and the search placeholder are also subdued. These merit measured contrast and enlarged-text checks. The screenshots alone do not establish a WCAG failure or pass.
5. **Profile’s location in navigation is ambiguous in the capture.** “Your Profile” is shown while Library is selected in the bottom bar, with no visible Profile destination there. This may reflect an intentional Library hierarchy, but the image does not communicate that relationship clearly.

## Limits and next review

The native Profile capture ends partway into Privacy and data, and the article capture does not show its complete bottom sources area. Those are viewport boundaries, not proof that content is inaccessible; scrolling, safe-area clearance and the remaining controls were not tested. There is no current web Profile screenshot in this set. Native dark theme, large-text/reflow variants, keyboard/focus, TalkBack and physical-device behavior remain unreviewed here.

Static captures prove neither persistence nor Google success, cancellation, account switching, motion, timing, narration quality or playback. The delivery record’s functional test claims were read as separate evidence, not independently rerun. Preserve its open provider, performance, protected-503, rights and release gates. Owner visual acceptance remains pending.
