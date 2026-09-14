# CI/CD Release and Operations Guide

This repository releases the public Bible Sidekick container through GitHub Actions and deploys it through Portainer. Production is available at <https://biblia.darkosa.cl>.

> **Current reference:** `v1.0.6` is the latest verified release at the time of writing. GitHub Actions and the Portainer stack state are the source of truth for the current production release.

## Overview

| Concern | Implementation |
| --- | --- |
| Repository | `noujox/bible-sidekick` |
| Release trigger | Annotated `vX.Y.Z` tag |
| Image registry | Public `ghcr.io/noujox/bible-sidekick` |
| Deployment authority | Portainer stack `biblia-online` (stack ID 61, environment 2) |
| Production URL | <https://biblia.darkosa.cl> |

Plain pushes to `main` do **not** deploy production.

## Quick release path

1. Ensure the intended changes are committed on the release commit.
2. Create and push an **annotated** tag using the strict `vX.Y.Z` format.
3. Monitor the `Release` workflow in GitHub Actions until both the build and deploy jobs succeed.
4. Confirm the production health endpoint at <https://biblia.darkosa.cl>.

The workflow rejects tags that do not use the exact `vX.Y.Z` format. Do not treat a push to `main` or `latest` as a release action.

## Architecture

```text
Annotated vX.Y.Z tag
        |
        v
GitHub Actions build job
  - frozen Bun install
  - lint
  - build
  - publish public GHCR image
        |
        v
Self-hosted deploy runner
  - verify anonymous GHCR manifest access
  - update Portainer stack to the explicit release tag
  - verify the public production health URL
        |
        v
https://biblia.darkosa.cl
```

The release workflow is defined in [`.github/workflows/release.yml`](../.github/workflows/release.yml). The deployment script materializes the stack with the release tag and rejects unsafe image references in [`deploy/deploy_portainer.py`](../deploy/deploy_portainer.py).

## What runs where

| Location | Responsibility |
| --- | --- |
| GitHub-hosted build runner | Runs `bun install --frozen-lockfile`, linting, and the production build; publishes the public image to GHCR. |
| GHCR | Stores the image under the exact release tag, `latest`, and the short commit SHA. |
| Self-hosted runner labeled `bible-sidekick-deploy` | Verifies anonymous public GHCR manifest access, invokes the deployment script, and checks production health. It runs in the isolated `github-runner-bible-sidekick` Portainer stack. |
| Portainer | Updates the `biblia-online` stack in environment 2 to the explicit release tag. |
| Production endpoint | Serves the application at <https://biblia.darkosa.cl>. |

The self-hosted runner has no Docker socket. Its Portainer API credentials remain local to that runner and are not stored in GitHub.

## Version and tag policy

- Release tags are annotated and must match `vX.Y.Z` exactly.
- A release image is published with three tags: the exact release tag, `latest`, and the short commit SHA.
- Deployments use the explicit immutable `vX.Y.Z` image tag, not `latest`.
- `latest` is published, but is not a deployment or rollback target.

## Rollback

Roll back manually in Portainer:

1. Identify a previously released immutable `vX.Y.Z` image.
2. Change the `biblia-online` stack image tag to that explicit version.
3. Update the stack.
4. Verify <https://biblia.darkosa.cl> is healthy.

Never rely on `latest` for a rollback.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| A push to `main` did not deploy | Expected behavior. Production releases require an annotated `vX.Y.Z` tag. |
| The workflow rejects the tag | Confirm the tag exactly matches `vX.Y.Z`. |
| The build job fails | Review the frozen Bun install, lint, and build steps in the workflow run. |
| The deploy job cannot use the image | The deploy job validates anonymous public GHCR manifest access before updating Portainer; review the workflow result and image publication. |
| Portainer update or health validation fails | Review the deploy-job output and the `biblia-online` stack state, then confirm the public URL returns successfully. |

Do not paste or store credentials in workflow logs, issues, documentation, or repository files.

## Security constraints

- The GitHub Actions build publishes a public GHCR image.
- The deploy runner does not receive a Docker socket.
- Portainer API credentials are held locally by the self-hosted deploy runner, not in GitHub.
- The deploy job validates the public image manifest anonymously before changing Portainer.
- Documentation and operational output must not disclose tokens, API-key values, internal secret paths, or accidental credential content.

## PWA and database cache note

The sql.js WebAssembly file is bundled and precached from the same origin. The PWA configuration precaches `.wasm` assets, while `/biblia.db` uses a runtime cache; see [`vite.config.ts`](../vite.config.ts).

When a forced IndexedDB refresh is required—for example, after a database or cache-schema change—increment `DB_VERSION` in [`src/config/db-version.ts`](../src/config/db-version.ts). This cache-version change is separate from the container image version.

## Relevant files

- [Release workflow](../.github/workflows/release.yml) — release validation, build, registry publication, and deploy orchestration.
- [Deployment script](../deploy/deploy_portainer.py) — explicit tag validation, Portainer stack update, and production health verification.
- [Portainer stack template](../deploy/biblia-online.compose.yml.tmpl) — image-tag placeholder used for the `biblia-online` deployment.
- [PWA configuration](../vite.config.ts) — Workbox precache and database runtime-cache configuration.
- [Database version configuration](../src/config/db-version.ts) — application-level IndexedDB refresh version.
