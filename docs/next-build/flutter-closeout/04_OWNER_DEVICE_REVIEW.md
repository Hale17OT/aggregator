# Owner and device review — the checks an agent must not sign for you

Use this after the candidate build is stable. This checklist is not already completed. Record device model, OS, app build/flavor and review date; keep serial numbers and credentials private. The final package should link each task to its actual route, screenshot or installed APK.

## Review once, with specific decisions

The agent should first complete automated tests and inspect its own output. Ask the owner only for genuinely human or unavailable-platform checks, bundled into one session. An Android emulator is acceptable functional evidence, not proof of physical volume, touch feel, battery behavior or an iPhone experience.

### A. Appearance and motion — approximately 5–8 minutes

Open Home in both the web reader and Flutter app. Check balanced left/right text margins, readable masthead, long titles and orderly supporting stories. Select a category and search; the publication layout should stay coherent while the articles change.

Turn forward and back through headline pages. Does the paper bend/settle convincingly rather than flip like a flat card? Is the interaction responsive and is the reduced-motion alternative straightforward? On the phone, verify that page turning does not hijack system Back gestures or ordinary article scrolling.

Open Clips. Is the picture genuinely centered and fitted to the available height? Are captions and source actions readable? Do the native menus and interest tiles feel like the same product rather than generic defaults?

Record: **accept / needs changes**, with screen/build and the specific problem. Do not use a blanket approval to close listening or security checks.

### B. Radio on a physical Android device — approximately 5–7 minutes

Install the local-demo APK using the supplied device-specific instructions and scoped ADB connection to the running local backend. The desktop services must remain available; this is not an internet deployment. Choose only your intended debugging device.

Start an edition. Drag the actual volume and story knobs; test their small increment alternatives. Distinguish app-volume gain from the device's physical volume controls. Confirm that changing a chapter previews first and commits deliberately.

Navigate to an article while listening. Lock the screen for at least one minute. Use actual notification/lock-screen pause and resume, then return to the same recording position. Test the sleep-at-story-boundary behavior near a boundary. Audio should not double or unexpectedly restart.

Using your available headphones, disconnect them and confirm the designed pause behavior. Perform interruption testing through permitted test controls or a normal incoming interruption you can safely arrange; the agent must not place calls to real people as a test. A manually paused recording must not resume unexpectedly after interruption.

Record actual behavior. OS force-stop is not expected to sustain playback; reopening should be safe and normally paused.

### C. Listening and presenters — approximately 5 minutes

Use real speakers/headphones, not silent screenshots. Listen to one Radio excerpt, a presenter handoff and a clip containing footage/commentary. The agent should provide exact timestamps and direct playback links.

Judge voice clarity, pronunciation, unnatural pauses, clipping, loudness transitions, speech/media balance and perceptual lip-sync. Compare the requested solo/duo/treatment selection with what actually plays. Captions should remain intelligible and sources accessible.

Loudness analysis, decoded frames and non-silence checks do not answer these subjective questions. Mark each excerpt **acceptable / specific issue**, with timestamp. The 23 originals are preserved; a content/voice defect can require a separately approved media-revision task rather than silently replacing an immutable file.

### D. TalkBack / other screen reader — approximately 5–8 minutes

Use TalkBack on Android, VoiceOver on iOS only if available, and the appropriate desktop screen reader for any web claim. Test the real spoken interaction, not just a screenshot of semantics.

Traverse the masthead, topic controls and first article. Open and close evidence; follow a citation and return. Select an interest tile and hear its state. Adjust the radio through accessible actions, play/pause once, change a selector and dismiss it. Open a clip, access its transcript and leave it.

Check meaningful labels, logical order, no duplicated announcements, no hidden focused controls, correct role/value/selection, and no trapped modal. Turn on large text and reduced motion. Report platform-specific results; passing TalkBack does not pass VoiceOver automatically.

### E. Member confidence check — approximately 3 minutes

Use the same test account in native and web. Save a story and modify an interest on one, refetch the other, and confirm the same values. Sign out on the app; account content must clear locally. Do not assume signing out one session revokes every other session unless that is an actual product action.

The agent should already have tested concurrency, restart, ownership and revoked sessions. This is a short user-confidence check, not a replacement for those tests.

## Gate record template

```text
Gate:
Build / source / APK fingerprint:
Platform / device / OS:
Reviewer (owner, named tester, or agent):
Date and scenario:
Evidence / timestamp:
Result: ACCEPTED | NEEDS CHANGES | NOT RUN | BLOCKED
Specific finding:
Required next action:
```

## Native Figma and iOS

Figma closes only when the existing file contains actual editable components/screens and the owner or authorized designer has the real link. An SVG handoff alone leaves native Figma pending.

iOS requires a separate macOS/Xcode build and applicable simulator/device checks. The Android APK, shared Dart tests and iOS source tree cannot substitute. Store signing, verified domain association, external email and publication remain outside this local run.

## Owner summary

End the session with a short verdict: what you accept visually, which listening/performance defects remain, what was actually tested on your device, and what still needs a different platform or tooling. Avoid “all approved” when only a screenshot was reviewed.
