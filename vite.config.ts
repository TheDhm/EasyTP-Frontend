import { defineConfig, loadEnv, type Plugin } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import path from 'path'


// Content-Security-Policy for production builds only (the dev server needs inline
// scripts for hot reload). Login tokens live in localStorage, so the page must not be
// able to run or talk to anything but itself, the API, and Cloudflare Turnstile.
const csp = (apiUrl: string): Plugin => ({
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml: () => [{
    tag: 'meta',
    injectTo: 'head-prepend',
    attrs: {
      'http-equiv': 'Content-Security-Policy',
      content: [
        "default-src 'self'",
        "script-src 'self' https://challenges.cloudflare.com",
        "frame-src https://challenges.cloudflare.com",
        `connect-src 'self' ${apiUrl}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    },
  }],
})

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), csp(loadEnv(mode, process.cwd()).VITE_API_URL ?? '')],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
