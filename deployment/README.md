# Deployment Documentation — ShipFlow (Build Secure 24)

## Overview
**ShipFlow** is an enterprise logistics and shipment management platform built with Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, and SQLite (local) / PostgreSQL (production).

---

## Live Deployment Reference
- **Local Application URL:** `http://localhost:3000`
- **Health Check Endpoint:** `http://localhost:3000/api/health`
- **Repository:** `https://github.com/goud76856-design/build-secure`
- **Evaluator Pre-Configured Demo Accounts (All password: `ShipFlow2026!`):**
  - **Administrator:** `admin@shipflow.com` (Operations Director — Eleanor Vance)
  - **Delivery Driver 1:** `driver.john@shipflow.com` (North Zone Courier — John Davis)
  - **Delivery Driver 2:** `driver.sarah@shipflow.com` (Central Zone Bike Courier — Sarah Jenkins)
  - **Customer 1:** `customer.alice@gmail.com` (Acmetron Technologies — Alice Zhang)
  - **Customer 2:** `customer.bob@gmail.com` (Apex Retail — Robert Sterling)

---

## Required Environment Variables

| Variable Name | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | SQLite file or PostgreSQL connection URI | `file:./dev.db` |
| `JWT_SECRET` | 256-bit secret key for signing auth session tokens | `shipflow_enterprise_secret_auth_key_october_2026_production` |
| `NEXT_PUBLIC_APP_URL` | Base canonical application domain | `http://localhost:3000` |
| `NODE_ENV` | Runtime environment mode | `production` / `development` |

---

## Local Launch & Verification Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Database & Seed Demo Data:**
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

3. **Run Automated Test Suites:**
   ```bash
   npm test
   ```

4. **Build & Start Production Server:**
   ```bash
   npm run build
   npm run start
   ```
   Open `http://localhost:3000` in your web browser.
