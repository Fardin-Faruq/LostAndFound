# Lost2Found

A smart campus Lost and Found Management Portal designed to bridge the gap between students losing/finding items and the physical campus Lost and Found Office.

This project uses Agile and DevOps methodologies for development.

## Tech Stack
**Frontend:** React (Vite), TypeScript, Tailwind CSS, React Router
**Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT
**DevOps:** GitHub Actions, Docker (Dockerfile), Jest

## Features (Sprint 1 MVP)
- User Authentication (Register/Login with JWT)
- Report a Lost Item
- Report a Found Item (with prompt to return physical item)
- Browse active items feed
- Responsive UI and CI workflow

## Local Setup

### 1. Backend Server
```bash
cd server
npm install
# Rename .env.example to .env and configure MongoDB URI
npm run dev
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```

## Agile Artifacts
- [Product Backlog](docs/PRODUCT_BACKLOG.md)
- [Sprint 1 Plan](docs/SPRINT1_PLAN.md)

## Testing
To run backend tests:
```bash
cd server
npm test
```
