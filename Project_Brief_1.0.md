# MPAX Core — Sales Event Configuration Engine (SECE)
## Project Brief v8.0 — Configuration‑First, Event‑Driven Platform

## Focus Statement
MPAX turns high‑value asset sales into premium, AI‑guided "Sales Events" that learn each buyer's preferences and lift conversion—without custom engineering per category. The MPAX core is a configuration engine that sets up and operates each event end‑to‑end: persona, discovery behavior, search/ranking, UI contract, conversion paths, safety, and analytics.

## What We're Building (SECE)
The Sales Event Configuration Engine is the thin, reusable core that:
- Defines an event by configuration, not code
- Orchestrates conversation, search, recommendations, UI updates, and conversion using those configs
- Emits operational and revenue telemetry to optimize the next event

## Configuration‑First Build Philosophy

### What "Build" Means in MPAX
**No per‑event images**: We keep a small set of generic Docker images (discovery API, admin API, optional worker). They're built once. New Sales Events are data + configuration those images load at runtime.

**Code that is generated**: Only thin adapters (e.g., a custom column normalizer, a PDF parser hint, or a simple API connector) plus SQL migrations if the source schema requires extra fields. All of this lands in a `sources/<event_id>/` folder with tests and a human approval gate.

**Everything else is configuration**: The ingestion pipeline wiring, Discovery Engine persona/signals/ranking/UI, transaction mode, and scarcity/social rules are emitted as versioned JSON configs that the running stack consumes.

### Step‑by‑Step: What Happens After Your Elicitation Session

**You provide:**
- Samples: 1–3 spreadsheets, 1–2 condition report PDFs, 10–30 sample photos, any API references or curl responses, and 2–3 UI screenshots/wireframes
- Choices: Transaction mode (direct sales, lead gen, or human handoff), deposit rules, hold length, and any compliance must‑haves

**The engine produces a Sales Event Blueprint:**
- **Schema induction** from your XLS/CSV: proposes a `column_mapping.json` and field normalizers
- **PDF strategy**: picks a parser path (pure OCR vs. table extractor) and proposes any extraction hints
- **API connector plan**: if you supplied an OpenAPI spec or sample payloads, it generates a connector config and optional small adapter
- **UI contract**: infers visible tile fields, chips/filters, comparison fields, and actions from your screenshots
- **Discovery behavior**: persona tone, question strategy, preference signals, and ranking weights seeded for your domain
- **Transaction model**: toggles for direct sale vs. lead gen vs. human handoff, with appropriate actions and data needed
- **Scarcity/social policy**: initial SDME parameters (badges, timers, drop calendar) based on your event cadence

### Emitted Artifacts (Diff and Preview Ready)

**Ingestion (INE/MSE)**
- `sources/<event_id>/column_mapping.json`
- `sources/<event_id>/adapters/*.py` (only if needed)
- `sql/migrations/<event_id>/*.sql` (only if new fields are required)

**Discovery Engine configs**
- `config/sales_events/<event_id>.json` (the Sales Event brain)
- Optional `config/behavior_templates/<domain>.json` (if new domain)

**Transaction flows (TFE)**
- `config/transactions/<event_id>.json` (reserve/hold/deposit, reveal, handoff)

**Scarcity & social (SDME/CSPE)**
- `config/scarcity/<event_id>.json`
- `config/social_proof/<event_id>.json`

**Tests and preview**
- `tests/<event_id>/*` synthetic rows; contract tests
- A "Preview Event" sandbox that renders tiles/filters/actions and runs dry‑runs against your samples

### Human Gate Before Anything Ships
You and an operator see the diffs, the preview grid, a sample conversation, and a dry‑run of holds/reservations in staging. You approve, request edits, or add clarifications (e.g., "treat 'Ext. Color' as 'Exterior Color'").

### Deploy Without Rebuilding Containers
Admin clicks Publish. Configs are stored in Supabase and broadcast via Realtime. Running containers hot‑reload the new event; indexes warm; the UI starts serving it immediately.

## Sales Event = Configuration (No Code)
A Sales Event is a versioned config bundle applied at runtime.

### Minimal Schema (Authoritative Surfaces)
- Persona and questioning style
- Preference signals to extract and track
- Search defaults and data sources
- Ranking weights and trade‑off rules
- UI contract (tiles, chips, comparisons, actions)
- Conversion flow (reserve, consult, deposit, reveal)
- Scarcity/social proof policy
- Safety/compliance policy
- Analytics and A/B test plan

### Example: Platform Defaults
Save as `engines/de/src/discovery_engine/config/platform_defaults.json`
```json
{
  "id": "platform_defaults",
  "persona": {"name": "Claire","style": {"tone": "professional_warm","directness": "balanced"}},
  "preference_extraction": {
    "signals": ["BUDGET_RANGE","TIMELINE_URGENCY","USE_CASE","FEATURE_PRIORITY","DESIGN_AESTHETIC","RISK_TOLERANCE","EMOTIONAL_DRIVER","GEO_RADIUS"],
    "variant_generation": {"provider": "groq","k": 5}
  },
  "search_defaults": {"hybrid": true,"filters": {},"max_results": 12},
  "ranking_weights": {"individual_match": 0.6,"spec_alignment": 0.2,"scarcity": 0.1,"social_proof": 0.1},
  "ui_contract": {
    "tile_fields": ["title","price","match","badges","specs","media"],
    "chips": ["Budget","Brand/Make","Feature/Specs","Condition"],
    "comparison_fields": ["key_specs","verifications","ownership_costs"],
    "actions": ["Compare","Reserve","Schedule Call","Request Info"]
  },
  "conversion": {"actions": ["Reserve","Schedule Call"],"hold_minutes": 24,"deposit_required": false},
  "safety": {"claims_review": [],"compliance_flags": true},
  "analytics": {"ab_enabled": true,"primary_kpis": ["time_to_match","felt_understood","conversion_step_throughput"]}
}
```

### Example: Tesla Q1 2026 Event
Save as `config/sales_events/tesla_q1_2026.json`
```json
{
  "extends": "platform_defaults",
  "id": "tesla-q1-2026",
  "domain": "vehicles_ev",
  "persona": {"name": "Claire","style": {"tone": "calm_expert","directness": "crisp"}},
  "search_defaults": {
    "hybrid": true,
    "filters": {"model": ["Model 3"],"year": {"min": 2021},"accidents": 0},
    "max_results": 24,
    "data_sources": ["supabase.vehicle_listings"]
  },
  "ranking_weights": {"individual_match": 0.55,"spec_alignment": 0.25,"scarcity": 0.1,"social_proof": 0.1},
  "conversion": {"actions": ["Reserve","Schedule Video Walkthrough"],"hold_minutes": 24,"deposit_required": true},
  "safety": {"claims_review": ["title_status","battery_health"],"compliance_flags": true},
  "sdme": {"scarcity_badges": true,"drop_calendar": ["2026-01-10","2026-01-24"]},
  "cspe": {"trending_signals": ["views","wishlists","holds"]},
  "analytics": {"ab_enabled": true,"test_plan": "pricing_cards_vs_ownership_cost_cards_v1"}
}
```

### Example: Used Cars B2B2C ("Otto" Privacy‑Preserving Lead Flow)
Save as `config/behavior_templates/used_cars_b2b2c_otto.json`
```json
{
  "id": "otto-used-cars-v1",
  "domain": "used_cars",
  "persona": {"name": "Otto","style": {"tone": "friendly_expert","directness": "supportive"}},
  "preference_extraction": {
    "signals": ["BUDGET_RANGE","TIMELINE_URGENCY","BODY_STYLE","DRIVETRAIN","FEATURES","MILEAGE_CAP","BRAND_FLEXIBILITY","FINANCING_NEED","GEO_RADIUS"],
    "variant_generation": {"provider": "groq","k": 5}
  },
  "dealer_matching": {"inventory_alignment_min": 0.65,"max_dealers_per_lead": 5},
  "privacy": {"mode": "buyer_controlled","reveal_requires_buyer_confirm": true},
  "pricing": {"model": "usage_based","events": {"message_delivered": 6,"buyer_reply": 14,"contact_reveal": 39}},
  "ui_contract": {"actions": ["Message Dealer","Schedule Test Drive","Reserve"]}
}
```

## Sales Event Lifecycle (Runbook)
- **Configure**: Admin selects a template, fills event metadata, attaches data sources, and publishes. No code changes
- **Operate**: The event runs with real‑time conversation, search, ranking, UI updates, scarcity signals, and conversion flows—entirely driven by config
- **Optimize**: A/B plans execute automatically; telemetry feeds back into configuration suggestions
- **Close out**: Reports, payouts, and learnings are exported; the config and analytics are versioned for reuse

## Roles and Permissions
- **Admin**: Creates and publishes events, assigns templates, sets policies
- **Operator**: Monitors performance, adjusts safe levers (e.g., ranking weights), triggers drops
- **Specialist** (optional): Joins human handoffs from TFE
- **Buyer/Prospect**: Interacts via chat/UI; can opt for holds, consults, or reveal
- **Partner/Dealer** (B2B2C): Sees anonymized leads per RLS; pays usage‑based fees upon milestones

## Core APIs (Stable Contracts)
- `POST /api/v1/admin/sales_event` → create/publish from config
- `GET /api/v1/sales_event/{id}` → fetch UI bootstrap, tiles contract
- `POST /api/v1/discovery/start` → start session for event
- `POST /api/v1/discovery/message` → extract signals, search/re‑rank, UI updates
- `POST /api/v1/transaction/reserve` → hold/deposit; returns reservation details
- **Optional B2B2C**:
  - `GET /api/v1/dealer/prospects`
  - `POST /api/v1/dealer/messages`
  - `POST /api/v1/dealer/reveal-request`
- `GET /api/v1/analytics/event/{id}` → KPIs, A/B results

## Architecture at a Glance (Kept Thin)
- **Discovery Engine services**: `conversation_engine`, `search_engine`, `recommendation_engine`, `ui_controller`, `individual_modeler`, orchestrated by `discovery_engine`
- **Data/security**: Supabase (PostgreSQL + pgvector) with RLS; Zep Cloud memory; Redis optional
- **AI**: Mistral (OCR/embeddings/chat) + Groq for test‑time variants and Judge scoring
- **Delivery**: Cloudflare CDN for media; WebSocket updates for UI
- Everything parameterized by the Sales Event config

## Lower‑Overhead Options (Fresh Ideas)
- Start pgvector‑only hybrid search, defer knowledge‑graph layers; add materialized views for common filters instead of a custom KG service
- Use Supabase Realtime + Postgres functions to broadcast reservation and badge changes; reserve Redis Streams for high‑throughput phases later
- Encode safety/compliance as "policy‑as‑config" with JSON Schema validation and approval status; no bespoke policy code per category
- Replace long‑lived Celery workers with Supabase Functions/Edge Functions for light admin tasks; keep Groq/Mistral calls stateless
- Use YAML for authoring configs with JSON Schema validation; compile to JSON at publish time to avoid runtime parsing complexity

## Operating Model (Dates are explicit; today is October 25, 2025)

### Sprint 0 (Oct 27–Nov 9, 2025): Config engine + admin publish path
- **Deliver**: `behavioral_config.py`, `sales_event_config.py`, validator, "Preview Event" sandbox
- **Gate**: Launch a dummy event end‑to‑end in staging without code edits

### Sprints 1–2 (Nov 10–Dec 7, 2025): First live Sales Event (EVs)
- **Deliver**: Discovery Engine minimal (conversation/search/re‑rank/UI), WebSocket updates, TFE reserve
- **Gate**: p95 <200 ms responses; <3 minutes to first relevant match

### Sprints 3–4 (Dec 8, 2025–Jan 4, 2026): Second event + B2B2C module
- **Deliver**: Watches event; Used Cars dealer portal (anon lead flow)
- **Gate**: ≥25% lift vs. static baseline on at least one A/B

### Sprints 5–6 (Jan 5–Feb 2, 2026): Scale and package
- **Deliver**: SaaS packaging, compliance packs, dashboard KPIs, config templates library
- **Gate**: Three events completed; "new category in <5 minutes" demo recorded

## Success Metrics (Event‑Level and Platform‑Level)
- **Experience**: <3 minutes to first relevant match; >4.8/5 "felt understood"
- **Conversion**: >25% discovery→inquiry; 20–30% inquiry→deposit; >85% deposit→sale
- **Performance**: p95 personalized response <200 ms; WebSocket latency <50 ms; 99.9% uptime
- **Efficiency**: <5 minutes to configure a new category; <30 seconds per listing update
- **Governance**: 100% configs validated and versioned; change log ties to KPI deltas

## Risk Register (With Mitigations)
- **Latency at concurrency**: Pre‑warm embeddings, result caching, circuit breakers; staged load tests each sprint
- **Compliance variance** (title/authenticity/zoning): Safety pack per event with mandatory approval; RLS isolation; audit logs
- **Drift from "config‑first"**: Introduce config review gates; disallow domain‑specific code merges without CTO sign‑off
- **Single‑vendor risk**: Abstract AI endpoints; keep model‑agnostic adapters; support drop‑in alternatives later

## Current Readiness
- **Stack provisioned**: Supabase (RLS), Zep Cloud, Cloudflare CDN, Mistral AI, Groq Services are set up and ready
- **Preserved building blocks**: `state_schema.py`, `memory/zep_integration.py`, `individual_lock_service.py`, `langgraph_workflow.py`
- **INE+MSE**: Operational and feeding real inventory/media

## Deliverables Checklist (What This Brief Authorizes)
- **Config engine**
  - JSON Schema for `platform_defaults`, `behavior_templates`, `sales_events`
  - Admin publish/validate preview flow
- **Discovery Engine minimal**
  - Conversation (signals + variants + Judge), search (pgvector hybrid), recommendation (weights), UI controller (tiles/chips/compare/actions)
  - TFE reserve/hold via API; reservation timers and badges
- **Templates library**
  - `platform_defaults.json`
  - `tesla_q1_2026.json` (EVs)
  - `used_cars_b2b2c_otto.json` (dealer marketplace)
  - Optional: `watches_q1_2026.json`
- **Analytics**
  - Event KPIs API, A/B harness, nightly rollups

## Appendix: Event Operator's "One‑Pager" SOP
- Create Sales Event → choose template → attach data source(s) → set conversion actions → publish
- Monitor dashboard: time‑to‑match, step‑through, holds, deposits, reveal requests
- Adjust safe levers: ranking weights ±5–10%, scarcity on/off, copy variants (A/B)
- Close event: payouts, export learnings; clone config for next run

---

**If approved, I will:**
- Save this as `docs/business/briefs/MPAX_SECE_Project_Brief_v8.0.md`
- Generate JSON Schemas for config validation and commit starter templates
- Ship a "Hello, Sales Event" demo that proves zero‑code launch from config within Sprint 0