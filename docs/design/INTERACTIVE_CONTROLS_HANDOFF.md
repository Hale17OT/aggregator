# Existing control refinement — 13 October 2026

The owner accepted the corrective cabinet/presenters as a better direction, then requested direct hardware, performance and existing non-button controls refinements. General buttons remain accepted sufficiently to continue; cancelled button packaging is not reopened. Native Figma work is PENDING: these source components, specifications and browser captures are not native canvas edits.

## Component inventory and adoption

| Component / family | Actual instances | Behavior / retained semantics |
|---|---|---|
| RadioDial | Radio volume and Story faces | 56px visible face, relative 270° drag, primary pointer capture, 18% center dead zone, clamped stops, cancellation, arrows/Home/End/Page keys, 44px step buttons and native range alternatives. Story previews until release; volume applies immediately. |
| ControlSelect / Reka Select | Radio edition/speed/sleep; Newsroom format/video speed; Search Desk; Preferences theme/text/speed/presenters/voice/media | Designed trigger and portalled popup, checkmark, highlight, disabled options, typeahead, collision bounds, scrolling. Escape cancels/restores trigger, Tab closes and advances. SSR/native fallback until hydration; named GET field retained. |
| ControlCombobox / Reka Combobox | My library Story / Prepared programme | Searchable local choices, native text editing/IME, empty/filter state, clear search, keyboard/pointer selection. Selection changes only intended draft. |
| Native fields + shared field tokens | Search query, Sign in email, member forms | Label, visible focus, autofill/type=email/validation and form semantics retained. No custom password or fake credential field. |
| ControlSwitch | Preferences reduced motion / listening history | Native checkbox with switch semantics, native label/click/Space, visible custom track/focus/disabled state. |
| Feedback | Sign in, member save/errors, programme failures | Existing live status/alert semantics, shared visible panel; no optimistic success before response. 409/503 preserve drafts; slow save disables edits and duplicate submission. Reload is explicit and guarded against stale/unmounted responses. |
| AutoAnimate queue | Radio guest queue only | 150ms additions/removals/reorder, stable entry identity including duplicate editions. Disabled for OS/app reduced motion and focus inside the queue. Reorder restores focus to a usable control on the same row at a stop. |
| Retained native / existing | Ranges, video controls/captions, details/summary, Standard/Brief links, sources and navigation | Browser accessibility and semantic URL/source behavior. No invented app menus, dialogs, radios or segmented actions where none exist. Existing destructive actions remain unchanged. |

## Tokens and states

`apps/web/app/assets/fields.css` owns field/popup surface, text, muted text, control border, focus, invalid, disabled opacity, inset, selected/highlight and popup shadow/layer tokens. Existing base theme tokens remain authoritative. Light and Dark portals inherit from the document root. Field min-height 44px, radius 7px; popup radius 9px, collision padding 12px, max-height 360px; option min-height 44px. Motion 140ms, disabled for OS or saved reduced motion. Forced-colors uses system borders/highlights. Nothing animates dial physics or broadcast frames through AutoAnimate.

Current/default, focus, open, highlighted, selected, disabled, empty/unavailable, filtering, invalid, loading, success and failed/conflicting-save states are represented by shared components plus existing page state. Selected and highlighted remain distinct. Popup clipping/theme, 320/390/834/1440 reflow, actual member forms and 200% text were exercised. Six rendered text measurements: 8.88–16.61:1; this is scoped contrast evidence, not a whole WCAG certification.

## Migration checklist

- [x] Preserve cabinet/newspaper/general controls and root media element.
- [x] Replace actual in-use select instances, not only a gallery; searchable Library choices.
- [x] Keep SSR native fallback, labels, named Search GET value and source links.
- [x] Preserve durable member contracts; explicit Save, conflict/error draft retention, loading guards.
- [x] Record pointer-operated knobs and actual selection/validation separately from showcase.
- [x] Inspect Light/Dark popup captures on real pages; preserve built-app absence of the old development specimen.
- [x] Review Reka/AutoAnimate license/dependency additions; retain audit findings.
- [ ] Native Figma component/instance updates: bridge unavailable.
- [ ] Physical touch, screen-reader, Safari/Firefox and subjective speaker-volume review.

No app dialog or nested dialog/menu is currently present, so those composition scenarios were not verified or fabricated. Long-label/empty behavior is implemented, but a synthetic exhaustive component-state gallery and cross-platform IME audit were not run. Actual available lists, keyboard ends/typeahead and searchable empty results were exercised. Built video motion cannot be removed by CSS reduced motion; transcript/audio alternatives remain available.

Evidence and changed-file map: [review checkpoint](../execution/INTERACTION_PERFORMANCE_REVIEW.md). Captures: `output/playwright/interactive-controls/`; shared tokens remain code-native pending actual Figma access.


## Reader correction — 14 October 2026
Owner requested refinement, not new acceptance. Primary format navigation now Home / Radio / Newsroom / Clips; topic browsing is a separate Home scope strip. Shared Home/masthead logical insets32px desktop,18px narrow phones; actual briefing and last-column edges measured. Search and category retain Home rather than DiscoveryListing; old routes canonicalize losslessly.

MediaKey + existing ControlIcon supply a single18/22px SVG icon language with real names and hover/focus labels. Prepared Newsroom groups timeline, transport/mute, captions/rate/fullscreen within the stage; same video, native fallback, no duplicate muxed/WAV sound. Radio physical face and direct knobs retained; secondary skips/mute and persistent progress player use icons. Clips picture occupies an independent symmetric track; action rail does not shift its center. Narrow rail wraps. Picture height fits measured space beneath chrome; short windows deliberately use a smaller portrait.

InterestEditor is shared by onboarding, Your interests and Preferences. Group disclosure navigates; native checkbox tiles select explicit follows with forest surface/check, separate exclusions and team scope. Typed coveredBy annotations use existing ruleMatches, not navigation ancestry. Exact Manchester City team selection leaves Premier League unchecked. Saved/draft/conflict remain distinct.

paperFold is a600ms bounded inert clipped sheet with a progressing fold, underside gradient and moving contact shadow. Destination semantic HTML remains underneath; no canvas capture, new dependency or persistent media clone. Next advances right, Previous inverses; reduced motion skips and Escape/route/resize cancels. Actual normal-speed recordings and25/50/75% frames: output/playwright/reader-refinement/journeys.

Native Figma edits pending. Screenshots/browser functionality do not constitute owner visual/motion acceptance, subjective listening or screen-reader certification.
