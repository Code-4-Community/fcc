<div align="center">
  
# Technical Handoff & Architecture Documentation
**Project:** FCC Donation Platform  
**Organization:** Code4Community 
**Date:** June 2026  

</div>

<br />

## Table of Contents
1. [System Architecture & Core Stack](#1-system-architecture--core-stack)
2. [Integrations & Key Services](#2-integrations--key-services)
3. [Storage & Hosting (TBD)](#3-storage--hosting-tbd)
4. [Widget Build & Distribution](#4-widget-build--distribution)
5. [Styling Architecture](#5-styling-architecture)
6. [Environment & Containerization](#6-environment--containerization)
7. [Credits & Contributors](#7-credits-contributors)
8. [Maintenance & Contact](#8-maintenance--contact)

<div style="page-break-after: always;"></div>

## 1. System Architecture & Core Stack
The repository is structured as an **Nx Monorepo**.

### Backend (`apps/backend`):
-   **Framework:** NestJS (10.x).
-   **Data Layer:** PostgreSQL accessed via TypeORM. SQLite is retained for specific local test scaffolding.
-   **Validation:** DTOs processed via `class-validator` and `class-transformer`.
-   **Testing:** Jest and Supertest for E2E specs.

### Frontend (`apps/frontend`):
-   **Framework:** React 18 built with Vite.
-   **Routing:** React Router v6.
-   **UI Libraries:** Tailwind CSS natively bridging with `shadcn/ui` (`@radix-ui`) and `lucide-react` icons.
-   **Rich Text:** Tiptap (`@tiptap/react`, `@tiptap/starter-kit`) for email/content editing.
-   **Analytics:** Recharts for admin dashboard data visualization.

---

## 2. Integrations & Key Services

### Stripe (Payments):
-   **Frontend:** `@stripe/react-stripe-js` and `@stripe/stripe-js`. Uses `<CardElement>` / `<PaymentElement>` for PCI-compliant tokenization and intent confirmation.
-   **Backend:** Handles `Stripe webhook` verification (`STRIPE_WEBHOOK_SECRET`) to confirm payment fulfillment before executing database mutations.

### AWS Cognito (Authentication):
-   **Architecture:** Offloads user management and auth state. Frontend interacts via `amazon-cognito-identity-js`.
-   **Backend Verification:** Protected routes use `@nestjs/passport` with `passport-jwt` and `jwks-rsa`. The backend verifies the RSA signatures of incoming Cognito JWTs without pinging AWS per request.

### AWS SES (Email Comms):
-   **Architecture:** Transactional emails dispatch via `@aws-sdk/client-ses`. 
-   **Fallback/Wrapper:** A custom AWS SES wrapper operates alongside standard Node email patterns to handle bulk sends and template resolution.

---

## 3. Storage & Hosting (TBD)

### AWS Amplify & S3:
-   **TBD:** Infrastructure and deployment mapping for Amplify (frontend hosting) and S3 (asset block storage) are pending finalization.

---

## 4. Widget Build & Distribution
The React frontend functions as an embeddable widget injected into client sites (specifically WordPress).

-   **Compiler Target:** `apps/frontend/vite.embed.config.mts` builds the frontend into a single IIFE (Immediately Invoked Function Expression) artifact.
-   **Environment Bridging:** The API URL is not baked in at build time. The config maps `import.meta.env.VITE_API_BASE_URL` to `window.__FCC_DONATION_API_URL__`. The WordPress PHP script dynamically defines this global variable on the page before loading the React script, ensuring the widget can point to different environments dynamically.
-   **Artifact:** The build pipeline generates `fcc-donation.zip` containing the compiled React assets and the `fcc-donation.php` loader.

---

## 5. Styling Architecture
The UI relies on **Tailwind CSS** combined with **shadcn/ui** (Radix UI primitives). 

Raw CSS is largely prohibited, but the following specific modules utilize `.css` files for highly custom component scopes:
-   `apps/frontend/src/styles.css` & `root.css`: Application base layers and Tailwind directive injections.
-   `apps/frontend/src/containers/donations/donations.css`: Layout constraints for the core donation stepper flow.
-   `apps/frontend/src/components/GrowingGoal/GrowingGoal.module.css`: Bespoke CSS module for the interactive goal tracker.
-   `apps/frontend/src/components/testimonials/testimonials.css`: Carousel/testimonial structural styling.

---

## 6. Environment & Containerization
Local development and infrastructure bootstrapping is handled via Docker Compose (`docker-compose.dev.yml`).

### Container Topology:
-   **`postgres`**: The database container.
-   **`adminer`**: UI for database inspection.
-   **`backend-dev`**: Node Alpine container running the NestJS dev server with hot-reload (`nodemon`/`ts-node`).

### Execution Commands:
-   `yarn docker:up:dev` — Boots the local topology.
-   `yarn docker:migrate:dev` — Executes TypeORM migrations inside the active backend container.

### Environment Variables (`.env`):
Copies of `example.env` require specific distributions:
-   **System/Database:** Handled locally via Docker defaults (`NX_DB_HOST`, `NX_DB_PASSWORD`).
-   **Shared Infrastructure:** Require shared dev-pool keys for `COGNITO`, `STRIPE`, and `AWS_SES`. 
-   **IAM Access:** `NX_AWS_ACCESS_KEY` and `NX_AWS_SECRET_ACCESS_KEY` must be generated individually per developer from the AWS IAM Console for local SES Console.

<div style="page-break-after: always;"></div>

## 7. Credits
Built by the FCC Dev Team of Code4Community (Rotated team throughout September 2025 -- July 2026):

### Engineering
- Aaron Ashby (Tech Lead)
- Thanin (Bew) Kongkiatsophon (Tech Lead)
- Ben Petrillo
- Eric Sun
- Gauri Rajesh
- Gillian Scott
- Hannah Piersol
- Jayden Carvajal
- Pujita Kalinadhabhotla
- Sam Nie

### Design
- Matthew Chavez Cruz (Design Lead)
- Ashley Yoon
- Cindy Tran
- Matthew Wheeler

### Product Management
- Alex Choi (Product Lead)
- Imogen Slavin

---

## 8. Maintenance & Contact
> **Note:** This project is finalized for the 2025–2026 build cycle and is **no longer actively maintained** by the original Code4Community FCC development team.

For any historical context, architectural questions, or handoff clarifications, please reach out to **Thanin (Bew) Kongkiatsophon** at [bewxtt@gmail.com](mailto:bewxtt@gmail.com).
