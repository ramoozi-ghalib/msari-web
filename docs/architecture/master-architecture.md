# Governance Rules

Every AI agent working on this repository MUST read this document before making architectural decisions.

If any implementation conflicts with this document, this document takes precedence.

No architecture decision may be changed without updating this document and creating a new ADR (Architecture Decision Record).

# MSARI Platform - Master Architecture

Version: 1.0
Status: Approved
Last Updated: YYYY-MM-DD

---

# 1. Vision

MSARI is a unified hotel booking platform.

The Flutter application is the primary business platform.

The website is a public booking portal.

Both products operate on the same business data.

---

# 2. Architecture Principles

Single Source of Truth

API First

No Duplicate Business Logic

Shared Authentication

Shared Booking Engine

Offline-safe Website

Incremental Synchronization

---

# 3. System Overview

Flutter App

↓

Firebase

↓

MSARI API

↓

Website Sync Engine

↓

Website Database

↓

Next.js Website

---

# 4. Source of Truth

Hotels

Source:
Firebase

Replica:
Website DB

---

Rooms

Source:
Firebase

Replica:
Website DB

---

Cities

Source:
Firebase

Replica:
Website DB

---

Amenities

Source:
Firebase

Replica:
Website DB

---

Prices

Source:
Firebase

Replica:
Website DB

---

Discounts

Source:
Firebase

Replica:
Website DB

---

Users

Source:
Firebase Authentication

Website:
Authentication only

No duplicated accounts.

---

Bookings

Source:
Firebase

Replica:
Website DB (Read Only)

---

Articles

Source:
Website

---

SEO

Source:
Website

---

Site Settings

Source:
Website

---

Analytics

Source:
Website

---

# 5. Authentication

Authentication Provider

Firebase Authentication

Supported Login

Email

Google

Phone

Apple (Future)

Website MUST NOT maintain another user system.

---

# 6. Booking Flow

Website

↓

Booking API

↓

Firebase

↓

Application

All bookings must use the same backend.

---

# 7. Synchronization

Direction

Firebase

↓

Website

Never reverse.

No two-way sync.

Incremental synchronization.

---

# 8. Website Responsibilities

Render hotels

Search

SEO

Booking UI

Blog

Pages

Dashboard

Analytics

---

# 9. Flutter Responsibilities

Hotel management

Room management

Pricing

Availability

Amenities

Cities

Offers

Business rules

---

# 10. Admin Dashboard

The website dashboard is NOT a hotel management system.

It manages:

Bookings

Pages

Blog

SEO

Site Settings

Sync Monitoring

Reports

Users (Read)

---

# 11. API Strategy

REST API

Versioned

/v1/

JWT Authentication

Pagination

Filtering

Sorting

Search

---

# 12. Sync Engine

Incremental

UpdatedAt based

Retry support

Logging

Conflict detection

Rollback support

---

# 13. Security

HTTPS only

JWT

Rate Limiting

Audit Logs

Secrets in Environment Variables

---

# 14. Performance

Website serves data from PostgreSQL.

Never from Firebase directly.

API used for synchronization only.

---

# 15. Non Goals

WordPress

Direct SQL Migration

Two-way synchronization

Duplicate authentication

Duplicate booking engine

---

# 16. Future Roadmap

API

Sync Engine

Website Integration

Authentication

Booking

Monitoring

Launch

---

# 17. Architecture Decision Records

ADR-001

WordPress removed permanently.

ADR-002

Firebase becomes Single Source of Truth.

ADR-003

Website stores synchronized replica.

ADR-004

Authentication shared using Firebase Auth.

ADR-005

Booking engine unified.

ADR-006

Dashboard no longer manages hotels.

---

END OF DOCUMENT