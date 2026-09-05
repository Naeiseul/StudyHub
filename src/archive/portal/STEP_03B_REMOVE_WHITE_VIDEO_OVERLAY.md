# Step 3B: Remove White Video Overlay Only

**Date:** 2026-07-17
**Audience:** Antigravity
**Priority:** Immediate correction after Step 3
**Scope:** Remove the incorrect white overlay only. One visual correction only.

---

## Objective

Remove the white washed overlay that was added over the hero video.

The source video already has the intended darkness.

This step is only about removing the incorrect overlay treatment and preserving the source video as-is.

Nothing else should change in this step.

---

## Important Context

The current mistake is in:

- `styles.css`

The incorrect rule is the `::after` overlay on `.hero-media` that uses a white semi-transparent background.

Current wrong behavior:

- the hero video looks washed out
- the original dark mood of the source video was lost

Required behavior:

- keep the source video exactly as it is
- do not add a new replacement overlay
- do not invent a new treatment

If readability becomes an issue after removing the white overlay, stop and report it. Do not invent another fix in this step.

---

## Exact Task

1. Open `styles.css`
2. Find the `.hero-media::after` overlay rule that was added for the hero video
3. Remove that white overlay behavior
4. Keep the current video placement unchanged
5. Keep the current hero layout unchanged
6. Stop immediately after the white overlay is removed

---

## Allowed Files

You may change only:

- `styles.css`

Do not edit any other files.

---

## Exact Visual Requirement

After this fix:

- the hero video must still appear in the current hero media slot
- the white washed overlay must be gone
- the source video darkness must remain as originally present in the video itself
- the surrounding hero layout must remain unchanged

Do not:

- add a dark overlay
- add a gradient overlay
- change brightness
- change contrast
- tint the video
- blur the video
- move the video
- resize the hero
- restyle text

This is a removal step, not a redesign step.

---

## Forbidden Actions

Do not:

- touch `app.js`
- touch `index.html`
- touch assets
- change logo
- change login button
- change colors elsewhere
- change cards
- change pricing
- add orbit circles
- touch finance portal internals
- clean up unrelated CSS
- continue into the next step

If you do any of these, the task is wrong.

---

## Acceptance Criteria

The task is complete only if:

1. the white overlay is removed
2. the hero video remains in place
3. the source video is shown without a new invented treatment
4. no other landing-page section is modified
5. only `styles.css` is changed
6. one commit is made for this step only

---

## Output Format

After completing this step, report only:

1. the exact selector changed
- `.hero-media::after` (deleted)

2. confirmation that only `styles.css` changed
- Confirmed. Only `styles.css` was changed.

3. confirmation that no replacement overlay was added
- Confirmed. The video is now shown as-is with no new overlay or CSS treatment.

4. the commit hash for this step
- `93f01b1`

Then stop.

---

## Commit Rule

Commit only this step.

Suggested commit message:

`fix: remove white hero video overlay`

Do not bundle any other fixes into this commit.

---

## Final Instruction

Do only this removal step.

Do not continue into any other step.
