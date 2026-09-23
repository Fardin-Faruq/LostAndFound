# Sprint 2 Plan - Lost2Found

## Sprint Goal
Implement item discovery features, advanced search and filtering, item detail views, and the student personal dashboard so users can track their reports.

## Sprint Duration
Sprint 2

## Sprint Backlog

| ID | User Story | Story Points | Status |
|---|---|---|---|
| **US-3.2** | As a student, I want to search and filter reports by keyword, category, and date so that I can quickly find relevant items. | 5 | ✅ Done |
| **US-3.3** | As a student, I want to view the details of a specific report so that I can determine if it's my item. | 3 | ✅ Done |
| **US-1.4** | As a student, I want to view my profile and past reports so that I can track my activity. | 5 | ✅ Done |

## Technical Tasks

| Task | Status |
|---|---|
| Add search (`?search=`) query parameter support to GET /api/items | ✅ Done |
| Add category, date range, and sort filters to GET /api/items | ✅ Done |
| Build `BrowseItems` page with search bar + filter dropdowns | ✅ Done |
| Build `ItemDetails` page showing item info and claim button | ✅ Done |
| Build `MyDashboard` page: my reports, my claims, possible matches | ✅ Done |
| Add GET /api/items/mine endpoint | ✅ Done |
| Add GET /api/items/matches endpoint (matching engine) | ✅ Done |

## Definition of Done (DoD)
- All search and filter parameters work correctly in the API
- Frontend renders search results reactively
- Item detail page shows full item information
- My Dashboard shows user's reports and claim history
- CI pipeline passes

## Velocity
- Story Points Completed: 13
- Story Points Planned: 13
