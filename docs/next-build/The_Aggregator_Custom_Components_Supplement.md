# The Aggregator — custom components supplement

Add this task to the current Radio-knob and presenter-performance work.
This supplements that task; it does not cancel, replace, or restart it.
Finish any in-progress coherent change safely, then integrate this pass
into the same execution plan. Do not start a competing implementation
against the same files.

The buttons are already acceptable. Now bring the OTHER existing controls
to the same design standard: especially dropdowns, selection controls,
inputs, switches, menus, overlays, and feedback states.

Custom means a complete, intentional appearance AND working interaction.
A styled closed select with an untouched browser-default popup does not
fulfil the enhanced dropdown requirement. An attractive component gallery
without adoption on the actual pages does not complete this task either.

## 1. Preserve the product and current work

Inspect AGENTS.md, the latest project status, current Vue components,
tokens, and the actual running pages. Use the latest state rather than
historical reports that describe now-implemented features as missing.

Preserve the accepted buttons, newspaper layout, blackletter masthead,
article opening, current radio cabinet, presenter/video work, and themes.
Do not impose radio-style skeuomorphic hardware on ordinary account forms.

Keep the retained database, account/member data, root audio element,
prepared-video playback, captions, source links, and ownership rules.
Do not remount a media player because a settings popup opens.

Staff/MFA remains paused. No database reset, unnecessary migration,
duplicate supervisor, paid service, remote push, publication, or deployment.
Do not add pricing, billing, tiers, or unrelated account features.

## 2. Audit real controls before choosing components

Inspect Home/topic/search, Article/evidence, Radio, reader Newsroom,
Sign in, My library, and Preferences. Cover actual current functionality.

Create a concise inventory with:
- Page and control.
- Current implementation and purpose.
- Proposed shared component.
- Real data/action it connects to.
- States and verification needed.
- Any intentional native control or deferred exception.

Prioritize existing edition/voice/rate/sleep selectors; topic/search
filters; anchor preference; account actions; preference inputs/toggles;
and existing dialogs/disclosures. Confirm which of these actually exist.

Do not create controls or fake options just to fill the inventory.
Do not add a calendar, upload manager, rich-text editor, command palette,
data grid, password field, or staff screen without an existing need.

## 3. Use shared Vue primitives, not a second design system

Reuse suitable primitives already installed. If the project lacks a
reliable foundation for select/combobox/menu/dialog behavior, evaluate
Reka UI's unstyled Vue components and current Nuxt/SSR guidance:

https://www.reka-ui.com/docs/overview/introduction
https://www.reka-ui.com/docs/components/select
https://www.reka-ui.com/docs/components/combobox
https://www.reka-ui.com/docs/guides/server-side-rendering

Use one compatible approach, import only what is needed, and wrap it in
our existing component namespace. Record versions, license and audit
impact for any dependency change. Do not install multiple competing kits.

Keep the Nuxt/Vue/TypeScript stack. No React migration, copied React
components, default third-party theme, or wholesale CSS reset.

Custom visual design does not require rebuilding native text editing,
checkbox behavior, focus management, or positioning from scratch.
Preserve native inputs where useful; implement the branded surfaces
around appropriate semantics. Do not replace everything with divs.

Use WAI-ARIA patterns according to the actual interaction:
https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

A value selector, an action menu, navigation links, and a modal dialog
are not interchangeable just because they all display a floating panel.

## 4. Extend the accepted visual language

Derive tokens from the current button system and themes:
- Manrope for control text; blackletter remains masthead-only.
- Warm-paper/surface fields with restrained borders and depth.
- Forest interaction emphasis and existing selected-state colors.
- Separate dark surfaces, readable boundaries and established focus color.
- Consistent icon strokes, label spacing, radii, and field heights.

Begin with the existing roughly 44px control height and 7px radius.
Use comfortable option-row targets, readable labels, and aligned chevrons.
Adapt intentionally for compact toolbars without overlapping touch areas.

Make fields feel gently inset and floating panels elevated. Do not give
every option, checkbox, and text field the button's raised lower edge.

Provide semantic aliases for field, placeholder, border, focus, invalid,
popup, hover, selected, disabled and feedback states. Avoid literal colors
scattered across pages. Essential labels must not depend on placeholder
text, low-contrast grey, tiny type, or color alone.

## 5. Dropdowns and comboboxes — first priority

Build a reusable select with a fully designed trigger AND open panel.

TRIGGER
Show the current value, persistent external label where needed, chevron,
focus, open, disabled and invalid states. Reserve indicator space so text
and icons do not jump. Let meaningful long values wrap when necessary.

PANEL
Use our surface, restrained shadow, border, sensible padding, and aligned
option rows. Distinguish keyboard highlight, committed selection, and
disabled state. Selected items receive a check mark plus visual emphasis.
Allow descriptions only when useful; do not put nested interactive
buttons, links, or preview players inside listbox options.

Support grouped items only where the data needs them. No search box in
three-item selectors. Use a searchable combobox for genuinely longer
existing lists; implement clear query, no-results, empty, loading, retry,
and unavailable-value states as applicable. Ignore stale async results
and preserve normal text editing and IME composition.

BEHAVIOR
- Open through pointer and the chosen pattern's keyboard controls.
- Support arrows, typeahead where appropriate, and sensible first/last
  navigation according to the selected primitive's documented behavior.
- Keep the highlighted item visible when the list scrolls.
- Separate exploration from commitment; do not start playback or submit
  preferences merely because an option receives keyboard highlight.
- Commit deliberately, dismiss with Escape, and preserve the previous
  committed value when cancelling this selector.
- On Escape return to the trigger; on Tab allow logical onward traversal
  rather than forcing focus back and trapping the user.
- Handle outside interaction, disabled options, empty lists and a selected
  option becoming unavailable without silently choosing something else.
- Keep controls and selection usable by touch as well as mouse.

POSITIONING
Prevent clipping by the radio cabinet, article containers, sticky player,
or transformed parents. Use a supported portal/positioning boundary,
viewport collision handling, scroll limits, and an explicit layer scale.

Ensure portalled controls retain the correct theme. Inside dialogs, keep
popup content inside the appropriate focus/inert boundary rather than
teleporting it somewhere the parent dialog makes inaccessible.

At 320/390px, adapt the popup to available space and the virtual keyboard.
A sheet is acceptable for complex mobile selection when implemented as
an actual labeled modal with correct focus behavior—not a CSS-only
repositioning that leaves desktop semantics broken.

Preserve native/server fallbacks where existing no-JavaScript forms use
them. Show one active control, one submitted value, and one accessible
name; do not leave both the fallback and enhanced control tabbable.

## 6. Complete the other component families in actual use

A. TEXT AND SEARCH FIELDS
Create shared field layout, input/search/textarea treatments where used.
Include label, hint, required/optional treatment, error, clear action,
focus, disabled and appropriate read-only states. Keep native input types,
autocomplete, autofill, selection, copy/paste and Enter submission.

Style the existing email-link sign-in flow; do not introduce passwords.
Show real validation failures without clearing the entered email. Never
put sensitive sign-in links or tokens into screenshots or test reports.

B. CHECKBOXES, SWITCHES AND RADIO GROUPS
Use custom faces and tracks with proper underlying semantics, labels,
keyboard operation and adequate targets. Use mixed checkbox state only
where the application actually has one. An off switch is not a disabled
switch. Label meaning must remain stable when the value changes.

Use switches for existing binary settings and radio/segmented choices
for exclusive small sets where appropriate. Preserve the existing
Standard/Brief URL links: do not turn navigation into JavaScript tabs.

C. MENUS AND POPOVERS
Refine existing account and item-overflow surfaces. Actions remain
buttons; destinations remain links. Use menu semantics only when the
full menu interaction is implemented; an ordinary navigation disclosure
can retain ordinary links. An option selector must not become a menu.

Give command groups, separators and destructive actions clear hierarchy.
Do not invent destructive actions. Do not use a nonfunctional action to
show off a menu. Escape dismisses the topmost applicable surface without
also dismissing its parent or activating a media shortcut.

D. DIALOGS, DRAWERS AND CONFIRMATIONS
Refine existing evidence/settings/confirmation surfaces only where the
current product calls for them. Preserve inline/link alternatives.

Modal surfaces need a visible title, deliberate initial focus, contained
keyboard focus, inert background, a close/cancel action, and correct
focus restoration. Nonmodal panels must not acquire a blanket focus trap.

If replacing browser alert/confirm for an existing action, preserve its
cancellation, pending, failure, and successful-operation behavior.
Never show success or remove records before the server confirms success.
Do not add a second confirmation where none is needed.

E. TOOLTIPS, FEEDBACK AND DISCLOSURES
Use tooltips only for supplementary short explanations, available on
focus as well as hover and dismissible without losing context. Essential
instructions and errors remain visible without hover. Interactive help
belongs in a suitable popover, not a tooltip.

Create consistent inline status/error/notice treatments and restrained
toasts for existing actions. Announce meaningful results once; do not
move keyboard focus to routine toasts. Critical failures remain readable
until addressed. Never make an ephemeral toast the only source of an error.

Style existing accordions, applied-filter chips, queue feedback, and
pagination where present. Do not collapse the mandatory bibliography.
Keep skeletons tied to real loading, with reduced-motion handling.

F. MEDIA-ADJACENT CONTROLS
Unify existing selectors and range styling around the Radio and Newsroom.
The in-flight knob task owns rotary interaction: share its state instead
of building a competing volume/chapter implementation.

Preserve native video controls, captions and fullscreen. This pass must
not replace the media player or regenerate broadcast files merely to
change the surrounding website controls.

## 7. Connect choices to real state and existing APIs

Migrate actual instances, not only a development specimen.

Radio: supported edition, rate, voice and sleep choices must control the
existing player. Opening or highlighting options must not reload audio,
start generation, unmount the root player, or change chapters.

Newsroom: use only existing prepared variants/voices. Changing a selected
format must preserve the established pause/story-boundary/revision rules.
Do not imply the media-treatment preference has gained alternative
prepared programmes when the existing fallback is still required.

Library/Preferences: keep durable member ownership, opt-in history,
queue behavior, validation, lockVersion/conflict handling, and logout.

Keep draft form values separate from saved values. Preserve each form's
existing immediate-save or explicit-Save contract. Do not silently change
when a preference is committed merely to fit a new component.

Display pending/saved/error from real responses. Prevent duplicate writes
and stale responses from overwriting newer user intent. On failure or
409, preserve the user's draft and provide a safe retry/reload resolution;
do not erase it or silently overwrite another saved revision.

Public search/filter URLs, direct navigation and Back behavior remain
functional. Controls do not authorize anything: server validation,
permissions and CSRF stay unchanged.

## 8. Motion and interaction coordination

Use restrained CSS transitions or existing Motion for Vue for popup
presence, selected indicators and appropriate drawers. Start around
120–180ms for small control transitions; adjust by actual inspection.
Avoid springy menus, bouncing options, blurred labels, and decorative
movement that slows selection.

Use AutoAnimate only for suitable chip/queue/disclosure changes. Do not
animate or reorder options under the pointer or keyboard focus, and do
not assign two animation systems the same layout property.

Respect both system and saved reduced-motion preferences. Do not delay
focus placement or selection until an animation finishes. Closing panels
must not leave invisible focusable content or orphaned overlays.

Suspend global player shortcuts while the user is typing or operating
an applicable menu/dialog. Space and arrow keys inside a selector must
not also pause Radio, seek video, or adjust the hardware knob.

## 9. Figma and implementation coverage

Use the existing native Figma file and component/token conventions when
the bridge actually supports editing. Update existing instances without
overwriting unrelated or in-progress work. Preserve prior review states.

If the bridge remains unavailable, continue local implementation and
supply component/state specifications and actual captures; mark native
Figma work pending. Do not claim a Figma deliverable from screenshots.

A development-only specimen may cover long labels, empty/error states
and difficult combinations, but the same components must appear in
Radio, Newsroom, Search, Sign in, My library, and Preferences as applicable.
Keep the specimen absent from the built public application as before.

## 10. Verification and completion

Add focused tests to the existing controls suite or an appropriately
named companion. Use real pointer/keyboard sequences and actual forms;
setting component values programmatically is not interaction evidence.

Verify:
- Opening, selection, cancellation, typeahead/search, disabled/empty/error
  states, and scrolling through long option lists.
- Correct focus/labels/values and no duplicate enhanced/native controls.
- Menus near viewport edges, inside dialogs, over the mini-player, and
  next to the radio cabinet; no clipping or theme loss through portals.
- Nested Escape handling, outside interactions, and route-change cleanup.
- No accidental playback or global shortcut activation while typing.
- Real persistence and playback changes after commitment, including API
  failure, session expiry, slow responses and preference conflicts.
- 320/390/834/1440px, both themes, 200% text, long labels, reduced motion,
  forced colors, keyboard operation and emulated touch.
- Supported no-JavaScript reading/forms and no new hydration warnings.
- Root playback continuity, direct radio-knob behavior, source links,
  complete bibliographies, sign-in and member regressions.

Measure rendered contrast and inspect actual pages and open popups.
Run available accessibility checks; record unperformed screen-reader or
physical-device checks instead of claiming universal conformance.

Use test accounts and isolated test data. Do not clear retained member
records to test destructive confirmations. Use owned supervisor commands
for any required rebuild/restart, never an untracked duplicate server.

Update the component inventory, tokens, handoff, project status, tests,
and a concise migration checklist. Record any deliberately retained native
control with its reason. Do not conceal unfinished replacements.

Deliver before/after page-context captures, open-dropdown Light/Dark
captures, a short real selection/validation interaction recording, changed
files, exact verified commands, and remaining limitations. This is new
component evidence, not reopening the cancelled button-review packaging.

START with one excellent custom select, then apply it to the actual Radio
and Preferences selectors. Complete the remaining in-use component
families and integrate them with the ongoing knob/presenter improvements.
Do not stop after a plan, a package installation, or a component gallery.
