# CASA MX — Maps & Location Filters Strategy (Consolidated)

This document consolidates the previous maps-cost-control strategy and location-filters implementation prompt into one operational reference.

## Scope
- Map rendering/discovery UX
- Geocoding/autocomplete control strategy
- Mexico-specific location filters (estado/ciudad/colonia/código postal)
- Reliability, cost control, and validation expectations

## Current Direction (Authoritative)
- Keep map rendering with Leaflet + OSM tiles.
- Route geocoding/autocomplete through backend-controlled services when external providers are used.
- Keep frontend UX stable while enforcing limits/caching server-side.
- Preserve API-first architecture and backend authority.

## Location Filter Model (Mexico)
Structured fields used in property workflows:
- `estado` (required)
- `ciudad` (optional)
- `colonia` (optional)
- `codigoPostal` (optional)
- Keep `address` for compatibility

## API Expectations
- `GET /properties` supports combined location + price filters
- `GET /properties/filter-options` returns available estados/ciudades for UI dropdowns
- Filter logic supports pagination and validation

## Frontend Expectations
- Cascading filter UI (estado -> ciudad)
- Clear/apply behaviors with sane defaults
- Loading/error states and resilient fallback behavior
- No breaking changes to existing pages

## Maps Cost/Usage Controls
1. Centralized backend logging for external maps/geocoding usage
2. Caching layer for geocode and filter-option responses
3. Rate limiting and threshold alerts
4. Graceful fallback when limits are reached
5. Admin visibility into service health/usage where applicable

## Testing & Quality Gates
- Preserve passing baseline tests while introducing location/maps changes
- Validate combined filters, invalid parameter handling, and pagination
- Validate map/discovery views in E2E coverage
- Ensure no skipped tests for final validation suites

## Historical Source Files
This consolidated strategy replaces prior standalone maps-cost and location-filters planning documents.
