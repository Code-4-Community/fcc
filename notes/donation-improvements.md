# Donation Flow Improvements

## Overview
- Tailwind + shadcn will replace the legacy CSS for the donation form and provide structured primitives for each step.
- Step 2 must combine donor data, payment entry, and `DonationSummary` inside the new styling system while Stripe Elements handle PCI-safe card collection.
- The backend already exposes filtering/searching helpers; the remaining work is wiring the frontend admin controls to those endpoints.

## Tasks
1. Re-implement `Step2Details` with Tailwind + shadcn components, include `DonationSummary`, and remove the legacy CSS reference once the design is aligned.
2. Install `@stripe/stripe-js` and `@stripe/react-stripe-js`, and add a `StripeProvider` (e.g., `StripeProvider.tsx`) that wraps `DonationForm` (or the app entry point) to supply `Elements`.
3. Replace raw card inputs with `<CardElement>` or `<PaymentElement>` inside Step 2 and hook into Stripe’s `useStripe`/`useElements` to simulate intent creation/confirmation until the backend endpoint exists.
4. Add admin dashboard controls that leverage `DonationsRepository.findPaginated` filters and `searchByDonorNameOrEmail` so donors can be filtered/searched by date, amount, status, anonymity, etc.

## Acceptance Criteria
- Step 2 renders using Tailwind/shadcn primitives, shows the `DonationSummary`, and the old CSS is no longer imported for that component.
- `StripeProvider` exists, Stripe Elements collect payment details, and the flow can advance with mocked intent handling (the backend endpoint is not yet available).
- Admin dashboard exposes filter/search UI wired to the backend pagination API, including fields for date range, amount range, status, and donor search.
- Provide a screenshot of the updated Step 2 layout (including summary) before merging.
- Ensure the Stripe flow has been exercised against a running backend (local dev server is fine) or mocked response, and mention how you verified it in the PR description.
