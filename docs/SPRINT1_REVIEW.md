# Sprint 1 Review - Lost2Found

## Sprint Goal Achieved ✅
Build the foundational project structure, CI pipeline, authentication system, and core reporting functionality.

## Sprint Duration
Sprint 1 — Completed

## Completed User Stories

| ID | User Story | Status | Notes |
|---|---|---|---|
| **US-1.1** | Register with university email | ✅ Done | JWT auth, bcrypt password hashing |
| **US-1.2** | Secure login | ✅ Done | Returns JWT token, stored in localStorage |
| **US-2.1** | Submit a lost report | ✅ Done | POST `/api/items` with type=LOST |
| **US-2.2** | Submit a found report | ✅ Done | POST `/api/items` with type=FOUND |
| **US-3.1** | View all active reports | ✅ Done | BrowseItems page with filter support |
| **US-7.2** | CI/CD pipeline | ✅ Done | GitHub Actions: lint + test on push/PR |

## What Went Well
- Backend API structure is clean and extensible (Express + TypeScript + Mongoose)
- JWT authentication middleware works correctly across all protected routes
- GitHub Actions CI pipeline triggers on every push to main/master
- Vite + React + TailwindCSS frontend setup is fast to iterate on

## What Could Be Improved
- Sprint 1 plan statuses were listed as "Not Started" even after completion — tracking should be updated in real-time
- Test coverage in Sprint 1 only covered basic auth; more comprehensive tests needed

## Definition of Done — Checklist
- [x] Code pushed to version control
- [x] CI pipeline passes
- [x] Backend APIs for Auth, Lost, Found, Item Listings are functional
- [x] Frontend forms validate and submit to APIs
- [x] Code follows project structure conventions
- [x] Agile documentation updated

## Velocity
- Story Points Completed: 21
- Story Points Planned: 21

---
*Review conducted by: Development Team*
