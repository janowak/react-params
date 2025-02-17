default:
  just --list

build PROJ:
    pnpm --filter @react-params/{{PROJ}} build

publish PROJ:
    just build {{PROJ}}
    pnpm publish --filter @react-params/{{PROJ}} --access public  --no-git-checks

dev PROJ:
    pnpm --filter @react-params/test-{{PROJ}} dev
