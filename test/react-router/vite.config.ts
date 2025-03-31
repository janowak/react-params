import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  // resolve: {
  //   alias: {
  //     '@react-params/core': path.resolve(__dirname, '../../packages/core/src/'),
  //     '@react-params/remix-v7': path.resolve(__dirname, '../../packages/remix-v7/src'),
  //   }
  // }
});
