import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_URL_SERVER || 'http://localhost:3001'

  return {
    plugins: [react()],
    server: {
      allowedHosts: ['test.locket-wan.top', 'locket-wan.top'],
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})

