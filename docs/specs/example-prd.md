# EXAMPLE PRD — "Issue Tracker Lite" (sample, not a real project)

> This file is a **synthetic example** used to prove the template's PRD-intake flow. It is NOT the real PRD of any future project. Replace it with the actual PRD and delete this file.

## 1. Users

A registered, verified user; an administrator; a project lead role.

## 2. Goals

- Let users report issues, comment, and track status.
- Let admins manage users; leads manage their project's issues.

## 3. Scope

- In scope: issues (create, list, detail, status change), comments, project membership with a LEAD role.
- Out of scope: attachments, notifications, full-text search, API keys.

## 4. Rules

- Only the reporter, a project lead, or an admin may change an issue's status.
- Comments are immutable after 5 minutes.
- An issue title is required and unique per project.
- Deactivated users cannot be added to a project.

## 5. Acceptance

- A reporter creates an issue and sees it listed under their project.
- A lead changes the status; a non-member is denied (403).
- Comment immutability and the unique-title rule are enforced with clear errors.
- Admin listing still shows the new role column without breaking existing pagination.

## Flow this file exercises

`prd-intake` → `plan-feature` → `implement-module` → `database-change` → `api-contract` → `test-feature` → `security-review` → `review-change` → `project-handoff`.
