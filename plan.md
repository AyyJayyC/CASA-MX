# Casa-MX Cleanup Plan

## Overview
Casa-MX is a full transaction platform. The goal is to **remove redundant/over-engineered features** while keeping the core transaction flows. Each phase includes running tests before moving to the next.

---

## Phase 1: Remove Request Info System (REDUNDANT)

### Why
The Request Info system (`PropertyRequest` model + `RequestInfoModal` + `RequestedPropertiesList` + `/requested` page) is redundant — it's a simpler, less capable version of the MakeOfferModal. Both let a buyer express interest, but the offer system is more complete. The form collects structured data (budget, financing, timeline) but serializes it into a plain text message, wasting the structure.

### Files to delete
- `components/RequestInfoForm.jsx`
- `components/RequestInfoModal.jsx`
- `components/RequestedPropertiesList.jsx`
- `app/requested/page.js`
- `lib/api/requests.js` (if exists)
- `lib/queries/requests.js` (if exists)
- `lib/validation/requestSchema.js` (if exists)

### Backend changes
- Drop `PropertyRequest` model from Prisma schema
- Remove `propertyRequests` relation from `Property` model

### Frontend changes
- Remove RequestInfoModal import/usage from `app/properties/[id]/page.js`
- Remove `/requested` link from `app/dashboard/page.jsx`
- Remove `/requested` from `components/NavBar.jsx` (if present)

### Tests
- Run existing tests to ensure nothing is broken
- Update any tests that reference RequestInfoModal or /requested page

---

## Phase 2: Simplify Purchase Offers System

### Why
The offer system is core to a transaction platform, but it's over-engineered:
- `PropertyOfferEvent` with parent/child relationships (negotiation tree) is overly complex
- Furniture status negotiation (amueblada/equipada/sin_muebles) per-offer is a niche detail
- The "reject requires 2 counter-offers" rule is arbitrary

### Changes
- Remove furniture status fields from `MakeOfferModal.jsx`
- Remove furniture status from `app/dashboard/offers/page.jsx` and `app/dashboard/my-offers/page.jsx`
- Remove the "reject requires 2 counter-offers" rule from offer logic
- Simplify `OfferNegotiationTimeline.jsx` or merge into offer cards
- Backend: Remove `proposedFurnishedStatus` from `PropertyOfferEvent`, remove `agreedFurnishedStatus` from `PropertyOffer`

### Tests
- Run existing tests
- Update any offer-related tests

---

## Phase 3: Simplify Rent Negotiation System

### Why
Rent negotiation is valid for a transaction platform, but:
- 2 tables (Negotiation + NegotiationOffer) for what could be simpler
- The "reject requires 2 counter-offers" rule adds unnecessary complexity
- NegotiationPanel is embedded inside ApplicationsTable, making both bloated

### Changes
- Merge Negotiation + NegotiationOffer into a single model (or simplify the relationship)
- Remove the "reject requires 2 counter-offers" rule
- Simplify `NegotiationPanel.jsx` to a single-round proposal
- Clean up `ApplicationsTable.jsx` integration

### Tests
- Run existing tests
- Update any negotiation-related tests

---

## Phase 4: Simplify Reviews System

### Why
Reviews are important for trust, but `ReviewCategoryScore` (separate table for sub-ratings) adds unnecessary complexity.

### Changes
- Remove `ReviewCategoryScore` model from Prisma schema
- Remove category scores from `LeaveReviewModal.jsx`
- Remove category scores from `ReviewList.jsx` and `ReviewSummaryCard.jsx`
- Simplify to single rating + comment

### Tests
- Run existing tests
- Update any review-related tests

---

## Summary of All Changes

| Phase | Feature | Action | Key Files |
|---|---|---|---|
| 1 | Request Info System | **REMOVE** | RequestInfoForm, RequestInfoModal, RequestedPropertiesList, /requested page, PropertyRequest model |
| 2 | Purchase Offers | **SIMPLIFY** | MakeOfferModal, OfferNegotiationTimeline, offer pages, PropertyOfferEvent model |
| 3 | Rent Negotiation | **SIMPLIFY** | NegotiationPanel, ApplicationsTable, Negotiation/NegotiationOffer models |
| 4 | Reviews | **SIMPLIFY** | LeaveReviewModal, ReviewList, ReviewSummaryCard, ReviewCategoryScore model |

## Testing Strategy
After each phase:
1. Run `npm test` or the relevant test suite
2. Fix any broken tests
3. Only then proceed to the next phase

## Notes
- **Credit System** (CreditBalance, CreditTransaction, CreditPackage, UserSubscription) — KEEP AS-IS. This is the monetization model: buy-per-property or subscription for multiple properties. No changes needed.
- **Rental Applications** — KEEP AS-IS. Core to the rental transaction flow.
