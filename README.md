# ShipFlow — Enterprise Shipment & Logistics Management Platform

> **Build Secure 24** — Official Submission  
> **Host:** Abhedya — VBIT Cybersecurity Forum, Vignana Bharathi Institute of Technology, Hyderabad  
> **Team ID:** 61 | **Team Name:** Soul Reapers  
> **GitHub Repository:** [https://github.com/goud76856-design/build-secure](https://github.com/goud76856-design/build-secure)  
> **Submission Deadline:** October 6, 2026, 11:00 AM IST

---

## 1. Executive Summary

**ShipFlow** is a full-stack, enterprise-grade shipment lifecycle and logistics platform engineered to provide end-to-end operational visibility, rigorous role-based access control (RBAC), and bulletproof finite state machine (FSM) transition integrity across the entire freight lifecycle.

Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**, ShipFlow unifies three distinct stakeholder personas into a single, cohesive, production-ready system:
1. **Customers**: Self-service shipment booking wizard with dynamic volumetric pricing quote, real-time parcel telemetry, and thermal label generation.
2. **Delivery Personnel (Drivers)**: Mobile-optimized run-sheet dispatch, sequential stop workflow, canvas-based Proof of Delivery (POD) signature capture, and delivery failure exception logging.
3. **Operations Administrators**: Fleet dispatch grid, courier re-assignment, live operational KPI dashboards powered by Recharts, override governance with mandatory justification logs, and sanitized CSV exports.

---

## 2. System Architecture & Tech Stack

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Next.js 14 App Router UI                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐  │
│  │ Customer Portal  │  │  Driver Terminal │  │ Admin Command Center   │  │
│  │ (/customer)      │  │  (/driver)       │  │ (/admin)               │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────────┬────────────┘  │
└───────────┼─────────────────────┼────────────────────────┼───────────────┘
            │                     │                        │
┌───────────▼─────────────────────▼────────────────────────▼───────────────┐
│                      Next.js API & Route Handlers                        │
│  ┌───────────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │ RBAC & JWT Auth Layer │  │ Zod Input Guard  │  │ Finite State Mach.│  │
│  └──────────┬────────────┘  └────────┬─────────┘  └─────────┬─────────┘  │
└─────────────┼────────────────────────┼──────────────────────┼────────────┘
              │                        │                      │
┌─────────────▼────────────────────────▼──────────────────────▼────────────┐
│                    Persistence & Data Access Layer                       │
│                   Prisma ORM (SQLite / PostgreSQL)                       │
│    Users · Shipments · Addresses · Events · AuditLogs · RateCards        │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Frontend & Fullstack Framework**: Next.js 14 (React 18, App Router, Server & Client Components)
- **Language**: TypeScript 5 (Strict type checking enabled)
- **Styling**: Tailwind CSS with custom design tokens, modern dark-slate aesthetic, and responsive breakpoints
- **Data Persistence**: Prisma ORM with SQLite for zero-dependency local verification, seamlessly portable to PostgreSQL
- **Security & Auth**: `jose` (JWT with HS256), `bcryptjs` password hashing, `httpOnly` `sameSite=lax` secure session cookies
- **Data Validation**: `zod` 3.x schema validation on every API endpoint
- **Data Visualization**: `recharts` for administrative delivery throughput, state distribution, and driver workload
- **Testing**: `vitest` unit and integration test runner

---

## 3. Finite State Machine (FSM) Lifecycle

Every shipment in ShipFlow follows an authoritative, tamper-proof state machine enforced in `src/lib/stateMachine.ts`. Unauthorized or illegal transitions (e.g., jumping from `DRAFT` directly to `DELIVERED`) are strictly rejected with HTTP 400.

```
       ┌───────────┐
       │   DRAFT   │
       └─────┬─────┘
             │ (Customer / Admin submit)
             ▼
       ┌───────────┐         (Customer / Admin cancel)
       │  CREATED  ├───────────────────────────────────┐
       └─────┬─────┘                                   │
             │ (Customer pay / Admin confirm)          │
             ▼                                         │
       ┌───────────┐                                   │
       │ CONFIRMED ├───────────────────────────────────┤
       └─────┬─────┘                                   │
             │ (Driver pickup)                         │
             ▼                                         │
       ┌───────────┐                                   │
       │ PICKED_UP │                                   │
       └─────┬─────┘                                   │
             │ (Hub scan)                              │
             ▼                                         ▼
       ┌───────────┐                             ┌───────────┐
       │IN_TRANSIT │                             │ CANCELLED │
       └─────┬─────┘                             └───────────┘
             │ (Driver departure)
             ▼
       ┌──────────────────┐
       │ OUT_FOR_DELIVERY │
       └───────┬──┬───────┘
               │  │
  (POD Signed) │  │ (Delivery Failed: recipient absent, bad address)
               │  ▼
               │  ┌─────────────────┐
               │  │ DELIVERY_FAILED │
               │  └────────┬────────┘
               │           │ (Return to depot)
               ▼           ▼
        ┌───────────┐ ┌──────────┐
        │ DELIVERED │ │ RETURNED │
        └───────────┘ └──────────┘
```

---

## 4. Key Security & Compliance Features

### 🛡️ Privacy-Preserving Public Tracking (`/track`)
- Accessible publicly without requiring user authentication.
- **Strict PII Redaction**: Origin and destination street addresses and personal names are systematically stripped before serialization. Only city, state, postal code, current milestone status, and estimated delivery dates are exposed.

### 🔐 Multi-Tier Role-Based Access Control (RBAC)
- **Customer**: Strictly isolated to their own shipments (`userId` scoped). Cannot inspect or modify foreign parcels.
- **Driver**: Restricted to assigned run-sheet shipments. Can only perform delivery milestone updates (`PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `DELIVERY_FAILED`).
- **Administrator**: Full system visibility, driver dispatch control, and state override authority. Every manual override requires a mandatory textual reason that is permanently recorded in the immutable audit log.

### 📋 Comprehensive Audit Logging
- Every status transition, administrative override, driver assignment, and pricing change writes an immutable record to the `AuditLog` table capturing: `timestamp`, `userId`, `action`, `entityType`, `entityId`, `details`, and `ipAddress`.

### 📊 Formula Injection (CSV Injection) Protection
- Administrative CSV exports sanitize all cell strings. Any field beginning with `=`, `+`, `-`, or `@` is prepended with a single quote (`'`) to neutralize remote code execution vulnerabilities in spreadsheet applications.

---

## 5. Pre-Configured Evaluator Test Accounts

All accounts are pre-seeded and share the password: **`ShipFlow2026!`**  
The login page at `/auth/login` includes **1-click quick-fill buttons** for fast evaluation!

| Role | Email | Password | Name / Description |
|---|---|---|---|
| **Administrator** | `admin@shipflow.com` | `ShipFlow2026!` | Eleanor Vance (Fleet Director) |
| **Delivery Driver** | `driver.john@shipflow.com` | `ShipFlow2026!` | John Davis (North Zone Van Courier) |
| **Delivery Driver** | `driver.sarah@shipflow.com` | `ShipFlow2026!` | Sarah Jenkins (Central Zone Bike Courier) |
| **Customer** | `customer.alice@gmail.com` | `ShipFlow2026!` | Alice Zhang (Acmetron Technologies) |
| **Customer** | `customer.bob@gmail.com` | `ShipFlow2026!` | Robert Sterling (Apex Retail) |

---

## 6. Local Quickstart & Verification Guide

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 1. Installation
```bash
npm install
```

### 2. Database Setup & Seeding
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Run Automated Tests
```bash
npm test
```
All **19 unit and integration tests** verify state transitions, pricing calculations, PII masking, auth tokens, and audit log generation.

### 4. Build and Launch Production Server
```bash
npm run build
npm run start
```
The application will be live at **`http://localhost:3000`**.

### 5. Health Check
```bash
curl http://localhost:3000/api/health
```
Returns JSON confirming database connectivity, active shipment count, and latency metrics.

---

## 7. Project Structure

```
├── prisma/
│   ├── schema.prisma             ← Database model specifications
│   └── seed.js                   ← Deterministic enterprise demo seed script
├── src/
│   ├── app/                      ← Next.js 14 App Router routes & layouts
│   │   ├── page.tsx              ← Public landing page with feature showcase
│   │   ├── track/                ← Privacy-preserving parcel tracking page
│   │   ├── auth/                 ← Authentication pages (Login & Register)
│   │   ├── customer/             ← Customer dashboard, 5-step wizard, parcel view
│   │   ├── driver/               ← Driver mobile-optimized run sheet & POD screen
│   │   ├── admin/                ← Admin command center, dispatch, analytics, audit
│   │   └── api/                  ← Secure REST endpoints & webhook handlers
│   ├── components/               ← Shared UI components (Navigation, Modals, Forms)
│   ├── lib/
│   │   ├── auth.ts               ← JWT token generation, verification, and cookie helpers
│   │   ├── stateMachine.ts       ← Authoritative FSM transition graph & permissions
│   │   ├── pricing.ts            ← Dynamic volumetric pricing & surcharge calculator
│   │   ├── tracking.ts           ← Tracking number generator & PII masker
│   │   ├── validators.ts         ← Zod validation schemas
│   │   ├── audit.ts              ← Immutable audit logger
│   │   └── prisma.ts             ← Singleton Prisma client instance
│   └── __tests__/                ← Automated Vitest test suites
├── docs/
│   ├── APPROACH.md               ← Technical approach & threat model
│   └── logs.txt                  ← Verbatim turn-by-turn prompt execution history
└── metadata/
    ├── team.yaml                 ← Team 61 registration metadata
    └── submission.yaml           ← Final submission verification record
```

---

## 8. Team Members — Soul Reapers (Team 61)

| Member Name | Official Email | Personal Email |
|---|---|---|
| **Lingala Sri Charan Reddy** | `24p61a6269@vbithyd.ac.in` | `lingalasricharanreddy@gmail.com` |
| **Konakati Manikesh Reddy** | `24p61a6266@vbithyd.ac.in` | `manikeshreddy04@gmail.com` |
| **Gangu Jashwant** | `24p61a0216@vbithyd.ac.in` | `jaswanthbtech009@gmail.com` |
| **Badamoni Arya Goud** | `24p61a0410@vbithyd.ac.in` | `goud76856@gmail.com` |

---
*Built with precision and security for Build Secure 24.*
