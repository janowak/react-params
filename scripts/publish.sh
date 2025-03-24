#!/bin/bash
set -e

#for PROJ in "core" "react-router-dom" "remix-v6" "remix-v7"; do
#  pnpm --filter @react-params/$PROJ exec pnpm version patch
#  pnpm --filter @react-params/$PROJ build
#  pnpm --filter @react-params/$PROJ publish --access public --no-git-checks
#done

for PROJ in "utils" "vanilla" "react-router-v6" "react-router-v7" "remix-v6" "remix-v7" ; do
  pnpm  --filter @react-params/test-$PROJ update @react-params/core @react-params/react-router @react-params/remix-v6  @react-params/remix-v7
  find ./test/$PROJ -name "node_modules" -type d -prune -exec rm -rf {} +
done