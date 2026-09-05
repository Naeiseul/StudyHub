# Step 1: Freeze Current Live Website

**Date:** 2026-07-17
**Audience:** Antigravity
**Priority:** Immediate
**Scope:** Freeze only. No design work. No code changes. No commit from Antigravity.

---

## Objective

Take the **current live website version that is on the repository right now** and create a frozen backup copy under `D:\Logtraq` before any more landing-page work happens.

This step exists because later design steps may go wrong. We need one stable, local recovery point outside the repo first.

---

## Important Context

We are working with the **live website version currently in the repository right now**.

This step is **not** a redesign step.

This step is **not** permission to edit the landing page.

This step is **not** permission to commit more website changes.

This step is **not** permission to push anything.

If you do anything beyond creating the backup copy, the task is wrong.

---

## Exact Task

1. Read the current website files exactly as they exist now in the repo.
2. Create a backup folder under `D:\Logtraq`.
3. Copy the current landing-page files into that backup folder.
4. Copy only the assets directly used by the landing page into that backup folder.
5. Stop immediately after the backup is created.

---

## Suggested Backup Folder Name

Use:

`D:\Logtraq\landing-page-freeze-2026-07-17`

If that folder already exists, create:

`D:\Logtraq\landing-page-freeze-2026-07-17-v2`

Do not overwrite an existing backup without checking first.

---

## Files To Include

Copy the current live landing-page files:

- `index.html`
- `app.js`
- `styles.css`
- `config.example.js`

Also copy only the landing-page assets currently in use, for example:

- logo assets used by the current landing page
- image assets used by the current landing page
- video assets used by the current landing page

If an asset is not actually used by the current landing page, do not include it just because it exists in the repo.

---

## Files Not To Touch

Do not edit:

- finance portal internals
- tax portal logic
- Supabase SQL
- handoff docs
- pricing copy
- login UI
- hero design
- anything else

This is a backup task, not a design task.

---

## Forbidden Actions

Do not:

- redesign anything
- restyle anything
- rename website sections
- remove cards
- add orbit effects
- change colors
- change logos
- change pricing
- fix other issues "while you are there"
- create a commit
- push to git
- deploy to the live website

If you do any of these, the task is wrong.

---

## Acceptance Criteria

The task is complete only if:

1. a backup folder exists under `D:\Logtraq`
2. the current live landing-page files are copied there
3. the current landing-page assets in use are copied there
4. the repo working tree is unchanged
5. no commit is created
6. no push is made
7. no deployment is made

---

## Output Format

After completing the backup, report only:

1. the exact backup folder path created
- `D:\LogTraq\landing-page-freeze-2026-07-17`

2. the files copied
- `index.html`
- `app.js`
- `styles.css`
- `config.example.js`
- `assets/portal-workspace.webp`

3. confirmation that no repo files were changed
- Confirmed. No repo files were modified.

4. confirmation that no commit was made
- Confirmed. No commit was made during the backup process.

Then stop.

---

## Final Instruction

Do only this freeze step.

Do not continue into Step 2.
