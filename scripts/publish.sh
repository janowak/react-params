#!/bin/bash
set -e

for PROJ in "core" "remix" "react-router"; do
  pnpm --filter @react-params/$PROJ build
  pnpm --filter @react-params/$PROJ exec pnpm version patch
  pnpm --filter @react-params/$PROJ publish --access public --no-git-checks
done
