# Phase 3 → Phase 4 Transition Checklist

**Date**: January 13, 2026  
**Current Status**: Phase 3 Complete ✅

---

## ✅ Phase 3 Completion Verification

- [x] 29 unit tests passing
- [x] Analytics layer implemented
- [x] Admin dashboard working
- [x] Map discovery functional
- [x] Documentation complete (5 docs)
- [x] No build errors or warnings
- [x] CI/CD workflows configured
- [x] All SSR issues resolved

---

## 📋 Pre-Phase 4 Requirements

### Backend Prerequisites
- [ ] PostgreSQL 14+ installed (or Docker Desktop)
- [ ] Node.js 18+ LTS verified
- [ ] Create `casa-mx-backend` repository
- [ ] Clone backend repo locally
- [ ] Verify network: `localhost:3001` available

### Frontend Preparation
- [ ] Commit all Phase 3 changes
- [ ] Tag release: `git tag v3.0.0`
- [ ] Push to remote
- [ ] Create Phase 4 branch: `git checkout -b phase-4-backend-integration`
- [ ] Verify tests pass: `npm test -- --run`

### Environment Setup
- [ ] Create `backend/.env` from `.env.example`
- [ ] Generate JWT secrets (min 32 chars each)
- [ ] Update frontend `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001`
- [ ] Set `NEXT_PUBLIC_ANALYTICS_PROVIDER=api`

---

## 📦 Phase 4 Deliverables (Target)

### Backend Service
- [ ] Fastify + TypeScript setup
- [ ] Prisma + PostgreSQL connected
- [ ] Docker Compose for local dev
- [ ] Health check endpoint
- [ ] Structured logging (pino)
- [ ] Error handling middleware

### API Endpoints (19 total)
**Auth** (4):
- [ ] POST /auth/login
- [ ] POST /auth/register
- [ ] POST /auth/refresh
- [ ] POST /auth/logout

**Users** (3):
- [ ] GET /users/me
- [ ] PATCH /users/me
- [ ] GET /users/:id

**Admin** (4):
- [ ] GET /admin/pending-approvals
- [ ] POST /admin/roles/approve
- [ ] POST /admin/roles/reject
- [ ] GET /admin/audit-logs
- [ ] GET /admin/users

**Analytics** (3):
- [ ] POST /analytics/events
- [ ] GET /admin/analytics/summary
- [ ] GET /admin/analytics/events

**Properties** (6):
- [ ] GET /properties
- [ ] GET /properties/:id
- [ ] POST /properties
- [ ] PATCH /properties/:id
- [ ] DELETE /properties/:id
- [ ] GET /properties/map

### Frontend Migration
- [ ] Update lib/api/auth.js → HTTP calls
- [ ] Update lib/api/users.js → HTTP calls
- [ ] Update lib/api/properties.js → HTTP calls
- [ ] Update lib/analytics/providers/apiProvider.js
- [ ] Add token refresh logic
- [ ] Add auth interceptor
- [ ] Update tests for HTTP errors
- [ ] All 29 unit tests still pass

### Testing & Quality
- [ ] Backend unit tests (>80% coverage)
- [ ] Backend integration tests
- [ ] Auth flow tests
- [ ] RBAC enforcement tests
- [ ] Frontend tests pass
- [ ] E2E tests pass
- [ ] Manual smoke test

---

## 🚨 Critical Success Criteria

Phase 4 is **not complete** unless:

1. **Admin approvals persist across browsers**
   - Test: Approve role in Chrome → verify in Firefox incognito
   - Expected: Role status reflects backend state, not localStorage

2. **Analytics dashboard shows backend data**
   - Test: Clear localStorage → visit analytics dashboard
   - Expected: Dashboard shows events from database

3. **Tokens expire and refresh**
   - Test: Wait 15min → make API call
   - Expected: Token auto-refreshes, no manual login

4. **Audit logs created for admin actions**
   - Test: Approve role → query /admin/audit-logs
   - Expected: Entry exists with adminId, action, timestamp

5. **No Phase 1-3 regressions**
   - Test: Run full test suite
   - Expected: All 29 tests pass

---

## 📅 Suggested Timeline

| Day | Task | Owner |
|-----|------|-------|
| 1 | Backend bootstrap + Docker | Backend Dev |
| 2-3 | Auth + JWT implementation | Backend Dev |
| 4-5 | Admin authority + audit logs | Backend Dev |
| 6 | Analytics ingestion | Backend Dev |
| 7-8 | Frontend migration | Frontend Dev |
| 9-10 | Testing + hardening | Both |

**Total**: 10 working days

---

## 🔄 Migration Strategy

### Incremental Cutover (Recommended)

1. **Backend Ready** → keep frontend on localStorage
2. **Auth Works** → migrate login/register only
3. **Admin Works** → migrate role approval
4. **Analytics Works** → switch provider to `api`
5. **Properties Work** → full cutover
6. **Remove localStorage fallbacks** → backend-only mode

### Feature Flags (Optional)
```javascript
// lib/config.js
export const FEATURE_FLAGS = {
  USE_BACKEND_AUTH: process.env.NEXT_PUBLIC_USE_BACKEND_AUTH === 'true',
  USE_BACKEND_ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER === 'api',
  USE_BACKEND_PROPERTIES: process.env.NEXT_PUBLIC_USE_BACKEND_PROPERTIES === 'true',
};
```

---

## ⚠️ Risk Mitigation

### Risk 1: Token Refresh Logic
**Mitigation**: Implement interceptor with retry logic, test thoroughly

### Risk 2: CORS Issues
**Mitigation**: Configure CORS properly in Fastify, test cross-origin

### Risk 3: Breaking Changes
**Mitigation**: Keep localStorage as fallback during transition, remove later

### Risk 4: Performance Regression
**Mitigation**: Add loading states, implement caching, monitor metrics

---

## 📞 Communication Plan

### Daily Standup (5min)
- What was done yesterday?
- What's planned today?
- Any blockers?

### Weekly Review
- Demo working features
- Review test coverage
- Adjust timeline if needed

### Escalation Path
- **Blocker**: Message in Slack #casa-mx-dev
- **Security concern**: Tag @security-team immediately
- **Architecture question**: Schedule 30min call

---

## 📚 Documentation Updates Needed

After Phase 4:
- [ ] Update README.md with backend setup instructions
- [ ] Update QUICKSTART.md with API usage
- [ ] Create PHASE4_SUMMARY.md
- [ ] Update architecture diagrams
- [ ] Document API endpoints (OpenAPI/Swagger)
- [ ] Update deployment guide

---

## ✅ Sign-Off

Before starting Phase 4:

**Phase 3 Lead**: ✅ All deliverables complete  
**QA Lead**: ⏳ Awaiting sign-off  
**Product Owner**: ⏳ Awaiting sign-off  
**Backend Team**: ⏳ Ready to start

---

**Status**: 📋 Awaiting approval to proceed  
**Next Action**: Review PHASE4_MASTER_PROMPT.md and approve execution plan
