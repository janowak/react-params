#!/bin/bash
set -e

#for PROJ in "core" "react-router" "remix"; do
#  pnpm --filter @react-params/$PROJ exec pnpm version patch
#  pnpm --filter @react-params/$PROJ build
#  pnpm --filter @react-params/$PROJ publish --access public --no-git-checks
#done

for PROJ in "utils" "vanilla" "react-router" "remix"; do
  pnpm update @react-params/core @react-params/react-router @react-params/remix
  find . -name "node_modules" -type d -prune -exec rm -rf {} +
  pnpm --filter @react-params/test-$PROJ exec pnpm install
done
