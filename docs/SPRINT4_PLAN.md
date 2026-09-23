# Sprint 4 Plan - Lost2Found

## Sprint Goal
Implement the intelligent matching engine, in-app notification system, image upload support, and surface match results to students on their dashboard.

## Sprint Duration
Sprint 4

## Sprint Backlog

| ID | User Story | Story Points | Status |
|---|---|---|---|
| **US-6.1** | As the system, I want to calculate a match score between lost and found items based on category, color, brand, location, date proximity, and description similarity. | 8 | ✅ Done |
| **US-6.2** | As a student, I want to receive an in-app notification when a possible match is found for my lost item. | 5 | ✅ Done |
| **US-6.3** | As a student, I want to receive notifications about the status of my claims so that I know when to pick up my item. | 5 | ✅ Done |
| **US-2.3** | As a student, I want to upload an image of the lost/found item so that it is easily identifiable. | 5 | ✅ Done |

## Technical Tasks

| Task | Status |
|---|---|
| Build `DeterministicMatchingEngine` with 6-factor scoring (category, brand, color, location, date proximity, text similarity) | ✅ Done |
| Integrate match engine into `createItem` — auto-notify users on FOUND item creation | ✅ Done |
| Create `Notification` Mongoose model | ✅ Done |
| Build `NotificationService` with helpers for each notification type | ✅ Done |
| Build `/api/notifications` endpoints (GET, mark read, mark all read) | ✅ Done |
| Build `NotificationPanel` React component (bell icon + badge + dropdown) | ✅ Done |
| Integrate `NotificationPanel` into Navbar | ✅ Done |
| Build `imageService.ts` with base64 decoding + local disk fallback + Cloudinary support | ✅ Done |
| Add image upload zone to Report Lost / Report Found forms | ✅ Done |
| Expose matches on `MyDashboard` page | ✅ Done |

## Matching Algorithm Details
The `DeterministicMatchingEngine` scores lost↔found item pairs on a 0–100 scale:

| Factor | Max Points | Logic |
|---|---|---|
| Category | 20 | Exact match |
| Brand | 15 | Exact match (case-insensitive) |
| Color | 10 | Partial string match |
| Location | 15 | Partial string match |
| Date Proximity | 15 | ≤2 days → 15, ≤5 days → 10, ≤14 days → 5 |
| Text Similarity | 25 | Jaccard token similarity on title + description |

A score ≥ 35 surfaces as a match candidate. Score ≥ 40 triggers a push notification.

## Definition of Done (DoD)
- Matching engine correctly scores item pairs and ranks them
- Students see possible matches on their dashboard
- Notification bell shows real-time unread count (polled every 30s)
- Image upload accepts file picker input and stores locally or on Cloudinary
- All new endpoints are authenticated and tested
- CI pipeline passes

## Velocity
- Story Points Completed: 23
- Story Points Planned: 23
