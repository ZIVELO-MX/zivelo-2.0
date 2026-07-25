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

- **Mission reference:** When the change belongs to a mission, document it as `Misión ID: WEB-XXXX`.
- **UI screenshots required:** Check `Requiere capturas` and provide the mission ID. The checked box is the screenshot workflow trigger.
- **UI screenshots not required:** Check `No requiere capturas` and keep the `Misión ID: WEB-XXXX` reference. The pipeline must skip screenshots even when a mission is present.

Select exactly one screenshot checkbox. After creating or editing the PR, read the persisted body and confirm that the screenshot workflow will take the intended path.

## Open the PR early

1. Push the focused branch as soon as the change is reviewable.
2. Open a normal PR immediately so CI and human feedback can begin. Use a draft only when the user explicitly requests one.
3. Follow the repository template and describe the change, mission ID, validation strategy, screenshot decision, risks, and relevant context accurately.
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
