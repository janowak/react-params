import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // resolve: {
  //   alias: {
  //     '@react-params/core': path.resolve(__dirname, '../../packages/core/src/'),
  //     '@react-params/react-router': path.resolve(__dirname, '../../packages/react-router/src')
  //   }
  // }
})
