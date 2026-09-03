# AEGRIS

AEGRIS is a web-based AgTech platform for field monitoring, satellite vegetation analysis, environmental context evaluation, and decision support for agricultural operations.

The application combines Sentinel-2 satellite observations, weather data, crop context, soil information, and a deterministic decision engine to produce structured field-level assessments and recommendations.

> Current status: AEGRIS v1 — controlled pilot preparation.

## Core Capabilities

- Agricultural project and field management
- Interactive field geometry and mapping
- Sentinel-2 L2A vegetation analysis
- NDVI history and spatial statistics
- Satellite data quality control
- Weather and evapotranspiration context
- Soil moisture and soil profile context
- Crop and growth-stage context
- Deterministic AEGRIS Decision Engine
- Structured recommendations and alerts
- Historical analysis records
- Multi-tenant organization and role management
- Administrative and support interfaces

## Technology Stack

### Application

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Chart.js
- MapLibre GL / Mapbox GL
- Terra Draw
- Three.js

### Backend and Data

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)
- PostgreSQL RPC functions and migrations

### External Data

- Copernicus Data Space Ecosystem
- Sentinel-2 L2A
- Open-Meteo

## Decision Engine

The AEGRIS Decision Engine is deterministic and rule-based.

It evaluates six canonical factors:

1. NDVI
2. NDVI trend
3. Water balance
4. Current temperature
5. 24-hour temperature outlook
6. Soil moisture

The engine produces a normalized score, operational status, factor-level evaluation, data-completeness information, recommendations, and prioritized actions.

Decision outputs are persisted together with engine/ruleset versions and input/decision snapshots to support reproducibility and auditability.

The current agronomic thresholds are operational heuristics intended for controlled pilot validation. AEGRIS does not replace professional agronomic judgment.

## Satellite Analysis

Satellite analysis uses Sentinel-2 L2A data through the Copernicus Data Space Ecosystem.

The pipeline includes:

- Field polygon processing
- Coordinate-system handling
- 10 m analysis resolution
- Pixel-level SCL and data-mask filtering
- Valid-pixel quality gates
- NDVI time-series aggregation
- Mean, median, P05 and P95 statistics
- Accepted/rejected interval tracking
- Historical NDVI persistence

Analysis, NDVI history and recommendation persistence is handled atomically at the database level.

## Weather Pipeline

Weather data is retrieved through a shared server-side Open-Meteo pipeline.

The pipeline includes:

- Current weather
- Rolling 24-hour precipitation
- Rolling 24-hour FAO-56 ET0
- Temperature outlook
- Soil moisture
- Weather freshness validation
- Disabled response caching
- Bounded provider retry
- Explicit request timeout
- Fail-soft analysis behavior when weather is temporarily unavailable

## Security and Multi-Tenancy

AEGRIS uses Supabase authentication and PostgreSQL Row Level Security.

Organization roles include:

- Owner
- Admin
- Member
- Viewer

Access to projects and related data is scoped through organization membership and role checks.

Privileged server operations use narrowly scoped server-side paths or database RPC functions. Secrets and service-role credentials must never be exposed to browser code or committed to the repository.

## Environment Configuration

Local configuration is stored outside version control.

Typical environment variables include configuration for:

- Supabase
- Copernicus Data Space
- server-side administrative operations
- protected internal endpoints

Do not commit `.env.local`, access tokens, database passwords, service-role keys, or other secrets.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application is then available at:

```text
http://localhost:3000
```

## Validation

Run automated tests:

```bash
npm test
```

Run the production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Before production changes are accepted, the relevant build, tests, database migrations, and production behavior should be verified.

## Database Migrations

Database changes are maintained under:

```text
supabase/migrations/
```

Production migrations must be reviewed before execution.

Security-sensitive database functions should use explicit privileges and narrowly scoped access. Row Level Security must remain enabled where tenant isolation depends on it.

## Deployment

The production application is deployed from the main repository branch through the configured deployment platform.

Production secrets are managed through deployment/database environment configuration and must not be stored in source control.

## Backup and Recovery

Database backup and recovery procedures are operational infrastructure concerns and must be maintained separately from application source control.

Source code history is maintained in Git.

Database backups must be stored separately from the production database and recovery procedures should be periodically verified before broader commercial deployment.

## Pilot Status

AEGRIS v1 is being prepared for a controlled pilot.

The controlled pilot is intended to validate:

- agronomic thresholds
- recommendation usefulness
- field-level interpretation
- operational reliability
- user workflow
- real-world decision-support value

Pilot results should be treated as validation evidence for subsequent product and ruleset revisions.

## Repository

This repository contains proprietary AEGRIS application source code.

Unless explicitly stated otherwise, no permission is granted to copy, distribute, sublicense, or commercially use proprietary AEGRIS source code.
