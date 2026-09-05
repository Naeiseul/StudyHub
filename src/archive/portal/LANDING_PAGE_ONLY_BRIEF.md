# LogTraq Landing Page Only Brief

**Authoritative as of:** 2026-07-16
**Purpose:** Give Antigravity a narrow, explicit landing-page-only task. This brief does not authorize portal rewrites, finance-portal rewrites, or surprise commits.

---

## 1. Scope Lock

This task is **landing page only**.

Allowed:

- landing page background color adjustment
- landing page logo swap
- landing page retirement of non-finance product cards
- landing page orbit visual around Finance
- landing page pricing section update

Not allowed:

- edits inside the finance portal workflow
- edits inside the tax portal screens
- hub rewrites
- auth rewrites
- Supabase wiring
- Paystack wiring
- new product logic
- deploying to the live website
- committing anything beyond the exact requested landing-page changes

If a change is not explicitly described in this brief, do not make it.

---

## 2. Revert Rule

If the user says `revert`, it means:

- return files to the last working state before the unwanted change
- do not invent a new design
- do not push a substitute layout
- do not make "cleanup" commits that alter unrelated parts of the site

Antigravity must not interpret `revert` as permission to redesign.

---

## 3. Current Intent

The user wants a **new landing page direction** while leaving the finance portal itself untouched for now.

The landing page should now present **Finance only**.

The previous non-finance offerings should be retired from the landing page, but not deleted from local storage.

The finance profile remains the center of the public story.

---

## 4. Background Colour Change

Current direction:

- keep the existing background structure and most of the existing palette
- replace purple-tinted shading with **lighter blue shading**
- the result should read as **teal + light blue**

Do not:

- switch the whole website to dark mode
- replace the whole color system
- flatten the page to plain white
- create a new purple-heavy scheme

Implementation intent:

- preserve existing layout, gradients, spacing, shadows, and component structure
- only shift purple hues toward soft blue
- preferred blue family: pale sky blue, mist blue, light cyan-blue
- keep finance green/teal present so the brand still feels finance-led

Reference outcome:

- page should feel cleaner and brighter
- not purple
- not navy
- not pastel candy

---

## 5. Logo Swap

Change the current logo to the **box logo** described by the user:

- replace the current logo with the one from the other uncommitted project
- the user specifically does **not** want that other project committed
- only the logo asset/design should be taken from that project

Important:

- do not import the other project into this repo
- do not copy unrelated files from that project
- do not commit the other project

If the source asset is local on the machine:

- locate it
- copy only the required logo asset or recreate only that logo mark inside this repo

Visual rule:

- the finance portal preview on the landing page should keep its current circular presentation for now
- only the general site logo/brand mark should change to the requested box-logo version

---

## 6. Retire Non-Finance Portals

Retire these public landing-page offerings:

- Education
- Health
- Applications

The user said **retire, not erase**.

That means:

1. create archive folders under `D:\Logtraq`
2. store the retired module materials there
3. remove those offerings from the public landing page
4. leave only Finance visible on the landing page

Suggested archive structure:

- `D:\Logtraq\retired-education`
- `D:\Logtraq\retired-health`
- `D:\Logtraq\retired-applications`

Rules:

- do not delete source concepts permanently
- do not keep the retired modules visible on the landing page
- do not break Finance while removing the other cards

If there is no local Health module in this repo, do not fabricate one. Only archive what actually exists locally.

---

## 7. Finance-Centered Orbit Visual

Landing page only.

Do not change the finance portal itself.

Desired effect:

- Finance remains stationary in the middle
- additional smaller circles orbit around Finance
- those orbiting circles represent finance sub-offerings such as:
  - Tax
  - PAYE
  - VAT
  - UIF
  - CIPC
  - Payroll

Visual rules:

- use a soft opacity orbit ring
- Finance stays the center, unchanged
- orbiting circles should feel light, quiet, and intentional
- do not turn this into a noisy animation
- do not create four equal generic portal circles again
- do not replace the whole hero layout

Animation rules:

- slow orbit only
- subtle motion
- no jitter
- no bouncing
- no flashy scale pulses

Content rules:

- orbit labels can be short
- keep them readable
- orbit circles are supporting visuals, not the main CTA

Critical constraint:

- **Finance stays untouched in the center**
- only add orbiting finance sub-service circles around it

---

## 8. Pricing Strategy

This pricing is for the **current offering only**, not the future full finance suite.

The landing page should clearly say:

`Current offerings, more coming to you soon.`

### Business logic

The user wants pricing based on:

- current offering
- number of clients a practice has

### Supabase reality check

Official Supabase pricing as checked on 2026-07-16:

- Free plan: $0/month
- Includes 50,000 MAU
- 500 MB database
- 1 GB file storage
- 5 GB egress
- free projects pause after 1 week of inactivity
- limit of 2 active projects
- max file upload size on free plan: 50 MB

Source:

- https://supabase.com/pricing

Interpretation:

- the free plan is fine for a demo or very early pilot
- it is **not** a serious long-term production base for a document-heavy portal business
- real document storage and active practice usage will push the business toward Supabase Pro

Supabase Pro official baseline as checked on 2026-07-16:

- starts from $25/month
- 100 GB file storage included
- 8 GB database
- 250 GB egress

This means a real pricing model must comfortably exceed infrastructure cost and support time.

### Recommended pricing direction

Use client-count tiers for the current finance offering:

1. `Starter`
   - Up to 10 active clients
   - `R150/month`
   - Good as an entry price
   - Works as a small-practice trial tier

2. `Practice`
   - Up to 30 active clients
   - `R350/month`
   - Better aligned with actual recurring usage

3. `Growth`
   - Up to 75 active clients
   - `R650/month`
   - Gives room for heavier usage before custom pricing

4. `Custom`
   - 76+ active clients
   - `Contact us`

### Why this is reasonable

- `R150/month` is low enough to feel accessible for a very small practice
- it should not be the only tier
- larger practices must pay more because document handling, reminders, support, and storage load rise with client count
- this keeps the entry point simple without pretending the whole platform can run profitably on one low price

### Landing page presentation rule

Do not invent a new pricing design.

Instead:

- duplicate the **current pricing tile/band style**
- keep the same images, spacing, colors, and structure
- update the text only

Required copy direction:

- headline should clearly refer to current offering
- include the line:
  - `Current offerings, more coming to you soon.`

Possible pricing copy:

- `Finance portal pricing by active client count`
- `Current offerings, more coming to you soon.`

CTA direction:

- keep the same CTA style
- adjust CTA text only if needed so it matches finance pricing rather than the old single launch setup message

---

## 9. File-Level Intent

This brief is for the current static landing page structure.

Expected edit surface:

- `app.js`
- `styles.css`
- asset/logo files only if needed

Avoid unrelated edits to:

- portal workflow code
- Supabase SQL
- finance upload logic
- retired handoff files

---

## 10. Commit Rules For Antigravity

Antigravity must:

- commit only the exact landing-page changes requested here
- not commit unrelated cleanup
- not rewrite the portal
- not deploy
- not touch live production configuration

If a revert is requested later:

- restore the prior landing-page state
- do not invent replacement designs
- do not add new commits with extra features

---

## 11. Acceptance Criteria

The task is complete only if all of these are true:

1. landing page reads as Finance only
2. purple shading is shifted to a lighter blue while preserving the current general visual feel
3. requested box logo replaces the current logo without importing the whole other project
4. non-finance portals are removed from the public landing page
5. retired offerings are archived under `D:\Logtraq` rather than simply deleted
6. Finance remains in the center of the hero/profile area
7. finance sub-service circles orbit around Finance with subtle opacity-ring motion
8. finance portal internals are unchanged
9. pricing section keeps the same visual style but shows client-count pricing tiers
10. pricing section explicitly says `Current offerings, more coming to you soon.`
11. no unrelated commits are made
12. no deployment is performed

---

## 12. Final Instruction To Antigravity

Read this brief and treat it as narrowly as possible.

Do not be creative outside the brief.

Do not touch the portal internals.

Do not redesign the landing page from scratch.

Do not commit unrelated work.

Do not deploy.
