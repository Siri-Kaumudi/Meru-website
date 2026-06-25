# Production Deployment Guide — meracorporation.in

This guide deploys the Meru Darji Census website on your VPS.

**Project path on VPS:** `/opt/meru-website`

**Architecture:**

| Service | How it runs | Port / Path |
|---------|-------------|-------------|
| Frontend (React) | Built static files served by **host Nginx** | `/opt/meru-website/frontend/build/` |
| Backend (Express) | **Docker** (Node 22 image) | `127.0.0.1:5500` (internal) |
| MongoDB | **Docker** | `mongodb://localhost:27015/meru-website` (host access) |
| Nginx | Installed on VPS (not Docker) | Public ports `80`, `443` |

MongoDB is isolated on port **27015** and does not interfere with other MongoDB instances on your server.

---

## Prerequisites

- [ ] VPS with **Ubuntu 22.04 or 24.04**
- [ ] **Node.js 22.22.1** on the VPS (needed to build the frontend only)
- [ ] **Docker** and **Docker Compose**
- [ ] Root or sudo SSH access
- [ ] Domain **meracorporation.in** purchased
- [ ] Your VPS public IP address

Verify Node version (for frontend build):

```bash
node --version
# Should show v22.22.1
```

---

## Step 1 — Point Your Domain to the VPS

At your domain registrar, add:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `YOUR_VPS_IP` | 300 |
| A | `www` | `YOUR_VPS_IP` | 300 |

Check propagation:

```bash
ping meracorporation.in
```

---

## Step 2 — Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

---

## Step 3 — Install Docker

Docker runs **MongoDB and the backend**. The frontend is built on the host and served by Nginx.

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
```

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

```bash
docker --version
docker compose version
```

(Optional) Allow your user to run Docker without sudo:

```bash
sudo usermod -aG docker $USER
```

Log out and back in for this to take effect.

---

## Step 4 — Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Only ports 22, 80, and 443 are public. MongoDB (`27015`) and the API (`5500`) stay on localhost.

---

## Step 5 — Clone the Project

```bash
sudo mkdir -p /opt
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/meru-website.git
sudo chown -R $USER:$USER /opt/meru-website
cd /opt/meru-website
```

Replace the Git URL with your repository URL.

---

## Step 6 — Configure Backend Environment

```bash
cd /opt/meru-website/backend
cp .env.example .env
nano .env
```

Set these values:

```env
MONGO_URI=mongodb://localhost:27015/meru-website
PORT=5500
CLIENT_URL=https://meracorporation.in
JWT_SECRET=PASTE_A_LONG_RANDOM_STRING_HERE
ADMIN_USERNAME=admin
ADMIN_PASSWORD=PASTE_A_STRONG_PASSWORD_HERE
```

Generate a JWT secret:

```bash
openssl rand -base64 48
```

**Note:** `MONGO_URI` in `.env` is for host-side tools. Docker Compose overrides it inside the backend container to `mongodb://mongodb:27017/meru-website`.

**Do not** use the default password `Meru@Admin2024`.

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## Step 7 — Build and Start MongoDB + Backend (Docker)

From `/opt/meru-website`:

```bash
docker compose up -d --build
```

This starts:
- **mongodb** — available at `mongodb://localhost:27015/meru-website` on the host
- **backend** — API at `http://127.0.0.1:5500`

Verify containers:

```bash
docker compose ps
```

Both should show `running` (mongodb may show `healthy`).

Test API:

```bash
curl http://127.0.0.1:5500/api/health
```

Expected: `{"status":"ok","time":"..."}`

Test MongoDB from host:

```bash
mongosh mongodb://localhost:27015/meru-website
```

Type `exit` to leave the MongoDB shell.

---

## Step 8 — Create Admin User (One-Time)

```bash
cd /opt/meru-website
docker compose exec backend node scripts/createAdmin.js
```

Expected output:

```
Connected to MongoDB
✅  Admin created — username: admin
```

---

## Step 9 — Build the Frontend

Node.js on the host is only needed to build the React app:

```bash
cd /opt/meru-website/frontend
npm install
npm run build
```

This creates the production build at:

```
/opt/meru-website/frontend/build/
```

Nginx will serve files from this folder only.

---

## Step 10 — Install and Configure Nginx

Install Nginx:

```bash
sudo apt install -y nginx
```

**First time (before SSL):** copy the HTTP bootstrap into `sites-available` and enable it:

```bash
sudo mkdir -p /var/www/certbot
sudo cp /opt/meru-website/nginx/sites-available/meracorporation.in.http /etc/nginx/sites-available/meracorporation.in
sudo ln -sf /etc/nginx/sites-available/meracorporation.in /etc/nginx/sites-enabled/meracorporation.in
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

The config serves:
- Static files from `/opt/meru-website/frontend/build/`
- API requests proxied to `http://127.0.0.1:5500`

Test in browser:

```
http://meracorporation.in
```

Admin panel: `http://meracorporation.in/admin`

---

## Step 11 — Install SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain certificates with Certbot (same style as your other sites):

```bash
sudo certbot --nginx -d meracorporation.in -d www.meracorporation.in
```

Certbot updates `/etc/nginx/sites-available/meracorporation.in` automatically.

If you prefer to copy the HTTPS config manually after certificates exist:

```bash
sudo cp /opt/meru-website/nginx/sites-available/meracorporation.in /etc/nginx/sites-available/meracorporation.in
sudo nginx -t && sudo systemctl reload nginx
```

Alternative — webroot only (if not using `certbot --nginx`):

```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d meracorporation.in \
  -d www.meracorporation.in \
  --email YOUR_EMAIL@example.com \
  --agree-tos \
  --no-eff-email
```

Generate SSL options (if not already present from other sites on this VPS):

```bash
sudo curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -o /etc/letsencrypt/options-ssl-nginx.conf
sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
```

Then copy the HTTPS site config:

```bash
sudo cp /opt/meru-website/nginx/sites-available/meracorporation.in /etc/nginx/sites-available/meracorporation.in
sudo nginx -t && sudo systemctl reload nginx
```

Certificate files used by Nginx:

| File | Path |
|------|------|
| Certificate | `/etc/letsencrypt/live/meracorporation.in/fullchain.pem` |
| Private key | `/etc/letsencrypt/live/meracorporation.in/privkey.pem` |
| SSL options | `/etc/letsencrypt/options-ssl-nginx.conf` |
| DH params | `/etc/letsencrypt/ssl-dhparams.pem` |

Set up auto-renewal:

```bash
sudo certbot renew --dry-run
```

After SSL is active, update `backend/.env`:

```env
CLIENT_URL=https://meracorporation.in
```

Restart the backend container:

```bash
cd /opt/meru-website
docker compose restart backend
```

Test:

```
https://meracorporation.in
https://meracorporation.in/api/health
```

---

## Step 12 — Final Verification

| Feature | Test |
|---------|------|
| Home page | `https://meracorporation.in` |
| Registration | `/register` |
| Census counters | Home page |
| News | `/news` |
| Admin login | `/admin` |
| Admin dashboard | Stats, households |
| Excel export | Admin export button |
| News upload | Admin add news with image |

---

## Updating After Code Changes

```bash
cd /opt/meru-website
git pull

# Rebuild and restart backend + MongoDB
docker compose up -d --build

# Rebuild frontend
cd frontend
npm install
npm run build

# Reload nginx (usually not needed)
sudo nginx -t && sudo systemctl reload nginx
```

---

## Maintenance Commands

### Docker (MongoDB + Backend)

```bash
cd /opt/meru-website

# Status
docker compose ps

# Logs — all services
docker compose logs -f

# Logs — backend only
docker compose logs -f backend

# Logs — MongoDB only
docker compose logs -f mongodb

# Restart backend
docker compose restart backend

# Rebuild and restart everything
docker compose up -d --build

# Stop all containers
docker compose down
```

### MongoDB shell (from host)

```bash
mongosh mongodb://localhost:27015/meru-website
```

### MongoDB backup

```bash
docker compose exec mongodb mongodump --db meru-website --out /data/db/backup-$(date +%Y%m%d)
docker cp $(docker compose ps -q mongodb):/data/db/backup-$(date +%Y%m%d) ~/meru-backups/
```

---

## Optional — Migrate Existing Local Data

**On your local machine:**

```bash
mongodump --uri="mongodb://localhost:27015/meru-website" --out=./meru-backup
scp -r ./meru-backup root@YOUR_VPS_IP:~/
```

**On the VPS:**

```bash
cd /opt/meru-website
docker cp ~/meru-backup/meru-website $(docker compose ps -q mongodb):/tmp/restore
docker compose exec mongodb mongorestore --db meru-website /tmp/restore
```

---

## Troubleshooting

### Website loads but API fails

```bash
docker compose logs backend
curl http://127.0.0.1:5500/api/health
```

Check `backend/.env` and that containers are running (`docker compose ps`).

### CORS errors

Ensure `CLIENT_URL` in `backend/.env` matches your domain exactly:

```env
CLIENT_URL=https://meracorporation.in
```

Then:

```bash
docker compose restart backend
```

### MongoDB connection refused

```bash
docker compose ps
docker compose logs mongodb
mongosh mongodb://localhost:27015/meru-website
```

### Frontend shows old content

Rebuild and confirm Nginx root path:

```bash
cd /opt/meru-website/frontend && npm run build
ls /opt/meru-website/frontend/build/
```

Nginx must point to `/opt/meru-website/frontend/build` (see `nginx/sites-available/meracorporation.in`).

### Admin login fails

```bash
docker compose exec backend node scripts/createAdmin.js
```

### Backend container keeps restarting

```bash
docker compose logs backend
```

Usually caused by missing `JWT_SECRET` in `backend/.env` or MongoDB not ready yet.

---

## File Reference

| File / Path | Purpose |
|-------------|---------|
| `/opt/meru-website/docker-compose.yml` | MongoDB + backend containers |
| `/opt/meru-website/backend/Dockerfile` | Backend image (Node 22) |
| `/opt/meru-website/backend/.env` | Production secrets |
| `/opt/meru-website/frontend/build/` | Built React app (Nginx serves this) |
| `/opt/meru-website/nginx/sites-available/meracorporation.in.http` | HTTP bootstrap — use before Certbot |
| `/opt/meru-website/nginx/sites-available/meracorporation.in` | HTTPS config (Certbot style) — use after SSL |
| `/opt/meru-website/nginx/README.md` | Copy/symlink instructions |

---

## Security Checklist

- [ ] Strong `JWT_SECRET` (not the example value)
- [ ] Strong `ADMIN_PASSWORD` (not `Meru@Admin2024`)
- [ ] HTTPS enabled via Certbot
- [ ] Firewall allows only 22, 80, 443
- [ ] MongoDB bound to `127.0.0.1:27015` only
- [ ] API on `127.0.0.1:5500` only (proxied by Nginx)
- [ ] `backend/.env` never committed to git
