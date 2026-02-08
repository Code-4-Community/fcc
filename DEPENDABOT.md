# Dependabot Workflow

## Overview

Dependabot is a GitHub-native tool that automatically opens pull requests to keep dependencies up to date. Its configuration settings are located in `.github/dependabot.yml`, and runs weekly.

## What Dependabot Updates

- **Node.js dependencies**: Dependencies declared in `package.json` and the lockfile `yarn.lock`
- **Docker dependencies**: Updates base image tags referenced by Dockerfiles (e.g. the one in `apps/backend`)
- **GitHub Actions**: Updates action versions used in workflows in `.github/workflows`

## Schedule and Ownership

Dependabot creates PRs on a **weekly** basis, and automatically assigns the PRs to `aaronashby` and `thaninbew`

## How to Review Dependabot PRs

- Skim the PR title, release notes, and commits
- Check the diff
  - Dependency updates often change `package.json` + `yarn.lock` (or only `yarn.lock`).
  - Docker updates typically change a `FROM …` line.
  - Actions updates usually change `uses: …@vX` pins in workflows.

## Merging Guidelines (suggested)

- **Patch/minor updates**: usually safe to merge once CI passes.
- **Major updates**: prefer a quick manual smoke test and a scan for breaking changes.
- **Lockfile-only updates**: merge if CI passes (these happen due to dependency resolution changes).

## Common Tweaks (edit `.github/dependabot.yml`)

- **Add a separate Docker entry for root compose files**
  - Dependabot currently only scans Docker in `/apps/backend`. If you want it to update `docker-compose.dev.yml` at the repo root, add another docker update with `directory: "/"`.
- **Limit PR volume**
  - Add `open-pull-requests-limit: <number>` to an update block.
- **Ignore versions**
  - Use `ignore:` to skip major versions or specific packages temporarily.
- **Group updates**
  - Use `groups:` to bundle related packages (e.g., React, NestJS, Nx) into fewer PRs.

## Troubleshooting
- **CI fails after a bump**
  - Check the package’s changelog/release notes and revert/ignore if needed.
  - If it’s a tooling bump (Nx/Vite/ESLint/TypeScript), failures often come from peer dependency changes or config deprecations.
- **Dependabot isn’t opening PRs**
  - Confirm `.github/dependabot.yml` is on the default branch and syntactically valid.
  - Check the repo’s Dependabot alerts/PRs in GitHub for run history and errors.