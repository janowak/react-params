#!/bin/bash
set -e

for PROJ in "core" "react-router-dom" "remix" "react-router"; do
  pnpm --filter @react-params/$PROJ exec pnpm version patch
  pnpm --filter @react-params/$PROJ build
  pnpm --filter @react-params/$PROJ publish --access public --no-git-checks
done

for PROJ in "utils" "vanilla" "react-router-dom-v6" "react-router-dom-v7" "remix" "react-router" ; do
  pnpm  --filter @react-params/test-$PROJ update @react-params/core @react-params/react-router-dom @react-params/remix  @react-params/react-router
  find ./test/$PROJ -name "node_modules" -type d -prune -exec rm -rf {} +
  pnpm --filter @react-params/test-$PROJ install
done