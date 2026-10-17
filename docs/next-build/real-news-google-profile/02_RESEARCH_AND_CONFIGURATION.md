# Research and configuration decisions

Prepared 17 October 2026 for the existing Aggregator web/Flutter project. These are researched implementation decisions, not evidence that a Google client, provider account, live adapter or APK has been created. Recheck live documentation and the installed dependency versions when executing.

## Existing project evidence versus this new authorization

The supplied 16 October targeted closeout describes a native Flutter app with a captured-mail/browser approval handoff, protected app credentials, a retained database with 12 migration checksums, and 23 renditions/93 preserved files. It also records an intermittent account-tuple lock timeout, an older unexplained media incident and existing performance/review limitations. These are user-supplied checkpoint facts, not independently retested here. Inspect the repository's newer canonical status before writing.

The new request authorizes real news, Google configuration/sign-in and Profile. It does not supply publisher contracts, external SMTP permission, an Apple developer account, a deployment domain, a cloud budget, or editorial approvals. The master prompt permits a useful live publisher-content lane while leaving synthesized drafts subject to the existing editorial rules. It does not freeze the entire product behind those rules or pretend they are already satisfied.

## Native sign-in is not an embedded website

Android Credential Manager supports provider-owned account selection and a persistent Sign in with Google button. Account addition or security challenges may still invoke Google/system UI. The target is no Aggregator website/Chrome handoff for normal native sign-in—not suppressing provider security controls. [R01, R02]

Use the maintained Flutter Google Sign-In integration where it fits the existing stack. Its Android configuration requires the appropriate registration and a web client ID as serverClientId when not using Google-services registration. A misconfigured package, signing certificate or serverClientId may look like cancellation; do not diagnose every canceled result as deliberate user input. Firebase is optional, not a required replacement of the existing backend. [R03, R04]

There is a concrete lifecycle issue to resolve before writing nonce code: the reviewed Flutter API exposes nonce on initialize(), whose contract is exactly-once initialization, whereas authenticate() does not expose a nonce argument. Do not invent an API or repeatedly reinitialize it. Use a supported flow or a narrowly scoped platform adapter for a fresh per-request nonce; verify repeat sign-in/cancel/sign-out in one process. [R05, R06]

The iOS SDK presents authentication using a system authentication session through the presenting controller. It is not legitimate to promise a Flutter-owned form for Google's password/consent UI, or to replace it with WKWebView. Windows-only configuration cannot establish a working iOS build. [R07, R08, R09]

The app's own email option can complete with code entry in Flutter. That is a proposed extension of the existing auth_challenges system, not a claim that external email is configured. The master prompt retains captured mail only for testing and makes real native Google the primary usable external identity flow.

## Google Console configuration

Use the owner's already-open Google Auth Platform console through the actual connected browser. This response has not inspected that account or made changes in it.

| Resource | Derive from | Configuration intent |
|---|---|---|
| Web OAuth client | Actual frontend origin and chosen callback flow | GIS origin(s) and backend identity audience. Add redirects only where used. |
| Android OAuth client(s) | ApplicationId for each authorized build flavor plus signing certificate SHA-1 | Registration of the actual installed application; no APK-file hash substitution. |
| iOS OAuth client | Existing bundle ID | Platform client, reversed-client callback scheme, and server client configuration. |
| Consent/branding | Selected project and actual owner-provided app/contact data | Minimum identity scopes; testing status where applicable; no fabricated deployment/legal details. |

Google distinguishes JavaScript origins from full redirect URIs. Its client-management rules allow localhost/IP exceptions to normal secure-origin rules; the application's own origin and cookie policy must still match exactly. Client-setting propagation can take time, so repeated duplicate client creation is not a debugging strategy. [R10, R11]

Do not enable People/Gmail/Drive/YouTube APIs just to authenticate a reader. Scope examples in SDK sample applications are not requirements for this product. OAuth clients identify the application; they do not independently authorize source reuse.

The standard button branding is a permitted exception to the otherwise custom button family. Keep the Aggregator A branding around it, without altering Google's logo. [R12]

Public client IDs may live in appropriately scoped configuration; client secrets belong only in protected server configuration where actually needed. Native apps must never receive a web client secret. No configuration artifact should contain a captured token or Google account screenshot.

## Shared backend account model

Validate token signature, expected issuer/audience, expiry and the chosen request binding before issuing an Aggregator session. Use verified subject identity rather than email as the durable provider key. Google's guidance also distinguishes Gmail/Workspace authority from third-party email addresses; email_verified is not universal proof of continued control of an external mailbox. [R13]

Explicit linking, separate provider/app revocation, optimistic profile updates and last-method protection are project security decisions. Neither a connected Google account nor a Console-owner role satisfies paused staff/MFA gates. Verify cryptography/network responses outside locked account transactions and serialize only the necessary account/session writes.

Apple's current App Store login-services rule needs a separate release review when adding social login. It is not closed by creating an iOS client ID or by ordinary email login alone. This run does not automatically implement another provider or submit an app. [R14]

## Real-source starter assessment

Licensing suitability and editorial credibility are separate. This list is a practical starter set, not an assertion that it provides comprehensive global coverage or that all its claims are independently corroborated.

| Candidate | Useful starting role | Checks before use |
|---|---|---|
| Global Voices | Original international/context reporting; clearly attributed publisher stories | Its republication guidance permits sharing/adaptation with attribution. Credit author and original link prominently; verify original-versus-partner material and separate third-party audiovisual rights. [R15] |
| NASA | Primary announcements in space/science/technology | NASA's factual/editorial media-use guidance includes attribution and third-party exceptions. Inspect item ownership, endorsement constraints and content type; primary agency statements are not independent reporting. Its official feed catalogue provides discovery entry points. [R16, R17] |
| Wikinews | Published community-news material, tagged as such | Current policy assigns CC BY 4.0 to material published after 16 December 2024, older dates use different rules. Respect publication status, attribution and item/image exceptions. [R18] |
| Guardian | Disabled pending permission | [R19] |
| NewsAPI | Optional discovery with an authorized key/plan | Development-plan scope is restricted; full article text is not supplied and third-party rights still apply. No automatic paid upgrade or publisher scraping. [R20, R21] |

Global Voices also has an internal contributor AI policy. Do not confuse an internal editorial policy with either an endorsement of the Aggregator or automatic permission for every third-party asset. For the first reader lane, attributed original publisher material avoids presenting unreviewed generated prose as its journalism. [R22]

No source is enabled solely because it provides RSS. Retain purpose-scoped rights: metadata display, text reproduction, adaptation, synthesis, narration and visuals can have different outcomes. Licenses for text do not automatically cover photographs or embedded social posts.

Use fixed provider adapters, a bounded worker and actual network responses. The OWASP SSRF guidance supports explicit destination controls and DNS/IP validation; implement and test the actual connection path, not only a URL string allowlist. Keep these external-fetch restrictions distinct from local app/API/database and official Google identity traffic. [R23]

Do not extract YouTube audio or arbitrary captions into Radio. Link/embed display and derivative media use have different requirements, and the current catalogue should remain untouched in this run. [R24]

## Product decisions chosen for this run

- Default live mode displays eligible publisher content and exact original attribution in the existing newspaper; a clearly separate sample mode preserves the fictional catalogue and prepared media.
- No private extractive draft becomes a public article because a source license exists. Rights, semantic review and editorial approval are distinct.
- When rights allow only a headline/link, display that honestly; do not synthesize a body from a headline or manufacture a four-source bibliography.
- Freshness is publication/update time plus last successful refresh, not the time a feed was imported. Do not advertise exhaustive coverage of all topics or teams.
- Profile is a dedicated destination on both clients, using one member record and existing preference/taxonomy contracts. It is not a public social-network profile.
- Google is the primary real external login. Existing email flows remain tested, but captured mail is not external delivery.
- The app can retrieve public, permitted provider content locally without a production deployment. Public release, legal/operating-market review and commercial provider agreements remain separate.

## Primary references

R01. Android: About Sign in with Google — https://developer.android.com/identity/sign-in/credential-manager-siwg

R02. Android: Implement Sign in with Google — https://developer.android.com/identity/sign-in/credential-manager-siwg-implementation

R03. Flutter-maintained Google Sign-In — https://pub.dev/packages/google_sign_in

R04. Android plugin integration — https://pub.dev/packages/google_sign_in_android

R05. GoogleSignIn.initialize API — https://pub.dev/documentation/google_sign_in/latest/google_sign_in/GoogleSignIn/initialize.html

R06. GoogleSignIn.authenticate API — https://pub.dev/documentation/google_sign_in/latest/google_sign_in/GoogleSignIn/authenticate.html

R07. iOS Google Sign-In setup — https://developers.google.com/identity/sign-in/ios/start-integrating

R08. iOS Google Sign-In presentation reference — https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDSignIn

R09. Google OAuth policies — https://developers.google.com/identity/protocols/oauth2/policies

R10. Web GIS setup — https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid

R11. OAuth client management — https://support.google.com/cloud/answer/15549257

R12. Google sign-in branding — https://developers.google.com/identity/branding-guidelines

R13. Server token verification — https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

R14. Apple App Review Guidelines, Login Services — https://developer.apple.com/app-store/review/guidelines/#login-services

R15. Global Voices republication guidance — https://globalvoices.org/about/global-voices-attribution-policy/

R16. NASA media-use guidance — https://www.nasa.gov/nasa-brand-center/images-and-media/

R17. NASA RSS catalogue — https://www.nasa.gov/rss-feeds/

R18. Wikinews copyright policy — https://en.wikinews.org/wiki/Wikinews:Copyright

R19. Guardian Open Platform terms — https://www.theguardian.com/open-platform/terms-and-conditions

R20. NewsAPI terms — https://newsapi.org/terms

R21. NewsAPI plan and full-content information — https://newsapi.org/pricing

R22. Global Voices contributor AI policy — https://globalvoices.org/about/global-voices-policy-on-ai/

R23. OWASP SSRF prevention — https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html

R24. YouTube developer policies — https://developers.google.com/youtube/terms/developer-policies
