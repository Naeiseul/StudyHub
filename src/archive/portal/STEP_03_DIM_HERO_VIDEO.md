# Step 3: Dim Hero Video Only

**Date:** 2026-07-17
**Audience:** Antigravity
**Priority:** Immediate after Step 2
**Scope:** Video dimming only. One visible change only.

---

## Objective

Add the dim or overlay treatment needed to make the hero video sit properly behind the landing-page text.

This step is only about darkening or softening the hero video enough for readability.

Nothing else should change in this step.

---

## Important Context

Step 2 already restored the hero video.

The video asset is:

`assets/dash-bg.mp4`

The video is already placed in the hero.

This step is **not** permission to replace the video.

This step is **not** permission to recolor the whole page.

This step is **not** permission to move the logo.

This step is **not** permission to fix the login button.

This step is **not** permission to change cards, pricing, orbit visuals, or portal behavior.

If you do anything beyond dimming the hero video, the task is wrong.

---

## Exact Task

1. Keep the current hero video exactly where it is.
2. Add a dimming treatment so the hero text can sit on top cleanly.
3. Use the minimum code changes required to create that dim effect.
4. Stop immediately after the dim treatment is in place.

---

## Allowed Files

You may change only these files if needed:

- `styles.css`
- `app.js` only if the current markup absolutely requires a wrapper or overlay element

Do not edit any other files unless absolutely required for the overlay itself.

---

## Exact Visual Requirement

The video should still be visible.

The video should not look blacked out.

The text should read more clearly over it.

The dim treatment should feel:

- clean
- quiet
- controlled
- professional

Do not:

- blur the whole video heavily
- add flashy filters
- tint it purple
- add motion effects
- restyle the surrounding hero layout

The intended outcome is a simple overlay or opacity adjustment, not a redesign.

---

## Forbidden Actions

Do not:

- swap the video again
- change the hero copy
- move the brand block
- change the logo
- edit the login button
- remove any cards
- change pricing
- add orbit circles
- touch the finance portal
- touch tax portal logic
- clean up unrelated code
- continue into Step 4

If you do any of these, the task is wrong.

---

## Acceptance Criteria

The task is complete only if:

1. the hero video remains visible
2. the hero text is easier to read over the video
3. no other landing-page sections are modified
4. only the minimum required files are edited
5. one commit is made for this step only

---

## Output Format

After completing this step, report only:

1. the dimming method used
- Added a `::after` CSS pseudo-element to `.hero-media` acting as a semi-transparent white overlay (`rgba(255, 255, 255, 0.5)`), and elevated the `z-index` of `.floating-stat` to sit cleanly above it.

2. the files changed
- `styles.css`

3. confirmation that no other landing-page sections were modified
- Confirmed. Only the hero media CSS was updated to apply the overlay. No other sections or layouts were modified.

4. the commit hash for this step
- `3e90b8f`

Then stop.

---

## Commit Rule

Commit only this step.

Suggested commit message:

`feat: dim landing page hero video`

Do not bundle any other fixes into this commit.

---

## Final Instruction

Do only this dimming step.

Do not continue into Step 4.
