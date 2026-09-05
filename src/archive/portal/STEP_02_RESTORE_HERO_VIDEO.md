# Step 2: Restore Hero Video Only

**Date:** 2026-07-17
**Audience:** Antigravity
**Priority:** Immediate after Step 1
**Scope:** Hero video only. One visible change only.

---

## Objective

Restore the hero video to the top landing-page section.

This step is only about making the intended hero video appear again in the correct place.

Nothing else should change in this step.

---

## Important Context

Step 1 already froze the current live website into:

`D:\LogTraq\landing-page-freeze-2026-07-17`

We are now editing the landing page again, but **only for the hero video**.

This step is **not** permission to redesign the hero.

This step is **not** permission to dim the video yet.

This step is **not** permission to move the logo.

This step is **not** permission to fix the login button.

This step is **not** permission to change colors, pricing, cards, or portal behavior.

If you do anything beyond restoring the hero video, the task is wrong.

---

## Exact Task

1. Find the exact hero video asset from the previous local version or other local project the user referred to.
2. Import or copy only that video asset into this repo if needed.
3. Place the video in the top hero section of the landing page.
4. Make the minimum code changes required so the video renders correctly.
5. Stop immediately after the video appears.

---

## Allowed Files

You may change only these files if needed:

- `index.html`
- `app.js`
- `styles.css`
- the single video asset file required for the hero

Do not edit any other files.

---

## Exact Visual Requirement

The hero video must:

- appear at the top of the landing page
- sit in the intended hero media position
- be visibly present
- keep the current page structure intact

For this step, do **not** add a dim overlay yet.

For this step, do **not** animate anything new.

For this step, do **not** restyle the surrounding text.

For this step, do **not** replace the image with a different creative concept.

The only success condition is: the intended hero video is back and visible.

---

## Forbidden Actions

Do not:

- dim the video
- recolor the page
- change the logo
- move the brand block
- edit the login button
- remove any cards
- add orbit circles
- change pricing
- touch the finance portal
- touch tax portal logic
- clean up unrelated code
- make extra visual improvements
- continue into Step 3

If you do any of these, the task is wrong.

---

## Acceptance Criteria

The task is complete only if:

1. the hero video is visible at the top of the landing page
2. the surrounding layout is still the same
3. no other visual section is changed
4. only the minimum required files were edited
5. one commit is made for this step only

---

## Output Format

After completing this step, report only:

1. the exact video asset used
- `assets/dash-bg.mp4`

2. the files changed
- `app.js`
- `styles.css`
- `assets/dash-bg.mp4`

3. confirmation that no other landing-page sections were modified
- Confirmed. Only the hero media section was modified to replace the image with the video.

4. the commit hash for this step
- `588557b`

Then stop.

---

## Commit Rule

Commit only this step.

Suggested commit message:

`feat: restore landing page hero video`

Do not bundle any other fixes into this commit.

---

## Final Instruction

Do only this hero-video step.

Do not continue into Step 3.
