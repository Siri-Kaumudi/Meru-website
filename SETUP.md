# మేరు దర్జీ కుల సమాజం — Setup Guide

## Requirements
- Node.js 18+ (production VPS uses Node 22.22.1)
- MongoDB (local: port 27015, or Docker via `docker compose up -d`)
- npm

---

## 1. Install Dependencies

```bash
# From the meru-website folder:
npm run install:all
```

Or manually:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

---

## 2. Start MongoDB

**Option A — Docker (recommended, isolated on port 27015):**

```bash
docker compose up -d
```

**Option B — Local MongoDB** on port 27015.

---

## 3. Create Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your JWT_SECRET and ADMIN_PASSWORD
```

---

## 4. Create Admin User (one-time)

```bash
cd backend
node scripts/createAdmin.js
```

Default credentials in docs: **admin / Meru@Admin2024** — change before production!

---

## 5. Start the App (Development)

```bash
# From root folder — starts both backend + frontend:
npm run dev
```

- Website: http://localhost:5173
- Server API: http://localhost:5500
- Admin Panel: http://localhost:5173/admin

---

## 6. Add Leader Photos & Names

Edit `frontend/src/data/leaders.js` with real names and designations.
Place photos in `frontend/public/leaders/` and update the `photo` field:

```js
photo: '/leaders/president.jpg'
```

---

## 7. Change Admin Password

Edit `backend/.env`:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourNewStrongPassword
```

Then re-run: `cd backend && node scripts/createAdmin.js`

---

## Run Tests

```bash
# Backend validation tests:
cd backend && node tests/validators.test.js

# Frontend validation tests:
cd frontend && node src/utils/validators.test.js
```

---

## File Structure

```
meru-website/
├── backend/             ← Node.js + Express API
│   ├── models/          ← MongoDB schemas
│   ├── routes/          ← API routes
│   ├── middleware/      ← JWT auth
│   └── scripts/         ← Admin setup
├── frontend/            ← React frontend
│   └── src/
│       ├── pages/       ← Home, Register, Success, Admin
│       ├── components/  ← Reusable UI components
│       ├── utils/       ← API, validators, districts
│       └── data/        ← Leaders data
├── docker-compose.yml   ← MongoDB + backend
└── nginx/nginx.conf     ← Sample host Nginx config
```

---

## Production Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for full VPS setup with:
- Frontend build at `/opt/meru-website/frontend/build/`
- Backend via Docker (`docker compose up -d --build`, port 5500)
- MongoDB via Docker at `mongodb://localhost:27015/meru-website`
- Nginx on the host (not Docker)
