# Interests, entities and editions — implementation contract

Version 1.0 · 14 October 2026

This is a proposed product/data design, not a description of code already implemented. It supplements the master prompt. The JSON seed is an authored starting catalogue, not an upstream IPTC export or a database migration. Preserve current repository IDs through an explicit mapping during import.

## 1. Scope and catalogue breadth

The seed contains **24 browse groups and 390 authored topic concepts**, plus six named-entity examples (four real concepts and two deliberately fictional test concepts). Its hierarchy has a verified acyclic topic graph and allows a concept to appear under more than one legitimate subject. This does not claim that every club, company, person, country or conceivable news topic is bundled.

IPTC Media Topics is the external vocabulary to evaluate for broader news-subject coverage. Its maintained catalogue is available in machine-readable formats and is licensed CC BY 4.0. Preserve the official concept URI, checked revision, original label, attribution and mapping relation; a friendly local label does not create a new official IPTC term. The supplied seed has only one explicitly checked exact mapping (association football). All other mapping arrays are intentionally empty rather than guessed. [R01–R03]

The full external payload is **not bundled**. A direct download into this preparation environment failed, although the official browser-visible catalogue and JSON endpoint were inspected. Codex may download the official metadata under the master prompt's research permission, validate the shape/size/licence, save a hashed snapshot and import a reviewed mapping. Failure must leave the 390-concept authored catalogue working, with accurate coverage and attribution. Do not fetch an arbitrary mirror or claim an upstream import happened.

### Product browse groups and useful specificity

| Group | Representative scope from the supplied catalogue |
|---|---|
| World affairs | Diplomacy, international organisations, migration, development, humanitarian affairs, geopolitics. |
| Politics and government | Elections, legislation, public policy, local government, spending and accountability. |
| Business and economy | Economic indicators, inflation, companies, industries, startups, trade, manufacturing and consumers. |
| Markets and personal finance | Stocks, bonds, banking, currencies, digital assets, savings, pensions, taxes and payments. |
| Technology | AI, software, security, privacy, electronics, cloud, chips, robotics, open source and accessibility. |
| Science and space | Space, astronomy, physics, chemistry, biology, Earth/ocean science, mathematics and research. |
| Health and medicine | Public health, research, healthcare systems, medicines, patient safety, access and health-policy reporting. |
| Climate and environment | Climate, conservation, biodiversity, pollution, water, waste, forests and environmental justice. |
| Energy | Renewables, grids, storage, oil/gas, nuclear, efficiency, access and transitions. |
| Sports | Football, basketball, American football, baseball, cricket, rugby, tennis, motorsport, athletics, cycling, hockey, golf, combat/winter/water sports, para sport and governance. |
| Arts and culture | Visual arts, books, theatre, dance, architecture, design, museums, heritage and photography. |
| Entertainment | Film, television, music, streaming, animation, comedy, awards and live performance. |
| Gaming and esports | Games/platforms/development/accessibility and competitive genres. Esports also has a legitimate Sports parent. |
| Education | Schools, higher/vocational/adult education, policy, teaching, access and educational technology. |
| Society and communities | Human rights, inclusion, families, demographics, religion/belief reporting, community and social services. |
| Law crime and justice | Courts, criminal/civil justice, policing, regulation, public safety, cybercrime and investigations. |
| Conflict defence and security | Conflict reporting, peace, defence policy, arms control, peacekeeping and civilian protection. |
| Weather disasters and safety | Forecasts, extreme weather, earthquakes, floods, fires, preparation, response and recovery. |
| Cities housing and transport | Housing, planning, public transport, roads, rail, aviation, ports, infrastructure and local services. |
| Work and careers | Labour markets, rights, workplace, skills, professional development, employment and industrial relations. |
| Food and agriculture | Farming, supplies, food security/safety, fisheries, livestock, cooking, food culture and rural economies. |
| Travel and destinations | Destinations, tourism, transport, hospitality, responsible/outdoor/cultural and accessible travel. |
| Lifestyle and wellbeing | Fitness, home, gardening, fashion, parenting, relationships, hobbies, pets and everyday wellbeing. |
| Media and internet culture | Journalism, press freedom, verification, creator economy, social platforms, advertising and publishing. |

These are browse-friendly editorial categories, not immutable universal partitions. Navigation may show a concise subset plus Browse all; do not turn the masthead into 24 tabs. Health, financial and political **news topics** do not authorise advice, inferred identity labels or targeted persuasion.

## 2. Concepts are not all the same kind of thing

Use a canonical concept record or equivalent strongly constrained existing model with `kind`: topic, competition, team, organisation, person, place. A useful interface is not a requirement to use these exact table names.

**Topic edges** express broader/narrower subject scope. Keep a direct-edge table and derive bounded transitive closure only for genuine taxonomy edges. Reject self-links and cycles. Validate a full batch transaction before publishing a taxonomy revision. If mapping to SKOS, `broader` is the direct relation and its transitive closure is a separate concept; do not claim every associative relationship is an ancestor. [R07]

**Entity relations** express part-of, sport, participates-in, located-in, or other specifically approved meanings. Each type has allowed source/target kinds. A participation relation records its season or known validity interval, source and checked date. Unknown validity is unknown, not an invented expiry date. An entity may belong in multiple navigation paths without changing its ID.

**Article associations** connect the specific article version to a material subject/entity, with asserted or derived origin, relevance (primary/supporting/context), source of classification and classification revision. Incidental words in a citation or boilerplate are not enough for personalization. A subject-classification change invalidates affected new feed snapshots, not the historical article's evidence digest unless the underlying editorial contract includes classification.

Keep geography, format, language and story type separate from subject ancestry. A story can be Football + Manchester City + England + English + video. No need to duplicate its topic IDs for each format or language.

## 3. The football example, exactly

The supplied researched browse path is:

`Sports → Football (soccer) → Premier League → Manchester City — men’s first team`.

Premier League is a competition; Manchester City is an organisation; the men's first team is a team. The supplied official Premier League and UEFA pages support the limited cross-competition example checked on 14 October 2026. They are metadata sources, not permission to use logos, match footage or reporting. [R04–R06]

The season-scoped navigation edge must not freeze the team permanently into that league. Promotion/relegation, rename, rebranding or a different competition should not destroy existing follows. Club-wide follow includes intentionally linked teams when supported; following the men's first team does not silently subscribe to women's/youth teams, and vice versa. Do not label “all Manchester City” while saving a men-only preference.

The seed deliberately does not claim a complete current Premier League directory. Expand from current official records when verifiable; preserve checked dates and report partial coverage. Never derive current membership from an old roster or page title alone. Other sports can add their competitions/teams via the same data contract, not new hardcoded Vue branches.

“Man City” is an organisation alias. Search can show that club plus distinctly labelled available teams; the user chooses the target. Similar names and sponsor renames need disambiguation, stable IDs and aliases. Do not match every concept containing “City”.

## 4. Follow and exclusion semantics

A stored explicit rule has owner, target concept, action (follow/mute), optional supported context, created/updated time and concurrent revision. Ownership is verified server context, not a submitted user ID. Reuse existing follows where possible; permit one well-defined rule per owner/target/context rather than duplicate conflicting rows.

| User choice | Include | Do not infer |
|---|---|---|
| Follow Sports | Material sports stories within genuine subject descendants. | Their country, favourite team or an interest in every unrelated business article mentioning sport. |
| Follow Football | Material football subjects, including valid football-associated competition/team stories. | Basketball; every story from a source that sometimes covers football. |
| Follow Premier League | Stories materially about that competition. | Every non-league event involving one of its teams. |
| Follow Manchester City men | Material stories about that team across competitions. | All other league clubs, every women's/youth squad, or league-only filtering. |
| Follow team only in Premier League | Explicit team AND competition associations. | An automatically inferred restriction from the browsing route. |
| Follow broad category plus one leaf | Union of explicitly followed interests. | Two copies of the same story or a doubled score for the same evidence. |
| Mute Football | Exclude material football stories from For you/Clips personalization. | Removing bookmarks or deleting the account's other preferences. |
| Hide story | Exclude that canonical story from the personalized edition. | Muting the whole topic or deleting the article for everybody. |

A positive follow does not silently override a mute. If the user follows a child inside a muted branch, show the conflict and offer explicit removal of the blocking mute; otherwise keep the exclusion effective and explain it. Do not automatically mutate unrelated preferences. For multiply classified stories, a material muted subject/entity excludes the story even if another followed tag matches. Ignore merely incidental/context tags for this purpose.

Removing a broad follow removes that explicit rule, not separately followed children. The UI should distinguish “all of Sports followed” from “some interests inside Sports followed”. Expanding a group is not selecting it. Do not silently convert selections into hundreds of saved leaf rules; future descendants should be handled by the defined parent-follow semantics.

Rules apply to personalized surfaces, not access control. Top stories remains a clearly labelled editorial route; private preferences are not used to block a direct article URL. Existing permission, withdrawal and publication restrictions apply everywhere independently.

## 5. A deterministic first ranking implementation

Do not introduce a recommendation-model service. Use a small auditable rule engine and expose explanations.

1. Retrieve only currently eligible public/demo article projections; never private drafts. Respect the requested actual filters/snapshot and current rights.
2. Collapse variants/formats by canonical story identity, choosing the current available editorial version. Do not deduplicate independent events solely because their names are similar.
3. Apply explicit story hides and material subject/entity mutes.
4. Find explicit follow matches: team/organisation/person/place or scoped compound match; competition; specific topic; broad root. Topic expansion uses the topic graph and vetted article classification. `participates_in` alone does not turn team-only news into competition news.
5. Rank by a documented configured match-specificity class, then publication/cutoff freshness and existing editorial order; use stable ID as final tie-breaker. Use the **best** applicable match, not unlimited additive boosts for tag stuffing.
6. A small deterministic diversity pass can cap repeated subtopics per spread when other matched stories exist. Do not add unmatched items to satisfy diversity or describe this as a neutrality guarantee.
7. Build one stable edition snapshot. Persist or securely encode enough bounded ordering/version context to reload it. Link the applicable taxonomy, interest and catalogue revision. New changes create a new snapshot; they do not shuffle the one being read.
8. Return reason codes and visible labels actually supported by the matched rule, such as `followed_topic`, `followed_entity` or `followed_competition`. Avoid confidence/probability numbers.

The exact class weights, if numeric, belong in an explicit config with tests rather than unexplained magic constants. Deterministic reasons and correct scopes matter more than a superficially sophisticated scoring formula.

**Sparse inventory:** For you must not silently turn into Top stories. Offer a labelled general-news alternative or an empty coverage state. A zero-count topic is still selectable for future coverage; never fabricate content to fill it.

**Privacy:** explicit interests persist independently of passive history consent. Do not derive sensitive identity attributes from reading or follow choices. Do not send the follow graph to an analytics/provider API. Keep personalized URLs opaque and account-scoped, response caching private, logs minimal, and Clear interests independent from Clear history and account deletion.

## 6. Onboarding and state transitions

New authenticated account starts `not_started`; entering setup may record `in_progress`. Save with zero or more explicit valid interests commits selections and `completed` atomically. Skip records `skipped` and leaves editorial default. Opening a page or token-preview GET never marks completion. Invalid saves preserve drafts and return safe errors. Replayed completion is idempotent under an appropriate expected revision.

For older accounts, use a migration-safe legacy marker or equivalent eligibility logic. Preserve existing settings; offer a dismissible invitation rather than a forced repeat. Taxonomy expansion does not reset completed onboarding.

The same durable state powers setup and Your interests. UI draft state may remain local during editing but is labelled unsaved. When a stale tab returns 409, preserve its draft and show the current server state plus a deliberate retry/merge decision. Never unconditional-retry over a newer account preference edit.

User controls can be cards/checkboxes/disclosures and search results; this is not a giant cascading select. Search must return matching concepts with kind, breadcrumb, alias highlight and status. Accessible expansion and selection are separate controls; focus remains stable as children load. Debounce server queries, cancel stale results, cap result lists and avoid graph-wide reactive deep watches. The catalogue is small enough for a practical database index; no search cluster is necessary.

## 7. Test examples that prevent misleading success

- Football-only member does not get an unrelated basketball story solely because both have Sports ancestry.
- Manchester City men follow works in UI/storage; no eligible fixture news produces an honest empty state.
- Fictional Juniper Athletic positive fixtures give a real relevant feed; unrelated fictional league teams are excluded from a team-only follow.
- League-only follow does not inherit a team's separately tagged non-league story.
- Team + explicit league scope excludes that same team's cup story; unrestricted team follow includes it.
- Two saved follows of one story still produce one slot; a hide removes all presentation variants of that canonical story.
- Muting Football does not clear the radio queue/bookmarks, but filters new personalized recommendations.
- A rename preserves follows by ID. A retired entity remains visibly resolvable until replacement/removal is chosen.
- A discovered graph cycle rejects the update without partial import. Alias collisions return choices, not accidental merges.
- Two users with different interests never share cached personalized snapshots or saved data. Account-specific snapshot token reuse by the other user is denied.
- New-account onboarding happens after confirmation; a preview crawler, replayed token or returning-account visit does not create fresh setup side effects.
- Clearing all interests does not claim to erase already downloaded media or all account data.
