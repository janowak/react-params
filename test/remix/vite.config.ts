import {vitePlugin as remix} from "@remix-run/dev";
import {defineConfig} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
    plugins: [remix({}), tsconfigPaths()],
    resolve: {
        alias: {
            '@react-params/core': path.resolve(__dirname, '../../packages/core/src/'),
            '@react-params/remix': path.resolve(__dirname, '../../packages/remix/src')
        }
    }
});
