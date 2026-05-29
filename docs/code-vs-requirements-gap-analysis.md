# MED-CARE Ethiopia: Code vs. Requirements Gap Analysis

**Date:** 2026-05-29
**Scope:** Comparison of documented requirements in `docs/project.md` against implemented code across all three microservices.

---

## 1. AI & Intelligent Services (Critical Gaps)

| Requirement (from project.md) | Status | Details |
|---|---|---|
| **AI Symptom Checker** (UC-08) | ❌ Missing | No symptom analysis, triage, diet/workout recommendations. `medcare-ai.controller.ts` only proxies to an external webhook — no local AI logic. |
| **Prescription OCR via Mistral AI** (UC-09) | ❌ Missing | `prescriptions.controller.ts` has an upload endpoint, but the `/scan` endpoint is a placeholder webhook. No Mistral AI SDK or OCR pipeline. |
| **RAG-powered Medical Chatbot** (UC-11) | ❌ Missing | Chat endpoint proxies to `MEDCARE_AI_WEBHOOK_URL`. No Pinecone vector DB, no embedding generation, no document retrieval. |
| **Voice Search** (Amharic/English) | ❌ Missing | Document specifies voice input for multimodal search. Not implemented anywhere. |
| **Semantic Search via Pinecone** | ❌ Missing | Chapter 5 says MongoDB Atlas Search replaced Pinecone, but code uses only basic `$text` search — no `$search` aggregation. |
| **Amharic-language AI Chatbot** | ❌ Missing | Frontend has Amharic i18n translations (1250+ keys) but the AI chatbot backend has no Amharic-specific NLP or model. |

---

## 2. Notifications & Real-Time Alerts

| Requirement | Status | Details |
|---|---|---|
| **Push Notifications for Disease Alerts** | ❌ Missing | `DiseaseAlert` model/routes exist, but no WebPush, no socket event delivery, no notification queue. |
| **Real-time Order/Delivery Status Notifications** | ❌ Missing | No notification infrastructure. `socket.io` is in `package.json` but never used for notifications. |
| **SMS OTP via EthioTelecom** | ❌ Missing | Sequence diagram 3.3.4.1.1 specifies SMS OTP. Email-based OTP exists but no SMS integration. |
| **Rate-limited Alerts / Opt-in/out per Region** | ❌ Missing | Alert broadcast UI exists in admin frontend, but no actual delivery mechanism. |

---

## 3. Security & Compliance

| Requirement | Status | Details |
|---|---|---|
| **End-to-End Encryption (RSA + AES-256)** | ❌ Missing | `ENCRYPTION_KEY` env var exists and models have `encryptedContent` fields, but messages are stored as **plaintext** (`content` field). No encrypt/decrypt logic. |
| **MFA for Suppliers (Pharmacies)** | ❌ Missing | MFA is implemented for admin only. Document requires MFA for suppliers too. |
| **Data Deletion Policy (Right to be Forgotten)** | ❌ Missing | No user data deletion endpoints or scheduled cleanup. |
| **Audit Logs for Critical Actions** | ⚠️ Partial | AuditLog model exists but not consistently logged across all critical actions. |
| **Rate Limiting** | ⚠️ Partial | `express-rate-limit` imported but not actively configured per-route. |
| **FHIR Standards for Health Data Exchange** | ❌ Missing | No FHIR implementation or health data interoperability. |

---

## 4. Delivery & Logistics

| Requirement | Status | Details |
|---|---|---|
| **GPS-based Real-time Driver Tracking** | ❌ Missing | Delivery driver `location` endpoint saves coordinates but no real-time tracking UI or map feed. |
| **Route Optimization** | ❌ Missing | No automated route planning for deliveries. |
| **Dynamic Delivery Pricing** | ❌ Missing | No distance/urgency-based pricing logic. |
| **Driver Rating System** | ❌ Missing | No driver-specific rating or accountability system. |

---

## 5. Payment & Subscription

| Requirement | Status | Details |
|---|---|---|
| **Cash on Delivery** (UC-05) | ❌ Missing | Only Chapa payment implemented. No COD option. |
| **Subscription Management** | ❌ Missing | Document describes a `Subscription` entity. Not implemented. |
| **Commission Accrual/Payment** | ⚠️ Partial | Models exist but processing logic appears incomplete. |

---

## 6. PWA & Offline Capabilities

| Requirement | Status | Details |
|---|---|---|
| **Service Worker / Offline Caching** | ❌ Missing | No `service-worker.js`, no `manifest.json`, no IndexedDB caching. |
| **Low-Bandwidth Mode** | ❌ Missing | No adaptive content loading or bandwidth detection. |
| **Offline Medication/Facility Search** | ❌ Missing | No offline data persistence for core search features. |

---

## 7. Infrastructure & DevOps

| Requirement | Status | Details |
|---|---|---|
| **Kafka Event Streaming** | ❌ Missing | `kafkajs` not in any `package.json`. No Kafka producer/consumer code despite being mentioned in Chapter 5. |
| **CI/CD Pipeline** | ❌ Missing | No GitHub Actions, no automated test runner, no deployment pipeline. |
| **99.95% Uptime SLA** | ❌ Missing | No health monitoring, auto-scaling config, or uptime guarantees. |
| **Daily Backups / Disaster Recovery** | ❌ Missing | No backup scripts or DR plan implemented. |
| **Distributed Tracing** | ❌ Missing | No tracing infrastructure. |
| **Feature Flags** | ❌ Missing | No feature flag system for risky features. |

---

## 8. Testing

| Requirement | Status | Details |
|---|---|---|
| **Unit Tests (Jest)** | ❌ Minimal | Only 2 test files exist (`health.test.ts`, `auth-guard.test.ts`). No service/controller tests. |
| **Integration Tests** | ❌ Missing | No API integration tests. |
| **E2E Tests (Cypress)** | ❌ Missing | Not implemented. |
| **Load / Stress Tests** | ❌ Missing | Not implemented. |

---

## 9. Integration with External Systems

| Requirement | Status | Details |
|---|---|---|
| **DHIS2 Integration** | ❌ Missing | Document specifies integration with national health systems. |
| **eCHIS Integration** | ❌ Missing | Not implemented. |
| **Master Facility Registry** | ❌ Missing | Not referenced in code. |
| **EthioTelecom SMS Gateway** | ❌ Missing | Not integrated. |

---

## 10. Architectural Inconsistencies (Doc vs Code)

| Document Claim | Code Reality |
|---|---|
| Monolithic architecture (Chapter 4) | Microservices architecture (2 backends + frontend) |
| Kafka for event streaming | No Kafka dependency or code |
| pnpm + Turborepo monorepo | Not a monorepo; three independent projects |
| MongoDB Atlas Search (`$search`) | Only basic `$text` search used |
| Pinecone vector database | Not used at all |
| Single shared database | Each service manages its own DB connection (potentially shared Atlas DB) |

---

## Summary

| Category | Total Requirements | Implemented | Partial | Missing |
|---|---|---|---|---|
| AI & Intelligent Services | 7 | 0 | 0 | **7** |
| Notifications & Alerts | 4 | 0 | 0 | **4** |
| Security & Compliance | 6 | 0 | 2 | **4** |
| Delivery & Logistics | 4 | 0 | 0 | **4** |
| Payment & Subscription | 3 | 0 | 1 | **2** |
| PWA & Offline | 3 | 0 | 0 | **3** |
| Infrastructure & DevOps | 6 | 0 | 0 | **6** |
| Testing | 4 | 0 | 1 | **3** |
| External Integrations | 4 | 0 | 0 | **4** |
| **Total** | **41** | **0** | **4** | **37** |

---

## Key Recommendations

1. **AI Pipeline** — Implement actual Mistral AI OCR + RAG with vector DB (Pinecone or Atlas Search `$search`) + symptom checker logic
2. **Notifications** — Integrate WebPush, socket.io events, and SMS gateway (EthioTelecom)
3. **E2E Encryption** — Implement actual RSA/AES encrypt/decrypt in message send/receive flow
4. **PWA** — Add service worker, manifest, IndexedDB caching, and offline fallback
5. **Tests** — Add unit/integration/E2E tests as documented
6. **Infrastructure** — Add Kafka/event bus, CI/CD, monitoring (Prometheus/Grafana), backup scripts
