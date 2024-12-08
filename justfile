default:
  just --list

build PROJ:
    pnpm --filter {{PROJ}} build

build-remix:
    just build @react-params/remix

publish PROJ:
    pnpm publish --filter {{PROJ}} --access public

publish-remix:
    just publish @react-params/remix