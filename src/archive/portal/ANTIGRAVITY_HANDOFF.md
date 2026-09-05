# LogTraq Master Handoff for Antigravity

**Authoritative as of:** 2026-07-15
**Purpose:** Preserve the final business decisions, product architecture, implementation direction, design structure, regulatory boundary, and sales approach so work can continue from another computer and model.

> This document overrides older strategy in this repository, including README language describing LogTraq as a multi-sector hub or treating Education as active.

---

## 1. Final Business Decision

LogTraq is now **finance only**.

Finance includes the operational work surrounding:

- Tax practices
- Bookkeepers and accounting practices
- Payroll bureaus
- VAT and month-end bookkeeping
- Provisional and corporate tax
- Company-secretarial and CIPC work
- SARS notices and verification
- Audit-evidence preparation
- Later, carefully bounded FICA/FSP administration

Education is retired. Do not propose education products, tuition systems, student systems, application trackers, or a return to a general multi-industry hub unless the user explicitly reverses this decision.

The user is strongest when approaching a specific researched person rather than a faceless crowd. Structure sales around one finance practice relationship that exposes LogTraq to many recurring client workflows.

Sales model:

> Demo-led. Async-first. Call-second.

No live call should be required until a prospect replies with interest or submits a setup request.

---

## 2. Product Positioning

Working category:

> Finance operations software for South African practices.

Core positioning:

> LogTraq is the client-action and evidence-readiness layer between finance practices, their clients, and systems such as SARS eFiling, CIPC, Sage, Xero, and payroll software.

Supporting statement:

> Collect client evidence, track readiness, route professional review, and keep every deadline defensible without replacing the practice's accounting, payroll, or filing software.

LogTraq is not a ledger, payroll calculator, tax engine, investment-advice engine, lender, filing bot, or full accounting-practice replacement.

It owns:

- Who owes what information
- For which client/entity, service, and period
- What evidence was requested
- What was received, accepted, rejected, or replaced
- Who must prepare, review, approve, submit, or follow up
- What deadline or exception needs attention
- Whether external submission occurred
- Where proof and audit history live

---

## 3. Product Shape

This is **one finance-practice operations hub** with the Tax module as the first fully live workspace.

Do not build separate Tax, UIF, VAT, and CIPC mini-apps. Use one shell, one client system, one document system, one task system, and one deadline engine.

One client/company can have overlapping obligations. Separate mini-portals would duplicate clients, documents, communication, permissions, and deadlines.

    Public marketing website
        |
        +-- Hub dashboard
        |     Module tiles, alerts, recent activity, quick actions
        |
        +-- Practice workspace
        |     Staff, clients, obligations, evidence, review, deadlines
        |
        +-- Practice-branded client portal
        |     Requests, uploads, questions, approvals, progress
        |
        +-- LogTraq administration
              Setup, subscriptions, support, platform health

Finance areas are workflow packs on one engine:

- Personal Income Tax
- VAT and Bookkeeping
- Payroll and Employer Compliance
- Provisional and Corporate Tax
- CIPC and Beneficial Ownership
- SARS Notices and Verifications
- Audit Evidence
- Later FICA/FSP administration

The Tax module is the only module that must be fully built immediately. Other tiles may exist as locked, inactive, or coming-soon modules, but they must never look broken.

UIF belongs inside Payroll and Employer Compliance with PAYE and SDL. It is not a top-level standalone module.
---

## 4. Foundational Data Model

The reusable chain is:

    Practice
      -> client group
      -> person/legal entity
      -> service engagement
      -> obligation period
      -> tasks and evidence requests
      -> evidence
      -> preparation
      -> review
      -> client approval
      -> practitioner approval
      -> external submission record
      -> authority outcome
      -> closure

The central object is an **obligation**, not merely a client or document.

An obligation includes practice, client/entity, service, period, client cutoff, internal deadline, statutory deadline, workflow template version, preparer, reviewer, evidence requirements, lifecycle, readiness, exceptions, approvals, submission proof, outcome, and immutable history.

Keep lifecycle, readiness, and urgency separate.

Obligation lifecycle:

    Planned -> Open -> Awaiting client -> Partially received
    -> Ready for preparation -> Preparing -> Internal review
    -> Client approval -> Ready to submit -> Submitted externally
    -> Outcome pending -> Resolved -> Closed

Exception overlays:

- Blocked
- Client unresponsive
- Waiting for authority
- Payment pending
- Disputed
- Overdue
- Cancelled
- Amendment required

Every exception has an owner, reason, next action, and follow-up date.

Evidence lifecycle:

    Requested -> Uploaded -> Processing -> Needs clarification
    -> Accepted/Rejected -> Superseded -> Locked -> Retained/Deleted

---

## 5. Roles and Permissions

Roles:

- Practice owner/admin
- Operations manager
- Preparer
- Registered practitioner/reviewer
- Quality/compliance reviewer
- Client administrator
- Client contributor
- External collaborator
- Read-only auditor
- LogTraq support with no document access by default

Permissions separately control view, upload, prepare, review, approve, record submission, manage staff, and manage billing.

Do not rely on hidden navigation. Enforce permissions through server logic and Supabase Row Level Security.
---

## 6. Practice Workspace

Main navigation:

- Today
- Work
- Clients
- Evidence
- Reviews
- Inbox
- Calendar
- Reports
- Templates
- Settings

Hub rule:

- After successful login, land the user in the hub dashboard, not directly inside a single module.
- The hub shows module tiles.
- The Tax tile opens the existing tax workspace.
- If a practice is tax-only, a shortcut may deep-link back into Tax after the hub loads.

Today answers:

- What requires action now?
- Which clients are blocking progress?
- What evidence arrived?
- What is ready for review?
- What needs practitioner approval?
- What is due soon or overdue?
- Which exceptions lack a next action?

Do not make the home screen a wall of charts.

Core capabilities:

- Practice branding, branches, teams, staff, MFA, roles
- Hub dashboard and module tiles
- Qualifications and accountable-practitioner assignment
- Service catalogue and engagements
- Client CSV import and duplicate detection
- Individuals, companies, CCs, trusts, estates, NPOs, and related groups
- Directors, members, trustees, beneficiaries, spouses, employees, signatories
- Income tax, VAT, PAYE, UIF, SDL, CIPC metadata
- Year-end, VAT category, payroll cutoff, incorporation anniversary
- Consent and authority-to-act records
- Internal, practitioner-only, and client-visible notes
- Full client timeline
- Monthly, two-monthly, annual, anniversary, and event-driven obligations
- Client cutoff, internal deadline, statutory deadline
- Updateable deadline sources and template versions
- Dependencies, overrides with reasons, automated period generation
- Versioned workflows, checklists, tasks, conditional questions
- Evidence requirements, assignments, reminders, escalation, review gates
- Bulk season launch with recipient preview
- Personal queues, deadline heatmap, new uploads, review/approval queues
- Workload, bottlenecks, exceptions, search, saved filters
---

## 7. Client Portal

The portal is practice-branded. The practice retains the client relationship.

Navigation:

- Next Actions
- Requests
- Documents
- Approvals
- Messages
- History
- Account

The opening screen says what the client must do, for example:

> Three things need your attention.

Examples:

- Upload the May bank statement
- Confirm there were no payroll changes
- Approve the VAT information pack

Capabilities:

- Secure passwordless invitation/access
- Mobile upload and camera capture
- Conditional forms
- Clear due dates/status
- Save and resume
- Delegate a request to an authorised contributor
- Ask a question inside a request
- See accepted, rejected, and missing items
- Replace rejected evidence
- Complete declarations/approvals
- View proof and history
- Switch between connected entities
- Notification preferences
- Accessible, low-bandwidth operation

Tiles may represent actions, obligations, or entities. Do not use a school-subject menu for Tax/UIF/VAT.

---

## 8. Evidence, Communication, and Approval

Evidence requirements:

- Conditional practitioner-configured request lists
- Secure upload
- Entity/obligation/period/coverage tagging
- Version history, duplicates, expiry
- Accept, reject with reason, clarify, replace
- Carry-forward only after reconfirmation
- Malware scan, private storage, signed links
- Access/download history
- Retention/deletion rules
- Indexed evidence bundle export
- OCR/classification/coverage warnings only with human confirmation

Communication:

- Personalised email tied to actual obligations
- Practice-approved templates and merge fields
- Stop reminders when satisfied
- Correct contact routing
- Reply capture on the request
- Delivery/bounce tracking
- Quiet hours and channel preferences
- Escalation to alternate contacts
- Preview before bulk sending
- SMS/WhatsApp later

Approval sequence:

    Draft -> Preparer complete -> Internal review -> Correction if needed
    -> Client declaration -> Registered practitioner approval
    -> Ready to submit -> External submission recorded
    -> Proof uploaded -> Authority outcome -> Closed

Controls:

- Preparer/reviewer separation
- Mandatory sign-offs
- Review notes and return flow
- Evidence snapshot bound to approval
- Identity, timestamp, template version
- Material changes reset affected approval
- Authority reference and proof
- Verification/amendment/objection/appeal tracking
- No shared SARS/CIPC credentials
- No screen scraping
- No automatic regulated submission

---

## 9. Workflow Packs

### Personal Income Tax

Taxpayer profile, conditional evidence, IRP5/IT3, medical aid, retirement, rental, capital gains, foreign income, deductions, auto-assessment administration, client declaration, practitioner review, assessment, verification, objection/appeal tracking.

### Provisional and Corporate Tax

Year-end-driven IRP6 schedules, evidence requests, practitioner-owned estimates, client approval, payment reminder, ITR14 readiness, statements/schedules handoff, outcomes and amendments.

### VAT and Bookkeeping

Recurring month-end pack, bank-statement coverage, invoices, sales, journals, loans, petty cash, transaction queries, VAT evidence, imports/exports/zero-rated evidence, review, approval, proof, period lock/reopen.

### Payroll and Employer Compliance

Monthly cutoff, no-change confirmation, starters, leavers, remuneration, overtime, leave, deductions, bank changes, restricted employee evidence, clarification, client approval, variance flags, EMP201/PAYE/UIF/SDL readiness, EMP501 packs, IRP5 delivery.

### Company Secretarial

Anniversary calendar, annual returns, beneficial ownership, director/member/address changes, resolutions, CIPC submission records, certificates, registers, annual reconfirmation.

### SARS Notices

Notice capture, practitioner classification, deadline, requests, indexed response package, practitioner review, submission record, follow-up, resolution.

### Audit Evidence

Prepared-by-client requests, secure collaboration, samples, query threads, management representation, locked evidence, indexed export. Auditor owns professional judgments.
---

## 10. Regulatory and Security Boundary

The user is not positioning herself as an accountant, registered tax practitioner, auditor, financial adviser, credit provider, debt counsellor, or collector.

Safest position:

> LogTraq supplies software and mechanical administration. The client's registered/licensed professional makes every regulated judgment, approves outputs, submits filings, communicates advice, and handles money.

Safe product territory includes setup, document intake/indexing, reminders, status, generic factual help, draft reports, reconciliation for review, audit trails, and support.

Only under a named professional, documented SOP, supervision, and approval: return/payroll data entry, audit working-paper assistance, mechanical FSP forms, or credit/debt administration.

Do not provide:

- Personalised tax opinions
- Return submission as LogTraq
- Audit/assurance opinions or protected sign-off
- Product suitability/recommendations
- Executing products, premiums, or claims
- Lending, credit reports, debt counselling/restructuring
- Substantive debt collection
- Custody/distribution of client money
- Autonomous legally significant decisions

Enforce named accountable professionals, registration checks, human approval, fixed fees, no credential sharing, no custody, immutable logs, and module suspension if registration lapses.

Security/POPIA baseline:

- Tenant isolation and RLS
- Staff MFA and granular RBAC
- Encryption and private storage
- Short-lived links and malware scanning
- Immutable audit events
- Backup/restore tests
- Retention/deletion/legal hold
- Operator agreement and subprocessors
- Data-location disclosure
- Data-subject export/correction
- Logged time-limited support access
- Incident/breach workflow
- No AI training on client documents by default
- No cross-client identifier matching without assessment
- No autonomous creditworthiness decisions

---

## 11. Revenue and Market Strategy

Finance is year-round when recurring operations are the base and seasons create peaks.

Recurring:

- Payroll/employer-change intake
- EMP201/PAYE/UIF/SDL readiness
- VAT packs
- Bookkeeping month-end
- Rolling client exceptions

Seasonal:

- April-May employer reconciliation
- July-October non-provisional individual tax
- July-January provisional filing
- September-October interim reconciliation
- January provisional/trust deadlines

Rolling:

- Company year-ends
- Provisional/company tax timing
- CIPC anniversaries and beneficial ownership
- AFS/audit preparation
- FICA/KYC review

Commercial model:

- Setup/implementation fee
- Monthly hosting/support
- Seasonal activation
- Later tiers by client volume/workflow packs
- Paystack handles LogTraq fees only
- Never hold client funds

Immediate acquisition wedge:

> Filing Season Client Readiness for small tax practices.

Recurring priority:

1. VAT readiness
2. Payroll-bureau cutoff
3. SARS verification/notices
4. CIPC/BO
5. ITR12 seasonal campaign

Do not build another all-in-one accounting platform. Existing products already cover CRM, calendars, portals, files, tasks, billing, tax production, and reminders.

Differentiation:

> The client-action layer that gets every South African compliance file complete, approved, and defensible before the practitioner begins or submits the work.

It works above the existing stack, is implemented for the firm, structures evidence by obligation/period, provides low-friction completion, quality review, indexed handoff, exception-first visibility, and measurable readiness.

---

## 12. Brand and Design

Finance-only is final. The name is not.

LogTraq is a temporary working name. Concerns: it sounds like LogTrack, leans toward logistics/IT, has spelling/search friction, and LogTraq Finance could imply a regulated provider.

Temporary descriptor:

> LogTraq | finance operations software

Before scale: CIPC company/reservation, trademark classes 9/42/35, domains, app stores, socials, and phonetic search. Add class 36 only if actual financial services are provided.

Working palette:

| Purpose | Colour |
|---|---|
| Ink | #171C1A |
| Background | #F6F8F6 |
| Surface | #FFFFFF |
| Green | #18513D |
| Soft green | #DCEAE3 |
| Information | #2F6FED |
| Warning | #D39A28 |
| Critical | #C7473D |
| Muted text | #65706A |
| Border | #D7DDD9 |

Design rules:

- Quiet, operational, dense but organised
- Maximum 8px card radius
- No nested cards or decorative dashboard sections
- Lucide icons and tooltips
- Tables for comparable records
- Tabs/segments/toggles/menus for their proper purposes
- No gradient orbs, dominant purple, beige/brown theme
- No viewport-scaled text or negative letter spacing
- Responsive, stable dimensions, no overlap
- Geist Sans is a suitable working font

Landing navigation:

- Product
- Workflow Packs
- Security
- Pricing
- Request a Walkthrough
- Sign In

Hero:

> Finance operations software for South African practices.

Supporting copy:

> Collect client evidence, track readiness, route professional review, and keep every deadline defensible without replacing your accounting or filing software.

CTA: Request a practice walkthrough. Do not lead with Start free trial.

Page order: hero with real product imagery, workflow, practitioner cockpit, client portal, workflow packs, existing-stack compatibility, security/professional control, implementation, pricing/pilot, setup CTA. Never fabricate customers, testimonials, integrations, or credentials.
---

## 13. Portal Pattern Decision

The user wants to trace a beautifully completed portal like an embroidery pattern: reuse its navigation, responsive behavior, tables, forms, screens, and states, then replace its surface and business logic.

Primary visual/structural reference:

- GitHub: https://github.com/Kiranism/next-shadcn-dashboard-starter
- Demo: https://shadcn-dashboard.kiranism.dev
- Licence: MIT

It provides a finished sidebar/header, dashboard, tables, forms, Kanban, chat, notifications, workspaces, team, billing, mobile behavior, and cleanup script.

Complication: it uses Clerk for auth, organisations, and billing. LogTraq must use Supabase and Paystack. Do not combine Clerk and Supabase auth. Replace deliberately only after the original runs unchanged.

Alternative infrastructure reference:

- https://github.com/KolbySisk/next-supabase-stripe-starter

It has Supabase, migrations, React Email, and Vercel structure, but Stripe must be removed and its UI is less complete.

Kiranism mapping:

| Existing | LogTraq |
|---|---|
| Overview | Today |
| Products | Obligations |
| Users | Clients |
| Product detail/form | Obligation/client record |
| Kanban | Work queue |
| Chat | Inbox |
| Notifications | Alerts |
| Workspaces | Practices/branches |
| Team | Staff/permissions |
| Billing | LogTraq subscription |

Do not use a school portal. Do not clone more repos before inventorying the chosen base.

---

## 14. Technical Stack and Infrastructure

Target:

- Next.js App Router, TypeScript, React
- Tailwind, shadcn/ui, Lucide
- Supabase Postgres/Auth/Storage/RLS
- Versioned migrations and generated types
- Vercel
- Paystack
- React Email
- Playwright

Rules:

- One auth system: Supabase
- One primary DB: Supabase
- One private document store: Supabase Storage
- One frontend/server host: Vercel
- Service-role and Paystack secret are server-side only
- Never expose secrets using NEXT_PUBLIC
- Separate test/live Paystack keys
- Preview deployments before domain switch
- Review starter migrations before applying to an existing project
- Prefer additive migrations; do not casually drop tables
- Test RLS

Paystack:

1. Server initializes transaction.
2. Frontend opens hosted checkout.
3. Public Vercel webhook receives event.
4. Verify HMAC SHA512 x-paystack-signature.
5. Verify reference, currency, amount, and order.
6. Process idempotently.
7. Update Supabase.
8. Activate only after verified server confirmation.
9. Never trust callback visitation alone.

---

## 15. Build Sequence

### Phase 0: Run and inventory

Run the selected portal unchanged, open every route, build it, deploy preview, inventory routes/components/dependencies, identify Clerk/Sentry/billing coupling. Do not redesign.

### Phase 1: Freeze documents

Create PRODUCT.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, DATABASE.md, SECURITY.md, BUILD_CHECKLIST.md. Every coding model reads them first.

### Phase 2: Remove unwanted dependencies

Remove Clerk Billing and sample domains. Decide and document auth replacement. Preserve UI and keep build green.

### Phase 3: Supabase foundation

SSR auth, practices, members, roles, tenant RLS, private storage, migrations, generated types, seed data, auth/RLS tests.

### Phase 4: Rename structure

Overview -> Today; Products -> Obligations; Users -> Clients; Chat -> Inbox; Workspaces -> Practices; Team -> Staff; Notifications -> Alerts; Billing -> Subscription. Use mock data first.

### Phase 5: Add the hub shell

- Login lands in the hub dashboard.
- Module tiles appear.
- Tax is active.
- Other tiles can be locked or coming soon.
- Preserve the current tax workspace route and sidebar behavior.

### Phase 6: Complete one vertical journey

    Practice signup -> workspace -> client -> obligation -> evidence request
    -> secure client link -> upload -> accept/reject -> practitioner review
    -> client approval -> submission record -> proof -> close

### Phase 7: Packs

Filing readiness, VAT, payroll cutoff, SARS notices, corporate/provisional, CIPC/BO, bookkeeping, audit evidence.

### Phase 8: Paystack

Only after auth, RLS, and core journey. Test mode, signed webhook, idempotency, verification, failures/retries.

### Phase 9: Email/reminders

Practice-branded transactional email, consent/opt-out records, delivery/bounce, stop conditions, history.

### Phase 10: Hardening

Lint, strict TypeScript, unit tests, RLS tests, Playwright, desktop/mobile screenshots, accessibility, security headers, error/loading/empty states, backup/restore, staging/production.
---

## 16. Antigravity Control Prompt

Use one phase per task:

    Read PRODUCT.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, DATABASE.md,
    SECURITY.md, BUILD_CHECKLIST.md, and ANTIGRAVITY_HANDOFF.md.

    Complete Phase [number] only.
    Preserve completed work.
    Do not redesign architecture.
    Do not add unrequested dependencies.
    Do not begin later phases.
    Preserve the existing Tax workspace unless the hub shell explicitly requires a routing wrapper.

    Before editing, state:
    - current architecture
    - files to change
    - acceptance criteria

    After editing:
    - lint
    - typecheck
    - tests
    - production build
    - honest failure report
    - stop

Commit after each successful phase. Never combine auth replacement, database redesign, Paystack, landing redesign, workflow packs, and email delivery in one generation.
---

## 17. Immediate Antigravity Task

This repository is an older static multi-sector LogTraq hub. Its README is outdated.

    Read ANTIGRAVITY_HANDOFF.md completely.
    Do not modify files.

    Audit this repository:
    - framework/dependencies
    - routes/pages
    - finance functionality
    - retired education references
    - auth/database/storage
    - deployment
    - divergence from handoff
    - reusable assets/behavior
    - archive candidates

    Inspect Kiranism:
    https://github.com/Kiranism/next-shadcn-dashboard-starter

    Compare:
    A. Transform this repo
    B. Replace its app layer with Kiranism structure
    C. Create a new portal repo and preserve this as legacy

    Score time, Supabase complexity, Vercel complexity, Paystack complexity,
    design completeness, migration risk, and maintainability.

    Recommend one option with evidence.

    Also answer one product question:
    - Should the current tax workspace stay intact inside the new hub shell, or should it be rewritten during the hub build?
    - State the minimum changes required to make the hub work without breaking Tax.

    Do not code, delete, migrate a database, or configure production.
---

## 18. Sales and Outreach

Targets: small SA tax practices, bookkeepers, payroll bureaus, accounting practices, and company-secretarial practices.

Research individually: practice, named person, source, visible problem, services, email source, consent status, dates, replies, next action, do-not-contact.

POPIA caution: unsolicited electronic marketing is regulated. The first unsolicited electronic communication should request consent rather than contain the sales pitch. Approach once, record consent, respect refusal/opt-out, and get compliance review before scale.

Consent-first draft:

    Subject: May I send you a short workflow demo?

    Hi [Name],

    I found [Practice] while researching how smaller finance practices
    manage client document collection.

    I built a short demonstration of a client-readiness workflow for
    tax, VAT, and payroll work.

    May I email you the 90-second demonstration? If not, I will not
    contact you again.

    [Name]
    [Business contact details]

After consent, send a personalised demo, ask which recurring workflow causes the most chasing, offer a focused pilot, and do not force a call.

---

## 19. Existing Work and Precedence

Previously recorded paths on the other computer:

- D:\LogTraq\all-my-files-live-deploy
- D:\LogTraq\AI_WORK_LOG.md
- D:\LogTraq-Archive\logtraq-retired-products-2026-07-12.zip

They may not exist on this PC. Do not recreate retired products because paths are absent.

An earlier four-demo boundary (Tax, Booking, Jobs, Custom) is superseded by finance-only. Reuse mechanics only when they support finance.

Non-negotiables:

1. Finance only.
2. One hub with shared data and workflow packs.
3. Different staff and client experiences.
4. Obligation is central.
5. Action/exception-first home.
6. Client sees next actions.
7. Work beside existing finance systems.
8. Never hold client money.
9. Never impersonate a regulated professional.
10. Human review and approval.
11. Supabase RLS from the foundation.
12. Paystack secrets server-side.
13. No shared SARS/CIPC credentials.
14. No automatic regulated submission.
15. No AI training on client evidence by default.
16. No generic all-in-one accounting replacement.
17. No education drift.
18. Complete one vertical journey before adding packs.
19. Verify every phase.

---

## 20. Key Links

- Supabase auth: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Vercel Supabase starter: https://vercel.com/templates/next.js/supabase
- Paystack payments: https://paystack.com/docs/payments/accept-payments/
- Paystack webhooks: https://paystack.com/docs/payments/webhooks/
- Information Regulator: https://inforegulator.org.za/guidance-notes/
- SARS Filing Season: https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/
- SARS practitioner registration: https://www.sars.gov.za/register-as-a-tax-practitioner/
- CIPC annual returns: https://www.cipc.co.za/?page_id=16055
- Kiranism repo: https://github.com/Kiranism/next-shadcn-dashboard-starter
- Kiranism demo: https://shadcn-dashboard.kiranism.dev
- Supabase/Stripe reference: https://github.com/KolbySisk/next-supabase-stripe-starter
- shadcn blocks: https://ui.shadcn.com/blocks?category=dashboard
- SaaSFrame: https://www.saasframe.io/categories/dashboard
- Mobbin: https://docs.mobbin.com/
- Page Flows: https://pageflows.com/

---

## 21. Final Summary

LogTraq is:

> A South African finance-practice operations platform that turns client obligations into contextual requests, complete evidence, controlled professional review, explicit approval, defensible handoff, and a permanent audit trail.

First commercial entry: filing-season readiness inside a broader finance hub.

Recurring foundation: VAT and payroll.

Durable platform: the shared obligation and evidence engine.

Hub rule: keep Tax intact, add the hub above it, and let future modules remain locked until they are real.

Antigravity must preserve this thesis before changing code.

