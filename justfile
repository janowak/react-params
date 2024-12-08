default:
  just --list

build PROJ:
    pnpm --filter {{PROJ}} build

build-remix:
    just build @react-params/remix

build-core:
    just build @react-params/core

publish PROJ:
    pnpm publish --filter {{PROJ}} --access public

publish-remix:
    just publish @react-params/remix