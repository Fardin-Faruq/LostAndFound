# Sprint 3 Plan - Lost2Found

## Sprint Goal
Implement the full physical office workflow and claims management system: admins can receive items, assign storage, review/approve/reject claims, and mark items as returned.

## Sprint Duration
Sprint 3

## Sprint Backlog

| ID | User Story | Story Points | Status |
|---|---|---|---|
| **US-1.3** | As an admin, I want to log in with an admin role so that I can verify and manage claims. | 3 | ✅ Done |
| **US-4.1** | As an admin, I want to confirm physical receipt of a found item so that the system accurately reflects the physical office inventory. | 5 | ✅ Done |
| **US-4.2** | As an admin, I want to view a dashboard with statistics (total lost/found, pending claims) so that I can monitor office activity. | 5 | ✅ Done |
| **US-4.3** | As an admin, I want to assign a physical storage location to an item so that it can be easily retrieved. | 3 | ✅ Done |
| **US-4.4** | As an admin, I want to mark an item as "Returned" upon handover so that the report is closed. | 3 | ✅ Done |
| **US-5.1** | As a student, I want to submit a claim for a found item by providing private verification details. | 5 | ✅ Done |
| **US-5.2** | As an admin, I want to review submitted claims and their verification answers so I can approve or reject them. | 8 | ✅ Done |

## Technical Tasks

| Task | Status |
|---|---|
| Create `Claim` Mongoose model (status: PENDING, UNDER_REVIEW, APPROVED, REJECTED) | ✅ Done |
| Add role-based middleware (`isAdmin`) | ✅ Done |
| Build `/api/office/stats` endpoint | ✅ Done |
| Build `/api/office/items` endpoint (FOUND item inventory) | ✅ Done |
| Build `/api/office/items/:id/receive` endpoint (mark physical receipt + storage) | ✅ Done |
| Build `/api/office/items/:id/return` endpoint | ✅ Done |
| Build `/api/office/claims` endpoint (list all claims for admin) | ✅ Done |
| Build `/api/office/claims/:id/review`, `/approve`, `/reject` endpoints | ✅ Done |
| Build `POST /api/items/:id/claims` for student claim submission | ✅ Done |
| Build `OfficeDashboard` page: stats cards, claims queue, inventory panel | ✅ Done |
| Send notifications on claim status changes | ✅ Done |

## Definition of Done (DoD)
- Admin can log in and access Office Dashboard
- Admin can receive a physical item and assign a shelf location
- Admin can approve or reject a claim with a reason
- Student is notified of claim status change
- All office endpoints are protected with admin-only middleware
- CI pipeline passes

## Velocity
- Story Points Completed: 32
- Story Points Planned: 32
