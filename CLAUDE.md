# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MPAX Core is a Sales Event Configuration Engine (SECE) that transforms high-value asset sales into premium, AI-guided "Sales Events." The project implements a configuration-first architecture where new sales events are created through data and configuration rather than custom code.

## Key Architecture Concepts

### Configuration-First Philosophy
- **No per-event code**: New sales events are created by loading configuration data into generic Docker images
- **Generated adapters only**: Only thin adapters (column normalizers, PDF parsers, API connectors) and SQL migrations are generated as code
- **Everything else is configuration**: Ingestion pipelines, discovery behavior, UI contracts, transaction flows are all configuration-driven

### Core Components
1. **Sales Event Configuration Engine** - Core system that defines events via configuration
2. **Discovery Engine** - Conversation, search, recommendation, and UI orchestration
3. **Transaction Flow Engine (TFE)** - Reserve/hold/deposit and conversion flows
4. **Scarcity & Social Proof Engine (SDME/CSPE)** - Scarcity signals and social proof policies
5. **Ingestion Engine (INE/MSE)** - Data processing and validation

### Project Structure
```
bmad/                    # BMAD Method v6a - Development methodology framework
├── core/                # Core workflows and agents
├── bmb/                 # BMad Builder Module - Extension tools
├── bmm/                 # BMad Method Module - Core implementation
├── cis/                 # Creative Ideation and Synthesis Module
└── _cfg/                # Configuration files

docs/                    # Project documentation
└── technical-decisions-template.md

Project_Brief_1.0.md     # Comprehensive project specification
```

## Development Commands

### BMAD Method Commands
```bash
# Install BMAD dependencies
npm run install:bmad

# Core BMAD workflows (configured in bmad/core/workflows/)
workflow brainstorming                 # Interactive brainstorming sessions
workflow bmad-init                     # System initialization

# BMM (Core Implementation) workflows
bmad pm plan-project                   # Project planning
bmad sm create-story                   # Story generation
bmad dev develop                       # Development implementation
bmad sr review-story                   # Code review and quality

# BMB (Builder) workflows
bmad bmb create-agent                  # Design custom agents
bmad bmb create-workflow               # Build new workflows
```

### Configuration Management
- Configuration files are stored in JSON format with version control
- Sales event configs: `config/sales_events/<event_id>.json`
- Behavior templates: `config/behavior_templates/<domain>.json`
- Platform defaults: `engines/de/src/discovery_engine/config/platform_defaults.json`

## Development Workflow

### Creating New Sales Events
1. **Elicitation Session**: Collect samples (spreadsheets, PDFs, photos, API references)
2. **Configuration Generation**: Engine produces Sales Event Blueprint with:
   - Schema induction from XLS/CSV
   - PDF strategy and parser selection
   - API connector configuration
   - UI contract inference
   - Discovery behavior persona
   - Transaction model setup
3. **Human Review**: Preview event, review diffs, approve or request changes
4. **Deploy**: Publish configuration without rebuilding containers

### Scale Levels
The system adapts to project complexity:
- **Level 0**: Single atomic change
- **Level 1**: 1-10 stories, minimal documentation
- **Level 2**: 5-15 stories, focused PRD
- **Level 3**: 12-40 stories, full architecture
- **Level 4**: 40+ stories, enterprise scale

## Key Files and Locations

### Core Configuration
- `bmad/_cfg/manifest.yaml` - BMAD installation manifest
- `bmad/bmm/config.yaml` - BMM module configuration
- `Project_Brief_1.0.md` - Complete project specification

### Documentation Standards
- Technical decisions: `docs/technical-decisions-template.md`
- Stories and development: `docs/stories/` (configured in BMM)
- Knowledge base: `~/bmad/bmm/kb.md`

### BMAD Method Structure
- Agents: Specialized AI roles (PM, Analyst, Architect, DEV, SR, UX, etc.)
- Workflows: Structured processes for development phases
- Teams: Coordinated agent groups for complex tasks
- Tasks: Atomic work units within workflows

## Operating Principles

### Just-In-Time Design
- Technical specifications are created one epic at a time during implementation
- Allows for learning and adaptation during development

### Context Injection
- Story-specific technical guidance is generated dynamically
- Provides developers with exactly the expertise needed for each task

### Configuration Governance
- All configurations must be validated and versioned
- Change logs tie configuration changes to KPI deltas
- Human approval required before any configuration publishes

## API Contracts

### Core APIs
- `POST /api/v1/admin/sales_event` - Create/publish from config
- `GET /api/v1/sales_event/{id}` - Fetch UI bootstrap
- `POST /api/v1/discovery/start` - Start discovery session
- `POST /api/v1/discovery/message` - Process messages, update UI
- `POST /api/v1/transaction/reserve` - Handle reservations/holds

## Technology Stack

### Core Services
- **Database**: Supabase (PostgreSQL + pgvector) with RLS
- **Memory**: Zep Cloud for conversation memory
- **AI**: Mistral (OCR/embeddings/chat) + Groq for variants
- **CDN**: Cloudflare for media delivery
- **Real-time**: WebSocket updates for UI

### Deployment
- Generic Docker images built once
- Configuration hot-reloaded at runtime
- No per-event container rebuilding

## Best Practices

### Configuration Management
1. **Start with templates**: Use existing behavior templates as foundations
2. **Validate everything**: All configs must pass JSON Schema validation
3. **Version control**: Every configuration change is tracked and versioned
4. **Preview first**: Always use the "Preview Event" sandbox before publishing

### Development Process
1. **Trust the methodology**: The v6a workflow system has been carefully designed
2. **Respect the scale**: Don't over-document small projects
3. **Embrace iteration**: Use retrospectives to continuously improve
4. **Stay configuration-first**: Avoid custom code when configuration will suffice

### Agent Usage
- Agents are activated via slash commands (e.g., `/bmad-dev`, `/bmad-architect`)
- Commands are autocompleted when typing `/`
- Agent remains active for the entire conversation
- Start new conversation to switch agents

## Success Metrics

### Performance Targets
- <3 minutes to first relevant match
- >4.8/5 "felt understood" rating
- p95 personalized response <200ms
- WebSocket latency <50ms
- 99.9% uptime

### Efficiency Goals
- <5 minutes to configure a new category
- <30 seconds per listing update
- 100% configs validated and versioned

## Current Status

### Ready Components
- Stack provisioned (Supabase, Zep Cloud, Cloudflare CDN, Mistral AI, Groq Services)
- Core building blocks preserved (`state_schema.py`, `memory/zep_integration.py`, etc.)
- INE+MSE operational and feeding real inventory

### Sprint Timeline (as of Oct 25, 2025)
- **Sprint 0** (Oct 27–Nov 9): Config engine + admin publish path
- **Sprints 1–2** (Nov 10–Dec 7): First live Sales Event (EVs)
- **Sprints 3–4** (Dec 8–Jan 4): Second event + B2B2C module
- **Sprints 5–6** (Jan 5–Feb 2): Scale and package

## Important Notes

- This project uses BMAD Method v6a for development lifecycle management
- Always prioritize configuration over code when possible
- The system is designed for "new category in <5 minutes" deployment
- All changes must go through human approval gates before production
- Focus on the Sales Event Configuration Engine as the core differentiator