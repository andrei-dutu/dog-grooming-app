---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
workflowStatus: complete
completedAt: '2026-05-13'
releaseMode: phased
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-05-13-0000.md']
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general
  complexity: low-medium
  projectContext: greenfield
---

# Product Requirements Document - PawBook

**Author:** Andreipop
**Date:** 2026-05-13

## Executive Summary

PawBook is a web-based dog grooming salon platform that eliminates the friction between pet owners and professional groomers. Customers browse verified groomer profiles, select from clearly defined services with transparent durations and pricing, and book confirmed appointments in under 60 seconds — without phone calls or back-and-forth. Each booking is anchored to a specific dog profile, so groomers arrive informed and owners arrive confident.

The platform serves three actors: **customers** who need fast, trustworthy booking; **groomers** who need a structured, surprise-free schedule; and **salon owners** who need a professional digital storefront they control.

### What Makes This Special

Most salon booking experiences are either a phone call or a generic calendar widget. PawBook's differentiator is the **dog-first booking flow** — the pet is a first-class citizen in the system, not an afterthought in a notes field. When a groomer opens their day, they see which dogs are coming, their breed, temperament, and service history. When a customer books, they pick the dog, not just a time slot. This creates a layer of trust and professionalism that generic booking tools can't replicate.

Groomers own their availability and service catalog. The salon owner manages the business without a developer. The system enforces scheduling integrity through service-aware time-blocking — no double bookings, no Saint Bernard surprises.

## Project Classification

- **Project Type:** Web Application (React SPA, role-based, real-time availability)
- **Domain:** Local service marketplace — general complexity
- **Complexity:** Low-medium — no regulatory constraints; primary complexity is scheduling logic and role-based auth
- **Project Context:** Greenfield — built from scratch
- **Team:** 6 developers, one-week delivery window
- **Tech Stack:** React (frontend) + Node.js + Express (backend) + PostgreSQL (database TBD)

## Success Criteria

### User Success

- A customer can discover a groomer, review their profile (bio, services, credentials), and complete a booking in under 60 seconds
- The groomer profile page is the trust conversion point — customers feel confident before booking based on what they see there
- A groomer starts every day with a full view of their schedule: dog name, breed, temperament, service booked — zero surprises
- No double-bookings occur — service-aware time-blocking prevents scheduling conflicts automatically
- A groomer can block time (breaks, days off) and their calendar reflects it instantly
- The salon owner can create groomer accounts and manage salon information without developer involvement

### Business Success

- All three user roles (Customer, Groomer, Admin) are fully functional end-to-end
- The booking flow is demonstrable as a complete, unbroken journey from registration to confirmed appointment
- The system handles the core constraint: multiple groomers, variable service durations, no conflicts
- App is production-ready (deployable) by end of week

### Technical Success

- Role-based authentication works correctly across all three roles
- Booking logic enforces service duration constraints and prevents double-booking
- Dog profiles are linked to customer accounts and surfaced correctly to groomers at booking time
- React frontend communicates cleanly with Node.js + Express backend

### Measurable Outcomes

- Complete booking flow works end-to-end for a first-time customer
- Groomer dashboard correctly reflects all bookings with full dog/customer context
- Admin can add a groomer and that groomer can immediately configure services and availability

## User Journeys

### Journey 1 — Sarah books Biscuit's first appointment (Customer — Happy Path)

Sarah, 32, just moved to the area and has a golden retriever named Biscuit due for a groom. She finds the PawBook site. She's immediately on the groomer listing page — profile cards with photos, specialties, and ratings. She spots a groomer who lists "great with anxious dogs" and has a 5-star rating. She clicks in, reads the bio, sees the service list with clear prices and durations. She feels confident. She clicks Book, picks "Full Groom (2 hrs)", sees the available slots for next week, picks Tuesday 10am, selects Biscuit from her dog profile, and confirms. Done in under 60 seconds. She gets an instant confirmation. No phone tag, no waiting.

*Reveals requirements:* Groomer listing, groomer profile page, service catalog, availability calendar, booking flow, dog profile selection, instant confirmation.

---

### Journey 2 — Sarah cancels and re-books (Customer — Edge Case)

Sarah's plans change — she can't make Tuesday. She logs into her dashboard, finds the upcoming appointment, and cancels it herself with one click. The slot opens back up on Marco's calendar automatically. She then picks a new slot for the following Friday. No phone call, no awkward conversation.

Additionally: If the groomer cancels, Sarah sees it on her dashboard with a reason, and can re-book directly from there.

*Reveals requirements:* Customer dashboard, customer-initiated cancellation, automatic slot release on cancel, booking status visibility, groomer cancellation flow, re-booking capability.

---

### Journey 3 — Marco manages his Tuesday (Groomer — Happy Path)

Marco logs in Monday evening to check tomorrow. His dashboard shows 5 bookings in order: 9am Biscuit (Golden Retriever, anxious, Full Groom), 11am Max (Poodle, nail trim only, 30 min), 1pm — blocked for lunch, 2pm Rocky... He goes to bed knowing exactly what's coming. At 9am, Sarah walks in. He already knows Biscuit's name, breed, and that he's anxious. He greets them both by name. Sarah is immediately impressed.

*Reveals requirements:* Groomer dashboard with daily view, dog/customer dossier per booking, break blocking.

---

### Journey 4 — Diana onboards a new groomer (Admin — Happy Path)

The salon hired a new groomer, Alex. Diana logs into her admin panel, clicks "Add Groomer," fills in Alex's name, email, and bio. Alex gets an invite email, sets a password, and logs in as a groomer. He adds his services and sets his working hours. He's live on the site within 10 minutes. Diana didn't write a line of code.

*Reveals requirements:* Admin groomer creation, invite flow, groomer self-setup (services + availability), admin master calendar.

---

### Journey Requirements Summary

| Capability Area | Driven By |
|---|---|
| Auth + role-based access | All journeys |
| Groomer profiles + listing | Journey 1 |
| Service catalog with duration/price | Journey 1 |
| Availability calendar + slot blocking | Journey 1, 3 |
| Dog-first booking flow | Journey 1 |
| Customer dashboard + booking management | Journey 2 |
| Customer self-cancellation + slot release | Journey 2 |
| Groomer cancellation + customer visibility | Journey 2 |
| Groomer daily dashboard + dossier | Journey 3 |
| Admin groomer management | Journey 4 |
| Salon info pages | Journey 1 (discovery) |

## Product Scope

### MVP — Minimum Viable Product

- Customer registration, login, dog profile creation
- Groomer listing page + individual groomer profile page (bio, services, credentials)
- Service catalog per groomer (name, duration, price)
- Real-time availability calendar with service-aware slot blocking
- Booking flow: groomer → service → slot → dog → instant confirm
- Customer dashboard (view/cancel upcoming appointments)
- Groomer dashboard (daily booking view with dog/customer dossier)
- Groomer availability management (set hours, block breaks)
- Admin panel: create/remove groomer accounts, view master calendar, update salon info
- Salon info pages (About, location/map, contact, hours)

### Growth Features (Post-MVP)

- Appointment reminders via email/notification
- Post-groom photo upload by groomer
- Groomer match quiz (breed/size → recommended groomer)
- Before/after photo gallery per groomer
- Groomer ratings and verified reviews

### Vision (Future)

- Multi-location salon support
- Loyalty/rewards system
- Mobile app

## Web Application Specific Requirements

### Project-Type Overview

PawBook is a React single-page application (SPA) served via a Node.js + Express backend. The frontend communicates with the backend via REST API. Three distinct role-based views (Customer, Groomer, Admin) are served from the same SPA with route-level access control.

### Technical Architecture Considerations

- **SPA architecture** — React handles all routing client-side; Express serves the API and static build
- **Role-based routing** — protected routes enforced both client-side (UX) and server-side (API auth middleware)
- **Auth strategy** — JWT tokens or session-based auth; all API endpoints validate role before responding

### Browser Support

- Modern browsers only: Chrome, Firefox, Safari, Edge (latest 2 versions)
- No IE11 or legacy browser support required

### Real-Time Availability

- **MVP:** Availability refreshes on page load — slots reflect current state when the calendar is opened
- **Aspirational (if deployed):** Live slot updates via polling or WebSocket — a booked slot disappears for other users without a page refresh
- Implementation decision deferred to architecture phase; MVP must not depend on real-time infrastructure

### Responsive Design

- Mobile-friendly layout required — customers will book from phones
- Groomer and Admin dashboards may be desktop-first given their management nature

### SEO

- Out of scope for this project

### Accessibility

- Basic accessibility: semantic HTML, proper form labels, image alt text
- Target: WCAG AA compliance as a good-practice goal, not a hard requirement

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — deliver the complete end-to-end booking experience as a working, demonstrable product within one week.
**Resource Requirements:** 6 developers, each owning one vertical slice (auth, booking logic, groomer profiles, booking flow UI, customer dashboard, admin panel).

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Customer registers, creates dog profile, browses groomers, books appointment
- Customer cancels or views their appointments from dashboard
- Groomer views daily schedule with full dog/customer context, manages availability and services
- Admin creates groomer accounts, views master calendar, updates salon info

**Must-Have Capabilities:**
- Customer registration, login, and dog profile management
- Groomer listing page + individual groomer profile (bio, services, credentials)
- Service catalog per groomer (name, duration, price)
- Real-time availability calendar with service-aware slot blocking
- Booking flow: groomer → service → slot → dog → instant confirm
- Customer self-cancellation with automatic slot release
- Customer dashboard (upcoming appointments, cancel)
- Groomer dashboard (daily booking view with dog/customer dossier)
- Groomer availability management (working hours, break blocking)
- Admin panel: create/remove groomer accounts, master calendar, salon info
- Salon info pages (About, location/map, contact, hours)

### Post-MVP Features

**Phase 2 (Growth):**
- Appointment reminders via email/notification
- Post-groom photo upload by groomer
- Groomer match quiz (breed/size → recommended groomer)
- Before/after photo gallery per groomer
- Groomer ratings and verified reviews

**Phase 3 (Vision):**
- Multi-location salon support
- Loyalty/rewards system
- Mobile app

### Risk Mitigation Strategy

**Technical Risks:** Booking availability logic (service-aware slot blocking + conflict prevention) is the highest-risk component — assign the strongest backend developer to this on day 1. Do not parallelize this with auth; auth must be stable before booking logic is built on top of it.

**Resource Risks:** If time runs short, simplify the Admin master calendar to a basic groomer list view. The customer booking flow and groomer dashboard must not be cut — they are the demo centerpiece.

**Scope Creep:** Reminders and photo upload are the most tempting additions. Hold the line until all MVP features are green.

## Functional Requirements

### User Account Management

- FR1: A visitor can register as a Customer with email and password
- FR2: A Customer can log in and out securely
- FR3: A Customer can create one or more Dog Profiles (name, breed, weight, temperament, notes)
- FR4: A Customer can edit and delete their Dog Profiles
- FR5: A Groomer can log in using credentials created by the Admin
- FR6: An Admin can log in with an admin-level account
- FR7: The system enforces role-based access — Customers, Groomers, and Admins see only their permitted views

### Groomer Discovery

- FR8: A Customer can browse a listing of all active Groomers
- FR9: A Customer can view a Groomer's full profile (bio, photo, credentials, specialties)
- FR10: A Customer can view a Groomer's service catalog (service name, duration, price)

### Booking Flow

- FR11: A Customer can select a Groomer and a Service to initiate a booking
- FR12: The system displays available time slots based on the Groomer's availability and the selected service's duration
- FR13: The system prevents booking of slots that are already taken or blocked
- FR14: A Customer can select which of their Dogs the appointment is for
- FR15: A Customer can confirm a booking and receive an instant confirmation (no approval step)
- FR16: A Customer can cancel an upcoming appointment
- FR17: Cancelling an appointment automatically releases the slot back to the Groomer's calendar

### Groomer Schedule Management

- FR18: A Groomer can define their working hours
- FR19: A Groomer can block specific time slots (breaks, days off)
- FR20: A Groomer can view their daily appointment schedule
- FR21: Each appointment on the Groomer's schedule shows the dog's name, breed, temperament, and service booked
- FR22: A Groomer can cancel an appointment with a reason
- FR23: A cancelled appointment is visible to the affected Customer with the cancellation reason
- FR24: A Groomer can manage their own service catalog (add, edit, remove services with name, duration, price)

### Customer Dashboard

- FR25: A Customer can view all their upcoming appointments
- FR26: A Customer can view past appointment history
- FR27: A Customer can re-book after a cancellation (by navigating back to the booking flow)

### Admin Panel

- FR28: An Admin can create a new Groomer account (name, email, bio)
- FR29: An Admin can deactivate or remove a Groomer account
- FR30: An Admin can view a master calendar showing all bookings across all Groomers
- FR31: An Admin can update salon information (name, description, hours, location, contact details)

### Salon Public Pages

- FR32: Any visitor can view the salon's About page (story, team overview)
- FR33: Any visitor can view the salon's contact information and location/map
- FR34: Any visitor can view the salon's operating hours

## Non-Functional Requirements

### Performance

- NFR1: Page load time must not exceed 3 seconds on standard broadband
- NFR2: Booking confirmation (from slot selection to confirmed state) must complete within 5 seconds
- NFR3: Groomer availability calendar must render current slot state within 2 seconds of page load
- NFR4: API responses for read operations (groomer list, availability) must complete within 1 second under normal load

### Security

- NFR5: All user passwords must be stored as hashed values (bcrypt or equivalent) — never plaintext
- NFR6: All API endpoints must validate the caller's role before returning data or performing actions
- NFR7: JWT tokens (or sessions) must expire and require re-authentication after a reasonable timeout
- NFR8: Customer data (dog profiles, contact info) must only be accessible to the owning Customer, their booked Groomer, and Admins
- NFR9: All data in transit must use HTTPS

### Reliability

- NFR10: A booking operation must be atomic — a slot is either fully booked or fully available; partial states are not permitted
- NFR11: Cancellation must release the slot immediately — no orphaned bookings
- NFR12: The system must not permit two simultaneous bookings for the same Groomer slot (race condition protection)
