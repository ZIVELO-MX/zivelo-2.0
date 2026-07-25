---
name: manage-pull-requests
description: Create and manage GitHub Pull Requests from reviewable repository changes. Use when Codex needs to open a PR, update its title or description, push follow-up commits, monitor or diagnose PR checks, decide whether UI screenshots apply, or report a PR's review status. Enforce early PR creation, CI-first validation, explicit screenshot configuration, and user-owned merging.
---

# Manage Pull Requests

Manage the complete PR lifecycle while keeping review feedback fast and leaving the merge decision to the user.

## Inspect the repository

1. Read the applicable `AGENTS.md` instructions.
2. Inspect the worktree, current branch, remotes, intended base branch, PR template, and relevant workflows.
3. Check whether the current branch already has a PR. Update it instead of creating a duplicate.
4. Preserve unrelated user changes and never push directly to `main`.

## Prepare a reviewable change

1. Create or use a focused feature branch from the intended base.
2. Review the diff and ensure the change is coherent enough for feedback.
3. Commit only files belonging to the requested change.
4. Do not wait for every local validation to finish before publishing a reviewable change.

## Decide screenshot handling

Make exactly one decision before finalizing the PR description:

- **UI screenshots required:** Include exactly one standalone line matching `Misión: WEB-XXXX`, replacing the placeholder with the real Task ID. Obtain the ID from the task context, branch, or repository tooling. If it cannot be determined, ask the user before finalizing the description.
- **UI screenshots not required:** Explicitly state `No requiere capturas` in the PR and omit a completed `Misión: WEB-XXXX` line. A literal placeholder such as `Misión: WEB-XXXX` may remain if the repository template uses it.

Never declare that screenshots are unnecessary while also including a completed mission line. After creating or editing the PR, read the persisted body and confirm that the screenshot workflow will take the intended path.

## Open the PR early

1. Push the focused branch as soon as the change is reviewable.
2. Open a normal PR immediately so CI and human feedback can begin. Use a draft only when the user explicitly requests one.
3. Follow the repository template and describe the change, Task ID, validation strategy, screenshot decision, risks, and relevant context accurately.
4. Do not claim that a check passed unless it actually ran and passed.
5. Continue refinements through follow-up commits on the same branch and update the PR body when its scope or evidence changes.

## Rely on the pipeline

- Treat the PR pipeline as the source of truth for lint, type checking, builds, automated tests, and E2E coverage.
- Avoid duplicating the full automated suite locally unless the user asks, immediate verification is necessary, or CI does not cover a required structural check.
- Monitor PR checks after opening. Inspect failed job logs, distinguish change-related failures from infrastructure failures, and fix failures within the requested scope.
- Report pending, passing, failing, or skipped checks precisely.

## Preserve user control

- Never merge, squash, rebase-and-merge, enable auto-merge, close, or delete the PR unless the user explicitly requests that action.
- Never present a green pipeline as permission to merge.
- Return the PR URL, branch, screenshot decision, and current check status to the user.
