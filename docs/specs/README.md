# THE AGGREGATOR - Product and delivery specification

Version 1.0 | 8 October 2026

Six coordinated documents define an evidence-led news synthesis product, its reader and newsroom experiences, a Figma-ready design system, backend data model and dependency-aware delivery plan.

## Read in this order

1. **Product Requirements Document:** launch scope, editorial rules, trust model, features, success measures and acceptance.
2. **Technical Requirements Document:** service boundaries, safe ingestion, evidence pipeline, generation, APIs, security and operations.
3. **App Flow Document:** reader, staff, failure, correction, privacy and future flows.
4. **Figma Design Brief:** visual direction, all screen states, components, responsive layouts, tokens, motion and design handoff.
5. **Backend and Database Schema:** entities, relationships, invariants, retention, reference SQL and implementation boundaries.
6. **Implementation Plan:** owners, dependencies, work packages, test strategy, release gates and operational handover.

Editable Word documents are in **documents/**. Matching plain-text Markdown versions are in **markdown/**; these are useful for AI coding/design handoff and version control.

## Engineering, design and planning companions

- **engineering/001_launch_schema.sql:** 54-table PostgreSQL-compatible launch reference DDL.
- **engineering/002_v1_extensions.sql:** 3 initial V1 extension tables. Read the schema document before treating these as complete future-feature migrations.
- **engineering/data_dictionary.md / .json:** detailed field-level descriptions across 57 tables.
- **engineering/entity_relationships.mmd:** Mermaid entity relationships.
- **engineering/core_flows.mmd:** Mermaid source-to-publication and reading flow.
- **design/design_tokens.json:** proposed light/dark color, type, spacing and motion tokens. Not a native Figma file or a guaranteed plugin import format.
- **design/contrast_checks.json:** calculated sample token contrast ratios; not a WCAG conformance certificate.
- **design/screen_register.json:** 29 launch/future screen definitions with roles and responsive/state requirements.
- **planning/feature_register.json:** 38 features with release, behavior, exceptions and acceptance criteria.
- **planning/requirements_traceability.md / .json:** feature-to-screen, flow, work-package and acceptance mapping.
- **planning/implementation_backlog.json:** 23 dependency-aware work packages; effort bands are planning estimates.
- **planning/reference_registry.json:** checked public source URLs, relevance and check date.

## Baseline decisions and open approvals

“Background Schema” is interpreted as **backend/database schema**. The baseline is an English responsive Vue/Nuxt web app with an Express/TypeScript API, PostgreSQL and human editorial review. The planned product name is The Aggregator; availability and trademark clearance have not been established. These are proposals, not previously approved user decisions.

Inline claim-linked citations complement a mandatory bottom bibliography. The source policy requires at least three distinct eligible evidence items and two independently established reporting origins; this is a proposed launch policy, not an industry rule. Normal publication needs human approval, and high-risk stories need two distinct approvers. Source credibility and permission for each content use are evaluated separately.

YouTube links and embeds do not imply permission to download arbitrary captions or synthesize API data across sources. Launch video evidence uses an independently permitted publisher-transcript path; API use and every downstream reuse remain subject to provider terms and actual permissions. Source licenses, operating markets, privacy basis, hosting region, budget, vendors and staffing require owner review.

## What is and is not delivered

Delivered: six specification documents and structured reference companions. The schema has not been executed against PostgreSQL; integration/migration verification is a prerequisite in WP04. No live application, production deployment, Figma file, publisher contract or completed security/accessibility certification is implied. The supplied repositories are incorporated into the design/implementation guidance, not installed or executed by these documents.

Source pages were checked on 8 October 2026. Provider terms and software capabilities can change. Recheck them before implementation. Requirements and performance targets are proposed baselines, not measurements of a running product.

## Change control

Keep Fxx feature IDs, SCxx screen IDs, FLxx flow IDs and WPxx work-package IDs stable. Record owner-approved changes, update related documents together and repeat impacted tests. Source permissions, citation integrity, review gates, correction and withdrawal controls are not optional trade-offs for schedule.
