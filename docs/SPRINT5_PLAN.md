# Sprint 5 Plan - Lost2Found

## Sprint Goal
Containerize the application with Docker, expand automated test coverage across all major API workflows, and finalize project documentation.

## Sprint Duration
Sprint 5

## Sprint Backlog

| ID | User Story | Story Points | Status |
|---|---|---|---|
| **US-7.1** | As a developer, I want to containerize the application using Docker so that it runs consistently across environments. | 8 | ✅ Done |

## Technical Tasks

| Task | Status |
|---|---|
| Create multi-stage `server/Dockerfile` (TypeScript build → production Alpine node image) | ✅ Done |
| Create multi-stage `client/Dockerfile` (Vite build → nginx static serving with SPA routing) | ✅ Done |
| Create root `docker-compose.yml` (MongoDB + Server + Client + named volumes) | ✅ Done |
| Expand `server/tests/api.test.ts` with full CRUD coverage | ✅ Done |
| Add tests for: office endpoints (stats, receive item, return item, claims workflow) | ✅ Done |
| Add tests for: notification endpoints | ✅ Done |
| Add tests for: matching engine edge cases | ✅ Done |
| Create Sprint 2–4 plan documents | ✅ Done |
| Create Sprint 1 Review document | ✅ Done |
| Update Sprint 1 plan with completed statuses | ✅ Done |

## Docker Architecture

```
docker-compose up
    ├── mongo:7          → port 27017  (persistent volume: mongo_data)
    ├── lost2found-server → port 5000  (persistent volume: uploads_data)
    └── lost2found-client → port 80    (nginx, SPA routing)
```

### Environment Variables (set in .env or CI secrets)
| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `MONGODB_URI` | Auto | Set by docker-compose to internal mongo service |
| `CLOUDINARY_CLOUD_NAME` | Optional | Enables Cloudinary image storage |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret |

## Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f server
```

## Running Locally (without Docker)

```bash
# Server
cd server && npm install && npm run dev

# Client (separate terminal)
cd client && npm install && npm run dev
```

## Definition of Done (DoD)
- `docker-compose build` succeeds for all services
- All three services start correctly with `docker-compose up`
- Test suite passes with `npm test` in the server directory
- All sprint documentation is complete and accurate
- CI pipeline passes all steps

## Velocity
- Story Points Completed: 21
- Story Points Planned: 21
