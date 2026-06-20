# మేరు దర్జీ కుల సమాజం — Setup Guide

## Requirements
- Node.js 18+
- MongoDB (running locally on port 27017)
- npm

---

## 1. Install Dependencies

```bash
# From the meru-website folder:
npm install
cd server && npm install
cd ../client && npm install
```

---

## 2. Start MongoDB
Make sure MongoDB is running locally. Install from https://www.mongodb.com/try/download/community

---

## 3. Create Admin User (one-time)

```bash
cd server
node scripts/createAdmin.js
```
Default credentials: **admin / Meru@Admin2024**
(Change these in server/.env before going live!)

---

## 4. Start the App

```bash
# From root folder — starts both server + client:
npm run dev
```

- Website: http://localhost:5173
- Server API: http://localhost:5000
- Admin Panel: http://localhost:5173/admin

---

## 5. Add Leader Photos & Names

Edit `client/src/data/leaders.js` with real names and designations.
Place photos in `client/public/leaders/` and update the `photo` field:
```js
photo: '/leaders/president.jpg'
```

---

## 6. Change Admin Password

Edit `server/.env`:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourNewStrongPassword
```
Then re-run: `cd server && node scripts/createAdmin.js`

---

## Run Tests

```bash
# Server validation tests:
cd server && node tests/validators.test.js

# Client validation tests (run after npm install in client):
cd client && node src/utils/validators.test.js
```

---

## File Structure

```
meru-website/
├── server/              ← Node.js + Express API
│   ├── models/          ← MongoDB schemas
│   ├── routes/          ← API routes
│   ├── middleware/      ← JWT auth
│   ├── scripts/         ← Admin setup
│   └── tests/           ← Validation tests
└── client/              ← React frontend
    └── src/
        ├── pages/       ← Home, Register, Success, Admin
        ├── components/  ← Reusable UI components
        ├── utils/       ← API, validators, districts
        └── data/        ← Leaders data
```

---

## Production Deployment

1. Update `server/.env` with your MongoDB Atlas URI
2. Set a strong `JWT_SECRET`
3. Build the client: `cd client && npm run build`
4. Serve the `client/dist` folder via Nginx or similar
5. Run server with PM2: `pm2 start server/index.js`
