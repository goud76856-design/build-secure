# Project Approach & Architecture — Build Secure 24

**Team ID:** 61
**Project Name:** ShipFlow — Enterprise Shipment Management & Logistics Platform
**Team Size:** 4 Members (Lingala Sri Charan Reddy, Konakati Manikesh Reddy, Gangu Jashwant, Badamoni Arya Goud)
**Primary Track / Domain:** Secure Logistics & Full-Stack Cloud Engineering

---

## 1. Problem Understanding, Scope & Threat Model

### 1.1 Problem Statement & Real-World Motivation
Modern supply chain logistics suffer from opaque shipment tracking, unauthorized status manipulation, lack of verified chain-of-custody, and insecure role boundaries between customers, drivers, and dispatchers. **ShipFlow** addresses this by providing a robust, full-stack logistics management platform with strict state machine transitions, server-side role-based access control (RBAC), tamper-evident audit logging, and privacy-safe public tracking.

### 1.2 Target Users & Personas
- **Customer:** Submits shipments, tracks real-time progress, views estimated delivery dates, and receives status updates.
- **Delivery Personnel (Driver):** Executes assigned pickups and deliveries, updates transit milestones with mandatory proof-of-delivery or failure justification.
- **Administrator / Dispatcher:** Oversees operations, manages fleet and rate cards, assigns shipments, inspects immutable audit logs, and monitors system health.

### 1.3 Threat Model & Attack Surface
- **Critical Assets:** User authentication credentials, recipient & sender PII (phone, address, email), shipment chain-of-custody records, financial rate cards, and audit logs.
- **Potential Attack Vectors:**
  - *Privilege Escalation:* Unauthorized users attempting to invoke driver or admin status updates. Mitigated via strict server-side middleware and role checks.
  - *Insecure Direct Object References (IDOR):* Customers attempting to view or cancel other customers' shipments. Mitigated via database-level ownership filtering.
  - *Arbitrary State Forgery:* Attackers jumping directly from `CREATED` to `DELIVERED`. Mitigated via an authoritative server-side state transition validator.
  - *PII Leakage in Public Tracking:* Unauthenticated users viewing full names or exact street addresses via `/track`. Mitigated via privacy-masked public response DTOs.
  - *Input Tampering & SQLi:* Mitigated using Prisma ORM parameterized queries and strict Zod validation schemas.

---

## 2. Technical Architecture & Secure System Design

### 2.1 High-Level Architecture Overview
ShipFlow is structured as a modern full-stack web architecture:
- **Client Tier:** Next.js React 18 App Router with Tailwind CSS, responsive role dashboards, and dynamic Recharts analytics.
- **API & Domain Tier:** Next.js Server Actions and Route Handlers with session-based HttpOnly authentication, Zod validation, and state machine enforcement.
- **Persistence Tier:** Prisma ORM backed by SQLite for zero-friction local development and automated testing, with direct portability to PostgreSQL for production deployment.
- **Security & Audit Subsystem:** Centralized audit logger capturing actor, action, target entity, timestamp, and metadata for all state mutations.

### 2.2 Technology Stack Rationale
- **Next.js & TypeScript:** Industry-standard type safety, server-side data isolation, and fast deployment compatibility.
- **Prisma ORM:** Strong type-safe database queries with zero manual SQL injection vulnerabilities.
- **Bcrypt & Session Auth:** Time-tested salted password hashing with secure session cookie tokens.
- **Zod & React Hook Form:** Bulletproof schema validation for multi-step shipment forms.

---

## 3. Implementation Milestones & 24-Hour Timeline

| Milestone / Phase | Time Window | Key Objectives & Deliverables | Security Verification | Status |
|---|---|---|---|---|
| **Phase 1: Foundation & Setup** | 0h – 3h | Architecture spec, repo configuration, Next.js scaffolding in `src/`, Prisma models | Plan approved & secret scan clean | `In Progress` |
| **Phase 2: Auth & Core Domain** | 3h – 8h | Multi-role authentication (Customer, Driver, Admin), session guards, RBAC | Auth tests & password hashing verified | `Planned` |
| **Phase 3: Workflows & Tracking**| 8h – 14h | 5-step shipment creator, state transition engine, driver delivery actions, public `/track` | State machine tests & IDOR protection | `Planned` |
| **Phase 4: Admin & Dashboards** | 14h – 19h | Operations dashboard, driver assignment, rate cards, audit logs, system health | Admin authorization & CSV sanitize | `Planned` |
| **Phase 5: Tests & Hardening** | 19h – 24h | Vitest unit/integration tests, Playwright E2E flows, production build, final commit freeze | 100% passing tests & clean build | `Planned` |

---

## 4. Architecture Decision Records (ADRs)

### ADR-001: [Title of First Major Decision]
- **Status:** [Proposed | Accepted | Superseded]
- **Context:** *What was the architectural context, problem, or requirement?*
- **Options Considered:** 
  1. *Option A (e.g., choice 1)*
  2. *Option B (e.g., choice 2)*
- **Decision & Rationale:** *What was decided and why was it chosen over alternatives?*
- **Security & Performance Trade-offs:** *What are the security implications or performance impacts?*

### ADR-002: [Title of Second Major Decision]
- **Status:** [Proposed | Accepted | Superseded]
- **Context:**
- **Options Considered:**
- **Decision & Rationale:**
- **Security & Performance Trade-offs:**

---

## 5. Engineering Journal & Real-Time Decision Log

*Maintain this chronological log as your team builds during the 24-hour hackathon.*

### [YYYY-MM-DD HH:MM IST] Entry 1: Project Initialization & Scope Lock
- **Focus:** Initial repository setup, team alignment, and schema architecture.
- **Key Challenges:** 
- **Resolution:** 

### [YYYY-MM-DD HH:MM IST] Entry 2: Implementation Milestone Progress
- **Focus:** 
- **Key Challenges:** 
- **Resolution:** 

---

## 6. Testing, Security Verification & Deployment Record

### 6.1 Testing & Security Verification Strategy
- **Unit & Integration Tests:** (Describe test coverage in `src/`)
- **Static Analysis & Linting:** (Lint and security checks run)

### 6.2 Deployment Verification
- **Live Deployment Platform:** (e.g., Vercel, Render, Railway, AWS)
- **Deployment URL:** (Recorded in `metadata/submission.yaml` and `deployment/README.md`)
- **Health Check Endpoint:** (e.g., `/health` or `/api/health`)
