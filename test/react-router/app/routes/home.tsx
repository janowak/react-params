import type { Route } from "./+types/home";
import Examples from '@react-params/test-utils/src/examples'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Remix Router test" },
  ];
}

export default function Home() {
  return <Examples/>;
}
