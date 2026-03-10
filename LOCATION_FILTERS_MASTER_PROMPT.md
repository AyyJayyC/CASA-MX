# Casa MX Location Filters Feature - Master Prompt & Chat History

**Date Started**: January 26, 2026  
**Status**: Ready for Checkpoint 1  
**Total Checkpoints**: 7

---

## Quick Context

We are adding **Mexico-specific location filtering** to Casa MX. This allows users to search properties by:
- **Estado** (State)
- **Ciudad/Municipio** (City/Municipality)
- **Colonia** (Neighborhood)
- **Código Postal** (ZIP Code)

### Critical Constraints
✅ **All 107 existing tests must pass** (78 backend + 29 frontend)  
✅ **No breaking changes**  
✅ **Backward compatible**  
✅ **No new technologies** - use existing stack only  

---

## Technology Stack (PRESERVE)

### Backend
- Node.js 18+ with TypeScript 5.5.4
- Fastify 4.28.1
- PostgreSQL 16
- Prisma 5.19.0
- Zod validation
- @fastify/jwt, @fastify/cors, @fastify/rate-limit
- Vitest 2.1.9

### Frontend
- Next.js 13.5.11 (App Router)
- React 18.2.0
- JavaScript/JSX
- Tailwind CSS
- React Query
- Vitest 1.2.0

---

## ✅ CHECKPOINT 1: Database Schema Update

### Current State
- Properties have single `address` field (string)
- No structured location data
- No migration needed yet

### Changes Required

**1. Update Prisma Schema** (`prisma/schema.prisma`):
Add these fields to Property model:
```prisma
colonia        String?    // Neighborhood (e.g., "Roma Norte")
ciudad         String?    // City/Municipality (e.g., "Guadalajara")
estado         String     // State (REQUIRED) (e.g., "Jalisco")
codigoPostal   String?    // ZIP code (e.g., "44100")
```

**2. Add Indexes** for fast filtering:
```prisma
@@index([estado])
@@index([ciudad])
@@index([colonia])
@@index([codigoPostal])
```

**3. Keep `address` field** (optional, for backward compatibility)

**4. Create Migration**:
```bash
cd casa-mx-backend
npx prisma migrate dev --name add_mexico_location_fields
```

**5. Update Seed Data** (`prisma/seed.ts`):
Add realistic Mexican locations to test properties. Examples:
- **Ciudad de México**: Roma Norte (06700), Polanco (11560), Condesa (06140)
- **Jalisco**: Guadalajara/Providencia (44630), Zapopan/Puerta de Hierro (45116)
- **Nuevo León**: Monterrey/San Pedro Garza García (66230), Monterrey/Cumbres (64610)

### Tests to Create
File: `tests/checkpoint-filters-1.test.ts`

Tests needed:
- ✓ Property can be created with all location fields
- ✓ Estado is required (cannot be null)
- ✓ Ciudad, colonia, codigoPostal are optional
- ✓ Existing properties migrated successfully
- ✓ Indexes exist on all location fields
- ✓ Seed data includes Mexican locations

### Success Criteria
- [ ] Migration applies without errors
- [ ] All existing properties have valid estado
- [ ] New properties can be created with location data
- [ ] Database indexes created
- [ ] Seed includes Mexican locations
- [ ] New tests passing
- **[ ] All 78 existing backend tests still passing**

---

## ✅ CHECKPOINT 2: Backend API - Filter Query Parameters

### New Endpoints

**1. Update GET /properties**:
Accept query parameters:
```
?estado=Jalisco&ciudad=Guadalajara&colonia=Providencia&codigoPostal=44630&minPrice=100000&maxPrice=5000000&limit=20&offset=0
```

Validation schema (Zod):
- All fields optional
- Limit: 1-100 (default 20)
- Offset: min 0 (default 0)
- Min/Max price: numeric

Response:
```json
{
  "success": true,
  "data": [...],
  "total": 245
}
```

**2. Create GET /properties/filter-options**:
Returns available filter values from database:
```json
{
  "success": true,
  "data": {
    "estados": ["Jalisco", "Ciudad de México", ...],
    "ciudades": {
      "Jalisco": ["Guadalajara", "Zapopan", ...],
      "Ciudad de México": ["Coyoacán", "Roma", ...]
    }
  }
}
```

### Implementation
- Use Prisma to query unique values
- Build `where` clause dynamically
- Support combining filters
- Maintain authentication
- Handle invalid params with 400 error

### Tests to Create
File: `tests/checkpoint-filters-2.test.ts`

Tests needed:
- ✓ GET /properties returns all when no filters
- ✓ Filtering by estado works
- ✓ Filtering by ciudad works
- ✓ Filtering by colonia works
- ✓ Filtering by codigoPostal works
- ✓ Combining multiple filters works
- ✓ Price range filters work
- ✓ Pagination works with filters
- ✓ Invalid params rejected with 400
- ✓ GET /properties/filter-options returns correct structure
- ✓ Authentication required on both endpoints

### Success Criteria
- [ ] Backend accepts filter query parameters
- [ ] All filter combinations work
- [ ] Pagination works with filters
- [ ] Filter options endpoint working
- [ ] Query validation with Zod
- [ ] New tests passing
- **[ ] All 78 existing backend tests still passing**

---

## ✅ CHECKPOINT 3: Frontend - Filter UI Component

### New Component: `components/PropertyFilters.jsx`

**Requirements**:
- Client component (`'use client'`)
- Use Tailwind CSS
- Spanish labels and placeholders
- Mobile responsive

**Inputs needed**:
1. **Estado dropdown** (required, shows all estados)
2. **Ciudad dropdown** (enabled after Estado selected, shows ciudades for that estado)
3. **Colonia input** (text input, optional)
4. **Código Postal input** (text input, 5 digits, optional)
5. **Min/Max Price** (numeric inputs, optional)
6. **Apply button** ("Aplicar Filtros")
7. **Clear button** ("Limpiar Filtros")

**Cascading Logic**:
- When Estado changes → reset Ciudad and Colonia
- Ciudad dropdown only shows values for selected Estado
- Disable Ciudad until Estado selected

**Data Fetching**:
- Fetch from `GET /properties/filter-options`
- Use React Query
- Handle loading/error states

### Tests to Create
File: `tests/components/PropertyFilters.test.jsx`

Tests needed:
- ✓ Component renders all inputs
- ✓ Estado dropdown populated
- ✓ Selecting Estado enables Ciudad
- ✓ Ciudad shows only matching values
- ✓ Changing Estado resets Ciudad/Colonia
- ✓ "Aplicar Filtros" calls onFilterChange
- ✓ "Limpiar Filtros" calls onClear
- ✓ Loading state shown
- ✓ Error state handled

### Success Criteria
- [ ] Component renders correctly
- [ ] All inputs functional
- [ ] Cascade logic works
- [ ] Data fetched from backend
- [ ] Loading/error states handled
- [ ] New tests passing
- **[ ] All 29 existing frontend tests still passing**

---

## ✅ CHECKPOINT 4: Frontend - Integrate with Properties Page

### Update: `app/properties/page.js`

**Changes**:
1. Import PropertyFilters component
2. Add filters above property list
3. Manage filter state in React
4. Fetch properties with filters applied

**URL State Management** (critical):
- Filters reflected in URL: `/properties?estado=Jalisco&ciudad=Guadalajara`
- Parse URL params on load (hydrate state)
- Update URL when filters change (without page reload)
- Use `useRouter`, `useSearchParams`
- Shareable links must work

**Update Data Fetching**:
- Modify `useProperties` hook to accept filters
- Pass filters as query params to backend
- Use React Query with filters in queryKey
- Handle loading/error states

**UI Enhancements**:
- Show active filters as chips/badges
- Display: "X propiedades encontradas"
- Empty state when no results
- Loading skeleton

### Tests to Create
File: `tests/integration/property-filtering.test.jsx`

Tests needed:
- ✓ Filters visible on page
- ✓ Applying filters updates URL
- ✓ URL params parsed on load
- ✓ Properties list updates
- ✓ Clearing filters resets URL
- ✓ Empty state shown when needed
- ✓ Loading state shown

### Success Criteria
- [ ] Filters on page
- [ ] Filtering updates URL
- [ ] URL state persists on refresh
- [ ] Properties list updates
- [ ] Empty state shown
- [ ] New tests passing
- **[ ] All 29 existing frontend tests still passing**

---

## ✅ CHECKPOINT 5: Update Property Upload Form

### Update: `components/PropertyUploadForm.jsx`

**New Location Fields**:
1. **Estado dropdown** (REQUIRED) - all 32 Mexican states
2. **Ciudad input** (REQUIRED)
3. **Colonia input** (optional)
4. **Código Postal input** (optional, 5 digits)
5. Keep **"Dirección completa"** field for backward compatibility

**Mexican States** (32 total):
Aguascalientes, Baja California, Baja California Sur, Campeche, Chiapas, Chihuahua, Ciudad de México, Coahuila, Colima, Durango, Guanajuato, Guerrero, Hidalgo, Jalisco, México, Michoacán, Morelos, Nayarit, Nuevo León, Oaxaca, Puebla, Querétaro, Quintana Roo, San Luis Potosí, Sinaloa, Sonora, Tabasco, Tamaulipas, Tlaxcala, Veracruz, Yucatán, Zacatecas

**Update Validation**:
File: `lib/validation/propertySchema.js`
- Estado: required, string
- Ciudad: required, string
- Colonia: optional, string
- Código Postal: optional, string, 5-digit pattern
- Address: optional

**Backend Updates**:
- POST /properties route accepts new fields
- Backend Zod schema updated
- Store all location fields in database

### Tests to Create
Update: `tests/components/PropertyUploadForm.test.jsx`

Tests needed:
- ✓ New location fields render
- ✓ Estado required (validation error if missing)
- ✓ Ciudad required (validation error if missing)
- ✓ Colonia optional (no error if empty)
- ✓ Código Postal optional (no error if empty)
- ✓ Invalid Código Postal shows error (not 5 digits)
- ✓ Form submission includes location fields
- ✓ Backend accepts new property with location

### Success Criteria
- [ ] Upload form has location inputs
- [ ] All validations working (frontend + backend)
- [ ] New properties saved with location
- [ ] Existing form features unchanged
- [ ] New tests passing
- **[ ] All 29 frontend + 78 backend tests passing**

---

## ✅ CHECKPOINT 6: Update Map View with Filters

### Update: `app/properties/map/page.js`

**Changes**:
1. Add PropertyFilters component above/beside map
2. Apply filters to properties shown on map
3. Sync filter state with URL (same as properties page)
4. Keep existing dynamic import for PropertyMap
5. Maintain ErrorBoundary

**Filter Integration**:
- Fetch properties with filters
- Pass filtered properties to PropertyMap
- Update markers when filters change
- Show result count

**Maintain Existing**:
- Marker clustering
- Popup functionality
- Analytics tracking
- Mobile responsiveness

### Tests to Create
File: `tests/integration/map-filtering.test.jsx` (or update existing)

Tests needed:
- ✓ Map page renders with filters
- ✓ Applying filters updates markers
- ✓ Clearing filters shows all markers
- ✓ Filter count matches marker count
- ✓ URL updates with filters

### Success Criteria
- [ ] Map has working filters
- [ ] Markers update based on filters
- [ ] URL state synced
- [ ] Empty state handled
- [ ] Existing features unchanged

---

## ✅ CHECKPOINT 7: Analytics, Testing & Documentation

### Analytics Tracking
- Track event: `filter_applied`
- Include metadata: which filters used, results count
- Use existing analytics system

### Testing
Run full test suites:
- **Backend**: `npm test` → 78/78 passing
- **Frontend**: `npm test -- --run` → 29/29 passing
- No regressions
- All new tests passing

### Documentation Updates
1. **COMPLETE_PROJECT_DOCUMENTATION.md**
   - Add filters to features list
   - Document new database fields
   - Document new API endpoints
   - Add API documentation

2. **README.md**
   - Add filters to features
   - Update setup instructions

3. **QUICKSTART.md**
   - Add filter usage examples
   - Show example URLs

4. **Migration guide**
   - Steps to update existing properties
   - Backward compatibility notes

### Success Criteria
- [ ] Analytics implemented
- [ ] All documentation updated
- [ ] Migration guide created
- **[ ] ALL 107 TESTS PASSING (78 + 29)**
- [ ] No regressions

---

## Pre-Launch Checklist

### Database
- [ ] All fields added to schema
- [ ] Migration applied
- [ ] Indexes created
- [ ] Seed data includes locations
- [ ] Existing properties valid

### Backend
- [ ] GET /properties accepts filters
- [ ] GET /properties/filter-options works
- [ ] Zod validation working
- [ ] Pagination works with filters
- [ ] Auth still required
- [ ] 78/78 tests passing

### Frontend
- [ ] PropertyFilters component working
- [ ] Properties page integrated
- [ ] Upload form captures location
- [ ] Map view supports filters
- [ ] URL state management working
- [ ] Mobile responsive
- [ ] 29/29 tests passing

### Integration
- [ ] End-to-end flow works
- [ ] URL sharing works
- [ ] Filter options populated
- [ ] Empty states working
- [ ] Loading states working

### Quality
- [ ] No TypeScript errors (backend)
- [ ] No build errors (frontend)
- [ ] No console errors
- [ ] Analytics working
- [ ] Documentation complete

---

## Manual Testing Scenarios

After all checkpoints:
- [ ] Apply single filter (estado) → filtered results
- [ ] Apply multiple filters (estado + ciudad) → narrower results
- [ ] Clear filters → all properties
- [ ] Share filtered URL → works in new browser
- [ ] Upload property with location → saves correctly
- [ ] View on map → marker appears
- [ ] Filter map view → markers update
- [ ] Mobile device → responsive
- [ ] Código postal validation → rejects invalid

---

## Quick Reference: Mexican Locations

### Ciudad de México
- Colonias: Roma Norte (06700), Polanco (11560), Condesa (06140), Coyoacán (04000)

### Jalisco
- **Guadalajara**: Providencia (44630), Chapultepec (44630), Centro (44100)
- **Zapopan**: Puerta de Hierro (45116), Chapalita (45010)

### Nuevo León
- **Monterrey**: San Pedro Garza García (66230), Cumbres (64610), Barrio Antiguo (64000)
- **San Pedro Garza García**: Hacienda Santa Catarina (64849)

### Other Key States
- Veracruz, Guanajuato, Michoacán, Yucatán, Quintana Roo, Baja California

---

## Execution Protocol

1. ✅ Read checkpoint requirements
2. ✅ Implement minimum code
3. ✅ Run tests after checkpoint
4. ✅ Fix breaks before proceeding
5. ✅ Don't skip checkpoints
6. ✅ Don't change technologies
7. ✅ Don't break existing tests

---

## Status: Ready for Checkpoint 1

**Next Step**: Update Prisma schema with location fields

Begin when ready!
